# Back end prep: handoff (docs-only)

Branch: `backend`. Date: 2026-09-30. Status: **ready for the coordinator to review and merge (docs only).**

## What changed
- `docs/backend/ROADMAP.md`: what a back end means for Clear Signs, in priority order with now/soon/later labels. Covers form emailing, lead storage, card/monthly billing, tracker, NFC links, video booking. Each has options, costs, data protection notes and a recommendation.
- `docs/backend/LEARNING-PATH.md`: 7-stage practical learning path with free resources and exercises tied to this site.
- `docs/backend/HANDOFF.md`: this file.
- Nothing in `site/`, `docs/DECISIONS.md`, `docs/TODO.md` or other sessions' files was edited. `backend/` exists but has no prototype.

## How it was checked
- Files read back and committed on `backend`; `git status` clean.
- Prices: read from the providers' own pages on 2026-09-30 (Cloudflare Pages Functions, Formspree, Resend, Stripe UK). Pages that failed to load (SumUp card fees, GoCardless, Web3Forms, ICO fee) are marked "check price" in the roadmap.

## NOT verified
- Stripe Billing subscription fees (page wording unclear); whether SumUp supports repeat billing; GoCardless pricing; current ICO fee.
- Where each provider stores data and their data-processing terms (check before choosing).
- No legal advice; the privacy policy still needs a professional check.
- No code was written or run, so no tests exist yet.

## Owner decisions pending (sent via the coordinator; my defaults in brackets)
1. OK to use a US-based form service free tier at first? [yes]
2. Payment provider: Stripe / SumUp / GoCardless / bank transfer only? [Stripe payment links + bank transfer]
3. How long to keep enquiries that don't become jobs? [12 months]
4. Approve a local prototype in `backend/` (no accounts, not deployed, with tests)? [yes] **Not started until the coordinator confirms.**

## Suggested follow-ups for the coordinator's files
- TODO: add "choose form emailing route" and "decide enquiry retention period" under D/G; link the roadmap from the payment provider item in C.
- DECISIONS: record answers 1 to 4 once given.
- Privacy policy draft: each chosen service (form service, email sender, payment provider) needs adding as a processor in sections 2 and 4.
