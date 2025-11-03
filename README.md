# n00plicate 2.0 (Preview)

[![CI](https://github.com/IAmJonoBo/n00plicate/workflows/CI/badge.svg)](https://github.com/IAmJonoBo/n00plicate/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nx](https://img.shields.io/badge/built%20with-Nx-21.6-blue)](https://nx.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-22.20.0-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.18.2-orange)](https://pnpm.io/)
[![Storybook](https://img.shields.io/badge/Storybook-9.1.9-ff4785)](https://storybook.js.org/)

> Penpot-first, multi-runtime design systems powered by open tooling. n00plicate 2.0 is an in-progress
> rewrite that introduces a token orchestrator, framework-agnostic UI kernel, and automated quality
> gates spanning web, native, and desktop surfaces.

⚠️ **Status**: The 2.0 architecture is actively under development. Track progress in
[`docs/IMPLEMENTATION_PLAN_2.0.md`](docs/IMPLEMENTATION_PLAN_2.0.md) and use the documentation hub at
[`docs/README.md`](docs/README.md) for the most current references.

## Why n00plicate

- **Penpot as the source of truth** — DTCG-compliant exports flow through a Rust-based orchestrator to
  generate SDKs for every surface.
- **Single UI kernel** — Lit + vanilla-extract primitives drive adapters for React, Vue, Svelte, Solid,
  Compose, SwiftUI, Flutter, and Tauri.
- **Frontier quality gates** — Storybook 10-ready docs, Loki visual diffs, Playwright interaction tests,
  and accessibility checks block regressions before they ship.
- **All open-source** — Built entirely on permissive tooling (Nx, pnpm, Qwik, React Native, Tauri,
  Starlight, Loki, Biome) so teams can operate fully on-premises.

## 2.0 Architecture Snapshot

```mermaid
flowchart LR
  Penpot[(Penpot 2.8)] -->|DTCG export| Orchestrator
  Orchestrator[[Token Orchestrator (Rust/WASM)]] --> Outputs{{Token Outputs}}
  Outputs -->|CSS / TS / JSON / Compose / Swift| Kernel
  Kernel[[UI Kernel (Lit + vanilla-extract)]] --> Adapters[/Framework Adapters/]
  Adapters --> Apps((Applications))
  Apps --> Storybook
  Storybook --> Quality[[Visual + A11y Gates]]
  Apps --> CI[[CI / CD]]
  Quality --> CI
```

- **Token Orchestrator** (Phase 2): Normalises Penpot exports, enforces governance rules, and writes
  multi-language outputs to `packages/tokens-outputs`.
- **UI Kernel** (Phase 3): Platform-neutral primitives with strict accessibility guarantees.
- **Adapters** (Phase 3/4): Thin wrappers for Qwik, React, Vue, Svelte, Solid, Compose, SwiftUI, Flutter,
  and Tauri webviews.
- **Quality Gates** (Phase 6): Storybook interactions, Loki visual diffs, Playwright journeys, and a11y
  scans wired into GitHub Actions.

Refer to [`docs/IMPLEMENTATION_PLAN_2.0.md`](docs/IMPLEMENTATION_PLAN_2.0.md) for timelines and owners.

## Getting Started

### Prerequisites

- Node.js 22.20.0 (run `nvm use` after `./setup.sh`)
- pnpm 10.18.2 (`corepack enable && corepack prepare pnpm@10.18.2 --activate`)
- Rust (toolchains for the token orchestrator and Tauri)
- Docker (Penpot + automation stack)
- Platform SDKs as needed: Android Studio, Xcode, or Tauri dependencies

### Bootstrap the Workspace

```bash
git clone https://github.com/IAmJonoBo/n00plicate.git
cd n00plicate

# One-time setup
./setup.sh

# Start token build + Storybook in watch mode
pnpm dev:full-stack

# Export tokens from Penpot (requires .env)
make tokens-sync

# Run the full quality suite
pnpm nx run-many -t lint,test,visual-test
```

### Frequently Used Commands

| Goal                    | Command                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| Sync tokens from Penpot | `make tokens-sync`                                                 |
| Build everything        | `pnpm build`                                                       |
| Launch Storybook        | `pnpm nx run design-system:storybook`                              |
| Mobile dev server       | `pnpm --filter @n00plicate/mobile-rn start`                             |
| Desktop dev server      | `pnpm --filter @n00plicate/desktop tauri dev`                           |
| Format & lint           | `pnpm lint:workspace` (Biome + typed ESLint) / `pnpm format:check` |
| Visual regression       | `pnpm nx run design-system:visual-test`                            |

## Repository Layout

```text
apps/
  web/          # Qwik City reference app
  mobile/       # React Native reference app
  desktop/      # Tauri reference shell
  docs/         # Starlight docs site (2.0)
  workflows/    # Automation entrypoints (CI runners, token cron)

packages/
  token-orchestrator/  # Rust CLI (Phase 2)
  tokens-core/         # Canonical token schema + history (Phase 2)
  tokens-outputs/      # Generated outputs (gitignored)
  ui-kernel/           # Lit primitives (Phase 3)
  ui-adapters/         # Framework adapters (Phase 3/4)
  platform-bridges/    # Compose / SwiftUI / Flutter bridges (Phase 4)
  design-system/       # Current component library (1.x → 2.0)
  design-tokens/       # Legacy Style Dictionary build (1.x)
  shared-utils/        # Shared TypeScript utilities

infra/
  containers/          # Devcontainer + Penpot stack
  workflows/           # GitHub reusable workflows
  provisioning/        # Terraform / infra-as-code (planned)

docs/                  # Documentation hub (see docs/README.md)
scripts/               # Automation scripts (bash/node)
toolchains/            # Centralised config (tsconfig, eslint, biome, etc.)
```

## Documentation Map

- **Start here** — [`docs/README.md`](docs/README.md)
- **Implementation roadmap** — [`docs/IMPLEMENTATION_PLAN_2.0.md`](docs/IMPLEMENTATION_PLAN_2.0.md)
- **Token system** — [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md)
- **Storybook workflows** — [`docs/platforms/storybook.md`](docs/platforms/storybook.md)
- **CI / DevOps** — [`docs/devops/ci-overview.md`](docs/devops/ci-overview.md)
- **Troubleshooting** — [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)

Legacy n00plicate 1.x documentation is being archived; check the "Legacy / Pending Review" section of
[`docs/README.md`](docs/README.md) if you need something that has not yet been migrated.

## Engineering Metrics & Observability

- Target SLOs: full build ≤ 5 minutes, token drift MTTR ≤ 24 hours, Storybook visual escape rate < 2 %,
  documentation freshness updates each sprint.
- Structured logging (pino/tracing in TypeScript, tracing in Rust) and OpenTelemetry spans across the
  orchestrator, Storybook pipelines, and reference apps feed Grafana/Loki dashboards.
- Flake tracking and error budgets managed via Nx analytics; CI auto-quarantines flaky tests and opens
  follow-up issues.
- Security scanning (Scorecard, Trivy, Cargo Audit, dependency review) runs as part of the release
  gates.

## AI & Developer Intelligence

- `n00plicate assist` CLI offers local Ollama workflows with optional OpenAI and GitHub Copilot integration for
  accessibility in connected environments.
- CI posts AI-generated summaries for token diffs, visual regressions, and failing pipelines to speed up
  triage.
- Storybook gains an intelligence addon (token inspector, contrast checks, design checklist) with
  AI-suggested remediation.
- `just` commands and CLI wizards (`n00plicate init feature`, `n00plicate token create`) provide guided flows with
  inline AI help.

## Contributing

We welcome feedback and contributions while 2.0 takes shape:

1. Review [`CONTRIBUTING.md`](CONTRIBUTING.md) and adopt the coding standards.
2. Look for `n00plicate-2.0` issues in GitHub Projects → "n00plicate 2.0 Delivery".
3. Keep pull requests focused, with docs and tests covering new behaviour.
4. Mention which phase (from the implementation plan) your work targets.

Automated checks enforce formatting (Biome), linting (ESLint), type safety, Vitest suites, Storybook
interaction tests, and Loki visual baselines. Run `pnpm nx run-many -t lint,test,visual-test` before
requesting review.

## Community & Support

- **Issues** — [github.com/IAmJonoBo/n00plicate/issues](https://github.com/IAmJonoBo/n00plicate/issues)
- **Discussions** — [github.com/IAmJonoBo/n00plicate/discussions](https://github.com/IAmJonoBo/n00plicate/discussions)
- **Storybook (public)** — <https://iamjonobo.github.io/n00plicate/storybook/>
- **Dependency automation plan** — [`docs/DEPENDENCY_AUTOMATION_PLAN.md`](docs/DEPENDENCY_AUTOMATION_PLAN.md)

## License

n00plicate is released under the [MIT License](LICENSE). Penpot assets, Compose bindings, and other
downstream artefacts retain their upstream licences as noted in the respective directories.

---

Built with ❤️ using 100% open-source tooling: Penpot · Nx · pnpm · TypeScript · Qwik · React Native ·
Tauri · Storybook · Vitest · Loki · Biome
