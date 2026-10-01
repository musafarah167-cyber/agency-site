# Tests

Needs only Python 3 (already on your Mac) and Google Chrome (for the browser check). Nothing to install.

```
python3 tests/check_site.py             # quick automatic check: pages, links, anchors, meta tags, phone numbers, placeholders
python3 tests/check_site.py --launch    # before going live: any placeholder counts as a FAIL
python3 tests/full_browser_check.py     # full browser check (about 5 minutes), screenshots in docs/testing/screenshots-2026-10-01-c/
python3 tests/full_browser_check.py --no-shots
```

`full_browser_check.py` opens the site in a hidden Chrome at 375 / 768 / 1280 px and checks: sideways scroll, console errors,
text contrast, tap sizes, mobile menu, quote form, NFC calculator, "try it" demo, package finder (including a real
keyboard-only walkthrough), reduced motion (hero must have 0 running animations), pausing when the hero is off screen, scroll
fade-ins (anchor jumps, JavaScript off, print), slanted hero clipping, illustration captions, header, frame timing and every
price on the page. It prints PASS / FAIL / NOTE and exits with 1 if anything fails.

Files: `cdp.py` (small Chrome remote-control helper), `browser_checks.js` (measuring script it injects),
`check_site.py` (fast checks, no browser). Reports are in `docs/testing/REPORT-<date>.md`.
