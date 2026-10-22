const { google } = require('googleapis');

const SHEET_RANGE = 'Sheet1!A:H';

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !rawPrivateKey) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY is not set. Add them to your .env file.'
    );
  }

  // Env vars store the key with literal "\n" sequences — convert to real newlines.
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// Appends one booking as a row. Never throws — a Sheets outage shouldn't stop
// the receptionist from replying to the patient. Returns true/false so the
// caller knows whether the row was actually logged.
async function appendBooking(bookingData) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not set. Add it to your .env file.');
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const row = [
      new Date().toISOString(),
      bookingData.phoneNumber || '',
      bookingData.patientName || '',
      bookingData.service || '',
      bookingData.preferredDate || '',
      bookingData.preferredTime || '',
      'Confirmed',
      '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: SHEET_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return true;
  } catch (err) {
    console.error('[sheets] Failed to append booking to Google Sheets:', err);
    return false;
  }
}

// Reads every logged booking row. Never throws — a Sheets outage should
// degrade the dashboard to an empty list, not break the whole page. Returns
// { bookings, configured } so the caller can tell "no data yet" apart from
// "Sheets isn't set up".
async function listBookings() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return { bookings: [], configured: false };
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: SHEET_RANGE,
    });

    const rows = (data.values || []).slice(1); // drop header row
    const bookings = rows
      .filter((row) => row.length > 0)
      .map((row) => ({
        timestamp: row[0] || null,
        phoneNumber: row[1] || '',
        patientName: row[2] || '',
        service: row[3] || '',
        preferredDate: row[4] || '',
        preferredTime: row[5] || '',
        status: row[6] || '',
        notes: row[7] || '',
      }));

    return { bookings, configured: true };
  } catch (err) {
    console.error('[sheets] Failed to read bookings from Google Sheets:', err);
    return { bookings: [], configured: true };
  }
}

module.exports = { appendBooking, listBookings };
