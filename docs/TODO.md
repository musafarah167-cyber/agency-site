# To-do list (tick off as we go)

Legend: [you] only the owner can do it, [claude] Claude can do it, [both] we do it together.
Update this file whenever something is done or added.

## A. Business setup (all [you]; nothing here is legal or tax advice)
See `docs/business-setup-guide.md` for official sources and figures (checked 2026-09-29). HMRC registration deadline 5 October 2026 may apply: see QUESTIONS.md question 1.
- [ ] Trade mark check for "Clear Signs": UK IPO register, Companies House, Google. Do before buying a domain, logo or printed cards.
- [x] Business type: sole trader (decided).
- [ ] [you] Register as self-employed with HMRC (gov.uk, free). Deadline is usually 5 October after the tax year in which you started trading. Check the exact rules and the £1,000 trading allowance on gov.uk or with an accountant.
- [ ] [you] Check the rules for trading under a business name as a sole trader (your own name and address may need to appear on invoices and the website). Decide what address to use if you work from home.
- [ ] Open a business bank account.
- [ ] Get insurance quotes: public liability and professional indemnity.
- [ ] Check whether the ICO data protection fee applies (about £52 a year for most small businesses).
- [ ] Get written OK from customers before showing their work in the portfolio.

## B. Online identity
- [x] Private GitHub repo created and first push done (2026-09-29).
- [ ] [both] Make GitHub login permanent: `gh` was downloaded to a temporary folder for this session only. Next session, install it properly (ask first) or log in again before pushing.
- [ ] [you] Buy domain (ASK first, costs money): e.g. clearsigns.co.uk if the name is clear.
- [ ] [you] Professional email on the domain (replaces the temporary Outlook address).
- [ ] [you] Google Business Profile, Instagram, Facebook, TikTok, WhatsApp Business (same name everywhere).
- [ ] [both] Logo and colours (site is navy/royal blue/white for now).
- [ ] [both] Choose hosting (static hosting is enough; ASK before paying) and go live with SSL.

## C. How each service runs (decisions needed)
- [x] NFC: owner has a blank-card supplier.
- [ ] NFC: way to program cards; who prints custom cards; test a small batch on iPhone and Android; confirm the cost per card so £30/£50 covers it.
- [ ] Websites: process drafted in `docs/process/website-build-process.md` (T7). Still to decide: who owns the domain and hosting (default: customer), staging host.
- [ ] Maintenance: monthly checklist drafted (`docs/process/maintenance-checklist.md`, T8). Still to decide: number of small edits, price for extra edits, notice period.
- [ ] Video: kit and editing tools; revisions included; who films?
- [x] Uniforms and vans: outsourced to a partner at the start (decided).
- [ ] Find and test the partner(s) (use `docs/process/partner-job-checklist.md`, T11): get a written price list, turnaround times, minimums, sample work, and who is responsible if a job goes wrong. Try a small paid sample first.
- [x] Split decided: design in house; partner prints (uniforms and vans) and fits (vans).
- [ ] Decide the margin Clear Signs adds on the partner's printing/fitting price.
- [ ] Agree how customers approve a design (proof/mock-up) before the partner starts.
- [ ] Payments: bank transfer, Stripe or SumUp; deposit rules; when monthly payments are due.
- [x] Invoice template and sales/expenses record: templates in `docs/templates/` (T10, T12). Working copies live OUTSIDE the repo.
- [x] Simple lead tracker: header-only CSV in `docs/templates/` (T12); working copy outside the repo.

## D. Legal documents
- [x] [claude] First draft of terms and conditions written: `docs/legal/terms-and-conditions-DRAFT.md` (not published).
- [ ] [you] Answer the 10 questions at the end of the draft so I can fill in the brackets.
- [ ] [you] Have the finished terms checked (solicitor, trade body or insurer) before using them with customers.
- [ ] [claude] Add a Terms page to the website once approved.
- [x] [claude] Privacy policy drafted: `docs/legal/privacy-policy-DRAFT.md` (T5). Needs owner answers and a professional check. Cookie notice only if analytics are added.
- [x] [claude] Quote template (`docs/templates/`) and customer onboarding checklist (`docs/process/`) drafted (T9, T10). Fill in brackets once answers arrive.

## E. Website content still needed
ESSENTIAL
- [ ] Package prices, one-off or monthly (Bronze, Silver, Gold, Platinum)
- [ ] Confirm or change proposed Silver, Gold, Platinum inclusions, and the [X] quantities
- [ ] Whether blank NFC cards are sold in bulk; any minimum order
- [x] Uniform and van wording updated: designed by us, printed (and fitted for vans) for the customer.
- [ ] Permanent phone, WhatsApp and email (current ones are temporary)

CAN BE PLACEHOLDER FOR NOW
- [ ] Real project examples and photos (with customer permission)
- [ ] Real customer reviews (never invented)
- [ ] Maintenance details and website turnaround time (FAQ)
- [ ] Company number and address for the footer, if required
- [ ] Logo, brand photos or video

## F. Our own sites
- [ ] 1. Main Clear Signs site (in progress, this folder)
- [ ] 2. Two or three demo sites (e.g. plumber, roofer), clearly marked as examples, no invented reviews. Plan written: `docs/demo-sites-plan.md` (T13); not built.
- [ ] 3. Private testing area so customer sites are approved before going live

## G. Site build (Claude)
- [x] Site moved into `site/`; unconfirmed claims removed; accessibility and mobile fixes done (T1 to T3)
- [ ] Owner to confirm: bulk/minimum order for NFC, what monthly maintenance includes, billing (one monthly bill?), whether any package is 'most popular'. Then restore the wording (see IDEAS.md)
- [ ] Check the site on a real phone (float button, menu, tap targets)
- [ ] Fill in prices and package details when given
- [ ] Add the "Our work" projects when given
- [ ] Separate pages per service (later)
- [ ] Email delivery for the quote form (optional; today it opens WhatsApp)
- [x] On-page SEO done: title, description, Open Graph, theme-color, one h1 (T4)
- [ ] Still to do for SEO (needs a domain, Phase 3): robots.txt, sitemap, canonical, og:url, local business structured data
- [ ] Final checks before launch: checklist written in `docs/process/website-build-process.md` (T7); still to run when the site is ready
