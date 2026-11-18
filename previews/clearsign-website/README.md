# ClearSign website

The website explains how ClearSign helps smaller businesses win customers and reduce admin. On a phone, visitors can request a project outline, book a guided voice assistant demo, explore four common business problems and measure time spent on a repeated task.

[Phone screenshot](website-specimen-mobile.png) · [Desktop screenshot](homepage-preview.png) · [Handover for Khalid and Hussam](HANDOVER.md)

## View this branch locally

From the repository root, run these commands with Node.js 22.12 or later.

```sh
cd previews/clearsign-website
node website/preview.mjs
```

Open [the local website](http://127.0.0.1:3213/). The checked-in pages are ready to view. To use a different port, start the preview with `SITE_PORT=3214 node website/preview.mjs` and open that port in your browser.

## Edit and check the site

Stay in this directory. Install the locked website dependencies and start the editing server.

```sh
node website/local.mjs install
node website/local.mjs dev
```

Open [the editing preview](http://127.0.0.1:3212/). After making changes, run the following commands to build and check the pages.

```sh
node website/build.mjs
node website/check.mjs
```

[Editing guide](website/README.md) · [Browser checks](tests/README.md) · [Check results](verification/README.md) · [Sources and licences](SOURCES.md)
