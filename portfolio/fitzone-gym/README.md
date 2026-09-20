# FitZone Gym — Premium Fitness Studio Portfolio Site

Demo portfolio site for NoirFlow. A dark, athletic, single-file website for a fictional premium strength & conditioning studio in Jaydev Vihar, Bhubaneswar. Third piece in the portfolio trio alongside **Smile Dental Care** (healthcare) and **Aurum Realty** (luxury real estate) — this one proves NoirFlow can also do dark/athletic/editorial, not just bright and premium-warm.

**Positioning:** *Serious training. Real results. Zero fluff.*

## What's Inside

- **Header** — Fixed, transparent at top, blurs to solid dark on scroll. Lime scroll-progress bar across the very top. Hamburger drawer on mobile.
- **Hero** — Full-viewport, CSS gradient + grid overlay that parallaxes on scroll. Headline wipes up line by line on load; the whole block fades as you scroll past it.
- **Stats bar** — 3 stats in JetBrains Mono, numbers counting up when the strip enters view
- **Marquee** — Infinite scrolling discipline ticker, pauses on hover
- **Programs** — 6 cards, SVG line icons that draw themselves in on reveal
- **Workout posters** ⭐ — The six-day split as six screen-print style posters. Tap one and the real session slides up over it: exercises, sets and reps. One open at a time.
- **Find Your Program** ⭐ — A 3-question quiz that recommends a program + membership tier, then hands over a WhatsApp message already describing what they picked
- **Membership** — 3 pricing tiers, quarterly featured with lime glow + badge
- **Coaches** — 3 cards with CSS placeholder "photo" blocks (initials, no image files)
- **Gym spaces** — 4 CSS/SVG panels standing in for floor photos
- **Schedule** — Full week table on desktop, one card per day on mobile. Today's column is highlighted automatically from the visitor's own clock.
- **Reviews** — 3 testimonials with lime stars + Google reviews link
- **FAQ** — 6-question accordion, grid-rows height animation (no JS measuring)
- **Location** — Contact details + pure-CSS map block with an animated lime pin
- **Final CTA** — Full-bleed "Ready to train?" strip
- **Footer** — 4 link columns, social icons, NoirFlow credit
- **Back to top** — Appears after the hero, lime accent

### The two pieces that actually sell this

**Workout posters** answer the question every gym site dodges: *what will I actually be doing?* Showing the real programming is proof of competence, and it costs nothing to produce because the posters are CSS, not photography.

**Find Your Program** is the lead-generation piece. A visitor who finishes it arrives in WhatsApp with their goal, their training frequency and their recommended plan already written out — so the gym owner opens a qualified conversation instead of "what are your charges?".

## Design System

| Token | Value | Use |
|---|---|---|
| Background | `#0a0a0a` | Page base (warm near-black gradients on hero/CTA) |
| Surface | `#171717` | Cards, stats bar |
| Border | `#27272a` | 1px card borders |
| Primary accent | `#a3e635` (lime-400) | CTAs, active states, hover borders — used sparingly |
| Secondary accent | `#fb923c` (orange-400) | One element only: the hero energy/live indicator |
| Text | `#ffffff` / `#a1a1aa` / `#52525b` | Primary / secondary / tertiary |

Fonts: **Inter** (headings at 600, tracking `-0.04em`; body at 400) + **JetBrains Mono** (prices, times, stats).

## Stack

Single-file HTML with **hand-written CSS — no Tailwind CDN**. This is a deliberate deviation from the `/portfolio` house default: the Tailwind Play CDN alone (plus its runtime JIT compile) costs more than this entire page and delays first paint. Zero image files; the only external requests are the two Google Font families.

No build step. Opens directly in any browser.

## Performance

- **98KB HTML, 21KB gzipped, 0 image files**
- All icons come from one inline SVG sprite referenced with `<use>` — defined once, used ~40 times
- **One** rAF-throttled scroll listener drives the progress bar, header, back-to-top, hero parallax and hero fade. Everything it touches is `transform`/`opacity` only, so scrolling stays at 60fps on mid-range Android.
- `IntersectionObserver` reveals fire once, then unobserve. A `load`/`resize` sweep catches any section a fast flick-scroll outran, so nothing can be left invisible.
- `prefers-reduced-motion` fully respected — parallax, marquee, counters, reveals and hover transforms all disabled

## Verified

Tested in headless Chromium at 380 / 414 / 560 / 768 / 1024 / 1440px:

- No horizontal overflow at any width; no JS errors
- Every poster's session list fits its card at every breakpoint (posters go 1 column on phones, 2 at 640px, 3 at 900px)
- Quiz maps all 27 answer combinations and builds a valid WhatsApp URL; reset works
- Counters land on exact values; FAQ expands; today's schedule column highlights
- Under `prefers-reduced-motion` the hero is visible immediately and counters jump straight to final values

## Deploy on Vercel

1. Import this repo folder to Vercel
2. Set **Root Directory** to `portfolio/fitzone-gym`
3. Framework: **Other** (static)
4. Deploy

## Customise for a Real Client

Replace in `index.html`:
- `919876543210` → client's WhatsApp number (appears in every CTA + footer)
- `+91 98 7654 3210` / `hello@fitzonegym.in` → real contact details
- `--lime: #a3e635` → client's brand accent (one variable, recolours the whole site)
- Coach names, initials (`KM` / `PN` / `RP`), roles and bios
- Pricing tiers and feature bullets
- **Workout posters** — the six `.poster` blocks hold the split. Swap exercise names and sets/reps for whatever the gym actually programs; this is the section clients will want to own.
- **Quiz logic** — `PROGRAMS`, `PLANS` and `STEPS` in the script are three small objects. Rewrite the copy there and the recommendation changes; no other edits needed.
- Schedule table **and** the mobile day cards (both are static — update both)
- Testimonials + the Google reviews URL
- Address, `og:` tags, and the `map-note` landmark line
- Optional: swap the `.coach-img` placeholder blocks for real photos

## Business Notes

**Who buys this:** Independent gyms, boutique studios, CrossFit boxes, and personal-training brands in tier-1/tier-2 Indian cities — owner-operated, 100–500 members, currently running on an Instagram page and nothing else.

**Pain it kills:** Trial enquiries die in Instagram DMs. A real site with pricing up front, a visible schedule, and a one-tap WhatsApp CTA converts walk-by interest into booked trials without the owner answering "what are your charges?" forty times a week.

**Pricing:** ₹25,000–₹40,000 one-time build, or ₹15,000 setup + ₹3,000/month for hosting, edits and schedule updates. The monthly is the better deal for us — gym schedules and pricing change constantly.

**90-second demo:** Open on a phone. Scroll the hero, tap a workout poster so the session slides up, run the 3-question finder, and let it dump you into WhatsApp with the recommendation already written. The prospect watches a lead qualify itself. That is the pitch.

**Cheapest viable v1:** This file with the client's number, prices, split and schedule swapped in. Half a day.

**Upsells:** Quiz answers piped into a CRM or Google Sheet instead of just WhatsApp · Google Business Profile setup · WhatsApp auto-reply agent for pricing/timing FAQs · membership renewal reminder automation · the Smart Clinic Dashboard (FitZone is already a business in its switcher) · monthly content/reel retainer.
