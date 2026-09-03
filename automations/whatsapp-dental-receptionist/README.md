# NoirFlow AI Receptionist — Dental Clinic Edition

Production-ready AI receptionist that handles patient inquiries 24/7, books appointments via natural conversation, and logs everything to a Google Sheet.

## What This Does

- Patient messages the clinic on Telegram (later migratable to WhatsApp)
- AI named Riya responds in warm Hinglish
- Collects name, service, date, time
- Confirms booking with authority
- Auto-logs booking to clinic's Google Sheet
- Remembers full conversation history via Supabase

## Tech Stack

| Layer | Tool | Purpose | Cost |
|---|---|---|---|
| AI Brain | Google Gemini 3.5 Flash | Natural conversation + intent extraction | Free tier |
| Compute | Vercel Serverless Functions | Runs the agent 24/7 | Free tier |
| Memory | Supabase Postgres | Persistent conversation history | Free tier |
| Storage | Google Sheets API | Booking log clinic owner can view | Free |
| Messaging | Telegram Bot API | Chat interface for patients | Free |
| Development | Claude Code on mobile | Code writing + version control | Claude Pro |
| Repo | GitHub | Version control + auto-deploy trigger | Free |

**Total monthly cost per client:** approximately ₹0–100, well within free tiers.

**Recommended NoirFlow pricing:** ₹15,000 setup + ₹3,999/month Care Plan.

## Setup Guide for NoirFlow Team

**Prerequisites:** phone with browser (no laptop needed), Claude Pro subscription, Google account, ~2 hours of focused work.

### Step 1: Gemini API Key (2 minutes)

