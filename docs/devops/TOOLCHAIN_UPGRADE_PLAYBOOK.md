# Toolchain Upgrade Playbook

> Updated for the flattened n00plicate workspace (September 2025).

This playbook captures the recommended sequence for keeping Node.js, pnpm, Nx, Qwik, React Native, Storybook, Style
Dictionary, and Penpot automation on their latest supported versions.

## 1. Environment Baseline

1. Ensure you are running the repository root (no more `repo/` prefix).
2. Confirm Node.js `22.x` (latest LTS) via `.nvmrc`:

   ```bash
   nvm install
   nvm use
   ```

3. Refresh pnpm via Corepack (scripted in `setup.sh`):

   ```bash
   corepack enable
   corepack prepare pnpm@10.18.2 --activate
   ```

## 2. Plan the Upgrade

1. Generate Nx migration schematics:

   ```bash
   pnpm upgrade:plan
   ```

2. Review the generated `migrations.json` and apply edits as needed.
3. Snapshot current lock state for rollback:

   ```bash
   git commit -am "chore: snapshot pre-upgrade state"
   ```

## 3. Apply Latest Versions

1. Pull the newest dependency graph across the workspace:

   ```bash
   pnpm upgrade:latest
   ```

2. Run pending Nx migrations:

   ```bash
   pnpm nx migrate --run-migrations
   ```

3. Refresh the Penpot dev stack after dependency bumps:

   ```bash
   make docker-stop
   make docker-dev
   ```

## 4. Validate Thoroughly

1. Re-install to ensure lockfile coherence:

   ```bash
   pnpm install
   ```

2. Execute the full verification suite:

   ```bash
   pnpm upgrade:verify
   make tokens-build
   pnpm nx run-many -t lint typecheck test build-storybook
   ```

3. Rebuild visual baselines as required (Loki/Storybook test-runner).

## 5. Document the Outcome

- Update `README.md` version badges for Nx, TypeScript, Storybook, etc.
- Call out notable toolchain changes in `docs/IMPLEMENTATION_GUIDE.md` and `docs/DEPLOYMENT.md`.
- If any packages required temporary downgrades, record the rationale in `docs/ADR.md`.

## 6. Release Checklist

- Regenerate the dependency graph artifact: `pnpm workspace:info`.
- Push migrations and regenerated lockfile in the same pull request.
- Tag the release with semantic version notes covering Penpot, Qwik, React Native, and Tauri deltas.

Following this routine ensures n00plicate stays aligned with the latest open-source tooling while preserving the
collision-free guarantees of the design-token pipeline.
