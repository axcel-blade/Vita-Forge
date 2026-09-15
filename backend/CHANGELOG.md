# Backend changelog

## [Unreleased]

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
