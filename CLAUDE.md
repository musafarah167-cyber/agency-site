# Agency site

Marketing agency website. Services: NFC cards (blank + custom), website builds and maintenance, video content, tiered packages.

## Project notes (read these first)
- `docs/TODO.md`: the checklist of everything left to do (business setup, content, sites). Tick items off and add new ones as we go.
- `docs/DECISIONS.md`: what the owner has confirmed. Update whenever they tell us something new.
- `docs/IDEAS.md`: suggestions not yet agreed.
- `docs/SESSIONS.md`: which session (design, front end, testing, back end prep, coordinator) owns which files. Read it before editing.
- `docs/PLAN.md`: the phased execution plan (Opus plans, Sonnet builder executes one task at a time, verifier checks). Follow its rules and gates.
Keep these three files current at the end of every task: record new facts, tick finished items, add new tasks.

## Colours
Blue and white (owner request): navy `#0a2a5e` hero and footer, royal blue `#1558d6` buttons and accents, pale blue `#eef4fd` alternate sections. Orange accent (owner request 2026-09-30): main buttons `#f7931e` with navy text (hover `#e8770f`), orange text `#c2410c` for small headings and ticks, `#ffa552` on navy. Set in `:root` at the top of `site/styles.css`.

## Stack
Plain HTML/CSS/JS, no build step. All site files live in `site/` (only this folder is ever deployed; `docs/` and `CLAUDE.md` stay private): `site/index.html`, `site/styles.css`, `site/script.js`, `site/favicon.svg`.
Preview: `python3 -m http.server 8765` from inside `site/`, then open http://localhost:8765.

## Status
Ongoing project: the owner sends content in stages and the site is built up over time.
Brand name: Clear Signs (owner confirmed). Owner thought it might be trademarked; a UK IPO register check is still advised before spending on branding or a domain.

## Placeholders (search for `[` in the HTML)
Services also include uniform and van logo designs (separate from packages). Van designs: no fixed price, quoted by message because it depends on van size and customer needs (owner confirmed). Uniform price and design-only vs printing scope still not given.
NFC prices: blank £30 per card, custom £50 per card (owner confirmed; bulk tiers and minimum order not given).
Three packages (confirmed 2026-09-30): Bronze £499 one-off; Silver £499 + £175/month; Gold £699 + £300/month (both 6-month minimum). Details in docs/DECISIONS.md. Platinum dropped.
Never invent prices, reviews, claims or certifications.

## Quote form
No backend. It validates, then opens WhatsApp with the message prefilled. Add a form service later if email delivery is wanted.

## Not done yet
Real content, logo, per-service pages, domain, hosting, deployment (ask before spending money or going live).

## Phone numbers (owner confirmed 2026-10-08)
- Calls: 0121 517 2760 (landline). On the site as `tel:+441215172760` and display text `0121 517 2760` in `site/index.html` (call buttons, contact intro, footer).
- WhatsApp: 07405 535846 (mobile) stays for WhatsApp links and the quote form: `wa.me/447405535846` in `site/index.html` and `WHATSAPP_NUMBER` in `site/script.js`. WhatsApp format is international with no + or leading 0.

## Email (temporary, owner will change it)
fmusa00@outlook.com. To change: search `fmusa00@outlook.com` in `site/index.html` (mailto link and display text).

## Packages and quotes (owner confirmed)
All three packages confirmed with prices (2026-09-30).
Single services can be bought without a package. Only NFC cards have set prices; website work, video, uniform and van designs are quoted by message.

## Working style (owner request 2026-09-30)
Keep the site preview open in the browser panel (server on port 8765 from `site/`) and make changes live as the owner asks, reloading the panel after each change. Record each change in docs as usual. Push to GitHub only when asked.
