// Vercel serverless function — POST /webhook (rewritten from /api/webhook, see vercel.json)
// Expects: { "from": "<phone number>", "message": "<text>" }
// In a real deployment, this endpoint sits behind your WhatsApp provider
// (e.g. Twilio, Meta Cloud API, WATI) which forwards inbound messages here
// and relays the JSON "reply" back out over WhatsApp.

const { generateReply } = require('../src/ai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { from, message } = req.body || {};

  if (!from || typeof from !== 'string') {
    return res.status(400).json({ error: '"from" (phone number) is required.' });
  }
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '"message" (text) is required.' });
  }

  try {
    const { reply, booking } = await generateReply(from, message);
    return res.status(200).json({ reply, booking: booking || undefined });
  } catch (err) {
    console.error('[webhook] Error handling message:', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
};
