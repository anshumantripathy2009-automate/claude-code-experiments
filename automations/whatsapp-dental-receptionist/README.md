# WhatsApp AI Dental Receptionist

An AI receptionist that chats with patients over WhatsApp, in a warm Hinglish
tone, and collects their **name, service, and preferred date/time** — then
outputs a structured booking your team can drop straight into a calendar or
CRM. Powered by Google Gemini's free tier (`gemini-3.5-flash`).

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
- Once all three are collected, it replies with a confirmation and the
  server logs a structured booking JSON to the console (ready to pipe into
  a booking system, spreadsheet, or Slack alert).

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

### 4. Run locally

```bash
npx vercel dev
```

This serves the endpoint at `http://localhost:3000/webhook`.

### 5. Test it (no WhatsApp account needed)

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
to your terminal.

### 6. Deploy to Vercel

```bash
npx vercel
```

Then add `GEMINI_API_KEY` as an environment variable in your Vercel project
settings (Project → Settings → Environment Variables), and redeploy.

### 7. Connect a real WhatsApp number (next step, not included here)

Point your WhatsApp Business API provider's inbound-message webhook at
`https://<your-project>.vercel.app/webhook`, mapping their payload's sender
number and text into `{ "from": ..., "message": ... }`. Provider-specific
wiring (Twilio/Meta/WATI) is a quick add-on — see "Upsells" below.

## How the pieces fit together

```
api/webhook.js              → Vercel serverless entrypoint (POST /webhook)
src/ai.js                   → Talks to Gemini, manages system prompt, parses booking JSON
src/conversation-store.js   → In-memory per-phone-number chat history
src/prompts/receptionist-prompt.md → The receptionist's personality & rules
```

**Note on memory:** conversation history is stored in-memory (a plain JS
object), which is fine for demos and low-traffic use, but resets on every
serverless cold start / redeploy. For production, swap
`src/conversation-store.js` for Supabase (already in the default stack) —
same function signatures, just backed by a table instead of an object.

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
4. Show the terminal logging the structured booking JSON the moment it's
   complete — "that's what plugs into your calendar or CRM."

## Cheapest viable v1 (what's shipped here)

- No database — in-memory store, good enough for a live demo or single-clinic
  pilot.
- No WhatsApp provider wiring yet — testable via plain HTTP (Hoppscotch)
  today, provider webhook mapping is a follow-up task once a client is
  confirmed.
- Single clinic's services/hours baked into the prompt — fine for one
  client at a time; multi-tenant config is an upsell.

## Upsells / add-ons

- Real WhatsApp Business API wiring (Twilio/Meta Cloud API/WATI)
- Supabase-backed persistent conversation + booking history
- Auto-sync confirmed bookings to Google Calendar / clinic CRM
- SMS/email fallback confirmation to the patient
- Multi-language support (pure Hindi, English, regional languages)
- Admin dashboard to see all pending bookings
