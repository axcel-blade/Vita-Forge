# Vita Forge

![Version](https://img.shields.io/badge/version-0.8.0-blue)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

A backend-connected career-tools platform for building professional, ATS-friendly resumes and cover letters with user accounts and data persistence.

The repo is split into a Vite frontend and a NestJS backend. The UI never talks to the database directly.

## What it is

| Module | Description |
|---|---|
| **Website** | Home, About, Products, and Contact pages |
| **Resume Builder** | Section editor with live A4 preview, templates, and PDF export |
| **Cover Letter Writer** | Guided form with live draft preview and PDF export |
| **Collaboration** | Share a resume room over SSE (last-write-wins) |
| **Templates** | Marketplace presets (Modern, Basic, Executive, Compact, Academic) |

## What it does

**Resume Builder**
- Edit profile, experience, education, skills, projects, certificates, achievements, volunteer work, interests, and references
- Reorder bullet points inside each entry with up/down controls; the live preview follows that order
- Live A4-paginated preview that updates as you type
- Community format styling: 11pt body including the professional title, abbreviated dates with spaced hyphens (`Jun 2022 - Present`), bold-italic dates on the title line, reverse-chronological sections, and 0.75–1 inch page margins
- Education lists each school in bold Title Case (not italic) so university names stay consistent; long titles wrap beside the date instead of overlapping it
- Modern and Basic layout templates with accent colour picker
- Export to PDF or JSON; import a saved profile from JSON

**Cover Letter Writer**
- Guided form with tone selection
- Auto-populates name, email, and phone from a saved resume profile
- Live A4 draft preview
- Export to PDF or JSON; import a saved profile from JSON

**Backend Integration**
- User accounts with authentication (secure HttpOnly session cookies, 30-day sliding expiry)
- Persistent storage for profiles, resumes, and cover letters via PostgreSQL
- User-specific data isolation between accounts
- Profile sync across devices and browser sessions

## Built with

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Language | TypeScript 5.8 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| PDF export | jsPDF (A4, matching on-screen preview) |
| Runtime | Node.js 20+, npm 10+ |

## How to run it

**Requirements:** Node.js 20+, npm 10+. PostgreSQL is optional.

```bash
git clone https://github.com/axcel-blade/vita-forge.git
cd vita-forge
```

**Environment**

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Do not put backend secrets in `VITE_*` variables.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`.

**Backend**

```bash
cd backend
npm install
npm run dev
```

API at `http://localhost:3001/api` (versioned endpoints under `/api/v1`, e.g. `/api/v1/auth`). Health checks stay unversioned at `/api/health`.

Health probes:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/ready
```

**Database (optional)**

Set `DATABASE_URL` in `backend/.env` (leave blank for the in-memory store), then:

```bash
cd backend
npm run prisma:generate
npm run prisma:deploy
```

**Tests**

```bash
cd backend
npm test
```

**Production build**

```bash
cd frontend && npm run build
cd ../backend && npm run build
```

## Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2). New to the project? [docs/docker.md](docs/docker.md) has a full walkthrough with a cheat sheet — the commands below are the condensed version.

**Start frontend + backend (in-memory API store)**

```bash
docker compose up --build
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:8080 |
| Backend  | http://localhost:3001/api/v1 |
| Health   | http://localhost:3001/api/health |

Stop with `Ctrl+C`, or run detached:

```bash
docker compose up --build -d
docker compose down
```

**Optional Postgres**

Wire the API to Compose Postgres and run migrations on startup:

```bash
docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db up --build -d
```

Default DB URL: `postgresql://vita:vita@postgres:5432/vitaforge` (override with `DATABASE_URL` / `POSTGRES_*`).

**Useful flags**

```bash
# Rebuild images after code changes
docker compose up --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

Image definitions live under `docker/`. Compose files are `docker-compose.yml` and optional `docker-compose.db.yml` at the repo root.

## Where the code lives

```
vita-forge/
├── frontend/          # User interface (Vite + React)
├── backend/           # API and business logic (NestJS)
│   ├── src/
│   ├── database/      # Prisma schema + migrations
│   └── tests/
├── docker/            # Dockerfiles and nginx config
├── docker-compose.yml
├── docs/              # Documentation
├── .github/           # Workflows and templates
├── README.md
└── LICENSE
```

## Contributing and support

- [CONTRIBUTING.md](CONTRIBUTING.md) — Git Flow, commit format, PR checklist
- [backend/CHANGELOG.md](backend/CHANGELOG.md) — backend version history
- [frontend/CHANGELOG.md](frontend/CHANGELOG.md) — frontend version history
- [ROADMAP.md](ROADMAP.md) — planned features
- [SECURITY.md](SECURITY.md) — vulnerability reporting
- [SUPPORT.md](SUPPORT.md) — how to get help

## License

MIT — see [LICENSE](LICENSE) for details.
