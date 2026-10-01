# Quote form back end: LOCAL PROTOTYPE

**NOT DEPLOYED. Nothing here is live, nothing sends real email, and no accounts or sign-ups are needed.** The website in `../site/` does not use it yet.

## What it is (plain English)
When a visitor sends the quote form, the website would post the details to this small program. It checks them, ignores bots, and builds an email to you. In this prototype the "email" is only **printed on screen and saved to `backend/outbox/`** (a "dry run"). It needs only Node.js (already installed here); nothing to install.

## Files
| File | What it does |
|---|---|
| `src/enquiry.js` | Checks the fields, spots bots (hidden "honeypot" field called `website`), builds a plain-text email |
| `src/handler.js` | Takes a web request, returns a reply (ok / error codes) |
| `src/senders.js` | `dryRunSender` (prints, sends nothing) and `resendSender` (real sending for later; unused, tested only with a fake) |
| `functions/api/enquiry.js` | The shape Cloudflare Pages expects, so this could later run at `/api/enquiry`. Not deployed |
| `server.js` | Tiny local test server on 127.0.0.1 only (this computer) |
| `test/` | 14 automated tests |
| `.env.example` | Names of settings. Real `.env` is git-ignored. Never commit keys |

## Try it
```bash
cd backend
npm test        # runs the 14 tests
npm start       # starts the local server on port 8787
```
In a second terminal:
```bash
curl -X POST localhost:8787/api/enquiry -H 'content-type: application/json' \
  -d '{"name":"Sam","contact":"sam@example.com","interest":"Gold package","message":"hi"}'
```
You get `{"ok":true}` and the dry-run email appears in the first terminal.

## Safety built in
- Bots: the hidden `website` field. Filled in = replied "ok" but nothing is sent (no reCAPTCHA, so no cookies).
- Size limits on every field and the whole request; unknown service names rejected.
- Email is plain text with a fixed subject, so visitor text cannot inject headers or HTML. Reply-To is set only for a clean email address.
- Errors never log the visitor's details.

## NOT done (needed before going live)
- Choosing the route: form service vs this Function + an email service (needs an account the owner opens; see `docs/backend/ROADMAP.md`).
- Hosting (Cloudflare Pages) and setting secrets in its dashboard, not in files.
- Rate limiting (stops floods), and a test with a real email service.
- Front-end changes in `site/` (see `docs/backend/HANDOFF.md`).
- Privacy policy: add the email service as a processor; keep enquiries 12 months if no job follows (owner decision).