Go to [aistudio.google.com](https://aistudio.google.com), sign in with Google, create API key, copy it, save to secure notes.

### Step 2: Google Cloud Service Account for Sheets (10 minutes)

Go to [console.cloud.google.com](https://console.cloud.google.com), create new project named `noirflow` with the client slug appended. Navigate to **APIs and Services → Library**, and enable **Google Sheets API**. Then go to **APIs and Services → Credentials → Create Credentials**, choose **Service Account**. Name it `noirflow-sheets-writer`, skip roles, click Done. Click the service account, go to the **Keys** tab, **Add Key → JSON → Create**. A JSON file downloads.

Extract two values from it: `client_email` and `private_key`. Preserve the `\n` literal characters in the private key exactly as they appear.

### Step 3: Client's Google Sheet (5 minutes)

Create a new Google Sheet titled with the client name and "Live Bookings". In row 1, add headers: `Timestamp`, `Phone Number`, `Patient Name`, `Service`, `Preferred Date`, `Preferred Time`, `Status`, `Notes`. Rename the bottom tab to exactly `Sheet1` (capital S).

Click **Share**, paste the service account email as **Editor**. Copy the Sheet ID from the URL — the long string between `/d/` and `/edit`.

### Step 4: Supabase Project (15 minutes)

Go to [supabase.com](https://supabase.com) and create a **New project**. Name it `noirflow-agents` or client-specific. Choose region **Mumbai** for India. Save the database password.

Go to **SQL Editor → New query**, paste and run this SQL:

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
alter table conversations
  add constraint conversations_phone_client_unique
  unique (phone_number, client_slug);
```

Then go to **Project Settings → API**, and copy the **Project URL** and the **`service_role`** secret key. **Do not use the `anon` key.**

### Step 5: Telegram Bot (5 minutes)

Open Telegram, search for **BotFather** with the verified badge. Send `/newbot`. Give it a name like "Client Name AI Receptionist". Choose a username ending in `bot`, like `ClientNameAI_bot`. Copy the bot token from the response.

### Step 6: Vercel Deployment (15 minutes)

Go to [vercel.com](https://vercel.com), click **New Project**, import from GitHub. Set **Root Directory** to `automations/whatsapp-dental-receptionist`. **Framework Preset:** Other.

Add these environment variables and mark all as **Sensitive**:

| Variable | Source |
|---|---|
| `GEMINI_API_KEY` | Step 1 |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Step 3 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Step 2 |
| `GOOGLE_PRIVATE_KEY` | Step 2 (`\n` preserved) |
| `SUPABASE_URL` | Step 4 |
| `SUPABASE_SERVICE_ROLE_KEY` | Step 4 |
| `TELEGRAM_BOT_TOKEN` | Step 5 |

Add each variable to all three environments: **Production**, **Preview**, **Development**. Click **Deploy**. Copy the production URL when ready.

### Step 7: Connect Telegram to Vercel (2 minutes)

Open in your phone browser this URL after replacing placeholders with your bot token and Vercel URL:

```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<VERCEL_URL>/api/telegram-webhook
```

Expected response is a JSON with `ok: true` and description "Webhook was set".

### Step 8: End-to-End Test (10 minutes)

Open Telegram, search your bot username. Send `/start`. Then send a message like:

> Hi, I want teeth cleaning tomorrow at 4pm, my name is Test Patient.

Riya should confirm the booking with authority. Check the Google Sheet — a new row should appear. Check the Supabase `conversations` table — a new row with message history should be there.

### Step 9: Customize for the Client (30 minutes)

Update `src/prompts/receptionist-prompt.md` with the client's clinic name, services offered with prices if applicable, working hours, location with Google Maps link, and special positioning like family-friendly, luxury, or budget. Push to GitHub and Vercel auto-deploys the update.

## Architecture Flow

1. Patient sends a message on Telegram.
2. This triggers the **Telegram Bot API** webhook.
3. Which calls the Vercel serverless function at `/api/telegram-webhook`.
4. Which loads conversation history from Supabase using `phone_number` and `client_slug`.
5. Then sends context + the new message to **Gemini 3.5 Flash**.
6. Gemini responds in Hinglish and extracts a booking JSON when complete.
7. The updated conversation is saved back to Supabase.
8. If `bookingComplete` is `true`, a row is appended to the Google Sheet.
9. Finally, the AI reply is sent back to the patient on Telegram.

## File Structure

```
automations/whatsapp-dental-receptionist/
├── api/
│   ├── webhook.js              # Generic JSON webhook for testing
│   └── telegram-webhook.js     # Telegram-specific handling
├── src/
│   ├── ai.js                   # Gemini integration + booking extraction
│   ├── supabase-client.js      # Database connection
│   ├── conversation-store.js   # Memory functions
│   ├── sheets.js               # Google Sheets logging
│   └── prompts/
│       └── receptionist-prompt.md  # Riya's personality
├── package.json
├── vercel.json
├── .env.example
└── README.md
```

## Migrating from Telegram to Real WhatsApp

Once a client closes, migrate to WhatsApp using one of these options:

| Option | Cost | Setup | Number |
|---|---|---|---|
| Meta WhatsApp Cloud API | Free for 1,000 conversations/month | 7–14 days KYC | Real Indian number |
| Twilio Sandbox | Free | 10 minutes | US number only |
| AiSensy | ₹999/month+ | 20 minutes | Real Indian number |

Migration is a ~2-hour job. Swap the webhook endpoint. Same backend code works.

## Troubleshooting Common Errors

| Error | Fix |
|---|---|
| `Unable to parse range Sheet1!A:H` | Rename Google Sheet tab to exactly `Sheet1` (capital S). |
| `ON CONFLICT specification` error | Missing `UNIQUE` constraint on the Supabase `conversations` table. |
| Model not found from Gemini | Update to `gemini-3.5-flash` — `2.0` retired in June 2026. |
| Private key errors on Vercel | Ensure `\n` characters are preserved as literals, not converted to line breaks. |
| Booking never triggers Sheets write | Check if the AI is marking `bookingComplete` as `true` in the prompt. |
| `Method not allowed` on Vercel URL | This is correct — `/api/webhook` only accepts `POST` requests; browsers send `GET`. |

## Client Pricing Guidance for NoirFlow Sales

- **Setup fee:** ₹15,000–₹25,000, based on customization depth.
- **Care Plan:** ₹3,999–₹5,999/month.
- **Delivery timeline:** 3–7 days per clinic.
- **Client ROI framing:** one recovered missed patient covers the entire year of Care Plan.

## Credits

Built by **NoirFlow**, an AI automation agency based in Bhubaneswar, India.

Founders: **Anshuman Tripathy** and **Somyaranjan Sahoo**.
