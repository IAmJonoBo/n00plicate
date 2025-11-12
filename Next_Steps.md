# Next Steps

## Tasks

- [ ] Sprint 0 – Discovery & Alignment (Architecture Guild) — Due: Week 0
  - Align on architecture blueprint, token orchestrator vision, and AI accessibility approach per implementation plan.
- [ ] Sprint 1 – Repository Foundations (Platform Enablement Squad) — Due: Weeks 1–2
  - Stand up workspace layout, toolchain presets, devcontainer, CODEOWNERS, and telemetry scaffolding.
- [ ] Sprint 2 – Token Orchestrator Skeleton (Token Pipeline Squad) — Due: Weeks 3–4
  - Deliver Rust CLI scaffolding, Penpot ingest, schema validation, and OpenTelemetry instrumentation.
- [ ] Sprint 3 – Token Outputs & Automation (Automation Squad) — Due: Weeks 5–6
  - Generate multi-platform token outputs, implement token-sync workflows, and wire telemetry dashboards.
- [ ] Sprint 4 – UI Kernel & Adapters MVP (Design System Squad) — Due: Weeks 7–8
  - Build Lit-based kernel, framework adapters, Storybook integration, and automated contract tests.
- [ ] Sprint 5 – Platform Integrations (Experience Squads) — Due: Weeks 9–10
  - Integrate kernel/tokens into web, native, and desktop apps plus reference examples and telemetry hooks.
- [ ] Sprint 6 – Docs, DX & AI Assistance (Developer Experience Squad) — Due: Weeks 11–12
  - Launch docs site, publish governance guides, and document AI-assisted tooling flows.
- [ ] Sprint 7 – Quality Gates & GA Readiness (Release Engineering Squad) — Due: Weeks 13–14
  - Harden CI matrix, finalize release notes, and stage GA communications.
- [ ] Cross-Sprint Backlog Grooming (Squad Leads Council) — Due: Ongoing each sprint review
  - Reprioritise Storybook 10 parity, analytics dashboards, Penpot plugin enhancements,
    CLI expansions, security hardening, and migration codemods.

## Steps

- [ ] Validate baseline automation commands (DevOps Guild — Week 0) to confirm `pnpm lint:workspace`,
  `pnpm typecheck`, `pnpm -w -r test`, `pnpm --filter @n00plicate/design-system run visual-test`,
  `pnpm -w -r typecheck`, `pnpm -w -r test`, `pnpm --filter @n00plicate/design-system run visual-test`,
  `pnpm --filter @n00plicate/design-system run test-storybook`, `pnpm build`, and `pnpm audit` all run cleanly in the
      container and CI. Document exit codes, coverage deltas, and remediation owners.
  - 2025-10-11: Initial audit attempt on Node 22.19.0 saw `pnpm format:check` and `pnpm lint:workspace`
    crash the terminal while Nx constructed the project graph after emitting engine mismatch warnings;
    rerun once the container runtime upgrades to Node 22.20.0 and capture full logs for the ledger.
  - 2025-10-12: Provisioned a pnpm wheelhouse via the devcontainer build (`/opt/pnpm-store`) with
    `pnpm fetch --prod --dev` and added Copilot onboarding instructions so automation can hydrate
    dependencies offline before rerunning the gates once the Node 22.20.0 image lands.
  - 2025-10-11: Re-tested `pnpm format:check`, `pnpm lint:workspace`, and `pnpm -w -r typecheck`
  under `nvm use 22.20.0` (previously `NX_DAEMON=false` — legacy Nx env var; no longer required).  
  The run aborted while the (now-removed) Nx project graph initialised.
    graph (exit code 134 / SIGABRT). Captured logs in `infra/troubleshooting/2025-10-11-nx-runtime-crash.md`
    for DevOps triage and flagged the need to validate Nx without the native binary.
  - 2025-10-12: Historically, teams forced Nx to use the JavaScript implementation by exporting
    `NX_NATIVE_ENABLE=false` (legacy) in the
    devcontainer and Copilot bootstrap. `pnpm format:check` now exits cleanly and reports 21 Biome
    formatting/import-order violations across apps/web/mobile/desktop instead of crashing; next rerun
    needs those fixes so lint/type/test gates can proceed.
  - 2025-10-12: Confirmed `pnpm lint:workspace` succeeds with the fallback path, but `pnpm -w -r
typecheck --nx-bail` stalled after kicking off five projects (manual SIGTERM at ~12m). Capture logs,
    triage the hang, and rerun once formatting diffs are resolved.
  - 2025-10-13: Installing Node.js 22.20.0 via `.nvmrc` and exporting `NX_NATIVE_COMMAND_RUNNER=false`
  plus `NX_ADD_PLUGINS=false` (both legacy Nx env vars) let `pnpm format:check` reach the Biome
  runner without crashing; the
    command now lists outstanding formatting updates across docs/apps while `pnpm lint:workspace`
    completes successfully under the same environment overrides. Investigate whether typecheck/test
    targets also require the plugin disablement and capture timings once formatting drift is cleared.
  - 2025-10-13: Redirected `pnpm format*` scripts to direct Biome invocations and pointed `pnpm lint:base`
    plus `pnpm lint:typed` at Biome/ESLint CLIs so workspace format/lint gates no longer depend on the
    crashing Nx target. Confirm downstream CI workflows are aligned before retiring the `workspace-format`
    helper project.
  - 2025-10-13: `pnpm typecheck` still aborts while Nx builds the project graph even with the new
    environment overrides; capture the failing spinner/logs and explore `NX_NATIVE_COMMAND_RUNNER=false`
    patches or alternate orchestration for type safety gates.
  - 2025-10-14: Replaced the Nx-driven workspace typecheck with `pnpm typecheck` (tsc over every
    package/app), adding per-project `typecheck` scripts and tsconfig baselines for mobile, desktop, and
    adapter packages. Command now completes sequentially via `pnpm -r --workspace-root=false --if-present`
    so the type gate can run without triggering the Nx project graph crash. Keep `pnpm typecheck:nx`
    available as a diagnostic path while upstream fixes incubate.
 - 2025-10-16: `pnpm -w -r test` and `pnpm -w -r build` still crash the shell.
   The run was attempted with `NX_NATIVE_COMMAND_RUNNER=false`, `NX_ADD_PLUGINS=false`, and `NX_NATIVE_ENABLE=false`.
  The run was attempted with `NX_NATIVE_COMMAND_RUNNER=false`, `NX_ADD_PLUGINS=false`, and `NX_NATIVE_ENABLE=false`.
    `NX_NATIVE_COMMAND_RUNNER=false`, `NX_ADD_PLUGINS=false`, and `NX_NATIVE_ENABLE=false`; capture the
    reproduction for DevOps and retry once the Node 22.20.0 image lands or Nx native binary is patched.
