# Focus Loop

**Path:** `/tools/focus-loop/`

A dual-mode personal AI focus coach, classroom, and advisor — a single-file,
mobile-first web app. Not a client deliverable; this started as an internal
tool built for founder #1 (Anshuman), and is now a candidate to spin off into
its own SaaS for solo founders and students later.

## Dual-mode: Anshuman vs. new user

On first load, an identity screen (not dismissible) asks "Who's using it?":

- **"I'm Anshuman"** — the original, hardcoded experience. NoirFlow context,
  the 6 fixed learning topics, the NoirFlow business advisor. Unchanged from
  before this upgrade, zero impact on his existing data.
- **"I'm new here"** — a 5-8 minute conversational onboarding (a real chat,
  not a form) where the AI asks 8 questions one at a time, infers a learning
  profile (topics, skill level, what they already know), and then the whole
  app — Focus Coach, Classroom, Advisor — runs off *their* profile instead of
  Anshuman's. A photography side-hustler gets photography-business advice
  from the Advisor tab, not agency advice.

Both paths share the same underlying app; only the system prompt and the
learning profile it's built from differ. `userType` (`'anshuman' | 'new'`)
gates which one loads, stored in `localStorage` under `focusloop.userType`.
"Switch user" in Settings clears everything and returns to the identity
screen.

## What it does

Three tabs, one page:

- **Focus** — a 25-minute sprint timer with a coach kickoff message, a
  post-sprint check-in, a daily sprint log, a 7-day streak view, and an
  end-of-day AI pattern analysis.
- **Classroom** — an editable "What I already know" learning profile (6
  fixed topics for Anshuman, however many topics onboarding produced for a
  new user) drives an adaptive lesson flow: pick a topic, the AI reads your
  level + what you already know + your feedback history on that topic, picks
  the next concept, and teaches it — grounded with Google Search when the
  topic needs current facts. Three feedback buttons (Clear / Partial / Lost)
  after each lesson feed back into what gets taught next.
- **Advisor** — a free-form chat with an AI that knows your actual situation
  (NoirFlow's real prospects/offers/patterns for Anshuman; whatever the new
  user said they're building, for them) and pushes back on weak calls.

Built with Tailwind (CDN) and vanilla JavaScript, no build step. All sprint
logs, lessons, chat history, and profile data persist in `localStorage` —
nothing leaves the browser except the Gemini calls, which go through a thin
serverless proxy (`api/chat.js`) so the API key never ships to the client.

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

- No signup/login — identity is a local, per-browser choice (Anshuman vs.
  new user), not an account. Each browser/device picks once and stays that
  way until "Switch user" resets it.
- All persistence is `localStorage`, keyed under `focusloop.*` (sprints,
  journal, classroom, advisor sessions, userType, userProfile,
  learningProfile, learningLog). Clearing browser data clears everything.
  "Export my data" in Settings downloads it all as one JSON file first.
- If the Gemini call fails for any reason, every mode has a hardcoded
  offline fallback message so the timer and logging never get blocked by a
  network issue. Onboarding has its own fallback too, so a dropped
  connection mid-conversation doesn't strand a new user.
