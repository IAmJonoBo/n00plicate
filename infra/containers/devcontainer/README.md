# Devcontainer Runtime & Wheelhouse

This devcontainer image aligns local development with the repository's required toolchain and
pre-loads a pnpm "wheelhouse" so automation runs can install dependencies offline.

## Key Components

- **Node.js 24.11.0 via nvm** — matches the `engines` field declared in `package.json` and the CI
  runners.
- **pnpm 10.21.0** — activated through Corepack for deterministic installs.
- **Shared pnpm store (`/opt/pnpm-store`)** — populated at build time with `pnpm fetch --prod --dev`
  so that containers, GitHub Codespaces, and Copilot agents can run `pnpm install --prefer-offline` without
  reaching the public registry.
- **Rust toolchain** — installed for Tauri and token orchestrator builds.
- **Android SDK + OpenJDK 17** — supports React Native Android and mobile automation tasks.
 - **Nx deprecation note** — Nx and its native binary are no longer part of the workspace toolchain.
  Historically these devcontainers set `NX_NATIVE_ENABLE=false`, `NX_NATIVE_COMMAND_RUNNER=false`,
  `NX_ADD_PLUGINS=false`, `NX_DAEMON=false`, and `NX_NO_CLOUD=true` as a mitigation; those flags are now
  legacy. The devcontainer uses pnpm store caching and workspace filter invocations instead of Nx for
  orchestrating builds/test runs and offline installs.

## Updating the Wheelhouse

1. Update dependencies as usual (e.g., via Renovate or manual `pnpm up`).
2. Rebuild the devcontainer image: `devcontainer build --workspace-folder .` or via CI.
3. Confirm the wheelhouse picked up new packages by running `pnpm install --offline` inside the
   container and verifying no network calls occur.
4. Commit any accompanying documentation or Copilot instructions that reference new commands.

## Copilot & Automation Alignment

Automation agents should follow [`.github/copilot-instructions.yml`](../../../.github/copilot-instructions.yml)
to synchronise with the wheelhouse before executing quality gates. These instructions:

- Pin Node.js to 24.11.0 and pnpm to 10.21.0.
- Reuse the shared pnpm store to hydrate installs offline.
- Execute the baseline lint, type-check, test, build, and security audit commands.

Update both this README and the Copilot instructions whenever the toolchain or gate list changes so
that humans and agents stay aligned.
