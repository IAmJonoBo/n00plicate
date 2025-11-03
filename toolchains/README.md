# Toolchain Presets

Centralised configuration presets for the n00plicate 2.0 workspace. Consumers should extend or import
these rather than duplicating configuration at the project level. Keeping presets here lets us update
linters and compilers in one place while the legacy 1.x codebase continues to function.

## Layout

- `tsconfig.base.json` – strict TypeScript defaults shared by all workspaces.
- `eslint.base.js` – fast, non-type-aware ESLint config consumed by editors.
- `eslint.typed.js` – extends the base config with TypeScript-aware rules scoped to n00plicate 2.0 targets.
- `README.md` – guidance for adding future presets (Biome, Stylelint, Vitest, etc.).

> As additional toolchains migrate from the legacy tree, mirror their presets here and have each
> package/app reference the shared baseline.
