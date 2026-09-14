---
name: vitaforge-cleanup
description: Removes VitaForge scratch files after agent work. Use when finishing a task, cleaning the repo, or when temp.txt / temp*.md files appear.
---

# VitaForge cleanup

Delete when the task is done:

- `*.tmp`
- `temp*.txt`, `temp*.md`
- numbered scratch files
- empty accidental filenames

Keep: `.env.example`, `backend/`, `docs/`, `frontend/src/**`, `frontend/.env`, `TODO.md`.

Do not commit real `.env` files. Source of truth: `CLAUDE.md`.
