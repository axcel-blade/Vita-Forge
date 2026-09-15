# Docker notes for Vita Forge (v0.8.0)

## Quick start

From the repository root:

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3001/api/v1

Compose waits for the backend `/api/health/live` check before starting the frontend.

## Optional Postgres

```bash
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db up --build
```

This sets `DATABASE_URL` for the API, waits for Postgres health, and runs `prisma migrate deploy` via `docker/backend-entrypoint.sh` on container start.

## Files

| Path | Role |
|------|------|
| `docker/backend.Dockerfile` | NestJS API image |
| `docker/backend-entrypoint.sh` | Migrate (if `DATABASE_URL`) then start Nest |
| `docker/frontend.Dockerfile` | Vite build + nginx |
| `docker/nginx.conf` | SPA routing for the frontend |
| `docker-compose.yml` | Default compose services (repo root) |
| `docker-compose.db.yml` | Postgres overlay (repo root) |

## Environment

Compose reads env vars from your shell or a root `.env` (not committed):

```bash
CORS_ORIGINS=http://localhost:8080
VITE_API_BASE_URL=http://localhost:3001/api/v1
ANTHROPIC_API_KEY=
```

See the root README Docker section for more detail.
