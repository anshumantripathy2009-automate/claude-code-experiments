// Per-IP rate limit for the login, signup and password-reset actions.
// Same trade-off as automations/whatsapp-dental-receptionist/api/_lib/rateLimit.js:
// in-memory and per serverless instance, so it's a speed bump against
// password guessing and invite-code guessing, not a hard wall. Supabase Auth
// adds its own rate limits on top of this.

import { headers } from 'next/headers';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const requestLog = new Map(); // key -> timestamps

async function clientIp() {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return h.get('x-real-ip') || 'unknown';
}

// Returns true when the caller is over the limit for this action.
export async function isRateLimited(action, maxAttempts) {
  const now = Date.now();
  const key = `${action}:${await clientIp()}`;
  const recent = (requestLog.get(key) || []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= maxAttempts) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}
