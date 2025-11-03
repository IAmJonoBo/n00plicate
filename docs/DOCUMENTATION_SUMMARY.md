# Documentation Summary (n00plicate 2.0)

Use this file to understand the current documentation landscape during the n00plicate 2.0 rewrite. Each
entry links to a living document; consult [`docs/README.md`](./README.md) for the canonical index.

## Start Here

| Document                                                          | Purpose                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| [`README.md`](../README.md)                                       | Project overview, architecture snapshot, and repo layout       |
| [`docs/README.md`](./README.md)                                   | Documentation hub with curated sections and legacy tracking    |
| [`docs/IMPLEMENTATION_PLAN_2.0.md`](./IMPLEMENTATION_PLAN_2.0.md) | Phase-by-phase implementation roadmap                          |
| [`docs/SPRINT_PLAN.md`](./SPRINT_PLAN.md)                         | Sequenced two-week sprint objectives and outcomes              |
| [`docs/REPO_STRUCTURE.md`](./REPO_STRUCTURE.md)                   | Canonical n00plicate 2.0 directory tree and migration reference     |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md)                           | Contribution workflow, quality expectations, PR checklist      |
| [`DEVELOPMENT.md`](../DEVELOPMENT.md)                             | Environment setup, daily workflow, troubleshooting quick links |

## Architecture & Governance

| Document                                                                                                     | Purpose                                                                |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [`docs/ADR.md`](./ADR.md)                                                                                    | Formal architecture decisions and rationale                            |
| [`docs/TOKEN_CONTRACT_SPECIFICATION.md`](./TOKEN_CONTRACT_SPECIFICATION.md)                                  | Token schema, naming rules, and validation requirements                |
| [`docs/IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md)                                                  | Step-by-step pipeline execution guide                                  |
| [`docs/IMPLEMENTATION_PLAN_2.0.md`](./IMPLEMENTATION_PLAN_2.0.md#engineering-metrics--observability-pillars) | Engineering metrics, observability pillars, and telemetry requirements |

## Tokens & Penpot Workflow

| Document                                                                  | Purpose                                               |
| ------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`docs/DESIGN_TOKENS.md`](./DESIGN_TOKENS.md)                             | Token pipeline reference (Penpot → outputs)           |
| [`docs/PENPOT_WORKFLOW_GUIDE.md`](./PENPOT_WORKFLOW_GUIDE.md)             | Penpot usage, export automation, governance           |
| [`packages/design-tokens/README.md`](../packages/design-tokens/README.md) | Current (1.x) Style Dictionary implementation details |
| Legacy: [`docs/DESIGN_TOKENS_MIGRATION.md`](./DESIGN_TOKENS_MIGRATION.md) | Historical migration notes pending consolidation      |

## UI Kernel, Storybook & Components

| Document                                                                      | Purpose                                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`packages/design-system/README.md`](../packages/design-system/README.md)     | Component library overview and testing guidance         |
| [`docs/platforms/storybook.md`](./platforms/storybook.md)                     | Storybook configuration, testing, and CI integration    |
| [`docs/testing/comprehensive-testing.md`](./testing/comprehensive-testing.md) | Visual, interaction, and accessibility testing strategy |

## Platform Guides

| Area                  | Document                                                        |
| --------------------- | --------------------------------------------------------------- |
| Web / Qwik            | [`docs/web/qwik-performance.md`](./web/qwik-performance.md)     |
| Mobile / React Native | [`docs/mobile/rn-new-arch.md`](./mobile/rn-new-arch.md)         |
| Mobile / Compose      | [`docs/mobile/compose-theme.md`](./mobile/compose-theme.md)     |
| Desktop / Tauri       | [`docs/desktop/tauri-security.md`](./desktop/tauri-security.md) |

## Automation, Quality & Operations

| Document                                                                              | Purpose                                             |
| ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`docs/devops/ci-overview.md`](./devops/ci-overview.md)                               | CI/CD topology, caches, and pipelines               |
| [`docs/cicd/advanced-pipeline-automation.md`](./cicd/advanced-pipeline-automation.md) | Release orchestration & token sync automation       |
| [`docs/cicd/token-drift-check.md`](./cicd/token-drift-check.md)                       | Token drift detection and remediation practices     |
| [`docs/CODE_QUALITY_PROTOCOL.md`](./CODE_QUALITY_PROTOCOL.md)                         | Linting, formatting, and quality gate configuration |
| [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md)                                               | Manual + automated deployment procedures            |
| [`docs/TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)                                     | Common issues and resolutions                       |

## Legacy / Pending Migration

The following documents stem from n00plicate 1.x. Keep them for reference while their contents are folded
into the 2.0 set. Do not treat them as authoritative.

- [`docs/CONTROL_DOCUMENT.md`](./CONTROL_DOCUMENT.md)
- [`docs/ADVANCED_DOCUMENTATION_SUMMARY.md`](./ADVANCED_DOCUMENTATION_SUMMARY.md)
- [`docs/DOCUMENTATION_COMPLETION_SUMMARY.md`](./DOCUMENTATION_COMPLETION_SUMMARY.md)
- [`docs/COLLISION_PREVENTION.md`](./COLLISION_PREVENTION.md) & [`docs/COLLISION_PREVENTION_EXAMPLES.md`](./COLLISION_PREVENTION_EXAMPLES.md)
- [`docs/development/advanced-workflows.md`](./development/advanced-workflows.md)
- [`docs/onboarding/advanced-contributor-guide.md`](./onboarding/advanced-contributor-guide.md)
- The `quality/`, `security/`, and `testing/` subtrees contain 1.x material to be refactored as the
  2.0 quality strategy solidifies.

Log a `documentation` issue when you migrate or retire any of the legacy documents above so this
summary stays honest.
