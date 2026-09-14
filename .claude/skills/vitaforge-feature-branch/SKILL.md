---
name: vitaforge-feature-branch
description: Creates VitaForge Git Flow feature branches from develop. Use when starting a feature, naming a branch, or when the user mentions Git Flow, and proactively before writing any new code (new feature, endpoint, component, or fix) if the current branch is develop or main.
---

# Feature branches

Before coding something new, check the current branch first (`git status` / `git branch --show-current`). If it is `develop` or `main`, create the appropriate branch before making any edits:

```bash
git checkout -b feature/<short-desc> develop
```

| Type | Pattern | Source |
|------|---------|--------|
| Feature | `feature/<short-desc>` | `develop` |
| Release | `release/<version>` | `develop` |
| Hotfix | `hotfix/<version>-<issue>` | `main` |

Do not commit or push unless the user asks. Merge to `main` through a PR.

Bug fixes and other backend/frontend work should also branch off `develop` (as `feature/<short-desc>`) rather than being committed directly on `develop` or `main`.
