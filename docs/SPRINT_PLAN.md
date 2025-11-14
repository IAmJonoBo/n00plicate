# n00plicate 2.0 Sprint Roadmap

Two-week sprints tailored for the n00plicate 2.0 rewrite. Each sprint now calls out mission, workstreams,
architecture/tooling upgrades, quality gates, and exit checklists so squads can execute against
consistent expectations. Partner this roadmap with
[`docs/IMPLEMENTATION_PLAN_2.0.md`](./IMPLEMENTATION_PLAN_2.0.md) for deeper architectural context.

## Baseline Quality Gates

The following checks are mandatory for every sprint increment. Treat them as entry and exit criteria
for stories as well as sprint reviews:

- `pnpm format:check`, `pnpm lint:workspace`, and `pnpm typecheck` green with no warnings gated by
  waivers.
- Functional/contract suites (`pnpm -w -r test`, Storybook interaction runner, Playwright
  journeys) stable with flake budgets logged.
- Visual regression baselines (Loki, Compose/SwiftUI snapshots) updated and reviewed.
- `pnpm build` + package-specific builds successful in CI.
- Security posture verified via `pnpm audit`, Scorecard, Trivy, Cargo Audit.
- Telemetry dashboards and runbooks updated when new signals are added.

Use Sprint 0 to unblock any failing gates so later sprints start from a trusted baseline.

---

## Sprint 0 – Discovery & Alignment (Week 0)

### Mission

Finalize architecture decisions, quality guardrails, and the baseline toolchain so squads can deliver
confidently from Sprint 1 onwards.

### Workstreams

- Run architecture workshops to confirm token orchestrator scope, UI kernel split, and automation
  layers.
- Map stakeholder goals and produce the n00plicate 1.x migration impact assessment.
- Draft the metrics charter (SLOs, SLIs, error budgets, telemetry owners).

### Architecture & Tooling Upgrades

  - Promote the Node 24.11.0 + pnpm 10.21.0 toolchain and document fallbacks (nvm, devcontainer,
  wheelhouse sync).
- Decide on AI platform mix (Ollama/OpenAI/Copilot) for `n00plicate assist` and Storybook guidance.
- Capture ADRs for Rust CLI footprint, Lit kernel, repo layout, Storybook 10 track, and AI
  accessibility workflow.

### Automation & Quality Gates

- Verify format/lint/type gates run without Nx native crashes; capture troubleshooting logs where
  blockers remain.
- Define acceptance criteria for telemetry dashboards and error-budget reviews.
- Baseline accessibility policy (WCAG targets, testing cadence, AI remediation workflow).

### Deliverables

- Architecture blueprint and dependency matrix updates.
- Draft ADR set and migration summary stub (`docs/MIGRATION_SUMMARY.md`).
- Metrics charter, quality gate documentation, and sprint operating agreement.

### Exit Checklist

- Vision statement approved and referenced in planning docs.
- ADRs merged or in-review with owners assigned.
- Toolchain upgrade plan accepted; devcontainer and CI images scheduled.
- Metrics charter and migration summary published with owners.

---

## Sprint 1 – Repository Foundations (Weeks 1–2)

### Mission

Stand up workspace scaffolding, shared tooling, and baseline telemetry so parallel squads can begin
delivery.

### Workstreams

- Finalize directory layout (`apps/`, `packages/`, `infra/`, `toolchains/`) and publish CODEOWNERS,
  PR templates, and governance docs.
- Ship toolchain presets (tsconfig, ESLint flat config, Biome, Stylelint, Vitest, Playwright).
  - Refresh devcontainer with Node 24.11.0, pnpm 10.21.0, Rust, mobile toolchains, Penpot stack, and AI
  CLIs.
- Seed SLO dashboards and telemetry hooks for orchestrator, kernel, and automation services.

### Architecture & Tooling Upgrades

- Stabilize plugin stack (legacy Nx plugin references removed). Replace Nx orchestration with pnpm workspace
  filters and explicit run scripts. `NX_NATIVE_ENABLE=false` is a legacy mitigation and no longer required.
- Publish `justfile` catalogue with automation/AI helper aliases and ensure CI runners install it.
- Align CONTRIBUTING/DEVELOPMENT guides with the new workflows and AI expectations.

### Automation & Quality Gates

- Achieve clean `pnpm format:check`, `pnpm lint:workspace`, `pnpm typecheck`, and sequential
  workspace tests for scaffolded projects.
- Bootstrap Markdown lint, Stylelint, and Storybook smoke gates with path filters.
- Ensure telemetry exporters send heartbeat metrics to the dashboards defined in Sprint 0.

### Deliverables

- Updated repo structure, CODEOWNERS, PR template, and governance docs.
- Toolchain presets and devcontainer updates merged.
- `just` automation catalogue and CI bootstrap scripts.

