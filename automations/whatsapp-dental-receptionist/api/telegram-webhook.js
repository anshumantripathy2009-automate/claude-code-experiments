// Vercel serverless function — POST /api/telegram-webhook
// Receives Telegram Bot API updates (set via setWebhook, see README.md
// "Telegram setup") and drives the SAME receptionist logic as /webhook —
// same Gemini prompt, same Supabase memory, same Google Sheets logging.
//
// Telegram chat IDs are stored as the "phone" key prefixed with "tg:" (e.g.
// "tg:123456789") so they can never collide with real WhatsApp numbers in
// the conversations table.

const { generateReply } = require('../src/ai');

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('[telegram-webhook] TELEGRAM_BOT_TOKEN is not set — cannot send reply.');
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
      console.error(`[telegram-webhook] Telegram API error (${response.status}):`, body);
    }
  } catch (err) {
    console.error('[telegram-webhook] Failed to call Telegram sendMessage:', err);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const update = req.body || {};
  console.log('[telegram-webhook] Received update:', JSON.stringify(update));

  const message = update.message;

  // Telegram also posts edited_message/channel_post/etc. updates — nothing
  // to reply to, so just acknowledge with 200 (Telegram retries on non-200).
  if (!message || !message.chat || typeof message.chat.id === 'undefined') {
    console.log('[telegram-webhook] Update has no message.chat — ignoring.');
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;
  const phoneNumber = `tg:${chatId}`;

  if (typeof message.text !== 'string' || !message.text.trim()) {
    console.log(`[telegram-webhook] Non-text message from ${phoneNumber} — sending fallback reply.`);
    await sendTelegramMessage(chatId, 'Sorry, I can only understand text messages for now.');
    return res.status(200).json({ ok: true });
  }

  try {
    const { reply } = await generateReply(phoneNumber, message.text);
    await sendTelegramMessage(chatId, reply);
  } catch (err) {
    console.error(`[telegram-webhook] Error generating reply for ${phoneNumber}:`, err);
    await sendTelegramMessage(chatId, 'Sorry, having a technical issue. Please try again.');
  }

  // Always 200 once we've handled (or attempted to handle) the update —
  // a non-200 makes Telegram redeliver the same update repeatedly.
  return res.status(200).json({ ok: true });
};
