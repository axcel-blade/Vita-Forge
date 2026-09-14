# Getting Started with Vita Forge

Welcome to **Vita Forge**, a career-tools platform for building professional resumes and cover letters.

## Quick Start

### Prerequisites

- [Git](https://git-scm.com/) (v2.0+)
- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://www.npmjs.com/) (v10 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (optional — omit `DATABASE_URL` to use the in-memory store)

### Installation

```bash
git clone https://github.com/axcel-blade/vita-forge.git
cd vita-forge

cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

cd frontend
npm install
npm run dev
```

In a second terminal:

```bash
cd backend
npm install
npm run dev
```

UI: `http://localhost:5173`  
API: `http://localhost:3001/api/v1`

## Project Structure

```
vita-forge/
├── frontend/           # React + Vite UI
│   └── src/
│       ├── features/   # auth, website, resume-builder, cover-letter
│       ├── services/   # REST clients
│       ├── components/
│       └── layouts/
├── backend/            # NestJS API
│   ├── src/            # auth, users, ai, health, collab, templates, repositories
│   ├── database/       # Prisma schema + migrations
│   └── tests/
├── docker/             # Dockerfiles + nginx
├── docker-compose.yml
├── docs/
└── wiki/
```

## Features Overview

### Resume Builder

- Edit profile, experience, education, skills, projects, and more
- Live A4 preview and PDF/JSON export
- Signed-in users sync to the backend, with restore points

### Cover Letter Writer

- Guided form, live preview, PDF/JSON export
- Signed-in sessions sync cover letter data with the same profile API

### Backend

- JWT register / login / refresh
- Profile JSON stored per user (Prisma when `DATABASE_URL` is set)
- Collaboration rooms and template catalog endpoints
- Health probes at `/api/health`, `/live`, and `/ready`

## Development Workflow

```bash
cd frontend && npm run dev
cd backend && npm run dev
cd backend && npm test
cd frontend && npm run build
```

## Docker

From the repo root:

```bash
docker compose up --build
```

- UI: http://localhost:8080  
- API: http://localhost:3001/api/v1  

Optional Postgres: `docker compose -f docker-compose.yml -f docker-compose.db.yml --profile db up --build -d`. See the root [README.md](../README.md#docker) for details.

## Configuration

Use `frontend/.env` for `VITE_*` values and `backend/.env` for `PORT`, `JWT_SECRET`, `DATABASE_URL`, and `ANTHROPIC_API_KEY`. Never put server secrets in frontend env files.

## First Steps

1. Copy both `.env.example` files
2. Install frontend and backend dependencies
3. Start both servers
4. Register an account and edit a resume

## Getting Help

- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [CHANGELOG.md](../CHANGELOG.md)
- [SUPPORT.md](../SUPPORT.md)
- [ROADMAP.md](../ROADMAP.md)

## License

MIT — see [LICENSE](../LICENSE).

---

**Last Updated**: September 2026  
**Version**: 0.8.0