- 2025-10-15: `pnpm typecheck` currently fails under Node 22.19.0 because `packages/shared-utils/tsconfig.json`
    still sets `"ignoreDeprecations"`, which TypeScript 5.5 rejects. Investigate aligning the compiler version
    or flag usage so the sequential type gate returns to green.
- 2025-10-18: Updated `.github/workflows/pr-verification.yml` so the Nx typecheck exit code is surfaced while
  providing a sequential `pnpm typecheck` fallback when the affected run fails, matching the workspace script
  design and keeping CI visibility during Nx instability.
- 2025-10-19: Tightened the PR verification gate by removing the `continue-on-error` guard from the affected
  typecheck step, ensuring the Nx exit status fails the workflow even when the sequential fallback runs.
- 2025-10-20: Baseline rerun in Node 22.19.0 container: `pnpm format:check` still reports existing formatting
  drift (51 errors, 4 warnings) from prior work; `pnpm lint:workspace`, `pnpm typecheck`, and `pnpm audit`
  succeed with engine warnings; `pnpm -w -r test` and `pnpm -w -r build` crash the shell as a legacy Nx graph initialised
  the project graph despite `NX_NATIVE_ENABLE=false` safeguards—captured fresh terminal crashes for DevOps.
- 2025-10-20: Added a `dorny/paths-filter` gate to `pr-verification.yml` so Markdown lint only runs when
  documentation paths (`docs/**`, package READMEs) change, replacing the previous incorrect
  `contains(github.event.pull_request.changed_files, 'docs/')` check.
- 2025-10-21: Tightened the Markdown lint gate to watch Markdown/MDX docs (including root handbooks and
  nested package READMEs) so CI only runs the fixer when relevant content files change.
- 2025-10-22: Expanded the Markdown lint paths filter to include `.github` docs, infra/app/tool READMEs,
  and markdownlint configuration files so documentation edits reliably trigger the CI lint job.
- 2025-10-23: Simplified the documentation filter to watch all Markdown/MDX sources while excluding build
  outputs and dependency caches, keeping the Markdown lint gate responsive without needing bespoke glob
  maintenance for every docs directory.
- 2025-10-16: Removed workspace `ignoreDeprecations` overrides to restore compatibility with TypeScript 5.9;
  `pnpm typecheck` now completes successfully on Node 22.19.0 while we wait for the container image to
  upgrade to the required Node 22.20.0 baseline.
- 2025-10-18: Raised the pnpm baseline to 10.18.2 across docs/scripts; refresh the `/opt/pnpm-store`
  wheelhouse tarballs so offline installs keep matching the new version.
