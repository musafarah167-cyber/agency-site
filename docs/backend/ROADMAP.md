# Back end roadmap for Clear Signs

Written 2026-09-30 by the back end prep session. A PLAN only: nothing here has been built, bought, signed up for or deployed. Not legal advice.

## What "back end" means (plain English)
- **Front end** = what visitors see (your website in `site/`). **Back end** = code and services that run out of sight: receive a form, store a record, send an email, take a payment.
- Today the site has no back end. The quote form opens WhatsApp and nothing is stored or emailed.
- Golden rule for a starting business: **use ready-made services before writing your own code**. Less to maintain, less that can break, less personal data for you to look after.

## Priority order at a glance
| # | Area | When | Why |
|---|---|---|---|
| 1 | Quote form also emails you | **NOW** (once hosting exists) | Stops enquiries being lost in WhatsApp |
| 2 | Storing leads safely | **NOW** (a spreadsheet is enough) | Follow-ups, and GDPR duties |
| 3 | Taking card payments / monthly billing | **SOON** (before first Silver/Gold customer) | Silver £49/mo and Gold £249/mo need repeat billing |
| 4 | Customer and job tracker | **SOON** (simple), **LATER** (custom) | Spreadsheet first; software only when it hurts |
| 5 | NFC card links | **NOW: decision only** | No server needed; cards use direct links the customer controls |
| 6 | Booking video shoots | **LATER** | Phone/WhatsApp is fine with few customers |

Data-protection terms used below: **UK GDPR** is the UK law on personal data; the **ICO** is the regulator. A **processor** is a company that handles data for you (e.g. an email service). A **controller** is you, the one responsible. You should list each processor in the privacy policy (`docs/legal/privacy-policy-DRAFT.md`, sections 2 and 4).

Prices: only those I could read on the provider's own site are given, with the date checked (2026-09-30). Everything else says **check price**. Prices are in the currency the provider showed and may exclude VAT.

---

## 1. Quote form that also emails you  (NOW)
**What it is:** when someone submits the form, the details reach your inbox as well as opening WhatsApp. **Why:** WhatsApp only works if the visitor presses send; email catches the rest. **Needed:** once the site is hosted; not before.

### Options
| Option | How it works | Cost (checked 2026-09-30) | Pros / cons |
|---|---|---|---|
| A. **Form service** (e.g. Formspree) | Form posts to their server, they email you | Formspree: Free $0 for 50 submissions/month ("testing and development" per their page), Personal $15/mo for 200, Professional $30/mo for 2,000 (formspree.io/plans). Others (Web3Forms, Getform): **check price** | Easiest, no code. Data sits with a US company (check transfer wording); free tier small |
| B. **Cloudflare Pages Function + an email-sending service** | A few lines of code on your own host receive the form and send the email | Pages Functions free plan: 100,000 requests/day shared with Workers (developers.cloudflare.com/pages/functions/pricing). Email service e.g. Resend: Free 3,000 emails/month, 100/day; Pro $20/mo (resend.com/pricing). Needs a sending domain (you will own one anyway) | Most control and best learning; you look after the code. Data goes through Cloudflare + email service (2 processors) |
| C. **Email link only** (`mailto:`) | Already on the site | Free | No spam filtering, relies on visitor's email app |
| D. **Keep WhatsApp only** | Today's behaviour | Free | Nothing emailed; nothing stored |

**Data protection:** the form collects name, contact details and message = personal data. You need: a privacy line under the form (already added), the provider named in the privacy policy, a short retention period (see section 2), and **spam protection** (a hidden "honeypot" field is free; avoid Google reCAPTCHA because it adds cookies and breaks the "no cookies" decision). Whichever provider, check where data is stored and their data-processing terms.

**Recommendation:** start with **B-lite later / A now**: when hosting is live, use a **form service free tier** for the first months (no code, ~20 minutes). Move to **B** once you want the learning and control, and the prototype in `backend/` (if you approve it) would be the practice version of B. Do NOT pay for a plan before real enquiries justify it.
**Decision needed from owner:** OK to use a US-based form service, or prefer to keep data with Cloudflare only?

## 2. Storing leads safely  (NOW)
**What:** somewhere to keep enquiries: who, what they asked, when, what happened. **Why:** follow up, stop losing work, and answer "what do you hold on me?" requests.
| Option | Cost | Notes |
|---|---|---|
| Spreadsheet from `docs/templates/` lead tracker, kept OUTSIDE git, on a password-protected, 2-step-login account | Free | Best for now. Never commit real leads to the repo |
| Hosted no-code database (Airtable, Notion etc.) | **check price** | Only if the spreadsheet becomes painful; adds a processor |
| Own database (e.g. Cloudflare D1) | **check price** | LATER. You become responsible for security and backups |

**Data protection:** collect only what you need; set a retention rule (privacy draft has `[X months]`; a common approach is to delete unsuccessful enquiries after about 6 to 12 months, but **you decide and record it**); delete on request; keep the file on an encrypted device with a strong password and 2-step login; never put leads in email threads you can't search and delete. Invoices must be kept for tax (HMRC rules, check gov.uk for the period).
**Recommendation:** spreadsheet now. Revisit at roughly 20 active leads at once.

