# ClearSign Solutions — website review

The current company website and brand kit, shared for Hussam to review. This is a separate preview: it does not replace `site/` and has not been published. Only `site/` is eligible for any future deployment, which requires separate owner authorisation.

## View it on your computer

From the repository root:

```sh
python3 -m http.server 3210 --bind 127.0.0.1 --directory previews/clearsign-website
```

Open http://127.0.0.1:3210/ for the website and http://127.0.0.1:3210/brand.html for the brand kit. Stop with Ctrl+C. If port 3210 is already occupied, choose another unused port. This local address works on the computer running the command; it is not a hosted review link.

All ten pages are prebuilt. Python 3 serves them; no package installation or external service is needed. The C is a real locally rendered 3D scene, not a video. If graphics cannot run, a matching still is shown.

## Edit and rebuild

```sh
node previews/clearsign-website/build/site.mjs
```

Use a current supported Node.js version. `build/site.mjs` is the source for shared HTML and page composition. Content lives in `content/`; do not make lasting copy edits directly to generated HTML. `website.js` owns navigation, the unsent form preview and shared motion. `hero-3d.js` owns the sculpture, and `scroll-story.js` owns the illustrative enquiry journey. CSS loads from general to specific, ending with `refinement.css` then `clarity.css`. The latter refines readable service hierarchy, contact actions and the form. Brand review uses `brand-kit.css`.

Read [HANDOVER.md](HANDOVER.md) for what works and what remains, [AGENTS.md](AGENTS.md) for editing boundaries and [SOURCES.md](SOURCES.md) for local runtime/licence details.

The enquiry form does **not send or save messages**. The sample workflows are illustrative, not evidence that those customer systems have been delivered. There are no invented clients, testimonials, prices or results.

The current flow uses five distinct services throughout: Websites, AI agents, Admin & follow-up, Custom software, and Marketing & print. Visitors can pick a service or their type of business, then review an enquiry with that context already selected. See `verification/audit-fixes.json` and `verification/audit-fixes-review.md` for the latest checks; visitor-flow and earlier reports are historical.

The audit corrections preserve all logo/hero assets, fix keyboard/menu/story and form editing/validation, and keep brand examples readable on phones and with enlarged text. Three.js runtime files are minified derivatives (63.9% smaller before HTTP compression). Scroll Craft has one documented local startup patch and loads only where used. See [vendor provenance](assets/vendor/PROVENANCE.md); ordinary HTML rebuilding still needs no package installation.
