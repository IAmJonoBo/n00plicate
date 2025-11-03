# Nx native binary crash while building project graph

## Summary

- `pnpm format:check` and `pnpm lint:workspace` crash with exit code 134 when Nx initialises the workspace graph.
- Failure reproduces after aligning to Node.js 22.20.0 and pnpm 10.18.2 using `nvm` within the current devcontainer.
- Captured terminal transcripts show `fatal runtime error: failed to initiate panic, error 5`
  emitted by the Nx native binary before aborting.

## Environment

- Node.js: 22.20.0 (via `nvm install 22.20.0`)
- pnpm: 10.18.2 (`corepack prepare pnpm@10.18.2 --activate`)
- OS image: `mcr.microsoft.com/devcontainers/base:bookworm`
- Nx CLI: workspace pinned version (see `package.json`)
- Cache: shared pnpm wheelhouse at `/opt/pnpm-store` hydrated via `pnpm fetch`

## Reproduction steps

```bash
# inside devcontainer shell
nvm install 22.20.0
nvm use 22.20.0
corepack enable
corepack prepare pnpm@10.18.2 --activate
pnpm install --frozen-lockfile
NX_DAEMON=false pnpm format:check
```

## Observed output

```
> n00plicate@0.1.1 format:check /workspace/n00plicate
> nx run workspace-format:format --configuration=check
fatal runtime error: failed to initiate panic, error 5
Aborted
 ELIFECYCLE  Command failed with exit code 134.
```

`pnpm lint:workspace` exhibits the same failure while Nx is constructing the project graph for `workspace-format:lint:base`.

## Mitigation status — 2025-10-12

- Setting `NX_NATIVE_ENABLE=false`, `NX_NATIVE_COMMAND_RUNNER=false`, and `NX_ADD_PLUGINS=false`
  (alongside `NX_DAEMON=false`) forces the CLI to build the project graph with the JavaScript
  implementation. With the native module and plugin auto-registration bypassed, `pnpm format:check`
  now surfaces formatter diffs instead of aborting with exit 134.
- Devcontainer defaults and Copilot instructions were updated to export the same variables so that
  humans and agents consistently avoid the unstable native binary while the upstream issue is
  investigated.
- Subsequent runs show `pnpm lint:workspace` succeeding, while `pnpm nx run-many -t typecheck --nx-bail`
  currently stalls after the first wave of projects; further investigation is required to determine if
  the hang is related to the fallback mode, outstanding formatting drift, or additional Nx inference
  plugins.
- Workspace scripts now invoke Biome and ESLint CLIs directly (`pnpm exec biome ...`, `pnpm exec eslint ...`)
  without routing through the `workspace-format` Nx target, sidestepping the crash for format/lint gates
  while preserving consistent tooling output.
- `pnpm typecheck` continues to abort while Nx constructs the project graph, so further mitigation is
  required for type safety gates before CI can rely on them.
- 2025-10-14: Added per-project `typecheck` scripts and tsconfig baselines so `pnpm typecheck`
  executes `tsc` sequentially via `pnpm -r --workspace-root=false --if-present`, bypassing Nx entirely
  for the type gate. The native crash still blocks Nx-driven typecheck/test invocations, but the new
  aggregator keeps type safety enforcement running until the upstream fix lands.

## Next actions

- [ ] Verify all Nx-based quality gates (format, lint, typecheck, test, build) complete successfully
      with the JavaScript fallback and capture their timings for regression tracking.
- [ ] Engage the Nx maintainers with the captured native crash logs to determine whether a patched
      release or alternative configuration can restore native performance on Debian Bookworm.
- [ ] Remove the forced fallback once an upstream fix is confirmed, updating devcontainer and Copilot
      guidance accordingly.
