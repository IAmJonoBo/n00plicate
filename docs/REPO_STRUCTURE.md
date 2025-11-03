# n00plicate 2.0 Repository Structure

This document captures the target directory layout for n00plicate 2.0. Use it as the source of truth when
migrating 1.x assets, scaffolding new packages, or evaluating placement for future workstreams. Paths
marked _(planned)_ will be created as their corresponding sprint delivers.

``text
n00plicate/
├── .github/
│ ├── workflows/ # CI/CD pipelines, lint/test gates, release automation
│ └── reusable/ # (planned) shared workflow snippets for token sync, Storybook QA
├── .husky/ # Git hooks (lint, format, visual diff checks)
├── .vscode/ # Editor recommendations, dev-container entrypoints
├── apps/
│ ├── web/ # Qwik City reference app (Phase 4)
│ │ ├── public/
│ │ ├── src/
│ │ │ ├── routes/
│ │ │ ├── components/
│ │ │ └── telemetry/ # OpenTelemetry helpers for web app
│ │ ├── tests/
│ │ └── README.md
│ ├── mobile/ # React Native + Expo workspace (Phase 4)
│ │ ├── android/
│ │ ├── ios/
│ │ ├── src/
│ │ │ ├── app/
│ │ │ ├── components/
│ │ │ └── telemetry/
│ │ ├── tests/
│ │ └── README.md
│ ├── desktop/ # Tauri shell (Phase 4)
│ │ ├── src/
│ │ ├── src-tauri/
│ │ └── README.md
│ ├── docs/ # Starlight docs site (Phase 5)
│ │ ├── content/
│ │ ├── public/
│ │ └── astro.config.mjs
│ ├── workflows/ # Automation runners (Phase 3)
│ │ ├── token-sync/ # Rust/Node combo for scheduled Penpot exports
│ │ ├── storybook-ci/ # Runs Loki, a11y, interaction suites
│ │ └── README.md
│ └── examples/ # Example integrations (Astro, Remix, Next) (Phase 4)
│ ├── astro-design-system/
│ ├── next-design-system/
│ └── remix-design-system/
├── packages/
│ ├── token-orchestrator/ # Rust CLI + wasm bindings (Phase 2)
│ │ ├── src/
│ │ ├── benches/
│ │ ├── wasm/
│ │ ├── tests/
│ │ └── Cargo.toml
│ ├── tokens-core/ # Canonical schema & history snapshots (Phase 2)
│ │ ├── history/
│ │ ├── schemas/
│ │ └── src/
│ ├── tokens-outputs/ # Generated SDKs (gitignored) (Phase 3)
│ │ ├── css/
│ │ ├── ts/
│ │ ├── compose/
│ │ ├── swift/
│ │ ├── kotlin/
│ │ └── flutter/
│ ├── ui-kernel/ # Lit + vanilla-extract primitives (Phase 3)
│ │ ├── src/
│ │ │ ├── primitives/
│ │ │ ├── patterns/
│ │ │ └── themes/
│ │ ├── tests/
│ │ └── README.md
│ ├── ui-adapters/ # Framework adapters (Phase 3)
│ │ ├── react/
│ │ ├── vue/
│ │ ├── svelte/
│ │ └── solid/
│ ├── platform-bridges/ # Native bridges (Phase 3/4)
│ │ ├── compose/
│ │ ├── swiftui/
│ │ └── flutter/
│ ├── design-system/ # Legacy components transitioning to UI kernel
│ │ ├── src/
│ │ ├── .storybook/
│ │ ├── stories/
│ │ └── tests/
│ ├── design-tokens/ # Legacy Style Dictionary pipeline
│ │ ├── src/
│ │ ├── tokens/
│ │ └── style-dictionary.config.js
│ └── shared-utils/ # Cross-cutting TypeScript utilities
│ ├── src/
│ └── tests/
├── infra/
│ ├── containers/
│ │ └── devcontainer/
│ │ ├── Dockerfile
│ │ ├── devcontainer.json
│ │ └── docker-compose.yml # Defines penpot-export, Penpot stack, Ollama
│ ├── workflows/ # (planned) reusable GitHub workflow fragments
│ ├── observability/ # (planned) Grafana dashboards, Loki configs, OTEL collectors
│ └── provisioning/ # (planned) Terraform/Ansible scripts for remote runners
├── scripts/
│ ├── justfile/ # (planned) convenience commands
│ ├── n00plicate-assist.js # (planned) AI orchestration entrypoint
│ ├── release-tools/
│ │ └── generate-notes.ts
│ └── token-helpers/
│ └── compare-snapshots.ts
├── toolchains/
│ ├── README.md
│ ├── biome.json
│ ├── eslint.base.js
│ ├── eslint.typed.js
│ ├── stylelint.config.cjs
│ ├── tsconfig.base.json
│ └── vitest.config.ts
├── docs/ # Markdown/diagrams (mirrors content served via apps/docs)
│ ├── IMPLEMENTATION_PLAN_2.0.md
│ ├── SPRINT_PLAN.md
│ ├── DESIGN_TOKENS.md
│ ├── ...
│ └── assets/
├── tools/
│ └── penpot-export/ # Workspace mount for penpot-export container
│ └── README.md
├── reports/ # (planned) generated graphs, metrics snapshots
└── tmp/ # Nx cache, build artifacts (gitignored)

## Notes

- **Telemetry & Observability**: Metrics dashboards, OTEL collector configs, and alert definitions will
  live in `infra/observability/`. Add Grafana/Loki provisioning scripts there during Phase 2/3.
- **AI Integrations**: CLI assistants, prompt templates, and Copilot/OpenAI helpers belong in
  `scripts/` (shared logic) and `apps/workflows/` (CI usage). Document usage in `docs/AI_GUIDE.md`
  (planned).
- **Legacy Assets**: Existing 1.x packages (`design-system`, `design-tokens`) remain until their 2.0
  replacements land. Keep legacy source contained to avoid confusion.
- **Examples & Migration**: The `apps/examples/` directory will host integration blueprints and should
  include READMEs explaining setup, telemetry, and AI-powered scripts.
- **Compliance Templates**: When generated (Phase 5/6), place SOC2/WCAG checklists under `docs/compliance/`.

Keep this tree updated as new directories are introduced or retired during the 2.0 rollout.
