# Secrets Rotation Register

**Audit date:** 2026-09-19
**Scope:** entire `claude-code-experiments` repo — all current files + all 54 commits across every branch
**Status:** 🟢 **NO ROTATION REQUIRED**

---

## Result

**Zero secrets were found, in current files or anywhere in git history.**

| Check | Result |
|---|---|
| Hardcoded keys in current files | None found |
| Keys in client-side HTML / `<script>` tags | None found |
| `.env` files committed | None, ever |
| Service-account / credential JSON committed | None, ever |
| Secrets in git history (all branches, all blobs) | None found |

### What was scanned

Patterns swept across every tracked file and every blob reachable from
`git rev-list --all`:

- `AIza…` — Google / Gemini API keys
- `sk-…`, `sk-ant-…` — OpenAI / Anthropic keys
- `eyJ…` — JWTs (Supabase anon & service-role keys are JWTs)
- `ghp_ / gho_ / ghu_ / ghs_ / ghr_` — GitHub tokens
- `<digits>:<base64>` — Telegram bot token shape
- `-----BEGIN … PRIVATE KEY-----` — PEM private keys
- `postgres:// mongodb:// mysql://` — database connection strings

Also enumerated every file ever added in history (including deleted paths
such as `portfolio/dr-maan/*` and `skills/ui-ux-pro-max/*`) to confirm no
credential file was committed and later removed.

### The one match, and why it's fine

`automations/whatsapp-dental-receptionist/.env.example:11`

```
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

This is a **placeholder template**, not a key. `.env.example` files are
meant to be committed — they document which variables are required without
carrying values. Correct as-is.

---

## Why this register exists anyway

Nothing needs rotating today. This file stays in the repo as the runbook for
the day something *does* leak — at which point speed matters more than
figuring out the process from scratch.

## Live secrets inventory

These are the credentials this repo uses. All of them live in Vercel
environment variables (or a local `.env`), none in git.

| Secret | Used by | Blast radius if leaked | Where to rotate |
|---|---|---|---|
| `GEMINI_API_KEY` | focus-loop, riya-voice, whatsapp receptionist | Quota theft, billing charges | https://aistudio.google.com/app/apikey |
| `SUPABASE_SERVICE_ROLE_KEY` | whatsapp receptionist | **Severe** — bypasses Row Level Security, full read/write on the database | Supabase → Project Settings → API Keys → roll `service_role` |
| `SUPABASE_URL` | whatsapp receptionist | Low (not secret, but identifies the project) | n/a |
| `GOOGLE_PRIVATE_KEY` + `GOOGLE_SERVICE_ACCOUNT_EMAIL` | whatsapp receptionist (Sheets logging) | Read/write on any sheet shared with the service account | Google Cloud Console → IAM & Admin → Service Accounts → Keys → delete old, add new |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | whatsapp receptionist | Low (an ID, not a credential) | n/a |
| `TELEGRAM_BOT_TOKEN` | whatsapp receptionist | Full control of the bot — an attacker can read and send messages as it | Telegram → @BotFather → `/revoke` then `/token` |
| `WEBHOOK_SECRET` | whatsapp receptionist | Lets anyone drive the receptionist (costs Gemini quota) | Self-generated: `openssl rand -hex 32` |
| `TELEGRAM_WEBHOOK_SECRET` | whatsapp receptionist | Same as above, for the Telegram route | Self-generated: `openssl rand -hex 32`, then re-run `setWebhook` |

## If a secret ever leaks — do this in order

1. **Rotate first, investigate second.** Generate the new key before you
   work out how it leaked. Every minute the old one is live is a minute it
   can be used.
2. **Revoke the old key.** Generating a new one does *not* disable the old
   one on most platforms. Explicitly delete it.
3. **Update Vercel env vars** for every affected project, then redeploy —
   env var changes do **not** apply to existing deployments.
4. **Check for abuse.** Gemini → AI Studio usage dashboard. Supabase →
   Logs. Telegram → message history. Look for spikes around the leak window.
5. **Purging git history is not a substitute for rotation.** If a secret
   reached a public repo, assume it was scraped within minutes — bots watch
   the GitHub events firehose for exactly this. Rotate regardless.

## Priority definitions

- **CRITICAL** — visible in current code, or in the history of a public repo.
  Rotate immediately.
- **HIGH** — in git history only, repo private. Rotate the same day.
- **MEDIUM** — exposed to a limited, trusted audience. Rotate at next
  convenience.
