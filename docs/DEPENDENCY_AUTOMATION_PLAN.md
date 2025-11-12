# Dependency Automation & Autoremediation Plan

## Renovate Configuration

- **Baseline**: `renovate.json` extends the recommended preset, enforces semantic chore commits, and groups runtime and dev
  updates.
- **Runtime coverage**: Managers enabled for npm, GitHub Actions, Docker, devcontainers, and Cargo to ensure all delivery
  environments stay in sync.
- **Post-upgrade verification**: Each Renovate branch now runs `pnpm install` followed by `pnpm run upgrade:verify`, executing
  build, test, and lint suites with Nx Cloud disabled so offline environments remain stable.
- **Concurrency guardrails**: `prHourlyLimit` (2) and `prConcurrentLimit` (8) prevent Renovate from overwhelming reviewers
  while still keeping dependencies fresh.

## Local & AI-friendly Tooling

- Added typed CLI tasks (`deps:plan`, `deps:verify`, `build`, `affected`) to `tools/dev-runner.js` with alias support,
  simplifying automation for humans and agents.
- Updated `package.json` scripts used to inject `NX_NO_CLOUD=true` and exclude the recursive `workspace-format` project.
- `NX_NO_CLOUD=true` is a legacy Nx variable; the repository now uses pnpm store caching and workspace filters
  to achieve reproducible offline builds and avoid recursion.
- `pnpm build` now skips the Tauri packaging step when the CLI is unavailable, avoiding false negatives during continuous
  verification.

## Autoremediation Workflow

1. **Plan**: Run `pnpm run upgrade:plan` (or `dev-runner deps:plan`) to generate Nx migrations for major upgrades.
2. **Apply**: Let Renovate or humans update dependencies. Post-upgrade hooks automatically execute `pnpm run
upgrade:verify` to build, lint, and test the workspace under the new toolchain.
3. **Observe**: Failures are surfaced in Renovate PRs and in local runs; `Next_Steps.md` tracks outstanding remediation
   items for visibility.
4. **Stabilise**: Successful verifications keep the lockfile and workspace in a releasable state, enabling automated
   merges for minor and patch updates.

> 📌 **Note**: Nx Cloud and related script-level `NX_NO_CLOUD` usage are legacy. Automation now uses pnpm store cache and
> workspace filters to maintain offline reproducibility in air-gapped or proxied environments.
