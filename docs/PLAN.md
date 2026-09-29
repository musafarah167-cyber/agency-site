# Clear Signs: execution plan

Planned by Claude Opus 5.5 on 2026-09-29. Built by the Sonnet `builder` agent one task at a time, checked by the `verifier` agent.
Tick tasks here and in `TODO.md` as they finish.

## Rules for every task
- One task at a time. Builder builds, verifier checks read-only, builder fixes. No parallel edits.
- Only the builder edits `docs/TODO.md`, `DECISIONS.md`, `IDEAS.md`, at the end of its task.
- One local commit per task. No `git push` unless the owner asks.
- Preview: `python3 -m http.server 8765` from `site/` (after T1). Check 375px, 768px, 1280px, and no console errors.
- Placeholder check before committing site changes: `grep -rnE '\[(CLIENT|CONFIRM|X|£|PROPOSED|YOUR)' site/` shows only intended placeholders.
- Never put real customer data or bank details in git. Never invent claims, prices or reviews.

## Phase 1: now (no owner input needed)
- [x] T1. Move site files into `site/` so a deploy can never publish `docs/` or `CLAUDE.md`.
- [x] T2. Remove unconfirmed claims: "Most popular" badge, "Bulk quantities available", flat "works with iPhone and Android" (use "most modern"), maintenance card details (mark CONFIRM). Flag "one monthly bill" for Batch 1.
- [x] T3. Accessibility and mobile: skip link, WhatsApp button contrast to 4.5:1, stronger focus ring, bottom padding so the float button never covers the form or footer, Escape closes menu, reduced-motion, 44px tap targets.
- [x] T4. On-page SEO without a domain: title/description include all services, Open Graph tags, theme-color, one h1, logical headings. (robots, sitemap, canonical, structured data wait for Phase 3.)
- [x] T5. Privacy policy draft: `docs/legal/privacy-policy-DRAFT.md`.
- [x] T6. Business setup guide with gov.uk/ICO/IPO sources: `docs/business-setup-guide.md`.
- [x] T7. Website build and launch process with pre-launch checklist: `docs/process/website-build-process.md`.
- [x] T8. Maintenance checklist (internal): `docs/process/maintenance-checklist.md`.
- [x] T9. Customer onboarding checklist per service: `docs/process/customer-onboarding-checklist.md`.
- [x] T10. Quote and invoice templates (no bank details): `docs/templates/`.
- [x] T11. Partner job checklist for outsourced printing and fitting: `docs/process/partner-job-checklist.md`.
- [x] T12. Lead tracker and sales/expenses CSV templates, headers only: `docs/templates/`.
- [x] T13. Demo sites plan (plan only): `docs/demo-sites-plan.md`.

## Owner decision batches (emailed)
- **Batch 1** (sent with Batch 2): 20 answers for terms, privacy, site wording. Includes the URGENT HMRC question.
- **Batch 2**: package prices and inclusions, NFC bulk, uniform pricing. Fallback: "Price on request" on every package.
- **Batch 3** (later): name/trade mark check, domain, hosting account, permanent contact details, legal check, insurance, ICO fee. Needs spend approval.

## Phase 2: after Batch 1 and 2 answers
Fill terms and privacy brackets; build `site/terms.html` and `site/privacy.html` as unlinked DRAFT + noindex; privacy line under the form; fill FAQ, footer, packages; update templates; build demo sites outside this repo.
### Phase 2 progress
- [x] P2-1. Terms draft filled with agreed decisions (brackets kept for name order, estate name, maintenance edit count, video who/where, late fees).
- [x] P2-2. Privacy draft, quote template and invoice template updated.
- [x] P2-3. Site wording softened per DECISIONS.md; privacy line under the quote form.
- [ ] Still to do in Phase 2: `site/terms.html` and `site/privacy.html` (unlinked, noindex), FAQ and footer content, package prices, demo sites.

**Gate:** legal documents checked professionally. Owner completes Batch 3 items 1 to 3 and approves any spend.

## Phase 3: staging
Owner connects hosting (recommended: Cloudflare Pages, free, deploy `site/` from the private repo). Staging from a `staging` branch with noindex. Add robots.txt, sitemap.xml, canonical, og:url, LocalBusiness structured data using confirmed facts only. Run the full launch checklist, including tel: and WhatsApp links on a real phone.
**Gate:** owner reviews staging and approves go-live in writing.

## Phase 4: go-live
Merge to production, connect domain, confirm SSL, link legal pages and remove draft banners, re-run checklist on live. Then owner sets up Google Business Profile, Search Console and socials.

## Standing gates (always ask first)
Any git push, showing any customer's work (needs written consent), any purchase, any DNS change, any deploy.

## Top risks
1. Publishing private files (guard: T1, only `site/` deployed).
2. Misleading claims under advertising rules (guard: T2, placeholder grep, every claim traced to DECISIONS.md).
3. Consumer distance-selling rules for quotes agreed by WhatsApp (guard: Batch 1 Q4, professional check).
4. Liability for the partner's printing or van damage (guard: T11, written proof sign-off, partner insurance, deposit covers partner cost, own insurance covers partner work).
5. Data protection: enquiries go through WhatsApp (Meta); customer site data when maintaining; leads never in git (guard: T5, ICO self-assessment, header-only templates).
6. Sole-trader name and address disclosure; trade mark conflict (guard: Batch 1 Q2 and Q3, Batch 3 search before spending).
7. Draft or staging pages indexed (guard: noindex, unlinked drafts).
8. Temporary contact details left behind at launch (guard: launch checklist step).
9. Customer lock-in disputes over domains or NFC links (guard: customer owns accounts, cards use direct links).

## Hosting options (owner approves any spend)
| Option | Cost | Staging | Notes |
|---|---|---|---|
| Cloudflare Pages (recommended) | Free tier, commercial use OK | Branch previews | Works with the private GitHub repo; output folder `site/`. Owner creates the account. |
| Netlify | Free tier | Deploy previews | Password-protected staging is paid. |
| GitHub Pages | Free only for public repos | None | Not recommended: repo is private. |
| UK shared hosting | Paid monthly | Subdomain | Often includes email; more to maintain. |
| Vercel | Hobby tier | Previews | Hobby tier is non-commercial only. |