- [ ] Coordinate PR template update broadcast with Docs & Release leads so contributor education stays consistent.
- [ ] Review sprint entry/exit criteria with squad leads to confirm sequencing and readiness to begin each phase.
- [ ] Map deliverables to repository issues and link back in this ledger.
- [ ] Update status, owners, and due dates during each planning PR so this file remains authoritative.
- [ ] Coordinate container runtime upgrade to Node 22.20.0 (DevOps Guild — Week 0) to align with the
      repository engine requirement and unblock baseline automation verification.
- [ ] Ensure Copilot workspace instructions stay in sync with toolchain changes (DevOps Guild — Ongoing)
      so AI agents continue to run installs from the shared wheelhouse before executing gates.
- 2025-10-26: Confirmed baseline for token-utils change: `pnpm format:check` still reports 52 formatter
  violations from legacy drift; `pnpm lint:workspace` and `pnpm typecheck` succeed under Node 22.19.0;
  `pnpm test` and `pnpm build` crash the shell during Nx project graph creation; `pnpm audit` reports no
  known vulnerabilities. Scoped `pnpm exec vitest run --config vitest.config.ts` inside
  `packages/shared-utils` to execute the new token-utils coverage without triggering Nx.
- 2025-10-27: React Native formatter multi-axis fix: added Vitest snapshot for `react-native/theme-ts`,
  reran `pnpm --filter @n00plicate/design-tokens exec vitest run`, `pnpm lint:workspace`, and
  `pnpm typecheck`; regenerated Style Dictionary outputs via
  `pnpm --filter @n00plicate/design-tokens build:tokens` (acknowledged existing collision warnings) to
  verify padding tokens now emit axis-specific objects.
- 2025-10-12: Revalidated baseline ahead of platform token precedence update — `pnpm format:check`
  still fails with 50 formatter errors and 4 warnings from existing drift; `pnpm lint:workspace` and
  `pnpm typecheck` complete with engine mismatch warnings; `pnpm -w -r test` and `pnpm -w -r build`
  continue to crash the terminal while constructing the project graph; targeted `pnpm --filter
  @n00plicate/design-tokens test -- --run` added to cover new platform lookup behaviour.
- 2025-10-28: Re-ran baseline commands before sprint planning refresh — `pnpm format:check` fails with
  47 errors/4 warnings (Biome broken symlink notices persist); `pnpm lint:workspace` and
  `pnpm typecheck` pass despite Node engine warnings; `pnpm -w -r test` and `pnpm -w -r build`
  still crash the shell while Nx constructs the project graph; `pnpm audit` reports no known
  vulnerabilities. Captured new terminal crashes for DevOps to correlate with ongoing Nx runtime issue.
- 2025-10-28: Expanded `docs/SPRINT_PLAN.md` with mission/workstream/quality-gate sections for each
  sprint plus baseline gate summary so squads can operationalise the roadmap; ensure squads cross-link
  the new structure from sprint kickoff notes.
 - 2025-10-29: Baseline rerun (Node 22.19.0) – `pnpm -w -r test`,
  `pnpm lint:workspace`, `pnpm typecheck`, and `pnpm audit --prod`.  
  Run `pnpm -w -r build` to build all workspaces; skip helper projects such as `workspace-format` if needed.
  complete with existing Node engine warnings and
  Nx Cloud client download notices. `pnpm format:check` still reports pre-existing Biome formatting
  drift (45 errors, 4 warnings). `pnpm dlx gitleaks@latest detect` failed because npm could not determine a
  runnable binary inside the package; capture the log for security tooling follow-up.
 - 2025-10-29: Updated CI (`ci.yml`, `pr-verification.yml`, `visual-tests.yml`) to inject the Nx Cloud
   token via the `NX_CLOUD_ACCESS_TOKEN` repository secret instead of shelling out to `gh variable get`.
   Note: This approach uses Nx Cloud and `NX_CLOUD_ACCESS_TOKEN` (legacy) and will be migrated to pnpm
   store cache / Actions-based caching.
  Documented the new secret requirement in `docs/devops/nx-remote-cache.md`; coordinate with DevOps to
  store the secret in GitHub and validate Nx Cloud self-healing once populated.
 - 2025-10-30: Added `scripts/configure-nx-cloud.sh` so workflows disable Nx Cloud gracefully when the
  secret is absent, vendored the `nx-cloud` package, and configured the `nx-cloud` tasks runner in
  `nx.json`. Reran the baseline: `pnpm -w -r test` (legacy Nx `run-many`),
  `pnpm lint:workspace`, `pnpm typecheck`, `pnpm -w -r build` (legacy Nx invocation; skip `workspace-format` as needed),
  and `pnpm audit --prod` succeed with existing Node engine warnings;
  `pnpm format:check` still reports legacy Biome drift and `pnpm dlx gitleaks@latest detect` fails because
  npm cannot determine the correct executable. Nx now logs "Nx Cloud Will Not Be Used" when
  `NX_NO_CLOUD=true` is injected, suppressing repeated agent download attempts in forked PRs.
