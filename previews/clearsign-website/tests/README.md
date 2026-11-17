# Check the website

From the review folder, `node website/check.mjs` checks the eleven generated pages, local links and assets using Node.js alone.

With the [local website](../README.md) running, use an existing Playwright installation, Chrome and WebKit to run the browser checks.

```sh
node tests/browser-check.mjs
node tests/review-fixes.mjs
```

`PLAYWRIGHT_MODULE` can point to an existing Playwright entry file. `CHROME_PATH` selects an installed Chrome executable. `PLAYWRIGHT_BROWSERS_PATH` can identify an existing browser installation. The tests open the local site on port 3210 by default. Set `CLEARSIGN_PREVIEW_URL` to a different local preview address ending in a slash when needed.

Results and temporary browser files are written under `outputs/website-checks/` in this review. The two hashes in `fixtures/website-image-baseline.json` identify the older example screenshots checked by the focused tests.
