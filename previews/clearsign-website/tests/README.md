# Check the ClearSign website

Build the current source and serve the exported files locally.

```sh
node website/local.mjs install
node website/build.mjs
node website/check.mjs
node website/preview.mjs
```

In a second terminal in the project folder, run the browser checks.

```sh
node tests/browser-check.mjs
node tests/review-fixes.mjs
```

The first check covers all twelve pages, ordinary and enlarged text, the service directory, navigation, enquiries, working artwork, keyboard use and reading without JavaScript. The second checks the general, package, branding, private AI and guided demo paths as well as contact addresses, validation, editing and earlier enquiry links. It checks the time estimate, optional email and the phone menu that follows readers through four sections. The export check also verifies that the former public brand kit and its download links were removed.

Both use the installed Chrome and the project-local WebKit browser for Safari behaviour. A real phone is separate from these browser tests. The helper uses the available Playwright browser library. You can set `PLAYWRIGHT_MODULE` and `CHROME_PATH` if your installation differs. Browser profiles, temporary files and evidence stay in this project. Use `SITE_URL=http://127.0.0.1:3211` to check a different local preview. [Checked branch results](../verification/README.md)
