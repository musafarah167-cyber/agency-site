# ClearSign website review

The homepage opens on warm white, with the large animated C beside “Turn enquiries into customers.” Five services are grouped by the problems they help a business solve. The car hire example shows how a caller’s details can reach the person who needs to follow up.

[Desktop screenshot](homepage-preview.png) · [Phone screenshot](website-specimen-mobile.png) · [Handover](HANDOVER.md)

## Open the website locally

From the repository root, start a local preview with Python 3.

```sh
python3 -m http.server 3210 --bind 127.0.0.1 --directory previews/clearsign-website/site
```

Open [the homepage](http://127.0.0.1:3210/) or [the brand guide](http://127.0.0.1:3210/brand.html) on that computer. The pages are already built. Visitors can email general enquiries, sales, support or accounts. The project form prepares an email to sales for the visitor to send in their own email app.

## Edit the review

From `previews/clearsign-website/`, run these commands once after checkout and again after editing.

```sh
node website/build.mjs
node website/check.mjs
```

Edit the copy, layout and artwork in [website/](website/README.md). The build produces the viewable [site/](site/) folder. The source includes the logo, fonts, original 3D animation and a still picture for devices that cannot show it. The earlier preview addresses also open the updated pages.

[Browser checks](tests/README.md) · [Verification results](verification/README.md) · [Sources and licences](SOURCES.md)
