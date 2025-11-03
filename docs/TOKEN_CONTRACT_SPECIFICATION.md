# Design Token Contract Specification

## Overview

Before exporting anything from Penpot into the n00plicate pipeline, you must treat the JSON token file as a formal
"contract artefact". If that contract is precise, every downstream tool—Style Dictionary, Qwik City, React Native,
Compose MP, Tauri 2 and Storybook—will ingest the data without clashes or manual patch-ups.

This document defines the formal contract rules that guarantee fidelity across all targets in the n00plicate design token
pipeline.

## 1. Penpot-Side Rules (Source of Truth)

### 1.1 Prefix & Structure Every Token

| Rule                                                                                                              | Why It Matters                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Prefix all semantic tokens** with a unique design-system id (`ds-`, `acme-`, etc.) inside Penpot's Tokens panel | Prevents name collisions with Tailwind classes, vendor CSS vars and third-party libraries                             |
| **Keep W3C DTCG hierarchy**: global → alias → semantic                                                            | Style Dictionary and other engines rely on this nesting to infer transforms                                           |
| **Use kebab-case** for token names (`color-bg-primary`) and omit spaces or slashes                                | JSON keys become CSS custom-property names and Kotlin/TS identifiers one-to-one; illegal characters will break builds |
| **Express colour values as 6-digit hex**; lengths and radii as unitless numbers                                   | Enables platform-independent arithmetic (e.g. Compose Dp, CSS px)                                                     |

### 1.2 Verified Export Procedure

Run either:

**Option A: CLI Export**

```bash
npx penpot-export --file <FILE_UUID> --out tokens.json --assets ./assets
```

**Option B: UI Export**
Use Penpot's Tokens ▶ Export button

Both routes create:

```text
tokens.json                 # DTCG-compliant
/assets/icon-mail.svg       # optional presets
```

✅ **Guarantee**: Penpot never changes the key order, so `git diff` shows clean semantic changes.

## 2. Style Dictionary Rules (Single-Source Build)

### 2.1 Platform-Scoped Output

Configure four independent build paths in `style-dictionary.config.js`:

```javascript
buildPath: {
  css:      'libs/tokens/css/',
  ts:       'libs/tokens/ts/',
  compose:  'libs/tokens/compose/',
  dart:     'libs/tokens/dart/'
}
```

Each folder contains exactly one artefact:

- `tokens.css`
- `tokens.ts`
- `Theme.kt`
- `tokens.dart`

✅ **Benefit**: This segregation removes duplicate-name collisions reported by other design-token engines.

### 2.2 Namespace Formatter

Add a global `"prefix": "ds"` to every platform so CSS outputs become `--ds-color-bg-primary`, TS exports
`const dsColorBgPrimary`, and Kotlin objects `DsColorBgPrimary`.

### 2.3 Custom Compose Formatter

Register the community compose/object formatter to emit a full `Theme.kt` that Material 3 consumes:

```javascript
StyleDictionary.registerFormat(require('./formats/compose-object'));
```

The formatter wraps colours, typography and shape tokens under `package ds.theme`.

## 3. Runtime Consumption Rules

### 3.1 Web (Qwik City)

- ✅ **Import `tokens.css` once**—never inline variables in components
- ✅ **Activate Qwik's image-optimisation** and add `prefetch="viewport"` to links; the CSS variables remain intact
  when chunks are code-split

### 3.2 React Native 0.80

- ✅ **Enable Hermes** and `newArchEnabled=true`; Metro deduplicates the PNPM symlink for `@tokens/ts`, avoiding
  duplicate bundle IDs

### 3.3 Compose Multiplatform

- ✅ **Reference the generated `Theme.kt`** in every `MaterialTheme {}` call; do not copy tokens into Android
  XML—duplicate sources break parity

### 3.4 Tauri 2

- ✅ **Keep `distDir` pointing to `apps/web/dist`** and leave `<meta CSP>` empty; Tauri injects a strict CSP with
  script hashes, preventing clashes with Qwik's hydration JS

## 4. Storybook Rules (Two Builders, One Portal)

| Builder                  | Port | Config Key                       |
| ------------------------ | ---- | -------------------------------- |
| **Qwik (Vite)**          | 6006 | `framework: "@storybook/qwik"`   |
| **React-Native (Metro)** | 7007 | `@storybook/react-native-server` |

Publish both to `/storybook-static/web` and `/storybook-static/rn` and aggregate them via Composition in a root
Storybook instance. This eliminates global webpack/Metro clashes noted in multi-builder setups.

