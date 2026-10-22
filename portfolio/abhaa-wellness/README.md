# Abhaa Wellness — Demo Website

Single-file, mobile-first demo site for **Abhaa Wellness**, a skin, hair and laser clinic in Chandrasekharpur, Bhubaneswar. We built it as a sales demo: their current domain (abhaawellness.com) isn't loading, so patients who click through from Google hit an error page. Every call to action goes to the clinic's real WhatsApp number (+91 73774 00777): the treatment cards, the 3-question "find your treatment" quiz, the booking form and the sticky mobile bar. The page has no backend and no build step.

- **Live demo:** https://abhaa-wellness-demo.vercel.app. It is marked `noindex` so it never competes with the clinic's own brand in Google.
- **Stack:** hand-written HTML/CSS/JS. Fonts are Cormorant Garamond and Inter. All visuals are CSS/SVG, with no photos.
- **Data sources:** address, phone and hours come from public listings (Google Maps, Facebook, Practo). The 4.9★ (170+ ratings) figure is from Justdial.

## Confirm with the clinic before going live
- Exact treatment menu and prices (the cards use the generic treatments they advertise)
- Doctor's name, photo and bio, for an About/Doctor section
- Real patient testimonials, used with permission. We don't invent reviews, so the site links to the Justdial rating instead.
- Clinic photos and logo
- One Justdial listing says "Closed Down". Ask them to get it removed.

## Deploy
Vercel project `abhaa-wellness-demo`, root directory `portfolio/abhaa-wellness`, no framework and no build command.
