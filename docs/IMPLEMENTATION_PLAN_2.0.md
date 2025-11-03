# n00plicate 2.0 – Implementation Plan

> Living roadmap for reimagining n00plicate into a Penpot-first, multi-runtime design system
> platform.
> Update status checkboxes (`[ ]` → `[x]`) and owners as milestones complete.

## Guiding Principles

- **Single Source of Truth**: Penpot 2.8 exports drive every downstream artifact. No manual token edits.
- **Composable Architecture**: Shared `ui-kernel` primitives power adapters across web, mobile, desktop, and embedded surfaces.
- **Deterministic Automation**: Every pipeline step (token sync, builds, tests, docs) is
  reproducible via CLI, CI, or GitHub Actions.
- **Accessible by Default**: A11y checks block merges across Storybook, Playwright, and native snapshots.
- **All-FOSS Stack**: Node, Rust, Qwik, React Native, Tauri, Starlight, Nx, Loki—no proprietary lock-in.

## Vision Statement

Deliver n00plicate 2.0 as an opinionated FOSS design-to-code platform where:

- Penpot is the canonical source for tokens and UI intent.
- An automated token pipeline produces SDKs for every runtime.
- Storybook acts as the shared source of UI truth across web, mobile, and desktop.
- Composable architecture, low cognitive load, deterministic automation, and world-class DX are
  non-negotiable.

## Architecture Blueprint

### Experience Layer

- **Web**: Qwik City 2 (server components, hydration-free UX).
- **Native**: React Native 0.81 with Expo Router + Compose Multiplatform 1.8 (Android/iOS/Desktop/Wasm).
- **Desktop**: Tauri 2.8 with Lit-powered Web Components.

### Design System Kernel

- `packages/ui-kernel`: Lit + vanilla-extract primitives.
- `packages/ui-adapters`: React, Vue, Svelte, Solid wrappers consuming the shared kernel.
- `packages/platform-bridges`: Compose, SwiftUI, Flutter adapters.

### Token Engine

- `packages/token-orchestrator`: Rust CLI (also compiled to wasm) ingesting Penpot DTCG exports,
  normalising metadata, enforcing contracts, and emitting outputs (CSS, TS, JSON Schema, Compose,
  Swift, Kotlin, Dart).
- `packages/tokens-core`: Canonical schema + historical snapshots.
- `packages/tokens-outputs`: Generated SDKs (gitignored).

### Automation Layer

- `apps/workflows/token-sync`: Scheduled exports, drift detection, approval gating.
- `apps/workflows/storybook-ci`: Multithreaded Storybook builds, Loki visual diffs, a11y/interaction tests.
- Observability: OpenTelemetry traces from Storybook + token consumers feeding Grafana/Loki.

### Knowledge Layer

- Starlight (Astro) docs with MDX diagrams, embedded Storybook stories, auto-generated API tables.

### Repository Organisation

```text
n00plicate/
├── apps/
│   ├── web/                     # Qwik City app
│   ├── mobile/                  # React Native + Expo
│   ├── desktop/                 # Tauri shell
│   ├── docs/                    # Starlight documentation site
│   └── workflows/               # Automation runners (token sync, CI entrypoints)
├── packages/
│   ├── token-orchestrator/      # Rust CLI (wasm + native)
│   ├── tokens-core/             # Canonical token schema + validators
│   ├── tokens-outputs/          # Generated outputs (gitignored)
│   ├── ui-kernel/               # Lit primitives + vanilla-extract themes
│   ├── ui-adapters/             # React, Vue, Svelte, Solid wrappers
│   ├── platform-bridges/        # Compose, SwiftUI, Flutter adapters
│   └── shared-utils/            # Cross-cutting TS utilities
├── infra/
│   ├── containers/devcontainer/ # Devcontainer + Penpot/Tauri services
│   ├── workflows/               # GitHub Actions reusable workflows
│   └── provisioning/            # Terraform for remote caches/artifacts
├── scripts/                     # Just recipes + TypeScript automation
├── docs/                        # Source markdown/diagrams (mirrors apps/docs)
└── toolchains/                  # tsconfig plus ESLint (base + typed) and Biome/Stylelint presets
```

## Tooling & DX Enhancements

- pnpm 10 + corepack with a `just` command catalogue (build, sync, snapshot, release, doctor).
- Nx 22 incremental graph with Nx Cloud OSS runner, TypeScript project references, `tsup` for UI
  adapters, and `rsbuild` for Rust CLI bundling.
