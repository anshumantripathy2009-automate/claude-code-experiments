// Simple in-memory rate limiter for Vercel serverless functions.
//
// Files under api/ whose name starts with "_" are NOT exposed as routes by
// Vercel, so this helper is importable but never publicly callable.
//
// WHY THIS EXISTS (the simple version):
// Our /api/* endpoints are open to the internet and spend money on every
// call (Gemini quota). Without a limit, anyone who opens dev tools on a demo
// link can hammer the endpoint and burn the API key's quota — which means the
// demo dies in the middle of a sales call.
//
// WHY IT WORKS THIS WAY (the pro version):
// Serverless functions are stateless between cold starts, and Vercel may run
// several instances in parallel — so this Map is per-instance, not global.
// That makes it a speed bump, not a wall: it stops casual abuse and runaway
// scripts, but a determined attacker spread across instances can exceed the
// limit. The real fix at scale is a shared store (Upstash Redis, Vercel KV)
// or Vercel's built-in WAF/Firewall rate limiting. For a demo-scale endpoint
// this is the right trade-off: zero dependencies, zero cost, no latency.

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // per IP, per window

// ip -> array of request timestamps (ms) inside the current window
const requestLog = new Map();

let lastSweepAt = Date.now();

/**
 * Drops entries that have fully aged out, so the Map can't grow unbounded
 * on a long-lived warm instance. Runs at most once per window.
 */
function sweepExpiredEntries(now) {
  if (now - lastSweepAt < WINDOW_MS) return;
  lastSweepAt = now;

  for (const [ip, timestamps] of requestLog.entries()) {
    const stillFresh = timestamps.filter((t) => now - t < WINDOW_MS);
    if (stillFresh.length === 0) {
      requestLog.delete(ip);
    } else {
      requestLog.set(ip, stillFresh);
    }
  }
}

/**
 * Best-effort client IP. Vercel sets x-forwarded-for; the first entry is the
 * original client, the rest are proxies. Falls back to the socket address,
 * then to a shared bucket so an unidentifiable caller is still limited
 * rather than exempt.
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length) {
    return String(forwarded[0]).trim();
  }
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }
  return 'unknown';
}

/**
 * Records this request and reports whether the caller is over the limit.
 * @returns {{ allowed: boolean, ip: string, retryAfterSeconds: number }}
 */
function checkRateLimit(req) {
  const now = Date.now();
  sweepExpiredEntries(now);

  const ip = getClientIp(req);
  const previous = requestLog.get(ip) || [];
  const withinWindow = previous.filter((t) => now - t < WINDOW_MS);

  if (withinWindow.length >= MAX_REQUESTS_PER_WINDOW) {
    // Don't record blocked attempts — otherwise a client that keeps retrying
    // permanently extends its own lockout.
    requestLog.set(ip, withinWindow);
    const oldest = withinWindow[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    return { allowed: false, ip, retryAfterSeconds };
  }

  withinWindow.push(now);
  requestLog.set(ip, withinWindow);
  return { allowed: true, ip, retryAfterSeconds: 0 };
}

/**
 * Convenience wrapper: applies the limit and, if exceeded, writes the 429
 * response itself. Returns true when the caller should STOP handling.
 *
 *   if (enforceRateLimit(req, res, '[riya-voice]')) return;
 */
function enforceRateLimit(req, res, logPrefix) {
  const { allowed, ip, retryAfterSeconds } = checkRateLimit(req);
  if (allowed) return false;

  console.warn(`${logPrefix} Rate limit exceeded for IP ${ip} — returning 429.`);
  res.setHeader('Retry-After', String(retryAfterSeconds));
  res.status(429).json({ error: 'Too many requests. Please slow down and try again shortly.' });
  return true;
}

module.exports = {
  checkRateLimit,
  enforceRateLimit,
  getClientIp,
  WINDOW_MS,
  MAX_REQUESTS_PER_WINDOW,
};
