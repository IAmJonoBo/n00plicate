# n00plicate 2.0 Development Guide

Use this guide when working on n00plicate 2.0. For big-picture context check
[`docs/IMPLEMENTATION_PLAN_2.0.md`](docs/IMPLEMENTATION_PLAN_2.0.md) and the documentation hub at
[`docs/README.md`](docs/README.md).

## 1. Workspace Setup

### Dev Container (recommended)

```bash
code --folder-uri vscode-remote://dev-container+$(pwd)/infra/containers/devcontainer
```

The container provisions Node 22.20, pnpm 10.18.2, Rust, Android/iOS toolchains, Playwright, and a local
Penpot stack.

### Local environment

```bash
./setup.sh                # installs Node/pnpm via corepack and bootstrap dependencies
pnpm install              # safe to re-run after dependency changes
pnpm lint:workspace       # runs Biome (format + lint) and typed ESLint to verify the toolchain
```

Ensure `nvm use` loads Node 22.20.0 before running scripts.

## 2. Project Layout (2.0)

```text
apps/            Web, mobile, desktop reference shells + automation runners
packages/        Token orchestrator, UI kernel, adapters, legacy 1.x packages
infra/           Devcontainers, GitHub workflows, provisioning scripts
scripts/         Helper scripts (Node/Bash)
docs/            Living documentation (see docs/README.md)
toolchains/      Shared config for TypeScript, ESLint, Biome, Vitest, Stylelint
```

Legacy folders from 1.x remain until their replacements land; prefer the 2.0 targets when adding code.

## 3. Daily Workflow

| Task                           | Command(s)                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| Sync tokens from Penpot        | `make tokens-sync` (requires `.env` with Penpot credentials)                        |
| Build tokens                   | `pnpm tokens:build` (legacy pipeline)                                               |
| Full workspace build           | `pnpm build` (skips Nx Cloud, tolerates missing Tauri CLI)                          |
| Start Storybook                | `pnpm nx run design-system:storybook`                                               |
| Start full dev stack           | `pnpm dev:full-stack` (watches tokens + Storybook)                                  |
| Run unit tests                 | `pnpm nx run-many -t test`                                                          |
| Run visual + interaction tests | `pnpm nx run design-system:visual-test && pnpm nx run design-system:test-storybook` |
| Lint + typecheck               | `pnpm lint:workspace && pnpm typecheck`                                             |
| Build affected projects        | `pnpm run build:affected`                                                           |
| Generate dependency graph      | `pnpm nx graph --watch`                                                             |

> Fast path: `pnpm lint:base` runs only the Biome formatter/linter (warnings currently tracked in Next_Steps). Use
> `pnpm lint:typed` when you need the slower type-aware ESLint rules without the formatter.
> **Offline builds**: `pnpm build` sets `NX_NO_CLOUD=true` and auto-skips Tauri packaging when the CLI is missing so the
> workspace
> can still produce artifacts in headless environments.

### Platform launchers

```bash
# Web (Qwik)
pnpm --filter apps/web dev

# Mobile (React Native)
pnpm --filter @n00plicate/mobile-rn start

# Desktop (Tauri)
pnpm --filter @n00plicate/desktop tauri dev
```

## 4. Tokens During the Transition

- **Current state**: `packages/design-tokens` still relies on Style Dictionary. New work should keep
  the JSON sources clean and avoid editing generated outputs.
- **Rewriting**: Phase 2 introduces `packages/token-orchestrator`, `tokens-core`, and `tokens-outputs`.
  When adding token features, coordinate with the token squad to ensure the new pipeline requirements
  are captured.
- **Validation**: `pnpm nx run design-tokens:validate` enforces current naming/namespace rules. Update
  the rule set if you introduce new token categories.

## 5. Component & Storybook Development

1. Create or update tokens first.
2. Consume tokens through the adapter (avoid hard-coded CSS values).
3. Add/extend Storybook stories in `packages/design-system/src/**/*.stories.tsx`.
4. Run `pnpm nx run design-system:visual-test` and review diffs.
5. Document component behaviour in MDX or package README.

Storybook 10 migration is tracked in Phase 3—file issues under the `storybook-10` label for blockers.

## 6. Quality Gates Checklist

Before pushing:

- `pnpm lint:workspace`
- `pnpm typecheck`
- `pnpm nx run-many -t test`
- `pnpm nx run design-system:visual-test`
- `pnpm nx run design-system:test-storybook`

CI repeats these checks plus Playwright journeys, package builds, and deployment dry runs.

## 7. Troubleshooting Quick Links

| Symptom                        | Try this                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| Node version mismatch          | `nvm use` then re-run `./setup.sh`                                                       |
| Token drift or collisions      | `pnpm nx run design-tokens:build` and inspect `libs/tokens/*`                            |
| Storybook cache oddities       | `rm -rf packages/design-system/storybook-static* && pnpm nx run design-system:storybook` |
| React Native Metro duplication | Clear Metro cache: `pnpm --filter @n00plicate/mobile-rn start -- --reset-cache`               |
| Dev container not starting     | `docker compose -f infra/containers/devcontainer/docker-compose.yml logs`                |

See [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) for the full catalogue.

## 8. Automation & CI

- GitHub Actions run on pushes and PRs to `main` / `develop`.
- Workflows live under `.github/workflows/`; reusable pieces live in `infra/workflows/`.
- Token sync jobs rely on `.env` secrets (`PENPOT_FILE_ID`, `PENPOT_ACCESS_TOKEN`).
- Use `make docker-dev` to bring up the local Penpot + Ollama stack for end-to-end testing.

## 9. Useful Links

- Architecture plan — [`docs/IMPLEMENTATION_PLAN_2.0.md`](docs/IMPLEMENTATION_PLAN_2.0.md)
- Documentation hub — [`docs/README.md`](docs/README.md)
- Contribution guide — [`CONTRIBUTING.md`](CONTRIBUTING.md)
- CI overview — [`docs/devops/ci-overview.md`](docs/devops/ci-overview.md)
- Storybook — <https://iamjonobo.github.io/n00plicate/storybook/>

Keep this guide up to date as the 2.0 milestones land. If something changed, edit this file in the
same pull request.
