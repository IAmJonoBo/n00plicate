# Pull Request Process

This project uses PR gates to reduce regressions. Follow this checklist when opening a PR.

## What to do before opening a PR

- Run locally:
  - `pnpm lint:workspace`
  - `pnpm typecheck`
  - `pnpm -w -r test`
  - If UI changed: `pnpm --filter @n00plicate/design-system run visual-test`
- Ensure tokens comply with prefixes and import rules.
- Update docs when public APIs or tokens change.

## What the CI will run on every PR

- PR Verification (affected lint, typecheck, test, build)
- Module Boundary Enforcement
- Collision Prevention & Quality Gates
- Visual Regression Tests (Loki) for design system changes
- Documentation Validation
- Semantic PR title check
- Automatic PR labels based on changed files

## Branch protection and required checks (manual setup)

In GitHub > Settings > Branches > Branch protection rules for `main`:

- Require a pull request before merging
- Require approvals: 1+ (or more for critical areas)
- Dismiss stale reviews when new commits are pushed
- Require status checks to pass before merging, including:
  - PR Verification
  - Module Boundary Enforcement
  - Visual Regression Tests
  - Documentation Validation
  - Semantic PR Title
- Require conversation resolution before merging
- Restrict who can push to matching branches (disable direct pushes to `main`)

## Merging Strategy

- Prefer "Squash and merge" with a clean, semantic PR title
- Link issues with `Closes #123`
- For breaking changes, provide a migration section in the PR

## Code Ownership

Code reviews are required for paths defined in `.github/CODEOWNERS`. Adjust as the team grows.
