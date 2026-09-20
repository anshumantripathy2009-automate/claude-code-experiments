# FitZone Gym — Premium Fitness Studio Portfolio Site

Demo portfolio site for NoirFlow. A dark, athletic, single-file website for a fictional premium strength & conditioning studio in Jaydev Vihar, Bhubaneswar. Third piece in the portfolio trio alongside **Smile Dental Care** (healthcare) and **Aurum Realty** (luxury real estate) — this one proves NoirFlow can also do dark/athletic/editorial, not just bright and premium-warm.

**Positioning:** *Serious training. Real results. Zero fluff.*

## What's Inside

- **Header** — Fixed, transparent at top, blurs to solid dark on scroll. Hamburger drawer on mobile.
- **Hero** — Full-viewport, CSS gradient + masked grid overlay, dual CTAs, trust row
- **Stats bar** — 3 stats in JetBrains Mono with lime dividers
- **Programs** — 6 cards with hand-drawn SVG line icons, lime border on hover
- **Membership** — 3 pricing tiers, quarterly featured with lime glow + badge
- **Trainers** — 3 coach cards with CSS placeholder "photo" blocks (initials, no image files)
- **Schedule** — Full week table on desktop, one card per day on mobile
- **Reviews** — 3 testimonials with lime stars + Google reviews link
- **Location** — Contact details + pure-CSS map block with an animated lime pin
- **Final CTA** — Full-bleed "Ready to train?" strip
- **Footer** — 4 link columns, social icons, NoirFlow credit
- **Back to top** — Appears after the hero, lime accent

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

Single-file HTML with **hand-written CSS — no Tailwind CDN**. This is a deliberate deviation from the `/portfolio` house default: the brief required total page weight under 100KB and sub-1s load on 4G, and the Tailwind Play CDN alone (plus its runtime JIT compile) blows both. The page is ~63KB, uses zero image files, and the only external requests are the two Google Font families.

No build step. Opens directly in any browser.

## Performance

- ~63KB HTML, **0 image files**
- One rAF-throttled scroll listener for header + back-to-top (60fps on mid-range Android)
- `IntersectionObserver` reveals fire once, then unobserve
- `prefers-reduced-motion` fully respected — animations and scroll-reveal disabled

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
- Schedule table **and** the mobile day cards (both are static — update both)
- Testimonials + the Google reviews URL
- Address, `og:` tags, and the `map-note` landmark line
- Optional: swap the `.coach-img` placeholder blocks for real photos

## Business Notes

**Who buys this:** Independent gyms, boutique studios, CrossFit boxes, and personal-training brands in tier-1/tier-2 Indian cities — owner-operated, 100–500 members, currently running on an Instagram page and nothing else.

**Pain it kills:** Trial enquiries die in Instagram DMs. A real site with pricing up front, a visible schedule, and a one-tap WhatsApp CTA converts walk-by interest into booked trials without the owner answering "what are your charges?" forty times a week.

**Pricing:** ₹25,000–₹40,000 one-time build, or ₹15,000 setup + ₹3,000/month for hosting, edits and schedule updates. The monthly is the better deal for us — gym schedules and pricing change constantly.

**90-second demo:** Open on a phone. Scroll hero → pricing → schedule → tap "Book Free Trial" and let WhatsApp open pre-filled. That last tap is the whole pitch.

**Cheapest viable v1:** This file with the client's number, prices and schedule swapped in. Half a day.

**Upsells:** Google Business Profile setup · WhatsApp auto-reply agent for pricing/timing FAQs · membership renewal reminder automation · the Smart Clinic Dashboard (FitZone is already a business in its switcher) · monthly content/reel retainer.
