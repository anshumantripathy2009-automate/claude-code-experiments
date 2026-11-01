# Previews

Concept homepage previews for local businesses.
Every page is `noindex` (meta tag plus an `X-Robots-Tag` header).

## Hosting

- **Now: Vercel.** Project `noirflow-previews`, Root Directory `previews`. Headers come from `vercel.json`.
- **Later: Cloudflare Pages.** Headers come from `_headers` (same rules). `.vercelignore` keeps `_headers` and this README off Vercel.
- Keep `vercel.json` and `_headers` in sync if you change a header.

## Make a new preview

1. Copy the template: `previews/_template/` → `previews/<business-slug>/` (e.g. `previews/sharma-dental-patia/`).
2. Open `previews/<business-slug>/index.html` and edit only the `CONFIG` object between `/* CONFIG:START */` and `/* CONFIG:END */`.
   - `phone` and `whatsapp`: digits only, with country code (`91XXXXXXXXXX`).
   - Leave optional fields empty (`""` or `null`) and their sections hide.
   - `rating`: only a real public rating, with `sourceUrl` pointing to where it's shown. Otherwise `null`.
3. Open the file in a browser and check it at 390 px wide.
4. Open a PR, get it reviewed, merge.
5. The link becomes `<PREVIEWS_DOMAIN>/<business-slug>/`.

`previews/sample-clinic/` is a filled-in test copy with fictional data.

## Rules (these override `portfolio/CLAUDE.md`)

- No testimonials, invented reviews, invented stats or stock photos of people.
- No 3D effects. Keep it fast: one HTML file, no images, no frameworks.
- Footer always says it is a concept preview and not the official website.
- `previews/index.html` must never list the preview folders.

## How to add a new business type

1. In `_template/index.html`, find `PRESETS` and copy the `clinic` block (there's a commented skeleton showing where it goes).
2. Rename the key (e.g. `gym`, `education`, `realestate`, `retail`, `shop`) and change the section order, headings, icons, WhatsApp message and booking form fields.
3. Need a section that doesn't exist yet (e.g. "courses" or "listings")? Add one function to `RENDERERS` and use its id in `sections`.
4. Set `CONFIG.businessType` to the new key. The rest of the page code stays the same.
