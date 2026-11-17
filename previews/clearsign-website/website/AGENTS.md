# ClearSign website source

Follow the project-root AGENTS.md. This is the canonical source for the current
ClearSign website. Keep the approved appearance, logo geometry and interactions
unless Khalid asks to change them. Publishing requires its own authorisation.

- Edit shared page markup in `build.mjs`, page content in `content/`, and browser
  assets or the authored brand guide in `static/`.
- Run `node website/build.mjs` from the project root to generate `site/`.
- `site/` is generated output: change its source here, then rebuild. Never copy
  the old `outputs/clearsign-website-concept/` files back over it.
- Use `--out outputs/<local-check-folder>` for a separate review build. The
  builder refuses unknown or edited output files rather than destroying them.
- Keep runtime libraries and their licences in `static/assets/vendor/`.
  Development tools, reference repositories, screenshots used only for testing,
  caches and reports do not belong in the publishable website.
- The two pictures in `static/assets/images/` appear on the website services
  page. They are content, not disposable test screenshots.
- Keep private customer information and credentials out of this folder.
- Nothing here sends enquiries: the contact form is a local preview only.