- DevContainer provisioning Node 22 LTS, Rust, Android/iOS SDKs, Playwright, Penpot 2.8, and both
  OpenAI + GitHub Copilot CLI tooling for AI accessibility.
- Local + remote AI assistant stack: `n00plicate assist` (Ollama) with fallbacks to OpenAI/Copilot for
  orchestration, scaffolding, and documentation queries.
- Storybook 10 readiness plan with 8.6 compatibility branch until addon parity, including custom
  addons for token inspection and accessibility.
- Husky pre-commit pipeline: Biome format/lint fast path, typed ESLint overlay, Stylelint,
  Markdownlint, targeted Vitest via `turbo run lint --filter` to keep hooks fast.
- CODEOWNERS per domain (tokens, kernel, adapters, workflows) and PR templates linking to success
  metrics.

## Foundational Dependencies

| Phase window | Dependency                                                                                             | Purpose                                                                                              | Runtime / licensing notes                                                                                                                       | CI coverage / follow-up                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phases 0–6   | Node 22.20.0 + pnpm 10.18.2                                                                            | Primary execution environment for Nx targets, Storybook builds, and script automation.               | MIT-licensed toolchain. Works offline once tarballs are cached; DevContainer pins versions via `setup.sh`.                                      | `.github/workflows/ci.yml`, `visual-tests.yml`, and `pr-verification.yml` install pinned Node/pnpm via `actions/setup-node` + `pnpm/action-setup`.                |
| Phases 1–6   | Nx 21.6 plugin stack (`@nx/{js,react,storybook,vite,plugin}`)                                          | Provides project graph, lint/test orchestration, Storybook build integration, and custom generators. | OSS licenses (MIT). Requires Node environment; offline usage supported via pnpm store.                                                          | Installed through workspace `pnpm install`. Ensure cache seeds via existing CI install steps.                                                                     |
| Phases 2–6   | Rust toolchain (stable 1.80+, `wasm32-unknown-unknown`, `cargo-generate`)                              | Builds the token orchestrator CLI, wasm bindings, and future Tauri shell automation.                 | Apache-2.0 / MIT dual license. Offline builds require pre-fetching `rustup` components.                                                         | **Follow-up:** add rustup provisioning to token orchestrator GitHub Actions (`token-sync.yml`/`token-export.yml`). Track in `Next_Steps.md`.                      |
| Phases 2–6   | Storybook 9.1 + Loki + Playwright runners                                                              | Document kernel/adapters and power visual/a11y regression gates.                                     | OSS license. Requires Node; offline builds rely on cached npm packages and Chromatic alternatives.                                              | `visual-tests.yml` builds Storybook and runs Loki; ensure Chromatic optional path documented in Sprint 6.                                                         |
| Phases 0–6   | AI CLIs: Ollama >=0.5 (`ollama run`), OpenAI CLI (`openai`), GitHub Copilot CLI (`github-copilot-cli`) | Powers `n00plicate assist` and AI-augmented `just` flows for scaffolding, Q&A, and review triage.         | Ollama: AGPLv3, runs fully offline with local models. OpenAI/Copilot: proprietary APIs—requires network + billing; provide opt-in legal review. | Devcontainers install Ollama by default; remote runners skip AI setup. **Follow-up:** evaluate self-hosted runners for AI optionality (track in `Next_Steps.md`). |

### CLI Deliverables & AI Runtime Expectations

| CLI deliverable                                                        | Runtime dependency                                                                    | AI / network requirements                                                                                | Licensing & offline posture                                                                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `n00plicate assist`                                                         | Node 22 CLI wrapper invoking Ollama (default) with optional OpenAI/Copilot fallbacks. | Offline with local Ollama models; optional remote API keys enable GPT/Copilot flows.                     | Wrapper MIT-licensed. Ollama AGPLv3—ensure redistribution compliance. Document opt-in for proprietary APIs.      |
| `n00plicate init feature`, `n00plicate token create` wizards                     | Node 22 + Nx generators + Rust orchestrator bindings (Phase 2+).                      | AI prompts piggyback on `n00plicate assist`; runs offline when Ollama available.                              | Scripts MIT; respects same Ollama/OpenAI licensing constraints.                                                  |
| `just` catalogue (`just lint-all`, `just ai-review`, `just penpot-up`) | Requires system `just` binary, pnpm workspace, Docker (for Penpot)                    | AI-enhanced recipes call `n00plicate assist`; offline usage supported when Ollama + Docker images pre-pulled. | `just` is MIT; Docker images for Penpot are AGPL-compatible. Provide legal review for enterprise redistribution. |

