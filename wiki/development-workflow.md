# Development Workflow

This guide covers the development workflow for Vita Forge contributors.

---

## Branch Structure

```
main (Production)          develop (Integration)
      ↑                          ↓
      |--------------------------|
      |   release/*              |
      |   hotfix/*               |
      └── feature/* branches     │
                                 ↓
                        [merge to main via PR]
```

---

## Branch Naming Convention

| Type | Pattern | Source Branch | Purpose |
|------|---------|---------------|----------|
| Main Development | `main` | - | Production-ready code |
| Integration | `develop` | - | Next release integration |
| New Features | `feature/<short-desc>` | `develop` | New features only |
| Release Prep | `release/<version>` | `develop` | Pre-release preparation |
| Hotfixes | `hotfix/<version>-<issue>` | `main` | Critical production fixes |

---

## Workflow Steps

### 1. Create Branch

```bash
# Switch to develop branch
git checkout develop

# Create feature branch
git checkout -b feature/<short-description>
```

**Examples:**
- `feature:dark-mode-accent-picker`
- `fix:cover-letter-pdf-export-failure`
- `docs:update-api-guide-v0.6`

### 2. Make Changes

- Follow existing code patterns
- Update documentation as you code
- Write tests for new features
- Keep commits small and focused

### 3. Commit

Use conventional commit format:

```bash
git commit -m "feat: add dark mode accent picker to resume editor"
```

**Commit Rules:**
- Use imperative mood ("add", not "added")
- Keep summary under 72 characters
- Don't include AI/bot attribution
- Update relevant markdown files

### 4. Pull Request

1. Push your branch: `git push origin feature:<branch-name>`
2. Open PR to `develop` branch
3. Complete PR checklist:
   - ✅ `npm run build` passes
   - ✅ No new runtime libraries
   - ✅ Markdown files updated
   - ✅ Branch targets `develop`
   - ✅ Clear commit messages

### 5. Review & Merge

- Address reviewer feedback
- Update CHANGELOG if needed
- Merge to `develop` after approval
- Release manager merges to `main` when ready

---

## Git Commands Reference

```bash
# Setup
git clone https://github.com/axcel-blade/vita-forge.git
cd vita-forge
git checkout develop
npm install

# Daily workflow
git fetch origin
git checkout -b feature/new-feature
npm run dev
git add src/
git commit -m "feat: add new feature"
git push -u origin feature/new-feature

# Before committing
npm run build          # Verify no build errors
npm test              # Run tests

# Sync with latest changes
git checkout develop
git pull origin develop
git checkout <your-branch>
git rebase develop

# Fixing issues
git add -A            # Stage all files
git reset --soft HEAD~1  # Unstage commits (keep them)
```

---

## Code Quality Checklist

Before opening a PR:

- [ ] Run `npm run build` - No errors
- [ ] Run `npm test` - All tests pass
- [ ] Check TypeScript compilation
- [ ] Update documentation
- [ ] Review CHANGELOG entry
- [ ] Verify no new dependencies in `package.json`
- [ ] Follow code style (indentation, naming)

---

## Documentation Requirements

Always update these files when making changes:

| File | When to Update |
|------|----------------|
| `README.md` | Public-facing changes |
| `backend/CHANGELOG.md` / `frontend/CHANGELOG.md` | Version-specific changes (log in whichever side changed) |
| API docs | Endpoint changes |
| Component docs | UI/component changes |

---

## Common Workflows

### Feature Development

```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-feature-name

# Develop your feature
npm run dev

# Test and commit
npm test
npm run build
git add .
git commit -m "feat: implement new feature"
git push
```

### Bug Fixes

```bash
git checkout develop
git pull origin develop
git checkout -b hotfix/issue-description

# Fix the bug
npm test
npm run build
git add .
git commit -m "fix: resolve issue description"
git push
```

### Hotfixes (Critical Production Issues)

```bash
git checkout main
git pull origin main
git checkout -b hotfix/0.6.2-security-fix

# Fix critical issue
npm test
npm run build
git add .
git commit -m "hotfix: security patch for XSS vulnerability"
git push

# PR should go to main (not develop) for hotfixes
```

---

## CI/CD Overview

Our GitHub Actions automatically:

1. **On every push to feature branches:**
   - Run linting (`npm run lint`)
   - Run tests (`npm test`)
   - Build production bundle (`npm run build`)

2. **On PR to `develop`:**
   - Trigger full CI pipeline
   - Create deployment artifacts if successful

3. **On merge to `main`:**
   - Deploy to staging environment
   - Bump version for release

---

## Pre-Commit Hooks

Run these locally before committing:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Check for unused dependencies
npm outdated

# Verify TypeScript types
npm run type-check
```

---

## Code Review Guidelines

### What to Expect in PR Reviews:

1. **Functionality checks:**
   - Does it work as intended?
   - Are edge cases handled?

2. **Code quality:**
   - Follows existing patterns?
   - Clean and readable?
   - Properly documented?

3. **Testing:**
   - Tests included?
   - Test coverage adequate?

4. **Documentation:**
   - Updated relevant docs?
   - README changes accurate?

5. **Dependencies:**
   - No new runtime libraries?
   - Version updates justified?

---

**Last Updated:** September 2026  
**Version:** 0.8.0