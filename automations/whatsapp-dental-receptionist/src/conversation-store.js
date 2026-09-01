// In-memory conversation store, keyed by phone number.
// NOTE: this resets on every server restart / serverless cold start.
// Fine for a demo/v1 — swap for Supabase/Redis before real production use.

const conversations = {};

function getConversation(phone) {
  if (!conversations[phone]) {
    conversations[phone] = {
      history: [], // [{ role: 'user' | 'assistant', text: string }]
      booking: null,
    };
  }
  return conversations[phone];
}

function addMessage(phone, role, text) {
  const convo = getConversation(phone);
  convo.history.push({ role, text });
  return convo;
}

function setBooking(phone, booking) {
  const convo = getConversation(phone);
  convo.booking = booking;
  return convo;
}

function resetConversation(phone) {
  delete conversations[phone];
}

module.exports = {
  getConversation,
  addMessage,
  setBooking,
  resetConversation,
};
