# ClearSign website source

Follow the AGENTS.md in the directory above website/. Use Next.js in this folder and keep the owner’s original C, warm white, charcoal and amber identity. Explain the business problem, what ClearSign can deliver and what the owner can measure. Describe industry examples as possibilities unless supporting customer evidence is supplied.

- Edit pages in `app/`, shared interfaces in `components/`, wording in `content/` and website assets in `public/`. Authored pages belong in components. The framework produces the HTML visitors receive.
- Run `node website/local.mjs install` for project-only dependencies and `node website/local.mjs dev` for the editing preview.
- Run `node website/build.mjs` from the project root to generate `site/`. Use `--out outputs/<review-folder>` for a separate local build. Preserve the output ownership checks.
- Run `node website/check.mjs` and the checks in `tests/README.md`. Test a small phone, text enlargement, the no-script email route and reduced motion.
- The enquiry form prepares an email for the visitor to review and send. Preserve the four contact addresses and established page links. Previous brand-kit addresses take visitors to the branding service.
- Keep private material and development tools out of public assets. Pushing and publishing require their own authorisation.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
