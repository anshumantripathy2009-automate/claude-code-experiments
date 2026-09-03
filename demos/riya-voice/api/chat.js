// Vercel serverless function — POST /api/chat
// Thin Gemini proxy for the Riya voice demo. Mirrors the exact call pattern
// used in automations/whatsapp-dental-receptionist/src/ai.js (same package,
// same GEMINI_API_KEY env var, same model, same startChat/sendMessage shape).
//
// This proxy exists so the API key never ships to the browser: index.html is
// a static page that gets linked directly to prospects, so embedding the key
// client-side would expose it (and your Gemini quota/billing) to anyone who
// opens dev tools. The key stays server-side here, same as the WhatsApp bot.

const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_NAME = 'gemini-3.5-flash';

const SYSTEM_PROMPT = `You are Riya, NoirFlow's AI sales demo assistant. NoirFlow is an AI automation and digital infrastructure agency based in Bhubaneswar, India, serving Indian SMBs (dental clinics, real estate, local businesses). You explain what NoirFlow builds: AI receptionists (WhatsApp/Telegram, Hinglish, books appointments automatically), business websites, and automation systems. Speak in warm Hinglish, 2-3 sentences max per reply — this is a spoken conversation, not a written one. If asked about pricing, give a general range (setup fee + monthly care plan) and always end by inviting them to book a discovery call with Anshuman. Never make up specific prices, dates, or claims not in this prompt.`;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your .env file.');
  }
  return new GoogleGenerativeAI(apiKey);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '"message" (text) is required.' });
  }

  // Client keeps the running conversation in memory (per browser tab) and
  // resends it each turn — no server-side persistence needed for a demo.
  const priorHistory = Array.isArray(history)
    ? history
        .filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.text }],
        }))
    : [];

  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({ history: priorHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('[riya-voice] Gemini API call failed:', err);
    return res.status(500).json({ error: 'Gemini call failed' });
  }
};
