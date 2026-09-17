// Vercel serverless function — POST /api/chat
// Thin Gemini proxy for Focus Loop. Mirrors the same package, env var,
// and model as automations/whatsapp-dental-receptionist/src/ai.js and
// demos/riya-voice/api/chat.js — the API key stays server-side so the
// static index.html never ships it to the browser.
//
// The BASE_SYSTEM_PROMPT + mode-specific instructions are assembled on the
// client (Focus Loop is a single-user personal tool, not a multi-tenant
// product), and forwarded here as `systemPrompt` + `prompt`. This proxy's
// only job is: attach the key, optionally turn on Google Search grounding,
// optionally continue a chat history, and return the reply text.

const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_NAME = 'gemini-3.5-flash';

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

  const { systemPrompt, prompt, history, useSearch } = req.body || {};

  if (!systemPrompt || typeof systemPrompt !== 'string') {
    return res.status(400).json({ error: '"systemPrompt" is required.' });
  }
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: '"prompt" is required.' });
  }

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
      systemInstruction: systemPrompt,
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    });

    let result;
    if (priorHistory.length) {
      const chat = model.startChat({ history: priorHistory });
      result = await chat.sendMessage(prompt);
    } else {
      result = await model.generateContent(prompt);
    }

    const reply = result.response.text();
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('[focus-loop] Gemini API call failed:', err);
    return res.status(500).json({ error: 'Gemini call failed' });
  }
};
