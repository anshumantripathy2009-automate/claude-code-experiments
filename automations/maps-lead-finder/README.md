# Maps Lead Finder (WORK IN PROGRESS, not usable yet)

Goal: find local businesses on Google Maps that have **no website**, rank them by how busy they
are (rating × reviews), and export a sheet with a ready WhatsApp pitch per lead, using the
official Google **Places API (New)**, not scraping.

Status: config (`config/searches.json`) and the API client (`src/places.js`, with a hard request
cap) are written. Still to build: lead filtering/scoring, CSV export, CLI, tests.

Blocked on: a `GOOGLE_MAPS_API_KEY` (Google Cloud project with billing + Places API (New)
enabled). Until then, leads are researched manually.
