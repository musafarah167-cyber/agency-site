# Learning path for the owner (back end basics)

Written 2026-09-30. You don't need to become a developer; you need enough to understand what you're buying, spot problems and make small changes. About 2 to 4 hours a week. Do the steps in order. Resource names are well-known free sources; check each is still free when you start.

## Stage 1: how the web works (week 1) NOW
**Learn:** what a browser, server, domain, DNS and HTTPS are; the difference between front end and back end.
**Why:** every decision in `ROADMAP.md` (hosting, forms, payments) rests on this.
**Free:** MDN Web Docs "How the web works" (developer.mozilla.org); Cloudflare Learning Center (cloudflare.com/learning).
**Exercise:** open `site/index.html`, then in your browser press F12 → Network tab → reload. Find which files load. Notice nothing is sent to a server when the quote form is used.

## Stage 2: HTML forms (week 2) NOW
**Learn:** what a form sends, `GET` vs `POST`, what "validation" is.
**Free:** MDN "Your first form" and "Sending form data".
**Exercise:** read the quote form in `site/index.html` and `site/script.js` with Claude. Write down in 5 lines what happens when someone presses the button. (Read only: the front end session owns those files.)

## Stage 3: JavaScript basics (weeks 3 to 5) NOW
**Learn:** variables, functions, `if`, arrays, objects, `fetch`.
**Free:** javascript.info (first 3 chapters); freeCodeCamp JavaScript course.
**Exercise:** in `backend/` (once it exists) change a small message or a validation rule and run the tests to see them pass or fail.

## Stage 4: command line, git and Node.js (weeks 4 to 6) SOON
**Learn:** `cd`, `ls`, running a script, `git status/commit/branch`, `npm`.
**Free:** "The Missing Semester" (missing.csail.mit.edu) first lectures; GitHub Skills (skills.github.com); nodejs.org docs intro.
**Exercise:** make a branch, change a line in a note file, commit, read `git log`.

## Stage 5: APIs and environment variables (weeks 6 to 8) SOON
**Learn:** what an API key is, why keys go in `.env` and never in git, how a server "sends an email".
**Free:** Cloudflare Pages Functions docs (developers.cloudflare.com/pages/functions); the docs of whichever email service you choose.
**Exercise:** run the local prototype (if approved), then read `.env.example` and explain which value is secret and why.

## Stage 6: data protection basics (alongside, 1 hour) NOW
**Learn:** controller/processor, lawful basis, retention, data subject requests.
**Free:** ICO "Guide to data protection for small organisations" and the ICO self-assessment (ico.org.uk).
**Exercise:** list every place you'd hold a customer's name and email, who can see it, and when you'd delete it.

## Stage 7: payments concepts (before you open an account) SOON
**Learn:** hosted payment links vs own card form, subscriptions, refunds, chargebacks, Direct Debit mandates.
**Free:** the provider's own docs and UK "Getting started" pages (Stripe docs, GoCardless guides).
**Exercise:** in the provider's **test mode** (no real money) only once you have an account, create a £49 monthly test subscription.

## Later (only when needed)
Databases and SQL (SQLite / Cloudflare D1), security basics (OWASP Top 10 summary), testing. Skip until a real need appears.

## Rules while learning
Never paste passwords or keys into chat or code; work on a branch; ask Claude to explain before it changes anything; break one thing on purpose in a safe copy, that's how it sticks.
