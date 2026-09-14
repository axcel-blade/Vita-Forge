# VitaForge frontend

React + Vite UI for the marketing site, resume builder, cover letter writer, and auth screens.

## Layout

```text
src/
├── components/     # Shared UI (editors, templates, preview)
├── features/       # Auth, website, resume-builder, cover-letter
├── layouts/        # App chrome
├── services/       # REST API clients and auth session
├── utils/
├── types/
├── constants/
├── assets/
├── routes/
└── main.jsx
```

The frontend talks to the Nest API only. It never connects to the database.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

`http://localhost:5173` — API base defaults to `http://localhost:3001/api/v1`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production bundle |
| `npm run preview` | Serve the production build |
