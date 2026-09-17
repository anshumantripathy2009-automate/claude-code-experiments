# Focus Loop

**Path:** `/tools/focus-loop/`

Anshuman's personal AI focus coach, classroom, and NoirFlow business advisor —
a single-file, mobile-first web app. Not a client deliverable; this is an
internal tool built for founder #1 (Anshuman), and a candidate to spin off
into its own SaaS for solo founders and students later.

## What it does

Three tabs, one page:

- **Focus** — a 25-minute sprint timer with a coach kickoff message, a
  post-sprint check-in, a daily sprint log, a 7-day streak view, and an
  end-of-day AI pattern analysis.
- **Classroom** — pick a topic (or let the coach suggest one based on recent
  sprint patterns) and get a tight, 5-8 minute AI-generated lesson tied to
  NoirFlow's actual state, grounded with Google Search when the topic needs
  current facts.
- **Advisor** — a free-form chat with an AI that knows NoirFlow's real
  prospects, offers, and patterns, and pushes back on weak calls.

Built with Tailwind (CDN) and vanilla JavaScript, no build step. All sprint
logs, lessons, and chat history persist in `localStorage` — nothing leaves
the browser except the Gemini calls, which go through a thin serverless
proxy (`api/chat.js`) so the API key never ships to the client.

## Testing locally

```bash
cd tools/focus-loop
npm install
cp .env.example .env
# edit .env and paste your Gemini API key (same key setup as
# automations/whatsapp-dental-receptionist/ and demos/riya-voice/)
npx vercel dev
```

Open `http://localhost:3000` — test at 380px width (or just open on your
phone) since this is mobile-first.

Without `vercel dev` running (e.g. opening `index.html` directly, or serving
it with a plain static server), the timer/logging/localStorage features
still work fully offline — only the AI calls (kickoff messages, lesson
generation, advisor chat, end-of-day analysis) will fail and fall back to
the static offline messages built into the app.

## Testing on Vercel

1. Deploy `tools/focus-loop/` as its own Vercel project — **Root
   Directory:** `tools/focus-loop`, **Framework Preset:** Other (same
   pattern as the WhatsApp receptionist and Riya voice demo projects).
2. Add `GEMINI_API_KEY` as an environment variable (Production + Preview).
3. Deploy, then open the production URL on your phone.

## Notes

- No signup/login — this is single-user, for Anshuman only.
- All persistence is `localStorage`, keyed under `focusloop.*`. Clearing
  browser data clears the app's history.
- If the Gemini call fails for any reason, every mode has a hardcoded
  offline fallback message so the timer and logging never get blocked by a
  network issue.
