# Docker Guide for New Developers

Everything you need to run, seed, and debug Vita Forge with Docker — no local Node/Postgres install required.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)
- This repo cloned locally, with `frontend/.env` and `backend/.env` copied from their `.env.example` files (optional — Compose sets sane defaults itself)

## The two compose files

| File | What it does |
|---|---|
| `docker-compose.yml` | Frontend + backend. Backend defaults to the **in-memory store** (no database). |
| `docker-compose.db.yml` | Overlay that adds Postgres + Redis and points the backend at them via `DATABASE_URL`. Only takes effect with `--profile db`. |

**Rule of thumb:** if you need data to survive a restart (accounts, resumes, cover letters), always pass both files and the profile:

```bash
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db <command>
```

If you only pass `docker compose <command>` (no `-f`/`--profile`), you get the in-memory backend — fine for a quick UI look, useless for anything you want to keep.

## Everyday commands

**Start everything (with database)**

```bash
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db up --build -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:3001/api/v1 |
| Health | http://localhost:3001/api/health |

**Start everything (no database, quick look)**

```bash
docker compose up --build
```

**Stop everything**

```bash
docker compose down
```

Add `-v` to also delete the Postgres/Redis volumes (wipes all saved data): `docker compose down -v`.

**View logs**

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

**Rebuild after pulling new code or changing a Dockerfile**

```bash
# Everything
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db up -d --build

# Just the backend (faster when only backend/ changed)
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db up -d --build backend
```

## Seeding demo data

Populates a demo account so you have something to log in with.

```bash
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db exec backend npm run prisma:seed
```

Creates `demo@vitaforge.dev` / `Password123!` with a sample resume profile.

## Inspecting the database

```bash
# Interactive psql shell
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db exec postgres psql -U vita -d vitaforge

# One-off query, no interactive shell
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db exec postgres psql -U vita -d vitaforge -c "SELECT email FROM users;"

# Prisma Studio (browser-based data viewer/editor)
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db exec backend npx prisma studio --schema database/schema.prisma
```

## Migrations

Migrations run automatically when the backend container starts with `DATABASE_URL` set. To run them by hand:

```bash
# Apply pending migrations
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db exec backend npx prisma migrate deploy --schema database/schema.prisma

# Check what's applied vs. pending
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db exec backend npx prisma migrate status --schema database/schema.prisma
```

## Common pitfall: `DATABASE_URL resolved to an empty string`

`docker compose exec` runs inside the container **as it was last started** — it does not re-read compose files or recompute environment variables. If you start the backend without `-f docker-compose.db.yml --profile db`, and later `exec` into it *with* those flags, the container is still the old one and `DATABASE_URL` is still empty.

Check what a running container actually has:

```bash
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db exec backend env | grep DATABASE_URL
```

If it's empty, recreate the container so the flags actually apply:

```bash
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db up -d --force-recreate backend
```

## Cheat sheet

| I want to... | Command |
|---|---|
| Start with a real database | `docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db up --build -d` |
| Stop everything | `docker compose down` |
| Wipe the database too | `docker compose down -v` |
| Tail backend logs | `docker compose logs -f backend` |
| Seed demo data | `docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db exec backend npm run prisma:seed` |
| Open a database shell | `docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db exec postgres psql -U vita -d vitaforge` |
| Fix a stale container's env | `docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db up -d --force-recreate backend` |

## See also

- Root [README.md](../README.md#docker) — condensed version of this guide
- [Getting Started](./getting-started.md) — running without Docker
