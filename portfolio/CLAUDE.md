# Website Building Standards — NoirFlow

This CLAUDE.md applies to all website projects in /portfolio. It extends the root CLAUDE.md. When working on any site inside /portfolio, follow these standards by default.

## Default Stack
- Single-file HTML + Tailwind CSS via CDN (no build step, no Node, no React)
- Vanilla JS only when needed
- Mobile-first, fully responsive
- Vercel-ready (include vercel.json)
- Must open directly in a browser — no compilation

## Performance Rules (Non-Negotiable)
- Web should look premium, 3d animated floating objects and much more worth like 2L+ indian rupees

## Design Principles
- Premium aesthetic — every site should look like it costs 5x what we charge
- Generous whitespace (py-16 sections minimum on desktop)
- Soft shadows (shadow-lg, shadow-xl), never harsh
- Rounded corners — rounded-2xl default for cards, rounded-full for pills
- Max 2 fonts per site: one display/heading + one body (both from Google Fonts)
- One primary accent color + one warm CTA color per client brand
- Subtle micro-interactions: hover lift, smooth transitions (transition-all duration-300)
- Smooth scroll behavior enabled globally

## Required Sections for Local Business Sites
Every local business site must include, in this order:
1. Sticky top nav with logo + WhatsApp CTA on the right
2. Hero with clear value prop, trust badges, primary + secondary CTA
3. Services / Offerings grid (cards with icons)
4. About / Founder section with photo + bio + stats
5. Testimonials (minimum 3, with star ratings)
6. Contact section with embedded Google Map + WhatsApp CTA + address/hours
7. Footer with subtle "Crafted by NoirFlow ⚡" credit linking to noirflow site

## CTAs (Critical)
- Primary CTA on every section is a WhatsApp link in wa.me format:
  https://wa.me/[country code + number]?text=URL_ENCODED_MESSAGE
- Never use generic contact forms — direct to WhatsApp instead
- WhatsApp buttons use green (#25D366) with the WhatsApp icon
- Secondary CTAs use the client's accent color

## SEO & Sharing
- Every site must have:
  - `<title>` tag with clinic/business name + city + service
  - `<meta name="description">` under 160 characters
  - Open Graph tags (og:title, og:description, og:image)
  - Favicon (inline SVG emoji is fine for v1)
  - Semantic HTML (use header, main, section, footer tags)

## Accessibility Minimums
- Alt text on every image
- Color contrast WCAG AA minimum
- Tap targets minimum 44x44px on mobile
- Keyboard-navigable

## File Structure for Each Site
```
portfolio/[site-name]/
  index.html        # The website
  vercel.json       # Static deployment config
  README.md         # One-paragraph description
```

## Client Customization Variables
When building for a real client (not demo), expect to receive:
- Business name + tagline
- City / address
- Phone / WhatsApp number
- Brand color (or pick one)
- 3-6 services with descriptions
- Owner name + 1 paragraph bio
- 3 testimonials (or generate placeholders to fill later)
- Hours
- Google Maps link

## Sales-First Reminders
- Every site must drive WhatsApp conversations — that's the conversion event
- Add a fixed floating WhatsApp button visible on mobile scroll
- Keep above-the-fold simple and fast — that's where deals are made
- Footer credit is small but always present — it's our portfolio acquisition channel

## Things to Avoid
- Stock photos that look fake
- Average, normal, random website design
