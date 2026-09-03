const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getConversation, addMessage } = require('./conversation-store');
const { appendBooking } = require('./sheets');

const MODEL_NAME = 'gemini-3.5-flash';
const BOOKING_BLOCK_REGEX = /```json\s*([\s\S]*?)```/i;

// Hardcoded until multi-tenant support lands — every conversation currently
// belongs to this one clinic.
const CLIENT_SLUG = 'smile-dental';

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

// Pulls the ```json { "booking": {...}, "bookingComplete": true } ``` block
// out of a reply, if present, and returns the reply text with that block
// stripped out. Riya confirms bookings herself now (see the system prompt),
// so `bookingComplete: true` is what actually signals a completed booking —
// not just the presence of a json block.
function extractBooking(replyText) {
  const match = replyText.match(BOOKING_BLOCK_REGEX);
  if (!match) {
    return { cleanReply: replyText.trim(), booking: null };
  }

  let booking = null;
  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed && parsed.bookingComplete === true && parsed.booking) {
      booking = parsed.booking;
    }
  } catch (err) {
    console.error('[ai] Failed to parse booking JSON from model reply:', err.message);
  }

  const cleanReply = replyText.replace(BOOKING_BLOCK_REGEX, '').trim();
  return { cleanReply, booking };
}

async function generateReply(phone, userMessage) {
  const priorMessages = await getConversation(phone, CLIENT_SLUG);

  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: loadSystemPrompt(),
  });

  const priorHistory = priorMessages.map((m) => ({
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
  await addMessage(phone, { role: 'user', text: userMessage }, CLIENT_SLUG);
  await addMessage(phone, { role: 'assistant', text: rawReply }, CLIENT_SLUG);

  const { cleanReply, booking } = extractBooking(rawReply);

  // extractBooking() already checked bookingComplete === true, so a non-null
  // booking here means Riya has confirmed the appointment herself.
  let bookingLogged = false;
  if (booking) {
    console.log(`\n✅ New booking collected for ${phone}:`);
    console.log(JSON.stringify(booking, null, 2));

    bookingLogged = await appendBooking({
      phoneNumber: phone,
      patientName: booking.name,
      service: booking.service,
      preferredDate: booking.preferred_date,
      preferredTime: booking.preferred_time,
    });
  }

  return { reply: cleanReply, booking, bookingLogged };
}

module.exports = { generateReply };
