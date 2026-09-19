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
//
// SECURITY POSTURE (Tier 1 audit):
//   - Key read from process.env, never hardcoded.
//   - Per-IP rate limit (see _lib/rateLimit.js).
//   - Fields validated and length-capped before reaching the model.
//   - Errors logged in full server-side, generic message to the browser
//     unless DEBUG_ERRORS is explicitly enabled (see below).
//
// KNOWN LIMITATION — read this before sharing the URL:
// Because the client supplies `systemPrompt`, anyone who can reach this
// endpoint can make it behave as any assistant they like, on your Gemini
// quota. The rate limit caps the damage; it does not remove it. If Focus
// Loop ever becomes a public/multi-user product, move prompt assembly
// server-side and put auth in front of this route.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { enforceRateLimit } = require('./_lib/rateLimit');
const { requireString, sanitizeHistory, isPlainObjectBody, rejectBadRequest } = require('./_lib/validate');

const MODEL_NAME = 'gemini-3.5-flash';
const LOG_PREFIX = '[focus-loop]';

// Focus Loop's prompts legitimately embed serialised app state — a full day
// of sprint logs, a nested classroom history — so the shared 5000-char
// default would reject normal usage. These caps are deliberately generous
// but still bounded, so no single request can push an unlimited payload
// (= unlimited token spend) into the model.
const MAX_SYSTEM_PROMPT_LENGTH = 10000;
const MAX_PROMPT_LENGTH = 20000;

// Opt-in flag: set DEBUG_ERRORS=1 in the Vercel env to surface Google's real
// status/message in the browser again. Off by default so production never
// leaks internals. This exists because Anshuman debugs from a phone, with no
// easy access to Vercel function logs — turn it on temporarily, then off.
const DEBUG_ERRORS = process.env.DEBUG_ERRORS === '1';

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

  // Rate limit first — cheapest possible rejection for an abusive caller.
  if (enforceRateLimit(req, res, LOG_PREFIX)) return;

  if (!isPlainObjectBody(req.body)) {
    return rejectBadRequest(res, LOG_PREFIX, 'body is missing or not a JSON object');
  }

  const systemPromptCheck = requireString(req.body.systemPrompt, 'systemPrompt', MAX_SYSTEM_PROMPT_LENGTH);
  if (!systemPromptCheck.ok) {
    return rejectBadRequest(res, LOG_PREFIX, systemPromptCheck.reason);
  }
  const systemPrompt = systemPromptCheck.value;

  const promptCheck = requireString(req.body.prompt, 'prompt', MAX_PROMPT_LENGTH);
  if (!promptCheck.ok) {
    return rejectBadRequest(res, LOG_PREFIX, promptCheck.reason);
  }
  const prompt = promptCheck.value;

  const useSearch = req.body.useSearch === true;
  const priorHistory = sanitizeHistory(req.body.history);

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

  // A 5xx means Google's own servers are temporarily overloaded/unavailable
  // — not a problem with our key, billing, or the request. It's the one
  // error class worth a short automatic retry rather than surfacing to the
  // user, who'd otherwise have to notice and resend by hand (Anshuman is
  // phone-only, no laptop to babysit this from).
  function isTransientServerError(err) {
    return !!err && typeof err.status === 'number' && err.status >= 500 && err.status < 600;
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function callModelWithRetry(genAI, withSearchTool) {
    try {
      return await callModel(genAI, withSearchTool);
    } catch (err) {
      if (isTransientServerError(err)) {
        console.warn(`${LOG_PREFIX} Transient server error, retrying once:`, err.status, err.message);
        await sleep(1200);
        return await callModel(genAI, withSearchTool);
      }
      throw err;
    }
  }

  try {
    const genAI = getClient();

    let result;
    let degraded = false;
    try {
      result = await callModelWithRetry(genAI, useSearch);
    } catch (err) {
      if (useSearch && isPermissionOrQuotaError(err)) {
        console.warn(
          `${LOG_PREFIX} Google Search grounding unavailable (permission/quota), retrying without it:`,
          err.message
        );
        result = await callModelWithRetry(genAI, false);
        degraded = true;
      } else {
        throw err;
      }
    }

    const reply = result.response.text();
    return res.status(200).json({ reply, degraded });
  } catch (err) {
    // Always log the real error — this is what shows up in Vercel logs.
    console.error(`${LOG_PREFIX} Gemini API call failed:`, err);

    // Keep the upstream status code (it's useful and not sensitive: a 429
    // means quota, a 400 means bad key) but never the upstream message,
    // which can name env vars, internal endpoints, or project IDs.
    const status = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
    const body = { error: 'Something went wrong' };
    if (DEBUG_ERRORS) {
      body.detail = err.message || 'Gemini call failed';
    }
    return res.status(status).json(body);
  }
};