## 3. Card payments and monthly billing  (SOON)
**What:** Silver (£49/month) and Gold (£249/month) are repeat charges "billed monthly in advance" (DECISIONS.md). Bank transfer also stays allowed. **Needs an account in your name and identity checks, so only you can open it.** I will not do that.
| Option | What it does | Cost (checked 2026-09-30) |
|---|---|---|
| **Stripe** (stripe.com/gb/pricing) | Cards online, payment links, subscriptions, Bacs Direct Debit | Standard UK cards 1.5% + 20p; premium UK cards 2.8% + 20p; EEA cards 2.5% + 20p; international 3.15% + 20p; Bacs Direct Debit 1% (min 20p, cap £4). The page also showed Stripe Billing pricing ("0.7% of Billing volume" pay-as-you-go), so **check what Stripe Billing will cost you on the live page before relying on it** |
| **SumUp** | Card readers, payment links, invoices | SumUp Invoices Plus about £7 + VAT/month per its page; card-fee and recurring-payment details I could not confirm: **check price and whether it supports repeat billing** |
| **GoCardless** (Direct Debit specialist) | Collects monthly Direct Debits from a customer's bank | Pricing page not readable when I checked: **check price** |
| **Bank transfer / standing order** | Customer sets up; you check your bank | Free. Manual chasing; fits your late-payment rule |

**Worked example (Stripe, UK standard card, using the checked numbers):** £49 costs 1.5% + 20p = about 93p in fees; £249 about £3.94. Direct Debit at 1% is about 49p and £2.49. This is arithmetic on the prices above, not a quote; the real rate depends on the card.

**Data protection / safety:** the provider holds the card numbers, **you never should**. Do not build your own card form. Stripe's hosted payment links/checkout keep you out of card-data rules. You will still hold customer names, emails and payment history: name the provider in the privacy policy. Direct Debit has its own indemnity rules and mandate paperwork: read the provider's guide before offering it.
**Recommendation:** for the first 1 to 3 customers, **bank transfer/standing order + a provider's hosted payment link** (no code, no monthly fee on Stripe per its page). Consider Direct Debit once you have 5+ monthly customers and chasing costs you time. **Decision needed from owner:** which provider to open (already on TODO section C), and whether to offer Direct Debit.

## 4. Customer and job tracker  (SOON simple / LATER custom)
**What:** one place showing each customer, what they bought, deadlines, and what's owed. **Options:** (a) spreadsheet templates already in `docs/templates/` (free, NOW); (b) a hosted tool (Notion, Airtable, Trello; **check price**); (c) something custom (LATER, only when you have many customers and a clear pain). **Data protection:** same as section 2; also keep customer website logins out of the tracker (use a password manager). **Recommendation:** (a). Building your own tracker is the classic beginner time-sink.

## 5. NFC card link redirects  (NOW: decision only)
**Decision already made:** custom cards are programmed with a **direct link the customer controls** (their website, Google review link etc.). So **no back end is needed**, there's no redirect server to keep running, and no lock-in dispute. Trade-off: if the customer's link changes, the card stops working and needs reprogramming (many cards can be rewritten; check your supplier's chip type). An optional "redirect we control" service would let you fix links later but makes customers depend on you forever and adds a server, cost and data duty. **Not recommended.** Action: write the direct-link rule into the order form wording so customers know.

## 6. Booking video shoots  (LATER)
**Options:** phone/WhatsApp + calendar (free, NOW); a booking tool such as Calendly, Cal.com or Google Calendar booking pages (free tiers exist, **check price**); custom booking (not recommended). **Data protection:** a booking tool stores names, emails and places; list it in the privacy policy. **Recommendation:** manual until you're regularly double-booked.

---

## Cross-cutting rules (apply to everything above)
- Never commit secrets: keys live in a `.env` file that is git-ignored; the repo holds only `.env.example` with placeholder names.
- Every new service = one more line in the privacy policy, and possibly a note about where data is stored.
- Keep "no cookies, no analytics" true at launch, or update the policy first.
- **ICO fee:** already on the TODO list. The self-assessment at ico.org.uk decides if you pay (about £52 a year for most small businesses per `docs/business-setup-guide.md`; I could not re-read the ICO page today, so re-check). Storing enquiries and emailing customers is likely to count as processing personal data.
- Back up whatever holds leads (spreadsheet copy on a second secured location).

## Suggested order of work
1. Now: choose hosting (Cloudflare Pages is the plan's recommendation; free), keep leads in the spreadsheet template.
2. At staging: add form emailing (option 1A, or 1B with the local prototype as practice).
3. Before first monthly customer: open a payment account, use hosted payment links.
4. Later: tracker, booking, anything custom.

## Questions for the owner (sent via the coordinator)
1. Form emailing: OK with a US-based form service free tier at first, or keep everything with Cloudflare?
2. Payment provider: Stripe, SumUp, GoCardless, or bank transfer only for now?
3. Retention: how long to keep enquiries that don't become jobs (suggest 12 months)?
4. Do you approve a small local prototype (no accounts, no deployment) of the quote form emailer, for learning?
