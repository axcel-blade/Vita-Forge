# Frontend changelog

## [Unreleased]

### Added
- Account panel on the home page for signed-in users (edit name/email, change password) instead of the marketing hero, with quick links to the dashboard, resume builder, cover letter writer, and active sessions
- Post-login dashboard (`/dashboard`, unlocked once signed in): a tool launcher linking to the resume builder, template marketplace, cover letter writer, and active sessions, with a Dashboard link in the navbar
- New `/account/sessions` page to view and revoke active login sessions, linked from the navbar
- Root `vercel.json` for a multi-service Vercel deploy: the Vite build served with SPA routing alongside the Nest backend
- Cursor rules for Apple (Australia) marketing UI: tokens, component states, accessibility (WCAG 2.2 AA), content tone, and guideline authoring (`.cursor/rules/frontend/apple-au-*.mdc`)

### Changed
- Moved Resume Builder-only components (editors, preview, templates, toolbar) from `src/components/` into `src/features/resume-builder/components/`; `src/components/` now holds only cross-feature shared pieces (`ErrorBoundary`, `Seo`, `Toast`, `TemplateSharedParts`)

### Fixed
- Converted `src/features/auth/ProfileMenu.jsx` and `AppNavbar.jsx` to TypeScript (`.tsx`), fixing a `tsc -b` failure (`TS7016`) that broke the frontend Docker build

## [0.8.0] - 2026-09-05

- nginx Docker image for the production Vite build (`docker/frontend.Dockerfile`)
- Template marketplace page wired to `/api/templates` with shared layout constants
- Collaborative resume rooms via SSE client (`src/services/collab.ts`)
- Builder share/join flow for multi-peer last-write-wins edits

## [0.7.0] - 2026-09-05

- Feature folders for website, auth, resume builder, and cover letter
- API clients live under `src/services/`
- Signed-in profile edits sync to the backend with optimistic UI
