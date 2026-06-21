# Dr. MaAn's Superspeciality Dental & Implant Clinic — Portfolio Website

**Cinematic Next.js 14+ website** for a premium dental clinic in Bhubaneswar, Odisha.

## What It Is

Full-stack marketing website built for real-client handoff. Features a React Three Fiber 3D tooth model in the hero, GSAP scroll animations, and a WhatsApp-first lead generation flow — all deployed on Vercel.

## Who Buys This

Dental/medical professionals in Tier 1–2 Indian cities who want a premium digital presence to justify ₹2–5L treatment packages.

## Sections

1. **Hero** — 3D procedural tooth (R3F + LatheGeometry), particle field, animated headline reveal
2. **Services** — 6 treatment cards, GSAP horizontal scroll pin on desktop
3. **Technology** — Clinic equipment with animated stat counters (5000+ patients, 15+ years)
4. **Doctor** — Cinematic split-layout bio with credentials
5. **Transformations** — Before/after drag slider with 3 real case studies
6. **Testimonials** — Infinite dual-row marquee (8 patient reviews)
7. **Booking** — React Hook Form + Zod + n8n webhook integration
8. **Contact** — Dark-styled Google Maps embed + clinic hours + address
9. **Footer** — Full links + NoirFlow credit

## Tech Stack

- Next.js 14, React 18, TypeScript
- React Three Fiber + drei + postprocessing
- Framer Motion + GSAP ScrollTrigger + Lenis smooth scroll
- Tailwind CSS (custom navy/ivory/gold design tokens)
- react-hook-form + zod (booking form)
- Vercel (hosting)

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your WhatsApp number, n8n webhook, and Google Maps key
npm run dev
```

## Environment Variables

See `.env.example` for all required and optional variables.

## Deploy

Push to GitHub → Import on Vercel → Set environment variables → Done.

---

**Suggested Pricing**

| Package | Price |
|---------|-------|
| Base site (this template adapted) | ₹75,000 one-time |
| + Custom 3D model (real GLB tooth) | ₹15,000 add-on |
| + Monthly maintenance + WhatsApp integration | ₹8,000/month |

**Sales Description**

> "We build cinematic dental websites that look like they were made in Switzerland — 3D tooth in the hero, animated testimonials, before/after sliders, and a WhatsApp booking flow that fills your calendar. One-time setup, fully yours."

---

*Crafted by [NoirFlow](https://noirflow.com) ⚡ — AI automation & digital infrastructure agency*