Add `storybook-design-token` with `preserveCSSVars: true` so live theme switching still shows `--ds-*` variables
instead of hard-baked values.

## 5. Nx & CI Guard-Rails

1. **Module-boundaries ESLint** (`@nx/enforce-module-boundaries`) blocks a web lib from importing mobile tokens and
   vice-versa.
2. **Token-drift test**—run `style-dictionary build --dry-run` and fail if `git diff` is non-empty.
3. **Storybook integrity**—execute `sb typecheck && sb test` for each builder to catch prop-type or interaction
   mismaps.

## 6. Checklist for Every Export

1. **Prefix audit**: all semantic tokens start with `ds-`.
2. **No spaces/slashes** in token names.
3. **Type & unit check**: hex colours, unitless numbers.
4. **Run Style Dictionary build**; commit generated artefacts.
5. **Nx lint**—no boundary violations.
6. **Storybook builds** (web, rn) start without port collision.
7. **CI passes** token-drift, visual-diff, size budgets.

## Contract Benefits

By respecting these contract rules—prefixed tokens, platform-scoped outputs, builder isolation and automated boundary
checks—Penpot becomes a safe single point of entry, Style Dictionary a deterministic transformer, and every runtime
(web, native, desktop, docs) remains collision-free, reproducible and perfectly in sync.

```typescript
// scripts/validate-token-contract.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface ContractValidation {
  prefixCompliance: boolean;
  namingCompliance: boolean;
  structureCompliance: boolean;
  typeCompliance: boolean;
  violations: string[];
}

export function validateTokenContract(tokensPath: string): ContractValidation {
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));
  const violations: string[] = [];

  // 1. Validate ds- prefix
  const paths = getAllTokenPaths(tokens);
  const unprefixedTokens = paths.filter(path => !path.startsWith('ds-'));
  if (unprefixedTokens.length > 0) {
    violations.push(`Unprefixed tokens: ${unprefixedTokens.join(', ')}`);
  }

  // 2. Validate kebab-case naming
  const invalidNames = paths.filter(path => /[A-Z]|[[:space:]]|\//.test(path));
  if (invalidNames.length > 0) {
    violations.push(`Invalid naming: ${invalidNames.join(', ')}`);
  }

  // 3. Validate DTCG structure
  if (!hasValidDTCGStructure(tokens)) {
    violations.push('Invalid DTCG hierarchy structure');
  }

  // 4. Validate types and units
  const typeViolations = validateTypesAndUnits(tokens);
  violations.push(...typeViolations);

  return {
    prefixCompliance: unprefixedTokens.length === 0,
    namingCompliance: invalidNames.length === 0,
    structureCompliance: hasValidDTCGStructure(tokens),
    typeCompliance: typeViolations.length === 0,
    violations,
  };
}
```

### 7.2 Pre-Commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

# Validate token contract before any commit
if [ -f "tokens.json" ]; then
  echo "🔍 Validating token contract..."

  node scripts/validate-token-contract.js tokens.json

  if [ $? -ne 0 ]; then
    echo "❌ Token contract validation failed"
    echo "Please fix token naming and structure issues before committing"
    exit 1
  fi

  echo "✅ Token contract validation passed"
fi
```

## 8. Benefits of Contract Compliance

### 8.1 Guaranteed Collision-Free Operation

By following these contract rules:

- ✅ **Prefixed tokens** eliminate Tailwind/vendor conflicts
- ✅ **Platform-scoped outputs** prevent duplicate-name collisions
- ✅ **Builder isolation** removes webpack/Metro clashes
- ✅ **Automated boundary checks** prevent architectural drift

### 8.2 Predictable Cross-Platform Behavior

- ✅ **Single source of truth** (Penpot) with verified export
- ✅ **Deterministic transformation** (Style Dictionary)
- ✅ **Runtime consistency** across web, native, desktop, docs
- ✅ **Automated validation** prevents manual patch-ups

### 8.3 Developer Experience Excellence

- ✅ **One-command setup** with contract validation
- ✅ **Real-time feedback** on contract violations
- ✅ **Safe refactoring** with automated boundary enforcement
- ✅ **Confidence in changes** through comprehensive CI/CD checks

## Conclusion

By respecting these contract rules—prefixed tokens, platform-scoped outputs, builder isolation, and automated
boundary checks—Penpot becomes a safe single point of entry, Style Dictionary a deterministic transformer, and every
runtime (web, native, desktop, docs) remains collision-free, reproducible, and perfectly in sync.

**The token contract is the foundation of the n00plicate design system's reliability and scalability.**
