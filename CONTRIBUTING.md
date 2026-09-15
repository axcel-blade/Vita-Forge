# Contributing to Vita Forge

Thank you for your interest in contributing. Please read this guide before opening issues or submitting pull requests.

---

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By contributing, you agree to uphold it.

---

## Project Rules

Before contributing, review [CLAUDE.md](CLAUDE.md) for the non-negotiable project rules:

- Do not use open-source runtime libraries. Use native browser APIs.
- Frontend and backend must work together — do not break the integration.
- Always update relevant markdown files alongside any code change.
- Do not add co-contributor AI or bot attribution to commits.

---

## Git Flow

This project uses Git Flow. All contributions must follow the branch model defined in [CLAUDE.md](CLAUDE.md).

| Branch | Purpose |
|---|---|
| `main` | Production-ready code only |
| `develop` | Integration branch for the next release |
| `feature/*` | New features, branched from `develop` |
| `release/*` | Release preparation, branched from `develop` |
| `hotfix/*` | Critical production fixes, branched from `main` |

### Steps

1. Fork the repository.
2. Create a `feature/<short-description>` branch from `develop`.
3. Make your changes and commit with a clear message (see below).
4. Open a pull request targeting `develop`.

---

## Commit Messages

Use the conventional commit format:

```
<type>: <short summary>

<optional body>
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

**Examples:**

```
feat: add dark-mode accent picker to resume editor
fix: prevent cover letter PDF export from silently failing
docs: update CHANGELOG for v0.8.0
```

Rules:
- Use the imperative mood ("add", not "added")
- Keep the summary under 72 characters
- Do not include AI/bot co-author attribution

---

## Development Setup

```bash
git clone https://github.com/axcel-blade/vita-forge.git
cd vita-forge
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cd frontend && npm install && npm run dev
# in another terminal
cd backend && npm install && npm run dev
```

Requires Node.js 20+ and npm 10+. PostgreSQL is optional.

---

## Pull Request Checklist

Before submitting a PR, confirm the following:

- [ ] `npm run build` passes without errors
- [ ] Relevant markdown files (`README.md`, `backend/CHANGELOG.md` and/or `frontend/CHANGELOG.md`) are updated
- [ ] No new runtime libraries added to `dependencies`
- [ ] Branch targets `develop`, not `main`
- [ ] Commit messages follow the format above

---

## Reporting Issues

Use the GitHub issue templates:

- **Bug:** [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature:** [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
