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

  // Runs one Gemini call, with or without the Google Search grounding tool.
  function callModel(genAI, withSearchTool) {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
      tools: withSearchTool ? [{ googleSearch: {} }] : undefined,
    });
    if (priorHistory.length) {
      const chat = model.startChat({ history: priorHistory });
      return chat.sendMessage(prompt);
    }
    return model.generateContent(prompt);
  }

  // Google Search grounding sits behind its own permission/quota gate,
  // separate from plain text generation — e.g. free-tier keys don't get
  // grounding on Gemini 3.x models at all, only on a billed project. Google
  // reports that the same way it reports any other quota/permission problem
  // (429 Too Many Requests or 403 Permission Denied), so we can't tell from
  // the error alone whether it's the grounding gate specifically or a
  // broader account issue — but since it only happens on calls that asked
  // for the tool, scope the retry to those.
  function isPermissionOrQuotaError(err) {
    return !!err && (err.status === 429 || err.status === 403);
  }

  try {
    const genAI = getClient();

    let result;
    let degraded = false;
    try {
      result = await callModel(genAI, !!useSearch);
    } catch (err) {
      if (useSearch && isPermissionOrQuotaError(err)) {
        console.warn('[focus-loop] Google Search grounding unavailable (permission/quota), retrying without it:', err.message);
        result = await callModel(genAI, false);
        degraded = true;
      } else {
        throw err;
      }
    }

    const reply = result.response.text();
    return res.status(200).json({ reply, degraded });
  } catch (err) {
    console.error('[focus-loop] Gemini API call failed:', err);
    // Forward Google's actual status/message (e.g. 429 quota exceeded, 400
    // invalid key) instead of a generic 500 — this is what actually showed
    // up in the Vercel function logs when debugging a silent "offline"
    // failure, so surface it to the browser instead of hiding it.
    const status = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
    return res.status(status).json({ error: err.message || 'Gemini call failed' });
  }
};
