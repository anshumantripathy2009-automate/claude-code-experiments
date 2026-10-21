# NoirFlow Client Portal

Every NoirFlow client gets their own login. They create an account with an
invite code you give them, sign in with email + password, and see
everything NoirFlow runs for their business: services, live operations, errors,
goals, and a support inbox. You run all of it from one admin console.

## What This Does

**For the client** (`/dashboard`):
- **Overview** — services running, open errors, goals on track, open requests, recent activity
- **Services** — every automation/website NoirFlow runs for them, its status, and a link to its live dashboard
- **Activity** — the operations + error log. Bookings the AI made, failures, and updates from NoirFlow. Filter by type. Errors show as open or fixed
- **Objectives** — the goals they're paying for (e.g. "40 AI bookings this month") with progress bars
- **Support** — report an issue or request something new, and track its status
- **Account** — edit contact details, change password

**For NoirFlow** (`/admin`):
- Onboard a client → get a one-time invite code to send them (copy or WhatsApp button)
- Add services, update their status
- Log operations, errors or updates to a client's feed
- Set and update objectives
- Work the ticket queue and mark errors fixed
- Invite team members as admins

**Automations report in by themselves:** the WhatsApp dental receptionist
posts every confirmed booking and every failure to the client's Activity feed
(see `automations/whatsapp-dental-receptionist` → "Client Portal Link").

## How Login Works (simple version)

1. You create the client in `/admin`. The portal shows an invite code like `NF-7KQ2-M9XD-4HPT`.
2. You send it to the client (the WhatsApp button pre-writes the message).
3. The client opens `/signup`, enters the code, then chooses their email + password.
4. From then on they just log in at `/login`. Forgot password → reset email.

Nobody can sign up without a code. Codes work once, expire after 14 days,
and can be locked to one email. Lost code? Click "New invite code" and the
old one stops working.

## How Login Works (pro version)

- **Invite codes:** 12 random characters (~59 bits) from an alphabet with no
  look-alike characters (`0/O/1/I/L`). Only the **SHA-256 hash** is stored, so a
  leaked database doesn't leak usable codes. Redemption *claims* the invite with
  a compare-and-set update (`used_at is null`) **before** creating the user, so
  two people racing the same code can't both win. If account creation fails, the
  claim is released.
- **Accounts** are created server-side with `auth.admin.createUser` (already
  email-confirmed, so no confirmation-email step) and then linked:
  `clients.auth_user_id` for a client, or a row in `admins` for staff.
- **Data isolation is enforced by Postgres, not the UI.** Client pages query
  as the logged-in user, and Row Level Security only returns their own rows.
  Column grants stop a client from editing their plan/status or setting a
  ticket's status, even with hand-crafted API calls.
- **Admin actions** are server actions (public POST endpoints), so *every*
  one calls `requireAdmin()` first. Queries then run as the admin user, and
  the database's `admins manage …` policies (via `is_admin()`) check again.
- **No master key in the web app.** The portal holds only the public
  (publishable) key. The single operation that needs Supabase admin powers,
  creating an account from an invite, runs in the `redeem-invite` Edge
  Function (`supabase/functions/redeem-invite`), where Supabase provides the
  key itself. A leaked Vercel env can't bypass Row Level Security.
- **Rate limits** on sign-in, signup and password reset (per IP, 15-minute
  window). Login errors are generic ("email or password is incorrect"), and
  password-reset always says "sent", so the forms can't be used to find out
  which emails have accounts.

## Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind | Free |
| Auth | Supabase Auth (email + password, invite-gated) | Free tier |
| Database | Supabase Postgres, the same project as the automations | Free tier (paused after 7 days idle on free plan) |
| Hosting | Vercel | Free tier |
| Email (password reset) | Supabase built-in → custom SMTP for production | Free (Resend free tier: 3,000/mo) |

**Monthly cost at 1–20 clients:** ₹0. Upgrade Supabase to Pro ($25/mo)
when you have paying clients, so the database never pauses.

## Setup

1. `cd client-portal && npm install`
2. Copy `.env.example` → `.env.local` and fill in the two values.
3. **Database:** in a fresh Supabase project, run `supabase/schema.sql` in
   the SQL editor. (Already done on `noirflow-agents`.)
