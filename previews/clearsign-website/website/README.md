# Editing the ClearSign website

The website is built with Next.js. Run the [setup and preview commands](../README.md) from the parent directory, `previews/clearsign-website/`. The generated `site/` is the folder used for a release.

| What to change | Where to look |
| --- | --- |
| Homepage copy and order of sections | `app/page.tsx` |
| Service list, enquiry choices and industries | `content/growth.ts` |
| Deliverables and questions on each service | `content/services.mjs` |
| Page layouts and navigation | `app/` and `components/` |
| Type, colours and spacing | `app/globals.css` and `app/studio.css` |
| Phone section menu | `components/phone-journey.tsx` and `app/phone-journey.css` |
| Admin time check | `components/time-check.tsx` |
| Website images, logos and animation | `public/assets/` |

The time check estimates the hours a task currently takes. On the contact and demonstration pages the visitor reviews an email and sends it in their own email app. Demo appointments are confirmed by the team. The original C animation has a still version for reduced motion.

Build with `node website/build.mjs` and verify the export with `node website/check.mjs`. The builder protects locally edited or unexpected output files. It also accepts `--out outputs/<review-folder>` to create a separate export. [Browser checks](../tests/README.md)
