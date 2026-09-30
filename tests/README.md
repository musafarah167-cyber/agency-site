# Tests

Needs only Python 3 (already on your Mac). Nothing to install.

```
python3 tests/check_site.py            # everyday check
python3 tests/check_site.py --launch   # before going live: any placeholder counts as a FAIL
```

It starts a temporary local server for `site/`, loads every page, and checks links, `#anchors`, files,
meta tags, one `h1`, `tel:` and WhatsApp numbers, alt text, and leftover placeholders (`[CLIENT`, `[CONFIRM`, `[X]`, `[£` ...).
PASS / WARN / FAIL is printed per check. Exit code 1 means at least one FAIL.

Browser checks (widths, menu, form, keyboard, contrast, reduced motion) are run by hand in the in-app browser
and written up in `docs/testing/REPORT-<date>.md`.
