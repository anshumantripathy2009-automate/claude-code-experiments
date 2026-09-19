// Vercel serverless function — POST /api/telegram-webhook
// Receives Telegram Bot API updates (set via setWebhook, see README.md
// "Telegram setup") and drives the SAME receptionist logic as /webhook —
// same Gemini prompt, same Supabase memory, same Google Sheets logging.
//
// Telegram chat IDs are stored as the "phone" key prefixed with "tg:" (e.g.
// "tg:123456789") so they can never collide with real WhatsApp numbers in
// the conversations table.
//
// SECURITY POSTURE (Tier 1 audit):
//   - Verifies Telegram's secret token header when configured, so a stranger
//     who guesses the URL can't puppet the bot.
//   - Per-IP rate limit (see _lib/rateLimit.js).
//   - Message text validated and length-capped before reaching the model.
//   - Logs metadata only — never full message bodies (patient PII).

const { generateReply } = require('../src/ai');
const { enforceRateLimit } = require('./_lib/rateLimit');
const { requireString, isPlainObjectBody, MAX_PROMPT_LENGTH } = require('./_lib/validate');

const LOG_PREFIX = '[telegram-webhook]';

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error(`${LOG_PREFIX} TELEGRAM_BOT_TOKEN is not set — cannot send reply.`);
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`${LOG_PREFIX} Telegram API error (${response.status}):`, body);
    }
  } catch (err) {
    console.error(`${LOG_PREFIX} Failed to call Telegram sendMessage:`, err);
  }
}

// Telegram echoes back whatever secret_token you passed to setWebhook, in
// the X-Telegram-Bot-Api-Secret-Token header. Register it like this:
//
//   curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
//     -d "url=https://<your-app>.vercel.app/api/telegram-webhook" \
//     -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
//
// Left unset, the endpoint stays open (so this change can't silently break a
// live bot) but warns on every call. Set it — the URL is the only thing
// standing between a stranger and your Gemini bill otherwise.
function isFromTelegram(req) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) {
    console.warn(
      `${LOG_PREFIX} TELEGRAM_WEBHOOK_SECRET is not set — this endpoint accepts updates from anyone. Set it in your Vercel env and re-run setWebhook.`
    );
    return true;
  }
  return req.headers['x-telegram-bot-api-secret-token'] === expected;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (enforceRateLimit(req, res, LOG_PREFIX)) return;

  if (!isFromTelegram(req)) {
    console.warn(`${LOG_PREFIX} Rejected update with missing/invalid secret token header.`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isPlainObjectBody(req.body)) {
    console.warn(`${LOG_PREFIX} Body is missing or not a JSON object — ignoring.`);
    return res.status(200).json({ ok: true });
  }

  const update = req.body;
  const message = update.message;

  // Telegram also posts edited_message/channel_post/etc. updates — nothing
  // to reply to, so just acknowledge with 200 (Telegram retries on non-200).
  if (!message || !message.chat || typeof message.chat.id === 'undefined') {
    console.log(`${LOG_PREFIX} Update ${update.update_id} has no message.chat — ignoring.`);
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;
  const phoneNumber = `tg:${chatId}`;

  // Validate and cap the text. Note we log the FAILURE REASON and the chat
  // id, never the text itself — message bodies are patient PII and Vercel
  // logs are not the place for them.
  const textCheck = requireString(message.text, 'message.text', MAX_PROMPT_LENGTH);
  if (!textCheck.ok) {
    console.log(`${LOG_PREFIX} Unusable text from ${phoneNumber} (${textCheck.reason}) — sending fallback reply.`);
    await sendTelegramMessage(
      chatId,
      'Sorry, I can only understand text messages, and shorter ones work best. Could you try again?'
    );
    return res.status(200).json({ ok: true });
  }

  try {
    const { reply } = await generateReply(phoneNumber, textCheck.value);
    await sendTelegramMessage(chatId, reply);
  } catch (err) {
    console.error(`${LOG_PREFIX} Error generating reply for ${phoneNumber}:`, err);
    await sendTelegramMessage(chatId, 'Sorry, having a technical issue. Please try again.');
  }

  // Always 200 once we've handled (or attempted to handle) the update —
  // a non-200 makes Telegram redeliver the same update repeatedly.
  return res.status(200).json({ ok: true });
};
