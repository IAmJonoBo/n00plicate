# Start Here: n00plicate

n00plicate is the multi-runtime design system and token orchestrator. Use it to transform Penpot exports into production UI packages across platforms.

## If you only have 5 minutes

- Read [`docs/README.md`](../docs/README.md) for the documentation hub.
- Check [`docs/IMPLEMENTATION_PLAN_2.0.md`](../docs/IMPLEMENTATION_PLAN_2.0.md) to understand the current milestone.
- Confirm Node/pnpm versions from the badges in [`README.md`](../README.md) before running commands.

## Quick start (humans)

```bash
cd n00plicate
corepack enable
corepack prepare pnpm@10.18.2 --activate
pnpm install

# bootstrap dev environment
./setup.sh

# run Storybook and token pipelines
pnpm dev:full-stack
```

## Agent hooks

- Automation relies on pnpm scripts (`tokens:sync`, `lint:workspace`, `nx run-many`) — expose new flows by wiring them into `make` or dedicated scripts in `scripts/`.
- Downstream adapters read manifests written under `packages/token-orchestrator/` and `packages/tokens-outputs/`; keep generated artefacts ignored as documented.
- Additions to the Penpot integration must update `docs/DESIGN_TOKENS.md` and the orchestration Rust crates simultaneously.

## Key directories

| Path | Purpose |
| --- | --- |
| `apps/` | Reference applications (web, mobile, desktop, docs, workflows). |
| `packages/` | Token orchestrator, UI kernel, adapters, shared utilities. |
| `docs/` | Documentation hub for the new architecture. |
| `scripts/` | Automation helpers (token sync, lint, release prep). |
| `toolchains/` | Central configuration shared across packages. |

## Contribution guardrails

- Keep generated token outputs in `packages/tokens-outputs/` (gitignored) — commit only the orchestrator source.
- Run `pnpm -w -r lint && pnpm -w -r test && pnpm -w -r visual-test` before merging to satisfy quality gates.
- Coordinate dependency or toolchain bumps with `n00-cortex` to avoid manifest drift.