4. **Edge Function:** `supabase functions deploy redeem-invite --no-verify-jwt`
   (it's public on purpose — signup visitors aren't logged in — and does all
   its own checks). Already deployed on `noirflow-agents`.
5. **Supabase Auth settings** (Dashboard → Authentication):
   - **Sign In / Providers → Email:** turn **"Allow new users to sign up" OFF**.
     The Edge Function creates accounts with admin powers, so this doesn't
     affect invite signups. It stops strangers creating (useless, unlinked)
     accounts directly against the Supabase API.
   - **URL Configuration:** set **Site URL** to your portal URL and add
     `https://your-portal.vercel.app/**` to **Redirect URLs**. Without this,
     password-reset links bounce.
   - **Production:** set up custom SMTP (e.g. Resend). Supabase's built-in
     mailer only sends a few emails per hour.
6. **First admin:** `npm run invite:admin -- you@yourcompany.com`, run the
   SQL it prints, then redeem the code at `/signup`. After that, invite
   teammates from the admin console.
7. `npm run dev` → `http://localhost:3000`
8. **Deploy:** Vercel → New Project → this repo → **Root Directory**
   `client-portal` → add the 2 env vars → Deploy.

## Onboarding a New Client (2 minutes)

1. `/admin` → **Onboard a new client** → business name, plan, status → **Create client + invite code**.
2. **Send on WhatsApp** (or copy the message) → client signs up.
3. **Add a service** for each thing you run for them. Copy the
   **Automation slug** it shows into that automation's
   `PORTAL_SERVICE_SLUG` env var, and its bookings/errors start flowing in.
4. **Add an objective** for the goal you sold them on.

## Demo Script (90 seconds)

1. Log in as a client → **Overview**: "This is what every NoirFlow client sees.
   Their services, their goals, what the AI did today."
2. **Activity**: "Every booking our AI makes shows up here on its own. And if
   anything breaks, they see it too, with its status. We don't hide problems."
3. **Objectives**: "This is the goal you're paying for, tracked live, not in
   a monthly PDF."
4. **Support** → send a request → switch to `/admin`: "It lands in my queue
   instantly. I mark it in progress, and you see that on your side."

## Sales Description

*"Every NoirFlow client gets a private portal with their own login. You see
every system we run for your business, every booking our AI made, every
issue and its fix status, and progress against the goals we agreed on, live.
Need something changed? Send it from the portal and track it until it's done.
No chasing us on WhatsApp, no monthly report PDFs. Just open your dashboard."*

## Pricing Guidance

Bundle it. Don't sell it alone. It's the thing that makes NoirFlow look like
a real company and justifies a retainer:

- **Included** with every monthly care plan (₹3,999+/mo). Your cost per client
  is about ₹0, and it's the main reason clients stay on the retainer instead of
  paying once.
- **Setup-only clients:** portal access as an add-on at **₹1,500/month** or
  **₹5,000 one-time + ₹999/mo**.
- **White-label for other agencies** (later): ₹15,000–25,000 setup per agency, with
  their branding, a separate Supabase project and `supabase/schema.sql`.

## Upsells / Next Versions (not built — cut for speed)

- WhatsApp/email alert to NoirFlow when a client opens a ticket or a critical error is logged
- Monthly auto-generated report from the Activity + Objectives data
- Multiple logins per client (owner + front-desk staff)
- Objectives that update themselves from automation data (e.g. booking count)
- Invoices/billing history with Stripe
- Your own domain (`portal.noirflow.ai`)

## Security Notes

- Row Level Security is on for every portal table. Clients can only ever read
  their own rows. Only admins (`is_admin()`) can write services, events,
  objectives, invites and ticket status.
- `invites` are visible to admins only; `admins` is not readable through the
  API at all (checked via the `is_admin()` function).
- The web app has no service-role key. Account creation runs in the
  `redeem-invite` Edge Function, inside Supabase.
- Password reset redirects only to same-site paths (`safeNextPath` in
  `app/auth/callback/route.js`), so it can't be used as an open redirect.
- Rate limiting is in-memory per server instance: good enough for a
  login form, not a substitute for Supabase's own auth rate limits (which
  also apply).