### Exit Checklist

- CI running on upgraded Node/pnpm with telemetry streaming.
- Setup docs refreshed and linked from onboarding communications.
- Quality gates documented in `/Next_Steps.md` and CI workflows.

---

## Sprint 2 – Token Orchestrator Skeleton (Weeks 3–4)

### Mission

Deliver the initial Rust/WASM token orchestrator capable of ingesting Penpot exports, validating
schemas, and emitting telemetry.

### Workstreams

- Scaffold `packages/token-orchestrator` CLI (Rust + wasm-bindgen bindings) with structured logging.
- Implement Penpot DTCG ingest, schema validation, and history management in
  `packages/tokens-core`.
- Capture orchestration rules, schema evolution policy, and OpenTelemetry expectations in ADRs.

### Architecture & Tooling Upgrades

- Ensure Rust stable toolchain + `wasm32-unknown-unknown` target available in devcontainer and CI.
- Add cargo fmt/clippy hooks and integrate with lint pipelines.
- Extend metrics dashboards to surface orchestrator latency/error/throughput.

### Automation & Quality Gates

- Unit coverage for schema/rule enforcement; CLI integration tests executed via Vitest/expect
  harness.
- Add `cargo test`, `cargo fmt --check`, `cargo clippy -- -D warnings` to CI.
- Validate telemetry events flowing to Grafana/Tempo dashboards with runbooks.

### Deliverables

- CLI scaffolding with ingest + validation + history snapshotting.
- Telemetry instrumentation and dashboards for orchestrator operations.
- ADR capturing orchestration principles and change-management policy.

### Exit Checklist

- CLI exports normalized JSON to `packages/tokens-core/history` with golden snapshot tests.
- Schema validation + rule enforcement tests passing.
- Telemetry dashboards populated with orchestrator runs and alert thresholds set.

---

## Sprint 3 – Token Outputs & Automation (Weeks 5–6)

### Mission

Automate token output generation across platforms, detect drift, and operationalize the supporting
CI workflows.

### Workstreams

- Generate outputs (CSS, TS, JSON Schema, Compose, Swift, Kotlin, Flutter) into
  `packages/tokens-outputs`.
- Build `apps/workflows/token-sync` automation to export from Penpot, diff, and raise PRs with
  AI-generated annotations.
- Integrate security scanning and telemetry into the automation pipeline.

### Architecture & Tooling Upgrades

- Harden Storybook 9.1 + Loki runners; document upgrade path to Storybook 10.
- Extend orchestrator CLI to publish provenance metadata and changelog entries.
- Wire security tooling (Scorecard, Trivy, Cargo Audit) into scheduled workflows.

### Automation & Quality Gates

- Add drift detection workflow to CI with approval gates and auto-rollback strategy.
- Ensure generated outputs have snapshot coverage and consumer contract tests.
- Validate telemetry dashboards capture automation success/failure with alerting hooks.

### Deliverables

- Multi-platform token outputs committed (gitignored as appropriate) with consumption docs.
- Token sync workflow with AI summaries, security scans, and dashboards.
- Runbooks describing token refresh cadence and incident response.

### Exit Checklist

- CI pipeline produces token outputs on demand and blocks merges on drift regressions.
- Drift PRs include AI-generated context and remediation suggestions.
- Security scans green with remediation backlog filed for warnings.

---

## Sprint 4 – UI Kernel & Adapters MVP (Weeks 7–8)

### Mission

Implement the Lit-based UI kernel, first-party adapters, and Storybook-powered validation tooling.

### Workstreams

- Build `packages/ui-kernel` with accessibility primitives, vanilla-extract theming, and telemetry
  hooks.
- Ship React adapter (`packages/ui-adapters/react`) and sample kernel consumers.
- Integrate kernel + tokens into Storybook with token intelligence addon and AI accessibility
  prompts.

### Architecture & Tooling Upgrades

- Stabilize Playwright, Storybook interaction runner, and Loki pipelines on Node 24.11.
- Add contract testing harness (Vitest DOM, Storybook test runner, Playwright journeys).
- Document adapter interface contracts and versioning policy.

### Automation & Quality Gates

- Enforce Storybook visual/a11y gates with thresholds and flake triage dashboards.
- Add adapter contract tests to CI with coverage tracking.
- Ensure telemetry captures component usage, performance, and accessibility guidance hits.

### Deliverables

- UI kernel + React adapter packages with docs and example implementations.
- Storybook workspace demonstrating kernel components with token inspector addon.
- Accessibility runbooks, AI remediation prompts, and contract test suites.

### Exit Checklist

- Storybook demos use generated tokens and pass visual/a11y gates.
- Adapter contract tests green with coverage meeting thresholds.
- Telemetry dashboards show kernel metrics and accessibility prompt usage.

---

