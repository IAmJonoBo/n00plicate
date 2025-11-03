# Ignore Patterns Guide

This document outlines the comprehensive ignore patterns implemented across all tools in the n00plicate repository.

## Overview

We've implemented consistent ignore patterns across all tools to:

- **Improve Performance**: Exclude unnecessary files from processing
- **Reduce Noise**: Focus on relevant source code
- **Prevent Conflicts**: Avoid formatting/linting generated files
- **Maintain Consistency**: Use the same patterns across all tools

## Summary of Improvements

After implementing comprehensive ignore patterns across all tools:

- **ESLint**: Successfully excludes problematic files (`metro.config.example.js`, `scripts/validate-token-contract.js`, etc.)
- **Markdownlint**: Reduced processing from 284 files to 72 files (74% reduction) and from 1,193 errors to 69 errors
  (94% reduction)
- **File Processing Efficiency**: Dramatically improved by excluding:
  - macOS metadata files (`._*`, `.DS_Store`)
  - IDE and editor artifacts
  - Generated and temporary files
  - Example and template files
  - OS backup and cache files

## Tool Configuration Files

### 🗂️ Git Ignore (`.gitignore`)

**Purpose**: Prevents files from being tracked by Git

**Key Patterns**:

- Dependencies: `node_modules/`, `.pnpm-store/`, `.yarn/`
- Build outputs: `dist/`, `build/`, `lib/`, `out/`
- Environment files: `.env*` (except examples)
- IDE files: `.vscode/`, `.idea/`
- OS files: `.DS_Store`, `._*`, `Thumbs.db`
- Testing: `coverage/`, `test-results/`
- Temporary: `tmp/`, `*.tmp`, `.cache/`

### 🎨 Prettier Ignore (`.prettierignore`)

**Purpose**: Excludes files from Prettier formatting

**Focus**: Similar to Git ignore but includes additional generated files:

- Lock files: `*-lock.json`, `*.lock`
- TypeScript artifacts: `*.d.ts`, `*.tsbuildinfo`
- Framework builds: `.next/`, `.nuxt/`, `.expo/`

### 📝 dprint Configuration (`dprint.json`)

**Purpose**: Excludes files from dprint formatting (YAML, Markdown, TOML)

**Key Excludes**:

- All JavaScript/TypeScript files (handled by other tools)
- Build and cache directories
- Generated token files
- Framework-specific outputs

### 🔧 ESLint Configuration (`eslint.config.js`)

**Purpose**: Excludes files from ESLint linting

**Comprehensive Patterns**:

- All common build outputs and dependencies
- Mobile development artifacts
- Generated documentation
- Backup and temporary files

### 📊 Biome Configuration (`biome.json`)

**Purpose**: Uses VCS ignore file automatically

**Note**: Biome respects `.gitignore` by default through `vcs.useIgnoreFile: true`

### 📖 Markdownlint Configuration (`config.markdownlint-cli2.jsonc`)

**Purpose**: Excludes files from Markdown linting

**Special Considerations**:

- Excludes `CHANGELOG.md` files (auto-generated)
- Focuses on documentation quality for authored content

## Pattern Categories

### 🏗️ Build & Compilation

```gitignore
dist/
build/
lib/
out/
*.tsbuildinfo
*.buildinfo
*.js.map
*.d.ts.map
```

### 📦 Dependencies & Package Managers

```gitignore
node_modules/
.pnpm-store/
.yarn/
*-lock.json
*.lock
```

### 🧪 Testing & Coverage

```gitignore
coverage/
test-results/
playwright-report/
blob-report/
jest-coverage/
.vitest/
```

### 🎯 Framework Specific

```gitignore
.next/          # Next.js
.nuxt/          # Nuxt.js
.expo/          # Expo/React Native
.nx/            # Nx workspace
storybook-static/ # Storybook builds
```

### 💻 IDE & OS

```gitignore
.vscode/
.idea/
.DS_Store
._*
Thumbs.db
*.swp
*.swo
```

### 🔄 Temporary & Cache

```gitignore
tmp/
temp/
.tmp/
.temp/
.cache/
*.tmp
*.temp
.turbo/
```

### 🎨 Design Tokens (Project Specific)

```gitignore
packages/design-tokens/libs/tokens/
packages/design-tokens/dist/
```

## Best Practices

### ✅ Do

- **Keep patterns consistent** across all configuration files
- **Use specific patterns** rather than overly broad ones
- **Document special cases** (like Changelog exclusions)
- **Test ignore patterns** after updates
- **Review periodically** as the project evolves

### ❌ Don't

- **Ignore source code** that should be tracked
- **Duplicate patterns unnecessarily** across configs
- **Use overly broad patterns** that might hide important files
- **Forget to update** all relevant configs when adding new tools

## Maintenance

### When to Update

1. **Adding new tools** or dependencies
2. **New framework adoption** (e.g., adding Svelte, Vue)
3. **Build process changes** (new output directories)
4. **CI/CD modifications** (new generated files)

### How to Update

1. **Identify the new pattern** that needs to be ignored
2. **Update all relevant config files** maintaining consistency
3. **Test the changes** with formatting/linting commands
4. **Document the reason** for the new pattern

### Verification Commands

```bash
# Verify ESLint (should show no errors for ignored files)
pnpm lint:packages

# Verify markdownlint (currently processes 72 files with 69 legitimate errors)
pnpm lint:md

# Verify dprint formatting
pnpm format:dprint:check

# Verify Prettier
pnpm format:prettier:check

# Verify all formatting
pnpm format:check

# Clean Apple metadata files (run periodically on macOS)
pnpm clean:apple
```

### Current Statistics (as of 2025-06-23)

- **ESLint**: All example files and scripts properly ignored, 0 configuration errors
- **Markdownlint**: 72 files processed (down from 284), 69 legitimate documentation errors
- **File exclusions**: Successfully excluding macOS metadata, IDE files, generated content, and temporary files
- **Apple Cleanup**: Successfully removed all macOS metadata files (`.DS_Store`, `._*` files) using `pnpm clean:apple`

## Troubleshooting

### Issue: Tool processing unwanted files

**Solution**: Check if the file pattern is included in the tool's ignore configuration

### Issue: Important files being ignored

**Solution**: Add specific include patterns or use `!pattern` to unignore

### Issue: Inconsistent behavior across tools

**Solution**: Verify all configs have the same base patterns with tool-specific additions

## Future Considerations

- **Performance monitoring**: Track impact of ignore patterns on build times
- **Tool evolution**: Stay updated with new ignore pattern recommendations
- **Team feedback**: Gather input on patterns that might be missing or too restrictive

---

**Last Updated**: 2025-06-23
**Related Files**: `.gitignore`, `.prettierignore`, `dprint.json`, `eslint.config.js`, `biome.json`, `config.markdownlint-cli2.jsonc`
