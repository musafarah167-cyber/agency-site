# Agency site

Marketing agency website. Services: NFC cards (blank + custom), website builds and maintenance, video content, tiered packages.

## Project notes (read these first)
- `docs/TODO.md`: the checklist of everything left to do (business setup, content, sites). Tick items off and add new ones as we go.
- `docs/DECISIONS.md`: what the owner has confirmed. Update whenever they tell us something new.
- `docs/IDEAS.md`: suggestions not yet agreed.
- `docs/PLAN.md`: the phased execution plan (Opus plans, Sonnet builder executes one task at a time, verifier checks). Follow its rules and gates.
Keep these three files current at the end of every task: record new facts, tick finished items, add new tasks.

## Colours
Blue and white (owner request): navy `#0a2a5e` hero and footer, royal blue `#1558d6` buttons and accents, pale blue `#eef4fd` alternate sections. Set in `:root` at the top of `site/styles.css`.

## Stack
Plain HTML/CSS/JS, no build step. All site files live in `site/` (only this folder is ever deployed; `docs/` and `CLAUDE.md` stay private): `site/index.html`, `site/styles.css`, `site/script.js`, `site/favicon.svg`.
Preview: `python3 -m http.server 8765` from inside `site/`, then open http://localhost:8765.

## Status
Ongoing project: the owner sends content in stages and the site is built up over time.
Brand name: Clear Signs (owner confirmed). Owner thought it might be trademarked; a UK IPO register check is still advised before spending on branding or a domain.

## Placeholders (search for `[` in the HTML)
Services also include uniform and van logo designs (separate from packages). Van designs: no fixed price, quoted by message because it depends on van size and customer needs (owner confirmed). Uniform price and design-only vs printing scope still not given.
NFC prices: blank £30 per card, custom £50 per card (owner confirmed; bulk tiers and minimum order not given).
Three packages: Bronze, Silver, Gold (Platinum dropped 2026-09-30) (names confirmed. Bronze = professional website built, 4 plain NFC cards, no maintenance, price not given. Silver and Gold contents not given; prices and inclusions still needed). Package prices and inclusions, NFC prices, reviews, projects, FAQ details, footer company details.
Never invent prices, reviews, claims or certifications.

## Quote form
No backend. It validates, then opens WhatsApp with the message prefilled. Add a form service later if email delivery is wanted.

## Not done yet
Real content, logo, per-service pages, domain, hosting, deployment (ask before spending money or going live).

## Phone number (temporary, owner will change it)
07405 535846. To change: search `447405535846` (tel: and wa.me links, and `WHATSAPP_NUMBER` in `site/script.js`) and `07405 535846` (display text) across `site/index.html` and `site/script.js`. WhatsApp format is international with no + or leading 0.

## Email (temporary, owner will change it)
fmusa00@outlook.com. To change: search `fmusa00@outlook.com` in `site/index.html` (mailto link and display text).

## Packages and quotes (owner confirmed)
Bronze is confirmed. Silver and Gold inclusions on the site are partly PROPOSED by Claude, not confirmed (see the note in the packages section; `[X]` = quantity to decide). No package prices yet.
Single services can be bought without a package. Only NFC cards have set prices; website work, video, uniform and van designs are quoted by message.
