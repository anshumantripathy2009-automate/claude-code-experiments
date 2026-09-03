# Riya Voice Demo

**Path:** `/demos/riya-voice/`

## What it is

A single-file, mobile-first HTML page where a prospect taps a mic button and
has a live spoken conversation with **Riya**, NoirFlow's AI sales assistant.
Riya explains what NoirFlow builds (AI receptionists, business websites,
automation systems), speaks in warm Hinglish, and always closes by inviting
the prospect to book a discovery call with Anshuman — there's also an
always-visible "Book a call" button at the bottom of the screen.

Built with the browser's native Web Speech API (`SpeechRecognition` for
voice input, `SpeechSynthesis` for voice output) — no audio infra, no extra
packages on the frontend. The page itself is static (Tailwind via CDN, no
build step); a small serverless function (`api/chat.js`) proxies the actual
Gemini call so the API key never ships to the browser.

## What it's for

**A sales tool.** Send the deployed link directly to a prospect (DM,
WhatsApp, email) so they can talk to NoirFlow's AI live, on their own phone,
before ever getting on a call. It's the fastest way to demonstrate "this is
what an AI receptionist actually feels like to talk to" without booking a
demo slot first.

## Testing locally

```bash
cd demos/riya-voice
npm install
cp .env.example .env
# edit .env and paste your Gemini API key (same key setup as
# automations/whatsapp-dental-receptionist/)
npx vercel dev
```

Open `http://localhost:3000` in **Chrome** (desktop or Android — Chrome is
required for `SpeechRecognition`; Safari/Firefox will show the "Voice demo
requires Chrome on Android or desktop" message and just show the disabled
mic + the always-visible "Book a call" button). Tap the mic, allow
microphone access when prompted, and talk.

## Testing on Vercel

1. Deploy `demos/riya-voice/` as its own Vercel project — **Root Directory:**
   `demos/riya-voice`, **Framework Preset:** Other (same pattern as the
   WhatsApp receptionist project).
2. Add `GEMINI_API_KEY` as an environment variable (Production + Preview),
   same value/source as the WhatsApp receptionist's key.
3. Deploy, then open the production URL on **Android Chrome** — that's the
   actual target environment this gets demoed and tested on.
4. Before sending the link to a real prospect, replace the placeholder
   `href` on the "Book a call with Anshuman" button in `index.html` with
   NoirFlow's real Calendly (or booking) link — it currently points to a
   `calendly.com/noirflow/discovery-call` placeholder.

## Notes

- No conversation memory across page reloads by design — this is a
  stateless, one-off sales demo, not a production receptionist. Each browser
  tab keeps its own short conversation history in memory for context within
  that session only.
- If the Gemini call fails, Riya says "Sorry, I'm having trouble connecting
  right now" out loud instead of failing silently.
