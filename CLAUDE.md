# Agency site

Marketing agency website. Services: NFC cards (blank + custom), website builds and maintenance, video content, tiered packages.

## Stack
Plain HTML/CSS/JS, no build step. Files: `index.html`, `styles.css`, `script.js`, `favicon.svg`.
Preview: `python3 -m http.server 8765` in this folder, then open http://localhost:8765.

## Status
Ongoing project: the owner sends content in stages and the site is built up over time.
Brand name: Clear Signs (owner confirmed). Owner thought it might be trademarked; a UK IPO register check is still advised before spending on branding or a domain.

## Placeholders (search for `[` in the HTML)
`[EMAIL]`, package names, prices and inclusions, NFC prices, reviews, projects, FAQ details, footer company details.
Never invent prices, reviews, claims or certifications.

## Quote form
No backend. It validates, then opens WhatsApp with the message prefilled. Add a form service later if email delivery is wanted.

## Not done yet
Real content, logo, colours, per-service pages, domain, hosting, deployment (ask before spending money or going live).

## Phone number (temporary, owner will change it)
07405 535846. To change: search `447405535846` (tel: and wa.me links, and `WHATSAPP_NUMBER` in `script.js`) and `07405 535846` (display text) across `index.html` and `script.js`. WhatsApp format is international with no + or leading 0.