## Engineering Metrics & Observability Pillars

- Define SLO-driven quality gates (build time, token drift MTTR, Storybook visual escape rate,
  flaky test budget) and wire alerts via Grafana/Loki dashboards.
- Standardise structured logging across CLI, orchestrator, and runtime adapters (pino/tracing in TS,
  tracing in Rust) with correlation IDs.
- Capture OpenTelemetry traces for token orchestration, Storybook builds, and application boot flows;
  surface dashboards for pipeline latency, failure hot spots, and usage analytics.
- Adopt central error-handling primitives (Result/Option in Rust, discriminated unions in TS) with
  human-readable remediation guidance.
- Track developer productivity metrics (affected task time, command success rates) via anonymous
  instrumentation manageable in air-gapped environments.

## Design Token Pipeline Overview

1. Penpot 2.8 plugin exports DTCG + metadata (roles, intent).
2. `token-orchestrator` normalises values, runs rule packs (naming, contrast, semantics), and records
   snapshots in `packages/tokens-core/history`.
3. Generated outputs (CSS, JSON, TS, Kotlin, Swift, Compose, Flutter) stored in `packages/tokens-outputs`
   (gitignored).
4. Storybook addons auto-import tokens for theming controls, docs tables, and live variant toggles.
5. Drift detection workflow compares Penpot vs. repo baseline and raises annotated PRs for approval.

## Component & UX Strategy

- UI kernel hierarchy: tokens → primitives → accessible patterns → composite widgets.
- Accessibility enforced via Axe + Storybook test runner; failures block merges.
- Deliver theme packs (light/dark/high contrast) and embed Penpot previews in Storybook docs.
- Capture interaction recipes (motion, microcopy) in MDX stories + Playwright traces.

## Code Quality & Testing Strategy

- Static analysis: Biome 2 baseline, ESLint 9 typed overlay, strict TypeScript 5.9, `knip` for dead-code audits.
- Tests: Vitest 3 (unit), Playwright 1.49 (E2E), Loki 0.35 (visual), Jest 30 (React Native), Compose/SwiftUI
  snapshots via KMP in CI.
- Contract tests for token outputs via JSON Schema + snapshot parity with automatic changelog gating.
- Flake tracking and error budgets enforced via Nx target analytics (auto-quarantine flaky specs, raise issues).
- Security scanning: Scorecard, Trivy, Cargo Audit, and dependency review gates baked into CI.
- Dependency graph budgets (`pnpm nx graph --file=reports/dependency-graph.json`) and bundle guardrails
  using `bundle-buddy`.

## Extensibility & Ecosystem Goals

- Publish CLI/UI kernel packages to GitHub Packages with OSS mirrors.
- Plugin architecture for the token orchestrator (custom transforms, filters) and Storybook (Penpot embed,
  token diff viewer).
- Example adapters for Astro, Nuxt, Remix to accelerate adoption.
- Document QA integrations (Backstage catalogues, ArgoCD, Netlify flows).

## AI & Developer Intelligence

- `n00plicate assist` CLI powered by Ollama locally with opt-in OpenAI and GitHub Copilot integrations for
  wider accessibility.
- AI summaries posted automatically on CI (token diffs, visual regressions, flaky test hints).
- Interactive CLI wizards (`n00plicate init feature`, `n00plicate token create`) with AI guidance and guardrails.
- Storybook intelligence addon (token inspector, contrast calculator, design checklist) backed by AI
  prompts for remediation steps.

## Documentation Experience Targets

- Starlight docs structured by role: Quick Start, Token Governance, Component Recipes, Platform Guides,
  Automation & DevOps, AI Assistance.
- Embed Storybook stories without iframes; auto-generate API tables from types.
- Automate changelog + release notes (Changesets), mirrored to docs and Storybook announcements.
- Record ADR per major decision (Rust orchestrator, Lit kernel, repo layout, etc.).
- Provide compliance templates (WCAG, SOC2) and design review checklists.

## Feature Roadmap Highlights

