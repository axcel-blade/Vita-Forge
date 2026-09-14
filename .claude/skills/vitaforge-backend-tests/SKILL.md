---
name: vitaforge-backend-tests
description: Runs and updates NestJS Jest tests under backend/. Use when adding backend features, fixing API/auth/AI code, or when the user asks to test the backend.
---

# VitaForge backend tests

Starting new backend work? Use `vitaforge-feature-branch` first if you're still on `develop`/`main`.

## Run

From `backend/`:

```bash
npm test
```

Coverage: `npm run test:coverage`.

## Conventions

- Specs live in `backend/tests/unit/` and `backend/tests/integration/` and match `*.spec.ts`.
- Prefer constructing services/controllers with mocks over `@nestjs/testing` unless those packages are installed.
- Jest maps `@nestjs/common`, `bcrypt`, `jsonwebtoken`, and `cors` to `backend/tests/stubs/` until those deps are fully installed.
- After changing auth or AI contracts, update the matching spec in the same change.

## Do not

- Commit `.env` files.
- Leave `temp*.txt` or `.tmp` files after the task.
