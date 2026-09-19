// Request-body validation helpers for Vercel serverless functions.
//
// Files under api/ whose name starts with "_" are not exposed as routes.
//
// RULE WE FOLLOW EVERYWHERE: never echo user input back in an error message.
// Echoing input is how reflected-XSS and error-oracle bugs start. The client
// gets a short, generic reason; the full detail goes to console.error, which
// lands in the Vercel function logs where only you can read it.

// Max lengths. Generous enough for real use, tight enough that a single
// request can't be used to push a giant payload into the model (which costs
// tokens = money) or into Supabase/Sheets.
const MAX_PROMPT_LENGTH = 5000;
const MAX_NAME_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 50;

/**
 * Checks a value is a non-empty string within a length cap.
 * @returns {{ ok: true, value: string } | { ok: false, reason: string }}
 */
function requireString(value, fieldName, maxLength) {
  if (typeof value !== 'string') {
    return { ok: false, reason: `"${fieldName}" must be a string.` };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, reason: `"${fieldName}" is required.` };
  }
  if (trimmed.length > maxLength) {
    return { ok: false, reason: `"${fieldName}" exceeds the maximum length of ${maxLength} characters.` };
  }
  return { ok: true, value: trimmed };
}

/**
 * Normalises a client-supplied conversation history into the shape the
 * Gemini SDK expects, dropping anything malformed instead of trusting it.
 * Oversized individual messages are truncated rather than rejected, so one
 * long past turn doesn't break an otherwise valid conversation.
 */
function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (m) =>
        m &&
        typeof m.text === 'string' &&
        m.text.trim().length > 0 &&
        (m.role === 'user' || m.role === 'assistant')
    )
    .slice(-MAX_HISTORY_MESSAGES) // keep the most recent turns
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text.slice(0, MAX_PROMPT_LENGTH) }],
    }));
}

/**
 * Guards against a body that isn't a plain JSON object. Vercel parses JSON
 * bodies automatically; a malformed or non-JSON body arrives as undefined,
 * a string, or an array — none of which we can destructure safely.
 */
function isPlainObjectBody(body) {
  return !!body && typeof body === 'object' && !Array.isArray(body);
}

/**
 * Writes a 400 with a generic message and logs the real reason server-side.
 * Always returns true so callers can `if (rejectBadRequest(...)) return;`.
 */
function rejectBadRequest(res, logPrefix, reason) {
  console.warn(`${logPrefix} Rejected request: ${reason}`);
  res.status(400).json({ error: 'Invalid request.' });
  return true;
}

module.exports = {
  requireString,
  sanitizeHistory,
  isPlainObjectBody,
  rejectBadRequest,
  MAX_PROMPT_LENGTH,
  MAX_NAME_LENGTH,
  MAX_HISTORY_MESSAGES,
};