- Token analytics dashboard (timelines, usage heatmaps).
- Real-time QA bot (Slack/Matrix) surfacing a11y/visual regression alerts.
- `just penpot-up` for optional local Penpot provisioning.
- CLI enhancements: `n00plicate design diff`, `n00plicate story publish`, `n00plicate repo doctor`, AI-powered incident explainers.
- Migration utilities for n00plicate 1.x consumers (codemods, token rename mapping).

## Immediate Next Steps

- Draft ADRs for core decisions (Rust CLI, Lit kernel, repo layout).
- Prototype token orchestrator flow (Penpot export → Rust CLI → CSS/TS outputs).
- Scaffold `ui-kernel` prototypes and integrate with Storybook 9.1 composition mode.
- Start Starlight docs skeleton with MDX + Storybook embeds.
- Design migration plan for 1.x adopters (parallel token/output strategy).

## Phase Breakdown

### Phase 0 – Discovery & Alignment (Week 0)

| Status | Task                                                                           | Owner   | Notes                                                |
| ------ | ------------------------------------------------------------------------------ | ------- | ---------------------------------------------------- |
| [ ]    | Approve architecture blueprint (token orchestrator, Lit kernel, adapters)      | Core WG | Reference `docs/IMPLEMENTATION_GUIDE.md` + this plan |
| [ ]    | Create ADRs for critical decisions (Rust CLI, repo layout, Storybook 10-track) | Core WG | ADR templates already live in `docs/ADR.md`          |
| [ ]    | Inventory current 1.x consumers and migration risks                            | DevRel  | Capture in `docs/MIGRATION_SUMMARY.md`               |

**Exit Criteria**: Architecture signed off, ADRs drafted, migration impact analysis complete.

### Phase 1 – Repository Foundations (Weeks 1–2)

| Status | Task                                                                                   | Owner       | Dependencies |
| ------ | -------------------------------------------------------------------------------------- | ----------- | ------------ |
| [ ]    | Finalise new workspace layout (`apps/`, `packages/`, `infra/`, `toolchains/`)          | Platform    | Phase 0      |
| [ ]    | Establish SLO baseline (build <=5 min, drift MTTR, visual escape rate, doc freshness)  | Platform/QA | Phase 0      |
| [ ]    | Stand up shared config presets (TS, ESLint, Biome, Stylelint, Vitest) in `toolchains/` | Platform    |              |
| [ ]    | Configure Nx 22 + pnpm 10.18.2 + Node 22.20 baselines across CI/devcontainers          | DevOps      |              |
| [ ]    | Introduce CODEOWNERS + `just` command catalogue + PR templates referencing metrics     | DevRel      |              |
| [ ]    | Publish contributor playbook updates (setup, scripts, justfile)                        | DevRel      |              |

**Deliverables**: Clean repo scaffolding, DevContainer refresh, base `justfile`, updated contributor docs.

### Phase 2 – Token Orchestrator & Contract Layer (Weeks 2–4)

| Status | Task                                                                                         | Owner           | Dependencies |
| ------ | -------------------------------------------------------------------------------------------- | --------------- | ------------ |
| [ ]    | Build `packages/token-orchestrator` Rust CLI (Penpot DTCG ingest, validation, JSON schema)   | Platform        | Phase 1      |
| [ ]    | Implement structured logging + error envelopes (Rust + Node bindings)                        | Platform        |              |
| [ ]    | Compile wasm bindings + Node wrapper for use in CI and apps                                  | Platform        |              |
| [ ]    | Create `packages/tokens-core` canonical schema + history snapshots                           | DesignOps       |              |
| [ ]    | Generate multi-platform outputs to `packages/tokens-outputs` (css, ts, compose, swift, dart) | Platform        |              |
| [ ]    | Wire GitHub Actions for scheduled Penpot sync + diff PRs (token drift, contract tests)       | DevOps          |              |
| [ ]    | Instrument orchestrator with OpenTelemetry spans + Grafana dashboards (latency, failures)    | Platform/DevOps |              |

**Deliverables**: Deterministic token pipeline, drift detection workflow, CLI usage docs.

➡️ Reference [`packages/token-orchestrator/README.md`](../packages/token-orchestrator/README.md) for the
Rust orchestrator usage guide, feature flags, and build targets.

### Phase 3 – UI Kernel & Adapters (Weeks 4–6)

