# VitaForge

## Backend (`backend/src/**`)

- NestJS layout: controllers stay thin; business logic lives in feature services (`auth/`, `users/`, `ai/`). Persistence goes through `repositories/`.
- Validate request bodies with class-validator DTOs in `dto/` folders. Do not accept untyped `any` bodies on new endpoints.
- AI generation goes through `AIService` and prompt builders — do not call LM Studio from controllers. Config defaults live in `backend/src/ai/lm-studio-config.ts`.
- Add or update Jest specs under `backend/tests/` for new services and controllers. Run `npm test` in `backend/`.

## Frontend (`frontend/src/**`)

- Use functional React components. Colocate styles next to the component (`login.css`, `register.css`).
- Put HTTP clients in `frontend/src/services/`, shared types in `frontend/src/types/`, and constants in `frontend/src/constants/`.
- New UI belongs under `frontend/src/components/` or the matching feature folder (`features/resume-builder`, `features/cover-letter`, `features/website`, `features/auth`).
- Prefer existing API helpers over ad-hoc `fetch` in components — see `frontend/src/services/index.ts`.

## Commenting (`**/*.ts, **/*.tsx, **/*.js, **/*.jsx`)

- Comment only complex logic, workarounds, performance tradeoffs, and non-obvious dependencies.
- Do not comment trivial loops or "this fixes issue #N" (use the commit message instead).
- Public functions use JSDoc (`@param`, `@returns`, `@throws`). TODOs include issue, owner, and status.

## Git flow

- Do not commit or push unless the user asks.
- Features: `git checkout -b feature/<short-desc> develop`
- Releases: `release/<version>` from `develop`
- Hotfixes: `hotfix/<version>-<issue>` from `main`
- Merge to `main` through a PR.

## Versioning

- SemVer is `MAJOR.MINOR.PATCH`. MAJOR = breaking, MINOR = feature, PATCH = fix.
- Before a release, bump the same version in root `README.md`, `frontend/package.json`, `backend/package.json`, both changelogs, Docker labels if present, and `.env.example`.

## Workspace hygiene

- Keep real project work (`backend/`, `docs/`, `frontend/src/**`, `.env.example`). Delete scratch files when a task is done: `*.tmp`, `temp*.txt`, `temp*.md`, numbered drafts, empty accidental filenames.
- Do not commit real `.env` files. Put templates in `.env.example`.
- Never edit generated output in `dist/` or `build/`.

## Documentation files

| File | Purpose |
|------|---------|
| `README.md` | Main project description shown on repo homepage |
| `CONTRIBUTING.md` | Contribution guidelines |
| `LICENSE` | License information |
| `CODE_OF_CONDUCT.md` | Community rules |
| `SECURITY.md` | Security policy and vulnerability reporting |
| `SUPPORT.md` | How users can get help |
| `CHANGELOG.md` | Version history and updates |
| `TODO.md` | Task tracking |
| `ROADMAP.md` | Future plans/features |
| `docs/*.md` | Documentation pages |
| `wiki/*.md` | GitHub Wiki pages |
| `.github/ISSUE_TEMPLATE/*.md` | Issue templates |
| `.github/PULL_REQUEST_TEMPLATE.md` | Pull request template |
| `.github/DISCUSSION_TEMPLATE/*.md` | Discussion templates |

When code changes affect any of the above (new feature, behavior change, version bump), update the relevant markdown files in the same change — most commonly `CHANGELOG.md` and `README.md`.

## Commit attribution

- Do not add an AI/bot co-author trailer (e.g. `Co-Authored-By: Claude ...`) to commits or PR descriptions.

## Session continuity

- When approaching the context limit on a long task, write a handoff under 200 words to `CONTEXT.md` with full file paths, branch, pending tasks, known bugs, and next steps.
- On a new session picking up existing work, read `CONTEXT.md` first if it exists.
