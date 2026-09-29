# Demo sites plan (plan only, nothing built yet)

Goal: show prospective customers what a Clear Signs website looks like, without inventing anything about real businesses.

## Rules
- Clearly marked as **examples** ("Example site, not a real business") in a visible banner and in the page title.
- No invented reviews, prices, certifications, insurance claims, addresses, phone numbers or statistics. Use marked placeholders such as `[CLIENT: add real review]` and clearly fake obvious sample text only where labelled as sample.
- Do not use a real company's name, logo or photos. Do not copy another business's content.
- Photos: only images we have the right to use [SOURCE: DECISION PENDING, e.g. licensed stock or own photos].
- Built and hosted OUTSIDE the main site repo, `noindex` so search engines do not list them as real businesses [DECISION PENDING: whether to link them from the main site].
- No owner spend without approval (hosting, domain, stock photos).

## Which trades
Suggested: **plumber and roofer** (QUESTIONS.md question 20, not yet answered). Optional third: [electrician / cleaner / garage / removals].

## What each demo shows
Sections from the main site pattern: prominent call button, WhatsApp button, quote form, services, service areas, FAQs, trust-signal areas (as placeholders), reviews placeholder, mobile-first layout. Each with a different colour scheme and tone for its trade.

## Steps
1. Owner confirms trades and whether demos are linked from the main site.
2. Claude builds each demo as plain HTML/CSS/JS in a separate folder or repo, from the main site's structure. [Time: DECISION PENDING; the usual turnaround time is not yet known.]
3. Run the pre-launch checklist from `docs/process/website-build-process.md`, plus: example banner present, no real-looking fake phone numbers (use a clearly fake format like `[PHONE]`).
4. Owner reviews privately, then approves any hosting.
5. Publish on a staging or free host only after approval.

## Open items
- Trades (Q20), photo source, hosting for demos, whether the demo appears in the "Our work" section (recommended: labelled as examples, not as customer work).