| Status | Task                                                                                                           | Owner            | Dependencies |
| ------ | -------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ |
| [ ]    | Scaffold `packages/ui-kernel` with Lit + vanilla-extract theming                                               | Platform         | Phase 2      |
| [ ]    | Implement accessibility primitives (focus management, motion, tokens)                                          | Platform         |              |
| [ ]    | Build adapters: `ui-adapters/react`, `ui-adapters/vue`, `ui-adapters/svelte`, `ui-adapters/solid`              | Experience Guild |              |
| [ ]    | Create `platform-bridges/{compose,swiftui,flutter}` bridging layers                                            | Native Guild     |              |
| [ ]    | Deliver Storybook intelligence addon (token inspector, contrast, design checklist) with AI remediation prompts | Platform/Docs    |              |
| [ ]    | Establish component contract tests (Storybook stories + Vitest DOM + Playwright)                               | QA Guild         |              |

**Deliverables**: Shared component kernel, working adapters, baseline Storybook integration.

### Phase 4 – Application Integration (Weeks 6–8)

| Status | Task                                                                                              | Owner           | Dependencies |
| ------ | ------------------------------------------------------------------------------------------------- | --------------- | ------------ |
| [ ]    | Migrate web app to Qwik City 2 + new kernel                                                       | Web Guild       | Phase 3      |
| [ ]    | Upgrade React Native app (Expo Router, Hermes, tokens)                                            | Mobile Guild    |              |
| [ ]    | Wire Compose Multiplatform/Tauri shells with generated tokens                                     | Native Guild    |              |
| [ ]    | Instrument apps with OpenTelemetry + structured logging (surface dashboards for perf/error rates) | Platform/DevOps |              |
| [ ]    | Add sample integrations (Astro, Remix, Next) in `examples/`                                       | DevRel          |              |

**Deliverables**: Updated reference apps, example integrations, platform parity report.

### Phase 5 – Documentation & Developer Experience (Weeks 8–9)

| Status | Task                                                                               | Owner      | Dependencies |
| ------ | ---------------------------------------------------------------------------------- | ---------- | ------------ |
| [ ]    | Launch Starlight docs app with MDX + Storybook embeds + live API tables            | Docs Guild | Phase 3      |
| [ ]    | Document token governance, release process, migration guides (with SLO dashboards) | Docs Guild |              |
| [ ]    | Ship AI assistant docs covering Ollama, OpenAI, and Copilot flows                  | AI Guild   |              |
| [ ]    | Publish upgrade playbooks (Penpot updates, toolchain bumps)                        | DevOps     |              |
| [ ]    | Add CLI wizards + AI usage guide (`n00plicate init`, `n00plicate token create`)              | Platform   |              |

**Deliverables**: docs site, governance guidelines, CLI handbooks, migration cookbook.

### Phase 6 – Quality Gates & Release (Weeks 9–10)

| Status | Task                                                                               | Owner           | Dependencies |
| ------ | ---------------------------------------------------------------------------------- | --------------- | ------------ |
| [ ]    | Implement enhanced CI matrix (a11y, visual, E2E cross-runtime) + flake tracking    | QA Guild        | Phase 3      |
| [ ]    | Run beta program with selected adopters                                            | DevRel          | Phase 4      |
| [ ]    | Finalise semantic releases (Changesets, GitHub Releases) + automated release notes | DevOps          |              |
| [ ]    | Launch token analytics dashboard + QA notification bot                             | Platform/DevOps |              |
| [ ]    | Ship n00plicate 2.0 GA announcement + migration toolkit                                 | Core WG         |              |

**Exit Criteria**: All tests green, documentation complete, migration path validated, release artifacts published.

## Cross-Cutting Backlog

- [ ] Storybook 10 add-on parity checklist (track official releases).
- [ ] Compose/SwiftUI snapshot automation in GitHub Actions.
- [ ] Token analytics dashboard + Slack/Matrix notifications.
- [ ] Optional Backstage plugin for docs + component catalogue.
- [ ] Penpot plugin improvements (semantic naming assistance, contract validation).
- [ ] Investigate open-source feature flags (e.g., Unleash) for runtime experiments.
- [ ] Security hardening backlog (Scorecard, Trivy, Cargo Audit follow-ups).
- [ ] Additional AI integrations (Copilot workspaces, OpenAI tooling evolutions).

## Tracking & Reporting

- Update status weekly in this document; mirror highlights to `docs/IMPLEMENTATION_GUIDE.md`.
- Use GitHub project board **“n00plicate 2.0 Delivery”** with columns: Backlog, In Progress, In Review, Done.
- Each checklist item should map to an issue/PR with `n00plicate-2.0` label for traceability.
