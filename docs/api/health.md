# Health API

Public probes for the Nest backend (no auth).

Global prefix: `/api`. Health routes are version-neutral (no `/v1`) so Docker/K8s probes stay stable across API versions; all other endpoints live under `/api/v1`.

## Endpoints

### `GET /api/health`

Liveness. Returns `200` if the process can answer.

```json
{
  "status": "ok",
  "service": "vita-forge-backend",
  "timestamp": "2026-09-05T06:00:00.000Z"
}
```

### `GET /api/health/live`

Same payload as `/api/health` (for Kubernetes-style `/live` probes).

### `GET /api/health/ready`

Readiness. Includes persistence mode (`memory` or `postgres`).

- `200` when the process is up and persistence is usable
- `503` when `DATABASE_URL` is set but Postgres is unreachable

```json
{
  "status": "ok",
  "service": "vita-forge-backend",
  "version": "0.8.0",
  "timestamp": "2026-09-05T06:00:00.000Z",
  "uptimeSeconds": 42,
  "checks": {
    "process": "ok",
    "persistence": {
      "mode": "memory",
      "status": "ok",
      "detail": "DATABASE_URL unset; in-memory store"
    }
  }
}
```

## Quick check

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/ready
```

Docker Compose uses `/api/health/live` as the backend healthcheck.
