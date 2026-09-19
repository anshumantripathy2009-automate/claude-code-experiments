// Vercel serverless function — POST /webhook (rewritten from /api/webhook, see vercel.json)
// Expects: { "from": "<phone number>", "message": "<text>" }
// In a real deployment, this endpoint sits behind your WhatsApp provider
// (e.g. Twilio, Meta Cloud API, WATI) which forwards inbound messages here
// and relays the JSON "reply" back out over WhatsApp.
//
// SECURITY POSTURE (Tier 1 audit):
//   - Optional shared-secret check (WEBHOOK_SECRET) so only your provider
//     can drive the bot. See the note on the constant below.
//   - Per-IP rate limit (see _lib/rateLimit.js) — every inbound message
//     costs a Gemini call plus a Supabase write, so an open endpoint is a
//     direct path to burning your quota.
//   - Fields validated and length-capped before reaching the model.
//   - Errors logged in full server-side, generic message to the caller.

const { generateReply } = require('../src/ai');
const { enforceRateLimit } = require('./_lib/rateLimit');
const {
  requireString,
  isPlainObjectBody,
  rejectBadRequest,
  MAX_PROMPT_LENGTH,
  MAX_NAME_LENGTH,
} = require('./_lib/validate');

const LOG_PREFIX = '[webhook]';

// Set WEBHOOK_SECRET in the Vercel env and have your WhatsApp provider send
// it as the x-webhook-secret header. Left unset, the endpoint stays open (so
// this change can't break a live integration) but logs a warning on every
// call. Setting it is strongly recommended before going to a paying client.
function isAuthorized(req) {
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected) {
    console.warn(
      `${LOG_PREFIX} WEBHOOK_SECRET is not set — this endpoint accepts requests from anyone. Set it in your Vercel env.`
    );
    return true;
  }
  return req.headers['x-webhook-secret'] === expected;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (enforceRateLimit(req, res, LOG_PREFIX)) return;

  if (!isAuthorized(req)) {
    console.warn(`${LOG_PREFIX} Rejected request with missing/invalid x-webhook-secret header.`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isPlainObjectBody(req.body)) {
    return rejectBadRequest(res, LOG_PREFIX, 'body is missing or not a JSON object');
  }

  const fromCheck = requireString(req.body.from, 'from', MAX_NAME_LENGTH);
  if (!fromCheck.ok) {
    return rejectBadRequest(res, LOG_PREFIX, fromCheck.reason);
  }

  const messageCheck = requireString(req.body.message, 'message', MAX_PROMPT_LENGTH);
  if (!messageCheck.ok) {
    return rejectBadRequest(res, LOG_PREFIX, messageCheck.reason);
  }

  try {
    const { reply, booking, bookingLogged } = await generateReply(fromCheck.value, messageCheck.value);
    return res.status(200).json({ reply, booking: booking || undefined, bookingLogged });
  } catch (err) {
    // Never forward err.message — it can name env vars, the spreadsheet ID,
    // or the Supabase project URL. Full detail goes to the Vercel logs.
    console.error(`${LOG_PREFIX} Error handling message:`, err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
