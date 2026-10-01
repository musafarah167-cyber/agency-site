# Back end prep: handoff (docs-only)

Branch: `backend`. Date: 2026-09-30. Status: **ready for the coordinator to review and merge (docs plus local prototype).**

## What changed
- `docs/backend/ROADMAP.md`: what a back end means for Clear Signs, in priority order with now/soon/later labels. Covers form emailing, lead storage, card/monthly billing, tracker, NFC links, video booking. Each has options, costs, data protection notes and a recommendation.
- `docs/backend/LEARNING-PATH.md`: 7-stage practical learning path with free resources and exercises tied to this site.
- `docs/backend/HANDOFF.md`: this file.
- `backend/`: LOCAL prototype of the quote form emailer (Node standard library only, no installs, no accounts). Dry-run only: prints and saves the "email" to `backend/outbox/` (git-ignored). Honeypot spam field, size limits, 14 tests. See `backend/README.md`. Merged `main` into `backend` first (2026-10-01).
- Nothing in `site/`, `docs/DECISIONS.md`, `docs/TODO.md` or other sessions' files was edited.

## How it was checked
- Files read back and committed on `backend`; `git status` clean.
- Prices: read from the providers' own pages on 2026-09-30 (Cloudflare Pages Functions, Formspree, Resend, Stripe UK). Pages that failed to load (SumUp card fees, GoCardless, Web3Forms, ICO fee) are marked "check price" in the roadmap.

## NOT verified
- Stripe Billing subscription fees (page wording unclear); whether SumUp supports repeat billing; GoCardless pricing; current ICO fee.
- Where each provider stores data and their data-processing terms (check before choosing).
- No legal advice; the privacy policy still needs a professional check.
- Prototype: `cd backend && npm test` = 14 pass (Node v24.20.0). Also ran `npm start` and used curl: valid enquiry -> ok + dry-run email printed/saved; honeypot -> ok, nothing sent; empty -> 400 with field errors; GET -> 405.
- NOT tested: browser form to server (site not wired), Cloudflare runtime (`functions/api/enquiry.js` never run on Cloudflare), a real email service, rate limiting, other Node versions.

## Owner decisions pending (sent via the coordinator; my defaults in brackets)
1. OK to use a US-based form service free tier at first? [yes]
2. Payment provider: Stripe / SumUp / GoCardless / bank transfer only? [Stripe payment links + bank transfer]
3. How long to keep enquiries that don't become jobs? [12 months]
4. Local prototype: approved by owner ("agree to all") and built.

## Answers received (via coordinator, 2026-10-01)
US form service free tier OK at first; Stripe payment links + bank transfer; keep non-job enquiries 12 months; prototype approved. Coordinator to record in DECISIONS.md.

## If the form is later wired to this (front end session; I did not touch `site/`)
1. Add a honeypot field inside the form that people never see: `<div hidden><input type="text" name="website" tabindex="-1" autocomplete="off"></div>`.
2. In `site/script.js`, after validation, `fetch("/api/enquiry", {method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(Object.fromEntries(new FormData(form)))})`; on success show a thank-you and keep opening WhatsApp as the fallback; on error show the message and offer WhatsApp.
3. Change the note under the form and the privacy policy wording ("details go straight into a WhatsApp message" would no longer be the whole story).
4. Field names already match the prototype: `name`, `contact`, `interest`, `message`, `website`.

## Suggested follow-ups for the coordinator's files
- TODO: add "choose form emailing route" and "decide enquiry retention period" under D/G; link the roadmap from the payment provider item in C.
- DECISIONS: record answers 1 to 4 once given.
- Privacy policy draft: each chosen service (form service, email sender, payment provider) needs adding as a processor in sections 2 and 4.