## Sprint 5 – Platform Integrations (Weeks 9–10)

### Mission

Wire the kernel and tokens into reference applications across web, native, and desktop platforms,
complete with instrumentation and examples.

### Workstreams

- Upgrade Qwik web app, Expo/React Native app, Compose Multiplatform shell, and Tauri desktop shell
  to consume kernel + tokens.
- Publish example integrations for Astro/Remix/Next with AI-assisted onboarding scripts.
- Instrument apps with OpenTelemetry and feed dashboards.

### Architecture & Tooling Upgrades

- Ensure multi-platform build toolchains (Android/iOS SDKs, Rust, Tauri, Expo) are cached in CI.
- Add shared navigation/state patterns for adapters to reuse.
- Expand telemetry schema to capture platform-specific performance and UX data.

### Automation & Quality Gates

- Compose/SwiftUI snapshot suites, React Native Jest, and Playwright mobile web journeys running in
  CI with flake monitoring.
- Performance budgets enforced (initial load, bundle size) with alerts in dashboards.
- Example apps validated by `just`/AI scripts end-to-end.

### Deliverables

- Reference apps compiling with instrumentation and documented integration steps.
- Example repo automation scripts and AI onboarding flows.
- Dashboard updates summarizing platform health metrics.

### Exit Checklist

- All reference apps build and pass platform-specific test suites in CI.
- Example projects documented with quickstart scripts verified by QA.
- Telemetry dashboards show baseline platform metrics with owners assigned.

---

## Sprint 6 – Docs, DX & AI Assistance (Weeks 11–12)

### Mission

Launch the new documentation experience, refine developer tooling, and expand AI-powered workflows.

### Workstreams

- Build Starlight-based docs app with MDX, Storybook embeds, and API tables.
- Document token governance, release process, migration guides, and AI tooling playbooks.
- Enhance `n00plicate assist` CLI with guided flows, offline hints, and telemetry.

### Architecture & Tooling Upgrades

- Integrate docs site with Storybook, telemetry dashboards, and search indexing (Algolia/elastic).
- Automate doc linting, link checking, and preview deployments.
- Expand `just` catalogue with doc/DX focused commands.

### Automation & Quality Gates

- Docs lint (markdownlint, Vale if available) and link check enforced in CI with diff-based filters.
- Coverage tracking for CLI commands via automated smoke tests.
- DX telemetry capturing CLI usage, docs search metrics, and onboarding funnel.

### Deliverables

- Docs site preview with Storybook embeds, AI search, and governance content.
- Updated CONTRIBUTING/DEVELOPMENT guides and release playbooks.
- `n00plicate assist` CLI enhancements and documentation.

### Exit Checklist

- Docs preview deployed; content reviewed by Docs/DX leads.
- AI tooling instructions validated across Ollama/OpenAI/Copilot flows.
- Telemetry dashboards updated with DX metrics and alert thresholds.

---

## Sprint 7 – Quality Gates & GA Readiness (Weeks 13–14)

### Mission

Harden CI/CD, complete beta programme follow-ups, and prepare the GA release package.

### Workstreams

- Expand CI matrix with accessibility, Playwright, Loki, Compose/SwiftUI, and security suites with
  flake analytics.
- Run beta programme, capture feedback, and close critical bugs.
- Compile release notes, migration toolkit, communications plan, and QA bot integrations.

### Architecture & Tooling Upgrades

- Finalize runtime parity across local, CI, and production automation (Node/pnpm, Rust, Storybook
  runners, AI CLIs).
- Harden observability pipelines (Grafana/Tempo/Loki dashboards, alert routing to Slack/Matrix).
- Automate release packaging with Changesets, provenance metadata, and signing.

### Automation & Quality Gates

- Require consecutive green runs across full CI matrix within agreed SLO budgets.
- Security scans (Scorecard, Trivy, Cargo Audit) must be zero critical/high issues.
- QA bot + analytics dashboards validated with simulated incidents.

### Deliverables

- GA release assets (Changesets notes, migration toolkit, announcement copy).
- Beta programme report with resolved actions.
- QA bot prototype and analytics dashboards wired to alerting channels.

### Exit Checklist

- CI matrix green with retries within SLO; release go/no-go checklist signed off.
- Release communications staged and approved by stakeholders.
- QA bot notifying on telemetry anomalies and runbooks finalised.

---

## Cross-Sprint Backlog

- Storybook 10 addon parity tracking.
- Token analytics dashboard + QA notification bot enhancements.
- Penpot plugin enhancements (semantic naming, validation hints).
- CLI advanced commands (`design diff`, `story publish`, `repo doctor`) and AI assistant extensions.
- Security hardening backlog (Scorecard, Trivy, Cargo Audit follow-ups).
- n00plicate 1.x migration codemods and API rename mapping.

Review and reprioritise these items at the end of each sprint.
