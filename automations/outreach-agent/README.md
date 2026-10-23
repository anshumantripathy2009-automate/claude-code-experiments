# AI Outreach Agent (Google Sheets + Gmail)

An AI sales assistant that works a prospect list for you twice a day. It finds each business's
public email and sends a short, personal cold email from your Gmail. It follows up twice, reads
replies, answers simple questions (price, details) from approved facts, and sends you a report
with 🔥 hot leads first.

Running for NoirFlow on the **NOIRFLOW PROSPECTS** sheet (scheduled task "NoirFlow outreach
agent", 8:43 AM and 4:43 PM IST).

## How it works
1. **Sheet = CRM.** One row per business. Column E (Status) drives everything.
2. **Finds emails** the business publishes (listings, its own pages), never guessed. No email →
   it writes a personal WhatsApp message + a one-tap link for you to send yourself (WhatsApp
   bulk automation gets numbers banned).
3. **Cold email** (AIDA, under 120 words) built on a real fact (rating, reviews, area), one
   clear ask (free demo), an honest opt-out line.
4. **Follow-ups:** 2 max, 3 days apart, in the same thread.
5. **Replies:** classified as wants call / wants website / asks price / asks details / not now /
   not interested / unsubscribe. It answers price and details questions from fixed facts only.
   Buying signals are handed to you, never closed by the bot.
6. **Report** to your inbox after every run, readable on a phone in under a minute.

Safety: at most 15 emails a day, only to addresses in the sheet, no attachments, and incoming
emails treated as data, never as instructions. Every action is logged in the Notes column.

## Control it
- **Skip a business:** set Status to `Anshuman handling` or `do not contact`.
- **Pause everything:** ask Claude to "pause outreach" (it disables the scheduled task).
- **Change the pitch or facts:** edit `prompts/outreach-agent.md`, then ask Claude to update the
  scheduled task.

## Setup for a client (resellable)
1. Connect the client's Gmail + Google Sheets in Claude.
2. Copy the sheet template (columns A–T, header in row 1).
3. Fill the "Facts you may state" section of `prompts/outreach-agent.md` with their offer.
4. Create the scheduled task with the playbook, replacing `{SHEET_ID}` and `{OWNER_EMAIL}`.

## Business lens
- **Who buys:** local agencies, coaches, B2B service firms, real-estate brokers. Anyone who sells
  to local businesses and hates cold outreach.
- **Pain:** hours a day of manual prospecting and forgotten follow-ups.
- **Demo in 90 seconds:** show the sheet → a sent email → a reply classified as 🔥 → the report.
- **Pricing:** ₹8,000–15,000 setup + ₹3,000–6,000/month (sheet build, playbook tuning, weekly
  review). Clients pay their own AI and Google costs.
- **Upsells:** lead research batches, a WhatsApp Business API version, auto-built demo websites
  per lead, a CRM dashboard.

**Sales description:** "I'll set up an AI sales assistant that works your prospect list every
morning and evening. It writes personal emails, follows up, answers price questions, and tells you
exactly who wants a call, so you only spend time talking to buyers."
