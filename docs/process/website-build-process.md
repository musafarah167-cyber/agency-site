# Website build process (customer sites)

Internal. Every step, who does it, and what proves it is done. Items in [brackets] are undecided.
"Owner" = you. "Claude" = Claude helping in a session. Customer = the business we build for.

**Account ownership: [DECISION PENDING: default customer owns domain/hosting]** (QUESTIONS.md question 14). The default means the customer creates and pays for the domain and hosting accounts and gives us access. Do not buy anything in our own name for a customer without written agreement.

## Steps
| # | Step | Who | Done when |
|---|---|---|---|
| 1 | **Brief.** Use `customer-onboarding-checklist.md`: business, services, areas, phone/WhatsApp, logo, photos, reviews they can prove, pages wanted. | Owner | Written brief saved (outside the repo). |
| 2 | **Quote.** Use `docs/templates/quote-template.md`. State what is included, rounds of changes [X], validity [X days], deposit. Send the terms (once checked). | Owner | Customer accepts in writing. |
| 3 | **Deposit.** [X%] paid before work starts. | Customer pays, owner confirms | Payment received, invoice sent. |
| 4 | **Build locally.** Plain HTML/CSS/JS in a private folder or repo for that customer. Only real content; anything missing is a marked placeholder. | Claude builds, owner reviews | Runs locally, placeholder check clean. |
| 5 | **Private staging.** Password-protected or unlisted preview with `noindex`. **[DECISION PENDING: which staging host; see PLAN.md hosting table.]** | Claude sets up, owner approves any cost | Preview link works on phone and desktop. |
| 6 | **Customer approval.** Customer checks the staging site and approves in writing (message or email counts). Changes limited to [X] rounds. | Customer | Written approval saved. |
| 7 | **Balance.** [Due before go-live.] | Customer | Paid. |
| 8 | **Go-live.** Connect domain, confirm SSL, run the checklist below on the live site. | Owner and customer (customer holds the accounts) | Live checks all pass. |
| 9 | **Handover.** Give the customer: logins list, what was built, how to contact us, maintenance offer, reminders (domain renewal date). Ask for permission to show the work (portfolio consent form only if signed). | Owner | Handover message sent. |

## Pre-launch checklist (run on staging, then again on live)
Absorbs TODO section G "Final checks before launch".
- [ ] Every link and menu item works; no dead links.
- [ ] Phone (`tel:`) link dials the right number, tested on a real phone.
- [ ] WhatsApp link opens the right chat with the message filled in, tested on a real phone.
- [ ] Quote form validates and hands over correctly. [If email delivery is used, send a test and check it arrives.]
- [ ] Mobile (375px), tablet (768px) and desktop (1280px) layouts look right.
- [ ] All images load, have alt text, and are not oversized.
- [ ] No errors in the browser console.
- [ ] Page title, description, favicon, share image present. `noindex` REMOVED on live, present on staging.
- [ ] robots.txt, sitemap, canonical URL, local business structured data (real facts only, needs the domain).
- [ ] SSL works (https, no warnings).
- [ ] No placeholders left: search the site for `[`.
- [ ] No invented reviews, prices, certifications, addresses or claims; each claim traces to something the customer confirmed.
- [ ] Contact details are the customer's permanent ones, not temporary test ones.
- [ ] Business name and address shown as required (see `docs/business-setup-guide.md`), legal pages linked if we provide them.
- [ ] Speed check (page loads quickly on mobile data).
- [ ] Backup of the finished site saved.
- [ ] Customer has approved in writing.

## Things that go wrong
- Customer changes their mind after approval: extra changes are quoted separately.
- Missing content: do not launch with invented content; agree placeholders or delay.
- Domain or hosting held by us and customer leaves: avoid by following the ownership default above.
