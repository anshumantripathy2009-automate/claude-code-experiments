# WhatsApp AI Dental Receptionist

An AI receptionist that chats with patients over WhatsApp, in a warm Hinglish
tone, and collects their **name, service, and preferred date/time** — then
auto-logs the booking as a row in a Google Sheet your front desk already
checks. Powered by Google Gemini's free tier (`gemini-3.5-flash`).

> **Model note:** this uses `gemini-3.5-flash`, Google's current stable
> flash model as of September 2026. The earlier `gemini-2.0-flash-exp`
> preview model was retired by Google on June 1, 2026 — if you fork this
> project later and Gemini errors start showing up in your logs, check
> [Google's model list](https://ai.google.dev/gemini-api/docs/models) for
> the current stable model name and update `MODEL_NAME` in `src/ai.js`.

## What it does

- Patient messages the clinic's WhatsApp number.
- Your WhatsApp provider (Twilio, Meta Cloud API, WATI, etc.) forwards the
  message to this app's `/webhook` endpoint.
- Gemini, primed with a receptionist system prompt, replies naturally,
  remembers the conversation per phone number, and asks for whatever's
  missing (name → service → date/time).
- Once all three are collected, it replies with a confirmation, logs the
  structured booking JSON to the console, and appends a row to your Google
  Sheet (timestamp, phone, name, service, date, time, status "Pending").

## Who it's for

Solo dentists and small dental clinics (1-3 chairs) who currently handle
WhatsApp booking enquiries by hand and lose leads outside office hours.

## Setup

### 1. Get a free Gemini API key

Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey),
create a key, and copy it.

### 2. Install dependencies

```bash
cd automations/whatsapp-dental-receptionist
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and paste your key:

```
GEMINI_API_KEY=your_actual_key_here
```

### 4. Google Sheets setup (bookings auto-log here)

1. Create a Google Sheet (any name). Add header row `Timestamp | Phone | Name | Service | Preferred Date | Preferred Time | Status | Notes`
   in row 1 of `Sheet1` — bookings get appended below it, in `Sheet1!A:H`.
2. Copy the spreadsheet ID from its URL:
   `https://docs.google.com/spreadsheets/d/<THIS_PART>/edit` →
   `GOOGLE_SHEETS_SPREADSHEET_ID`.
3. In [Google Cloud Console](https://console.cloud.google.com/), create (or
   reuse) a project, enable the **Google Sheets API**, then create a
   **Service Account** (IAM & Admin → Service Accounts).
4. Create a JSON key for that service account and download it. From the
   JSON: copy `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and
   `private_key` → `GOOGLE_PRIVATE_KEY` (keep it wrapped in quotes with the
   `\n` sequences intact — the app converts them to real newlines at
   runtime).
5. Open the Google Sheet, click **Share**, and share it with the service
   account's email (`...@...iam.gserviceaccount.com`) as an **Editor**.
   Without this step, every append call fails with a permissions error.
6. Add all three values to `.env`:

```
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

If Sheets logging fails (missing env vars, sharing not set up, API not
enabled), the receptionist still replies to the patient normally — it just
logs the error server-side and reports `"bookingLogged": false` in the
webhook response, so nothing is lost, but the booking won't be on the sheet
until you fix the config.

### 5. Run locally

```bash
npx vercel dev
```

This serves the endpoint at `http://localhost:3000/webhook`.

### 6. Test it (no WhatsApp account needed)

Open [Hoppscotch](https://hoppscotch.io) and send a `POST` request to
`http://localhost:3000/webhook` with a JSON body like:

```json
{
  "from": "+919876543210",
  "message": "Hi"
}
```

See [`test/example-requests.md`](./test/example-requests.md) for a full
sample conversation, including the point where the booking JSON is logged
to your terminal and (if configured) appended to your Google Sheet — check
the response's `"bookingLogged"` field to confirm.

### 7. Deploy to Vercel

```bash
npx vercel
```

Then add `GEMINI_API_KEY`, `GOOGLE_SHEETS_SPREADSHEET_ID`,
`GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY` as environment
variables in your Vercel project settings (Project → Settings →
Environment Variables), and redeploy.

### 8. Connect a real WhatsApp number (next step, not included here)

Point your WhatsApp Business API provider's inbound-message webhook at
`https://<your-project>.vercel.app/webhook`, mapping their payload's sender
number and text into `{ "from": ..., "message": ... }`. Provider-specific
wiring (Twilio/Meta/WATI) is a quick add-on — see "Upsells" below.

## How the pieces fit together

```
api/webhook.js              → Vercel serverless entrypoint (POST /webhook)
src/ai.js                   → Talks to Gemini, manages system prompt, parses booking JSON
src/sheets.js               → Appends completed bookings to Google Sheets
src/conversation-store.js   → In-memory per-phone-number chat history
src/prompts/receptionist-prompt.md → The receptionist's personality & rules
```

**Note on memory:** conversation history is stored in-memory (a plain JS
object), which is fine for demos and low-traffic use, but resets on every
serverless cold start / redeploy. Completed bookings survive this, though —
they're written straight to your Google Sheet as soon as they're collected.
For production conversation history, swap `src/conversation-store.js` for
Supabase (already in the default stack) — same function signatures, just
backed by a table instead of an object.

## Sales pitch (paste into a DM/proposal)

> Most dental clinics lose bookings because nobody's free to answer WhatsApp
> between patients or after hours. This AI receptionist replies instantly,
> in the tone your patients already text in, collects everything your front
> desk needs (name, service, preferred time), and hands you a ready-to-book
> lead — 24/7, for less than the cost of one missed appointment.

## Suggested pricing

- **Setup:** ₹8,000–₹15,000 one-time (branding the prompt to their clinic,
  connecting their WhatsApp number, basic testing with their team)
- **Retainer:** ₹1,500–₹3,000/month (hosting, monitoring, prompt tweaks,
  Gemini API usage — stays on the free tier for most single-clinic volumes)

Reasoning: this is a thin, fast-to-build wrapper — price it as a productized
service with a low setup fee and a small retainer to cover your time keeping
it running, not as a custom software project.

## Demo script (90 seconds)

1. Open WhatsApp (or Hoppscotch if no live number yet), send "Hi".
2. Show the instant, warm Hinglish reply.
3. Send name → service → date/time in three quick messages.
4. Flip to the Google Sheet — the booking row appears the moment the
   conversation completes, no manual entry: "that's what your front desk
   sees, live."

## Cheapest viable v1 (what's shipped here)

- Conversation history is in-memory only — good enough for a live demo or
  single-clinic pilot. Completed bookings, though, are already durable:
  they're written straight to the client's Google Sheet.
- No WhatsApp provider wiring yet — testable via plain HTTP (Hoppscotch)
  today, provider webhook mapping is a follow-up task once a client is
  confirmed.
- Single clinic's services/hours baked into the prompt — fine for one
  client at a time; multi-tenant config is an upsell.

## Upsells / add-ons

- Real WhatsApp Business API wiring (Twilio/Meta Cloud API/WATI)
- Supabase-backed persistent conversation history (bookings already land in
  Sheets; this covers the chat log too)
- Auto-sync confirmed bookings from the Sheet to Google Calendar / clinic CRM
- SMS/email fallback confirmation to the patient
- Multi-language support (pure Hindi, English, regional languages)
- Admin dashboard to see all pending bookings
