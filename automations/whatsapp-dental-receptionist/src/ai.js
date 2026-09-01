const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getConversation, addMessage, setBooking } = require('./conversation-store');

const MODEL_NAME = 'gemini-3.5-flash';
const BOOKING_BLOCK_REGEX = /```booking\s*([\s\S]*?)```/i;

let cachedSystemPrompt = null;

function loadSystemPrompt() {
  if (!cachedSystemPrompt) {
    cachedSystemPrompt = fs.readFileSync(
      path.join(__dirname, 'prompts', 'receptionist-prompt.md'),
      'utf-8'
    );
  }
  return cachedSystemPrompt;
}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your .env file.');
  }
  return new GoogleGenerativeAI(apiKey);
}

// Pulls the ```booking {...} ``` block out of a reply, if present, and
// returns the reply text with that block stripped out.
function extractBooking(replyText) {
  const match = replyText.match(BOOKING_BLOCK_REGEX);
  if (!match) {
    return { cleanReply: replyText.trim(), booking: null };
  }

  let booking = null;
  try {
    booking = JSON.parse(match[1].trim());
  } catch (err) {
    console.error('[ai] Failed to parse booking JSON from model reply:', err.message);
  }

  const cleanReply = replyText.replace(BOOKING_BLOCK_REGEX, '').trim();
  return { cleanReply, booking };
}

async function generateReply(phone, userMessage) {
  const convo = getConversation(phone);
  addMessage(phone, 'user', userMessage);

  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: loadSystemPrompt(),
  });

  // Everything except the user message we just appended becomes prior history.
  const priorHistory = convo.history.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));

  const chat = model.startChat({ history: priorHistory });

  let result;
  try {
    result = await chat.sendMessage(userMessage);
  } catch (err) {
    console.error('[ai] Gemini API call failed:', err);
    throw new Error('Sorry, the receptionist is unavailable right now. Please try again shortly.');
  }

  const rawReply = result.response.text();
  addMessage(phone, 'assistant', rawReply);

  const { cleanReply, booking } = extractBooking(rawReply);

  if (booking) {
    setBooking(phone, booking);
    console.log(`\n✅ New booking collected for ${phone}:`);
    console.log(JSON.stringify(booking, null, 2));
  }

  return { reply: cleanReply, booking };
}

module.exports = { generateReply };
