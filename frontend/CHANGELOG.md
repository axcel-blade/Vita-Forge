# Frontend changelog

## [Unreleased]

### Changed
- **Breaking:** Auth now relies on the backend's HttpOnly session cookie instead of storing `access_token`/`refresh_token` in `sessionStorage`/`localStorage`. `src/services/token.ts` is removed; `AuthProvider` resolves auth state by calling `GET /auth/me` (cookie sent automatically via `credentials: 'include'`) instead of holding a token in memory
- `apiRequest` (`src/services/http.ts`) always sends `credentials: 'include'` and attaches the CSRF cookie value as an `X-CSRF-Token` header on mutating requests; a `401` on an authenticated request now clears auth state and lets `ProtectedRoute` redirect to `/login`, rather than attempting a token refresh
- New `src/services/csrf.ts` reads the non-HttpOnly `vf_csrf` cookie for the double-submit CSRF header

### Added
- Account panel on the home page for signed-in users (edit name/email, change password) instead of the marketing hero, with quick links to the dashboard, resume builder, cover letter writer, and active sessions
- Post-login dashboard (`/dashboard`, unlocked once signed in): a tool launcher linking to the resume builder, template marketplace, cover letter writer, and active sessions, with a Dashboard link in the navbar
- New `/account/sessions` page to view and revoke active login sessions, linked from the navbar
- Root `vercel.json` for a multi-service Vercel deploy: the Vite build served with SPA routing alongside the Nest backend
- Cursor rules for Apple (Australia) marketing UI: tokens, component states, accessibility (WCAG 2.2 AA), content tone, and guideline authoring (`.cursor/rules/frontend/apple-au-*.mdc`)

### Changed
- Moved Resume Builder-only components (editors, preview, templates, toolbar) from `src/components/` into `src/features/resume-builder/components/`; `src/components/` now holds only cross-feature shared pieces (`ErrorBoundary`, `Seo`, `Toast`, `TemplateSharedParts`)

### Removed
- Resume Builder header: "Resume Builder" title, intro description text, "Saved to your account" status line, Template marketplace link, live collaboration controls (Start live session, Room ID input, Join, peer count), and restore point/version history controls (`src/features/resume-builder/pages/Builder.jsx`)
- Cover Letter Writer header: "Cover Letter Writer" title and intro description text (`src/features/cover-letter/pages/CoverLetterHome.jsx`)

### Fixed
- Converted `src/features/auth/ProfileMenu.jsx` and `AppNavbar.jsx` to TypeScript (`.tsx`), fixing a `tsc -b` failure (`TS7016`) that broke the frontend Docker build

### Removed
- Dashboard: dropped the "Template marketplace" and "Active sessions" tool cards (`src/features/auth/Dashboard.tsx`); those pages are still reachable from account settings/resume builder navigation

### Added
- Dashboard "Your documents" section that loads the signed-in user's saved profile (`GET /users/profile`) and shows a card for their resume and cover letter, each linking back into the matching editor

## [0.8.0] - 2026-09-05

- nginx Docker image for the production Vite build (`docker/frontend.Dockerfile`)
- Template marketplace page wired to `/api/templates` with shared layout constants
- Collaborative resume rooms via SSE client (`src/services/collab.ts`)
- Builder share/join flow for multi-peer last-write-wins edits

## [0.7.0] - 2026-09-05

- Feature folders for website, auth, resume builder, and cover letter
- API clients live under `src/services/`
- Signed-in profile edits sync to the backend with optimistic UI
