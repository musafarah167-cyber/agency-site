# Latest audit corrections — 17 November 2026

See audit-fixes-review.md and audit-fixes.json: 165 integrated assertions, 88 layouts across all eleven pages, plus targeted and independent checks. This revision supersedes the visitor-flow revision described below. The smaller runtime uses the same original C and all protected artwork is unchanged.

# Verification evidence

The latest visitor-flow revision is recorded in visitor-flow.json (150 assertions; 80 layouts), visitor-flow-review.md (scope and completion criteria), and visitor-text-zoom.json (20 independent enlarged-text checks, including clipped text).

The normal layouts cover all ten pages at 320, 390, 768, 861, 900 and 1440 pixels. Enlarged text covers all ten at 320 and 390 pixels at 200%. Chrome and WebKit checks include exact service selection and the unsent enquiry preview. All 17 logo/hero invariants match the pre-change baseline.

The older ../verification.json and the other retained reports describe the preceding charcoal/amber revision. They are historical evidence, not a claim that every older check was rerun.

These are recorded local checks. Physical phones, screen readers, conversion results and real enquiry delivery have not been checked. No deployment is included.

package-visitor-flow.json records the independently rebuilt shared package: all 11 HTML pages, all copied-file hashes, 3D readiness, the unsent form preview and no failed assets/script errors/external requests.

The current package check is package-audit-fixes.json. Additional cross-browser brand/rendering checks are in audit-fixes-webkit.json.
