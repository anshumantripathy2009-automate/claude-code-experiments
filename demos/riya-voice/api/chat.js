// Vercel serverless function — POST /api/chat
// Thin Gemini proxy for the Riya voice demo. Mirrors the exact call pattern
// used in automations/whatsapp-dental-receptionist/src/ai.js (same package,
// same GEMINI_API_KEY env var, same model, same startChat/sendMessage shape).
//
// This proxy exists so the API key never ships to the browser: index.html is
// a static page that gets linked directly to prospects, so embedding the key
// client-side would expose it (and your Gemini quota/billing) to anyone who
// opens dev tools. The key stays server-side here, same as the WhatsApp bot.
//
// SECURITY POSTURE (Tier 1 audit):
//   - Key read from process.env, never hardcoded.
//   - Per-IP rate limit (see _lib/rateLimit.js) so a prospect's demo link
//     can't be turned into a free Gemini endpoint on your quota.
//   - Every field validated and length-capped before it reaches the model.
//   - Errors are logged in full server-side and returned generically.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { enforceRateLimit } = require('./_lib/rateLimit');
const {
  requireString,
  sanitizeHistory,
  isPlainObjectBody,
  rejectBadRequest,
  MAX_PROMPT_LENGTH,
} = require('./_lib/validate');

const MODEL_NAME = 'gemini-3.5-flash';
const LOG_PREFIX = '[riya-voice]';

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

  // Rate limit BEFORE any parsing or model work — the whole point is to spend
  // as little as possible on a caller we're about to turn away.
  if (enforceRateLimit(req, res, LOG_PREFIX)) return;

  if (!isPlainObjectBody(req.body)) {
    return rejectBadRequest(res, LOG_PREFIX, 'body is missing or not a JSON object');
  }

  const messageCheck = requireString(req.body.message, 'message', MAX_PROMPT_LENGTH);
  if (!messageCheck.ok) {
    return rejectBadRequest(res, LOG_PREFIX, messageCheck.reason);
  }
  const message = messageCheck.value;

  // Client keeps the running conversation in memory (per browser tab) and
  // resends it each turn — no server-side persistence needed for a demo.
  const priorHistory = sanitizeHistory(req.body.history);

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
    // Full detail to the Vercel logs, generic message to the browser — a
    // prospect must never see a stack trace or an env-var name.
    console.error(`${LOG_PREFIX} Gemini API call failed:`, err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
