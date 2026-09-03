# WhatsApp AI Dental Receptionist

An AI receptionist that chats with patients over WhatsApp (or Telegram), in
a warm Hinglish tone, and collects their **name, service, and preferred
date/time** — then auto-logs the booking as a row in a Google Sheet your
front desk already checks. Powered by Google Gemini's free tier
(`gemini-3.5-flash`).

> **Model note:** this uses `gemini-3.5-flash`, Google's current stable
> flash model as of September 2026. The earlier `gemini-2.0-flash-exp`
> preview model was retired by Google on June 1, 2026 — if you fork this
> project later and Gemini errors start showing up in your logs, check
> [Google's model list](https://ai.google.dev/gemini-api/docs/models) for
> the current stable model name and update `MODEL_NAME` in `src/ai.js`.

## What it does

- Patient messages the clinic's WhatsApp number (or its Telegram bot).
- Your WhatsApp provider (Twilio, Meta Cloud API, WATI, etc.) forwards the
  message to this app's `/webhook` endpoint; Telegram posts directly to
  `/api/telegram-webhook`. Both endpoints call the exact same receptionist
  logic — same prompt, same memory, same Sheets logging.
- Gemini, primed with a receptionist system prompt, replies naturally,
  remembers the conversation per phone number (persisted in Supabase, so it
  survives across serverless invocations), and asks for whatever's missing
  (name → service → date/time).
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

### 5. Supabase setup (persistent conversation memory)

Vercel serverless functions spin up a fresh instance per request, so
without a real database the receptionist forgets the patient after every
single message — this is what makes multi-turn bookings (name → service →
date/time across several texts) actually work.

1. Create a project at [supabase.com](https://supabase.com) (the free tier
   is plenty for a single clinic).
2. Open the **SQL Editor** and run:

   ```sql
   create table conversations (
     id uuid default gen_random_uuid() primary key,
     phone_number text not null,
     messages jsonb not null default '[]'::jsonb,
     client_slug text not null default 'smile-dental',
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );
   create index conversations_phone_client_idx on conversations(phone_number, client_slug);
   ```

3. Go to **Project Settings → Data API** and copy the **Project URL** →
   `SUPABASE_URL`.
4. Go to **Project Settings → API Keys** and copy the **`service_role`**
   secret key (not the `anon`/public key — the service role key bypasses
   Row Level Security, which is what lets this server-side code read and
   write any patient's row; never expose it in client-side code) →
   `SUPABASE_SERVICE_ROLE_KEY`.
5. Add both to `.env`:

   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

If Supabase isn't configured (or a call fails), the receptionist still
replies — it just falls back to treating every message as the start of a
new conversation, and logs a warning server-side. Fine for a quick local
test, but you'll want this wired up before a real demo with multi-message
bookings.

### 6. Run locally

```bash
npx vercel dev
```

This serves the endpoint at `http://localhost:3000/webhook`.

### 7. Test it (no WhatsApp account needed)

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
the response's `"bookingLogged"` field to confirm. Send the same `from`
number again after restarting `vercel dev` to confirm memory actually
persisted (it should remember the name/service already given).

### 8. Deploy to Vercel

```bash
npx vercel
```

Then add `GEMINI_API_KEY`, `GOOGLE_SHEETS_SPREADSHEET_ID`,
`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SUPABASE_URL`, and
`SUPABASE_SERVICE_ROLE_KEY` as environment variables in your Vercel project
settings (Project → Settings → Environment Variables), and redeploy.

### 9. Connect a real WhatsApp number (next step, not included here)

Point your WhatsApp Business API provider's inbound-message webhook at
`https://<your-project>.vercel.app/webhook`, mapping their payload's sender
number and text into `{ "from": ..., "message": ... }`. Provider-specific
wiring (Twilio/Meta/WATI) is a quick add-on — see "Upsells" below.

### 10. Telegram setup (optional — demoable in minutes, no WhatsApp Business approval needed)

The same receptionist can run as a Telegram bot via `/api/telegram-webhook`
— handy for demos, since WhatsApp Business API access takes provider
approval but a Telegram bot is live in under 5 minutes.

1. In Telegram, open a chat with [@BotFather](https://t.me/BotFather) and
   send `/newbot`. Follow the prompts (choose a name and a unique
   `...bot`-suffixed username).
2. BotFather replies with an API token like
   `123456789:AAExampleTokenNotReal`. Add it to `.env`:

   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   ```

3. Deploy to Vercel first (step 8) so you have a live HTTPS URL — Telegram
   webhooks won't accept `localhost`.
4. Add the same `TELEGRAM_BOT_TOKEN` to your Vercel project's environment
   variables and redeploy.
5. Register the webhook with Telegram (replace both placeholders):

   ```bash
   curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<VERCEL_URL>/api/telegram-webhook"
   ```

   A successful response looks like
   `{"ok":true,"result":true,"description":"Webhook was set"}`.
6. Open your bot in Telegram (the `t.me/<your_bot_username>` link
   BotFather gave you) and send "Hi" — same receptionist, same memory,
   same booking flow, just a different channel. Chats are stored in
   Supabase with phone numbers prefixed `tg:` (e.g. `tg:123456789`) so they
   never collide with real WhatsApp numbers.
7. To stop the bot or point it elsewhere, clear the webhook with:

   ```bash
   curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/deleteWebhook"
   ```

## How the pieces fit together

```
api/webhook.js               → Vercel serverless entrypoint (POST /webhook) — WhatsApp channel
api/telegram-webhook.js      → Vercel serverless entrypoint (POST /api/telegram-webhook) — Telegram channel
src/ai.js                    → Talks to Gemini, manages system prompt, parses booking JSON
src/sheets.js                → Appends completed bookings to Google Sheets
src/conversation-store.js    → Supabase-backed per-phone-number chat history
src/supabase-client.js       → Shared Supabase client (service role)
src/prompts/receptionist-prompt.md → The receptionist's personality & rules
```

Both entrypoints are thin adapters that translate their channel's message
format into a `(phone, userMessage)` call to the shared `generateReply()`
in `src/ai.js`, then translate the reply back out. Adding another channel
later (SMS, Instagram DM, etc.) means writing one more adapter like these,
not touching the AI logic.

**Note on memory:** conversation history lives in the `conversations` table
in Supabase, keyed by `(phone_number, client_slug)` — not in-memory —
because Vercel serverless functions spin up a fresh instance per request
and would otherwise forget the patient after every message. Each turn
trims the stored history to the last 20 messages, so a long back-and-forth
doesn't grow the row (or the Gemini prompt) without bound. If Supabase is
unreachable, calls fail soft (empty history on read, a skipped write with a
logged error) rather than breaking the reply to the patient — see
"Supabase setup" above.

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

1. Open WhatsApp (or the Telegram bot, if WhatsApp Business isn't wired up
   yet — same brain, zero setup lag), send "Hi".
2. Show the instant, warm Hinglish reply.
3. Send name → service → date/time in three quick messages.
4. Flip to the Google Sheet — the booking row appears the moment the
   conversation completes, no manual entry: "that's what your front desk
   sees, live."

## Cheapest viable v1 (what's shipped here)

- Conversation history and completed bookings are both durable — chat
  history lives in Supabase, bookings are written straight to the client's
  Google Sheet.
- No WhatsApp provider wiring yet — testable via plain HTTP (Hoppscotch)
  today, provider webhook mapping is a follow-up task once a client is
  confirmed.
- Single clinic's services/hours baked into the prompt — fine for one
  client at a time; multi-tenant config is an upsell.

## Upsells / add-ons

- Real WhatsApp Business API wiring (Twilio/Meta Cloud API/WATI)
- Multi-tenant `client_slug` support — one deployment serving several clinics
  (the `conversations` table already has the column for it)
- Auto-sync confirmed bookings from the Sheet to Google Calendar / clinic CRM
- SMS/email fallback confirmation to the patient
- Multi-language support (pure Hindi, English, regional languages)
- Admin dashboard to see all pending bookings
