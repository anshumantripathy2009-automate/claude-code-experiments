// Sends the clinic owner / doctor an instant alert whenever Riya confirms a
// booking, so a human knows about every appointment the moment it happens.
//
// Delivery: Telegram message from the same bot (TELEGRAM_BOT_TOKEN) to every
// chat ID listed in OWNER_TELEGRAM_CHAT_ID (comma-separated, e.g. the doctor
// and the front desk). Each person finds their chat ID by sending /myid to
// the bot — see README "Owner alerts".
//
// Like appendBooking(), this never throws: a failed alert must never stop the
// patient from getting their reply. Returns true if at least one alert went out.

const LOG_PREFIX = '[notify-owner]';

function getOwnerChatIds() {
  return (process.env.OWNER_TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

// Telegram chats are stored as "tg:<chatId>" — there's no phone number to show.
function describeContact(phoneNumber) {
  if (!phoneNumber) return 'Not shared';
  if (phoneNumber.startsWith('tg:')) return 'Telegram chat (reply in the bot)';
  return phoneNumber;
}

function buildAlertText(booking, { sheetLogged }) {
  const when = [booking.preferredDate, booking.preferredTime].filter(Boolean).join(', ') || 'Time not given';
  return [
    '🦷 New booking by your AI receptionist',
    '',
    `👤 ${booking.patientName || 'Name not given'}`,
    `🩺 ${booking.service || 'Service not given'}`,
    `📅 ${when}`,
    `📞 ${describeContact(booking.phoneNumber)}`,
    '',
    sheetLogged ? '📊 Saved to Google Sheet ✅' : '⚠️ NOT saved to the Google Sheet — please add it manually.',
  ].join('\n');
}

async function notifyOwner(booking, { sheetLogged = false } = {}) {
  const chatIds = getOwnerChatIds();
  if (chatIds.length === 0) {
    console.warn(`${LOG_PREFIX} OWNER_TELEGRAM_CHAT_ID is not set — skipping owner alert.`);
    return false;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error(`${LOG_PREFIX} TELEGRAM_BOT_TOKEN is not set — cannot send owner alert.`);
    return false;
  }

  // Plain text (no parse_mode) so patient-supplied names can't break formatting.
  const text = buildAlertText(booking, { sheetLogged });
  let delivered = 0;

  for (const chatId of chatIds) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      if (response.ok) {
        delivered += 1;
      } else {
        // Log status only — the body can echo the message, which contains patient details.
        console.error(`${LOG_PREFIX} Telegram API error ${response.status} sending alert to chat ${chatId}.`);
      }
    } catch (err) {
      console.error(`${LOG_PREFIX} Failed to send alert to chat ${chatId}:`, err.message);
    }
  }

  console.log(`${LOG_PREFIX} Owner alert delivered to ${delivered}/${chatIds.length} chat(s).`);
  return delivered > 0;
}

module.exports = { notifyOwner, buildAlertText };
