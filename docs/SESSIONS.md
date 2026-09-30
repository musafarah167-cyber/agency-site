# Work sessions and who owns what

Set up 2026-09-30. The **coordinator** session (the original one) is the only one that merges work into `main` and pushes to GitHub.
Each other session works in its own git worktree on its own branch, commits there, and never merges or pushes.

| Session | Branch | Owns (may edit) | Must not edit |
|---|---|---|---|
| Coordinator | `main` | merging, `docs/DECISIONS.md`, `docs/TODO.md`, `docs/PLAN.md`, `docs/QUESTIONS.md`, `CLAUDE.md` | nothing is off limits, but avoids doing other sessions' jobs |
| Design | `design` | `site/styles.css`, `site/favicon.svg`, new images in `site/images/`, `docs/design/` | `site/index.html` content/wording, `site/script.js` |
| Front end | `frontend` | `site/index.html`, `site/script.js`, new pages in `site/` (e.g. service pages), `docs/frontend/` | `site/styles.css` except adding NEW rules at the end of the file under a `/* frontend: ... */` comment |
| Testing | `testing` | `tests/`, `docs/testing/` (reports, checklists) | anything in `site/` (report problems; do not fix them) |
| Back end prep | `backend` | `backend/`, `docs/backend/` | anything in `site/` |

## Rules for every session
- Read `CLAUDE.md`, `docs/DECISIONS.md` and this file first. The owner is a beginner: plain English, short explanations.
- Never invent prices, reviews, claims or certifications. Never buy, deploy, change DNS or push. Ask the owner first for anything costing money.
- Never commit secrets (`.env`, keys, passwords, bank details).
- Commit working states on your own branch with clear messages. Do not merge into `main`.
- When a piece of work is ready, write a short handoff in `docs/<your area>/HANDOFF.md` (what changed, how it was tested, what was not tested, anything the owner must decide) and tell the owner it is ready for the coordinator to merge.
- Owner decisions go to the coordinator so `docs/DECISIONS.md` stays the single source of truth.
