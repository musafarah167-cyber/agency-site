# Agency site

Marketing agency website. Services: NFC cards (blank + custom), website builds and maintenance, video content, tiered packages.

## Stack
Plain HTML/CSS/JS, no build step. Files: `index.html`, `styles.css`, `script.js`, `favicon.svg`.
Preview: `python3 -m http.server 8765` in this folder, then open http://localhost:8765.

## Status
Ongoing project: the owner sends content in stages and the site is built up over time.
Brand name is undecided (the "Clear Signs" idea may be trademarked; check the UK IPO register). Don't use it.

## Placeholders (search for `[` in the HTML)
`[YOUR BRAND]`, `[PHONE]`, `[EMAIL]`, `44XXXXXXXXXX` (also `WHATSAPP_NUMBER` in `script.js`), package names, prices and inclusions, NFC prices, reviews, projects, FAQ details, footer company details.
Never invent prices, reviews, claims or certifications.

## Quote form
No backend. It validates, then opens WhatsApp with the message prefilled. Add a form service later if email delivery is wanted.

## Not done yet
Real content, logo, colours, per-service pages, domain, hosting, deployment (ask before spending money or going live).
