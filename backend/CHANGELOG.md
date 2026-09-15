# Backend changelog

## [Unreleased]

### Changed
- **Breaking:** Replaced the JWT bearer-token auth flow with secure, server-managed HttpOnly session cookies. `POST /auth/login` and `POST /auth/register` no longer return `access_token`/`refresh_token` in the response body — they set an HttpOnly `vf_session` cookie (30-day sliding inactivity expiry, `Secure` in production, `SameSite=Lax`, `Path=/`) plus a readable `vf_csrf` cookie for double-submit CSRF protection. `POST /auth/refresh` is removed; the session renews itself on every authenticated request instead
- `Session` records now carry `expiresAt`, pushed forward by 30 days on every authenticated use (`touchSession`); an expired or revoked session is rejected and cannot be renewed
- All protected routes (`/auth/me`, `/auth/logout`, `/auth/sessions*`, `/auth/account`, `/auth/change-password`, `/users/*`) now go through `SessionAuthGuard` (validates the session cookie, 401 on failure) and, for mutating routes, `CsrfGuard` (double-submit `X-CSRF-Token` header check, 403 on failure)
- Login always mints a brand-new session id (never reuses one), preventing session fixation
- Removed the JWT/passport dependency chain (`@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `jsonwebtoken`) — no longer needed now that sessions are validated directly against the backend store

### Added
- Account settings: `PATCH /auth/account` (update name/email) and `POST /auth/change-password` (verifies the current password, then revokes every other active session as a security measure)
- User session management: login/register create a tracked `Session` record (device user agent, IP, last-active time). New `GET /auth/sessions` and `DELETE /auth/sessions/:id` list and revoke sessions; `POST /auth/logout` revokes the current session server-side. Access/refresh tokens carry a `sid` claim checked on every request, so a revoked session's tokens stop working immediately
- `docs/docker.md`: new-developer Docker guide covering everyday commands, seeding, database inspection, migrations, and the "stale container / empty `DATABASE_URL`" pitfall
- Root `vercel.json` for a multi-service Vercel deploy: Nest backend entrypoint `src/main.ts`, with `/api` rewritten to the backend
- API versioning: all endpoints now live under `/api/v1` (URI versioning, default version `1`). Health probes (`/api/health`, `/live`, `/ready`) stay version-neutral for Docker/K8s

## [0.8.0] - 2026-09-05

- Docker image build for Nest (`docker/backend.Dockerfile`) with Compose healthcheck on `/api/health/live`
- `HealthService` liveness + readiness (memory vs Postgres)
- In-memory collab rooms with SSE fan-out (`CollabModule`)
- Static template catalog (`TemplatesModule`)
- `AIService` no longer takes Nest-injected config objects (avoids `Object` DI token)

## [0.7.0] - 2026-09-05

- Prisma schema and migrations under `database/`
- Auth and profiles use a DataStore repository
- Profile version snapshots and restore
