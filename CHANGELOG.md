# Changelog

All notable changes to Vita Forge are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Cursor rules for Apple (Australia) marketing UI: tokens, component states, accessibility (WCAG 2.2 AA), content tone, and guideline authoring (`.cursor/rules/frontend/apple-au-*.mdc`).
- API versioning: all endpoints now live under `/api/v1` (URI versioning, default version `1`). Health probes (`/api/health`, `/live`, `/ready`) stay version-neutral for Docker/K8s.

### Changed
- Moved Resume Builder-only components (editors, preview, templates, toolbar) from `frontend/src/components/` into `frontend/src/features/resume-builder/components/`; `frontend/src/components/` now holds only cross-feature shared pieces (`ErrorBoundary`, `Seo`, `Toast`, `TemplateSharedParts`)

## [0.8.0] - 2026-09-05

### Added
- Docker Compose stack (`docker/`, `docker-compose.yml`) for frontend + backend with healthchecks
- Optional Postgres service via Compose profile `db`
- Collaboration rooms with SSE streaming (`/api/collab/*`)
- Template marketplace catalog API (`/api/templates`) and frontend presets
- Health readiness probe with persistence mode (`/api/health/ready`, `/live`)

### Fixed
- Nest `AIService` DI crash when optional `Partial<LmStudioConfig>` was treated as an injectable

### Changed
- Compose and docs default CORS origins include the Docker UI on port 8080

## [0.7.0] - 2026-09-05

### Added
- Prisma user, profile, and resume-version schema with migrations
- Registration → profile sync and restore points
- Optimistic resume and cover letter saves against the Nest API

### Changed
- Reorganized the Vite app into `features/`, `services/`, `layouts/`, and `constants/`
- Reorganized Nest into feature modules plus `repositories/` and `database/`
- Signed-in sessions persist profiles through the API instead of `localStorage`

### Fixed
- Frontend `.env` quoting so Vite reads `VITE_API_BASE_URL`

## [0.5.12] - 2026-08-31

### Changed
- Moved the Vite application into a dedicated `frontend/` folder to keep the repository root focused on project docs and automation
- Updated run instructions to install and launch the app from the new frontend directory
- Refreshed markdown references and version metadata to match the new repository structure

---

## [0.5.11] - 2026-08-26

### Fixed
- Long degree and school names wrap in the PDF instead of drawing over the date column
- Education school names use one style: bold, not italic, Title Case, with the degree on the following line

---

## [0.5.10] - 2026-08-26

### Changed
- Professional title, section headings, job titles, dates, and bullets all use 11pt so VMock no longer flags the Title as a mixed font size
- Date ranges use a spaced ASCII hyphen (`Jun 2022 - Present`) and sit bold-italic on the right of each entry title line
- Dated sections sort by end date first (`Present` first), then start date

---

## [0.5.9] - 2026-08-26

### Added
- Up/down controls on bullet lists so experience, education, projects, skills, awards, volunteer work, certificates, and interests can be reordered without deleting and re-adding lines

---

## [0.5.8] - 2026-08-26

### Changed
- Resume dates now render as abbreviated months with a spaced en-dash (`Jun 2022 – Present`) and bold-italic styling in both the A4 preview and the PDF export
- Date-bearing sections (experience, education, projects, volunteer work, certificates, awards) sort reverse-chronologically
- Section headings share one type size; titles, dates, and bullets inside sections share one body size
- Page margins sit in the 0.75–1 inch band (0.9 inch sides; extra PDF top offset so the name cap-height still clears 0.75 inch)

### Fixed
- Mixed date formats (full month names, `Issued …` certificate lines, year-only awards) that failed community format checks

---

## [0.5.7] - 2026-05-26

### Removed
- `react-router-dom` — replaced with a custom History API router (`src/core/router/router.jsx`)
- `jspdf` — replaced with native browser `window.print()` and CSS `@media print`
- `html2canvas` — unused dependency removed
- `react-to-print` — unused dependency removed

### Added
- `src/core/router/router.jsx`: custom router exporting `BrowserRouter`, `Routes`, `Route`, `Outlet`, `Link`, `NavLink`, `useNavigate`, `useLocation`
- Hidden `#resume-print-area` in `Builder.jsx` for CSS print targeting
- Hidden `#cover-letter-print-area` in `CoverLetterHome.jsx` for CSS print targeting
- `@media print` rules in `index.css` with A4 `@page` size

### Changed
- All `react-router-dom` imports updated to use the custom router
- `Toolbar.jsx` `savePDF` now calls `window.print()` instead of building a jsPDF document
- `exportCoverLetterPdf.js` now calls `window.print()` instead of building a jsPDF document

---

## [0.5.6] - 2026-05-25

### Fixed
- Resume Builder reset now restores default data in-app without a page reload, preventing 404 errors on nested routes hosted on static servers

---

## [0.5.5] - 2026-05-20

### Changed
- Replaced placeholder starter resume and cover letter defaults with fully filled fictional sample data covering every supported section

---

## [0.5.4] - 2026-05-15

### Added
- Route-level lazy loading via React `lazy` + `Suspense` to reduce initial bundle weight and improve first-load performance

---

## [0.5.3] - 2026-05-10

### Added
- Dedicated 404 page (`src/website/pages/NotFound.jsx`) for unknown routes

---

## [0.5.2] - 2026-05-01

### Changed
- Product page CTA button label updated from `Start Now` to `Get Started`
