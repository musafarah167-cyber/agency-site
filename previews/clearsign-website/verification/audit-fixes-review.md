# ClearSign audit fixes — 17 November 2026

The four main usability faults and the smaller form/navigation/readability faults are fixed. The original logo SVGs, favicon, hero controller and fallback image are byte-for-byte unchanged. The website is still an unpublished review; the form still sends and stores nothing.

## Changes and proof

| Reported problem | Implemented result | Verification |
|---|---|---|
| Mobile menu hides the next keyboard link | Menu closes when focus leaves the header; outside pointer clicks also dismiss it. Escape and normal tab order remain. | Core browser checks and independent review |
| Scrolling or resizing cancels the chosen story step | Explicit choices stay selected while reading; automatic selection resumes after leaving/re-entering the story or changing through the mobile layout. | Original failed 11 of 24 checks; fixed passes all 24 |
| Required fields accept only whitespace | Name/message require meaningful text; correcting the input clears the error. Internal message line breaks are preserved. | Core checks plus independent correction/editing review |
| Brand examples crop on phones | Grid columns shrink, card height can grow and text/captions wrap. Complete guide also fits enlarged text. | 24 panel/label cases plus eight full-brand viewport/text cases |
| Business/topic context cannot be corrected | The attached context is an optional editable selection; Not specified removes it from the preview. | Core tests and independent current/legacy-context review |
| Wrong current-page marker | Detail pages use separate Services section emphasis; actual overview and Contact have correct current-page attributes. | Core and independent browser checks |
| Message help appears twice in accessibility data | Short explicit label; separate hint referenced once as the description. | Browser label/description checks |
| Tiny example label is difficult to read | Existing charcoal, 12px text, wrapping when enlarged; contrast measured at 11.25:1. | Targeted computed-style and screenshot checks |
| Unused animation work on inner pages | Scroll Craft and story scripts load only on Home. A documented startup patch skips the video loop when no clips exist. | No such inner-page requests; zero homepage seek ticks while scroll progress updates |
| Large 3D library | Same pinned Three.js release minified at existing URLs. Total falls from 2,133,699 to 770,180 raw bytes (63.9%). | Exact input/output hashes; 443 exports retained; actual hero geometry parity; live rendering/fallback checks |
| Minor copy/metadata gaps | “Make an enquiry” replaces “place an enquiry”; brand guide has a truthful description. | Generated-source review and page checks |

## Current verification

- **165 integrated assertions passed across 88 layouts:** all eleven pages at six normal widths (320, 390, 768, 861, 900 and 1440) and at 200% root text size on 320/390. Includes internal destinations, service/context choices, safe editable preview, motion controls, no-JavaScript behaviour and WebKit's enquiry flow. No browser script errors, failed assets or external requests in that run.
- **13 core fix checks**, **21 independent form/keyboard checks**, **24 story checks**, **24 targeted brand/label checks**, **eight full-brand checks**, **19 vendor/build checks**, and **22 focused runtime checks** also passed. These overlap; they are not added into one inflated total.
- Actual C rendering, pause/resume, live reduced motion, offscreen stop/return, back navigation and forced graphics-loss fallback/recovery were checked in Chrome. Module responses exactly match the generated hashes.
- **Ten additional WebKit checks** passed: complete brand wrapping at 320/390/1440, narrow enlarged text, real minified-C rendering and pause control.
- The isolated shared package was rebuilt and checked across all eleven HTML pages; hashes match and no broken assets, script errors or external requests were found.
- All **17 protected logo/hero files** match their initial hashes. The brand worker additionally confirmed all 33 current/archived brand SVGs were unchanged.
- Normal and enlarged screenshots were inspected, including the complete narrow-phone card/captions and the manually selected Follow up example after scrolling.

The combined check exposed additional enlarged-text overflow in older brand-guide sections; natural wrapping fixed it. A suspected skip-link issue proved to be an oversized element-screenshot artefact: fresh viewport measurements showed the unfocused link fully off-screen, so no unnecessary source fix was made. One independent form-check attempt had uncertain browser-profile JavaScript state; a fresh isolated JavaScript-enabled profile passed. These test limitations are recorded in the detailed evidence.

## Included evidence

Current results: audit-fixes.json (integrated), audit-fixes-core.json, audit-fixes-story.json, audit-fixes-brand.json, audit-fixes-vendor.json, audit-fixes-runtime.json and audit-fixes-independent.json. The detailed original reproductions and before/after screenshots remain in the owner's project audit folder. Older visitor-flow files describe the preceding revision.

Runtime provenance: ../assets/vendor/PROVENANCE.md and three-build-provenance.json in that folder. Optional reproducible vendor preparation: ../build/prepare-vendor.mjs. Neither a minifier nor a dependency installation is needed to view this prebuilt package.

## Deliberately unchanged and remaining launch work

The downloadable/master logos keep their embedded fonts; optional font-export optimisation was not needed to fix the faults and would conflict with this pass's exact-asset preservation. Team identities/photos still require approved information. Social-sharing presentation and real public addresses belong to launch preparation; no domain or service details were invented. Search blocking remains deliberate. Real enquiry delivery, final public business details and publication remain separate work.

I haven't checked physical phones, real screen readers, production hosting compression/caching, battery life, actual background-tab switching, real shared-link cards or customer conversion. The 63.9% figure measures the two library files before compression, not a promised speed improvement. Existing renderer deprecation notices and warnings during deliberately forced graphics recovery are recorded; no unexpected runtime errors occurred.