- 2025-10-30: Removed stale `.trunk` symlinks, ignored the directory going forward, and ran Biome's
  autofixer to clear the long-standing formatter drift so `pnpm format:check` exits cleanly.
- 2025-10-30: Added `scripts/run-gitleaks.sh` and the `pnpm security:gitleaks` helper to download and
  cache the upstream CLI, restoring the repository's secret scanning gate without relying on the
  broken `pnpm dlx gitleaks@latest` package entry point.
- 2025-10-13: Scaffolded the Rust token orchestrator pipeline (Penpot ingest, governance checks,
  multi-platform emitters, OpenTelemetry spans) with integration tests and wired pnpm scripts to
  run the new CLI before legacy Style Dictionary tasks.

## Deliverables

- [ ] Architecture blueprint, ADRs, and migration summary captured for Sprint 0.
- [ ] Workspace scaffolding (toolchains, devcontainer, CODEOWNERS, telemetry stubs) for Sprint 1.
- [ ] Token orchestrator CLI, schema history, and observability baselines for Sprint 2.
- [ ] Automated token outputs, drift detection workflows, and security scans for Sprint 3.
- [ ] UI kernel/adapters, Storybook demos, and visual/a11y test coverage for Sprint 4.
- [ ] Runtime integrations with telemetry instrumentation and example projects for Sprint 5.
- [ ] Docs platform, AI tooling guides, and governance materials for Sprint 6.
- [ ] Hardened CI matrix, release collateral, and analytics dashboards for Sprint 7.

## Quality Gates

- Formatting: `pnpm format:check` keeps Biome/Prettier alignment intact before linting.
- Linting: `pnpm lint:workspace` (Biome format+lint, typed ESLint overlay) must pass.
- Type Safety: `pnpm typecheck` remains green across affected projects (Nx variant `pnpm typecheck:nx`
  retained for diagnostics).
- Testing: `pnpm -w -r test` and targeted suites (e.g., Storybook/Vitest) succeed.
- Visual Regression: `pnpm --filter design-system run visual-test` (Loki/Storybook) completes without diffs.
- Storybook Interaction: `pnpm --filter design-system run test-storybook` verifies stories and accessibility
  automation.
- Security: `pnpm audit` and scheduled security workflows report no blocking vulnerabilities.
- Build: `pnpm build` (and any sprint-specific Nx targets) completes successfully.

## Links

- [Implementation Plan 2.0](docs/IMPLEMENTATION_PLAN_2.0.md)
- [Sprint Roadmap](docs/SPRINT_PLAN.md)
- [CI Overview](docs/devops/ci-overview.md)
- [Development Guide](DEVELOPMENT.md)
- [Devcontainer Runtime & Wheelhouse](infra/containers/devcontainer/README.md)
- [Copilot Wheelhouse Instructions](.github/copilot-instructions.yml)
- [Nx Runtime Crash Log](infra/troubleshooting/2025-10-11-nx-runtime-crash.md)

## Risks / Notes

- Squad assignments assume current ownership; adjust as teams evolve and update here.
- Visual and Storybook test suites are known to require additional setup (React Native/Tauri)
  before gating can be fully enforced—track remediation as part of relevant sprints.
- Local container image currently pins Node 22.19.0, triggering engine mismatch warnings versus the
  required Node 22.20.0 baseline; coordinate with DevOps to bump the runtime and re-verify Nx targets.
- `pnpm -w -r test` and legacy Nx-driven typecheck commands triggered shell crashes during
  baseline verification while Nx built the project graph on Node 22.19.0; capture logs under
  `infra/` troubleshooting and stabilise the command path once the runtime upgrade lands so gates can
  be relied on for enforcement. `pnpm typecheck` now runs via `tsc` without touching the Nx graph, but
  the native runner crash still blocks any Nx-powered graph work (tests/build) until DevOps delivers a
  patched binary or upgraded runtime.
- Running Nx with `NX_NATIVE_COMMAND_RUNNER=false` and `NX_ADD_PLUGINS=false` bypasses the native graph
  builder crash, but it may reduce inference coverage/performance. Track upstream fixes so the native
  path can be restored once stable.
- Maintain the pnpm wheelhouse (`/opt/pnpm-store`) whenever the lockfile changes so offline installs
  and Copilot workflows remain valid; rebuild the devcontainer after dependency updates.
- Running Nx in JavaScript mode carries a performance penalty; track the upstream native fix so we can
  restore the faster path once available and update automation guidance accordingly.
- Typecheck target currently stalls under the JavaScript fallback after the initial batch of projects;
  monitor reruns and capture profiling data if the hang persists beyond formatting cleanup.
- Maintain this ledger in every planning PR to preserve alignment across squads and keep downstream templates accurate.
