# NoirFlow Client Portal

A real login portal for NoirFlow's paying clients. Each client signs in
with just their email (no password) and sees their own account — their
business info, a link to their live automation, and a place to report
issues or request changes, with a history of what they've submitted.

## What This Does

- Client logs in with a magic link (click the email, you're in — no password to forget)
- Sees their business info and can update their own contact details
- Sees a card linking out to their live automation dashboard (e.g. the
  [whatsapp-dental-receptionist](../automations/whatsapp-dental-receptionist/dashboard.html)
  live-data dashboard)
- Can submit "something's wrong" issues or "I want this" requests, and see
  the status of everything they've submitted (open / in progress / resolved)
- NoirFlow manages everything else (who's a client, their plan, resolving
  tickets) directly in the Supabase table editor — no separate admin app in v1

## Who This Is For

Internal to NoirFlow — this is the portal **you** give every paying client,
not a product sold on its own. It's what makes "AI automation agency"
feel like a real company instead of a one-off WhatsApp bot: a client who
can log in and see their own dashboard trusts you with the next contract
and the referral.

## Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | Next.js (App Router) + Tailwind | Free |
| Auth | Supabase Auth (magic link, no passwords) | Free tier |
| Database | Supabase Postgres — reuses the `noirflow-agents` project | Free tier |
| Hosting | Vercel | Free tier |

**Total monthly cost:** ₹0 — everything runs on free tiers at this scale.

## Setup

1. `cd client-portal && npm install`
2. Copy `.env.example` to `.env.local` and fill in the three Supabase values
   (all three come from the **same** `noirflow-agents` Supabase project —
   Project Settings → Data API / API Keys).
3. `npm run dev` — opens at `http://localhost:3000`.
4. Deploy: Vercel → New Project → import this repo → set **Root Directory**
   to `client-portal` → add the same three env vars (mark the service role
   key **Sensitive**) → Deploy.
5. In Supabase Auth settings, add your deployed URL (e.g.
   `https://your-portal.vercel.app/**`) to **Redirect URLs**, or the magic
   link will bounce.

The `clients` and `tickets` tables (with Row Level Security policies
scoping each client to their own rows) already exist in the
`noirflow-agents` Supabase project — this app doesn't create them, it
just reads/writes them.

## Onboarding a New Client

There's no signup form on purpose — clients don't appear until you add
them. In the Supabase SQL editor, run:

```sql
insert into clients (business_name, contact_name, contact_email, contact_phone, client_slug, automation_type, dashboard_url, plan, status)
values (
  'Smile Dental Care',
  'Dr. Rajesh Sharma',
  'client-real-email@example.com',  -- must match exactly what they'll sign in with
  '+91XXXXXXXXXX',
  'smile-dental',                    -- matches client_slug used by their automation
  'WhatsApp AI Receptionist',
  'https://your-automation.vercel.app/dashboard.html',
  'Care Plan — ₹3,999/mo',
  'active'
);
```

Leave `auth_user_id` unset (it defaults to NULL). The first time that
person logs in with that exact email, the portal links their new login to
this row automatically — no second step needed. See
`app/dashboard/actions.js` → `getOrClaimClient` for how that works.

To resolve a ticket, update its `status` directly in the `tickets` table
(`open` → `in_progress` → `resolved`).

## Demo Script (90 seconds)

1. Open the login page, enter your own email, click the magic link.
2. Point at the Account card — "this is pulled straight from your
   database, the client can update their own contact info any time."
3. Click "Open dashboard →" on the Automation card — "and this links
   straight into the live bookings dashboard we built for their actual
   AI receptionist, not a screenshot."
4. Submit a test "Request something" ticket, then show it appearing in
   Supabase's table editor in real time — "that's the client reaching
   you without a phone call or a lost WhatsApp message."

## Sales Description

*"Every NoirFlow client gets their own private portal — not a shared
spreadsheet, not a WhatsApp group that gets buried. They log in with just
their email, see exactly what their AI is doing for their business, update
their own details, and tell us directly when something's wrong or when
they want more. It's the difference between 'I built you a bot' and
'you're a client of a real company.'"*

## Pricing Guidance

This isn't sold as a standalone product — it's bundled into every NoirFlow
engagement as the account layer. Suggested framing:

- **Included free** with any Care Plan (₹3,999+/month) — a differentiator
  that costs NoirFlow ~₹0/month to run per client (free-tier Supabase/Vercel).
- If ever offered as an add-on to a one-time/setup-only client: **₹5,000
  one-time** to add portal access for their automation.

## Upsells / What's Next (not in v1 — deliberately cut for speed)

- Admin UI for NoirFlow to manage clients/resolve tickets without opening
  Supabase directly (today: just use the Supabase table editor)
- Email/WhatsApp notification to NoirFlow when a new ticket comes in
- Per-client usage/billing history
- Multiple team members per client account (today: one login per client)
- Self-serve plan upgrades

## Security Notes

- `clients` and `tickets` both have Row Level Security — a logged-in
  client can only ever see their own row(s), enforced at the database
  level, not just hidden in the UI.
- The Supabase **service role** key is used server-side exactly once (to
  link a new login to its pre-made `clients` row) and is never sent to
  the browser.
- There's no public signup — a `clients` row only ever appears by NoirFlow
  inserting one, so there's no way to create an account for a business
  that isn't actually a client.
