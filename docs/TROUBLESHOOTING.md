# 🛠️ Troubleshooting Guide

Common issues and solutions for the n00plicate design system monorepo.

> Applies to the n00plicate 2.0 toolchain (Node 22.20 / pnpm 10.18.2). If you are working from older
> instructions, cross-check the latest references in [`docs/README.md`](./README.md).

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Build Problems](#build-problems)
- [Development Server Issues](#development-server-issues)
- [Design Token Problems](#design-token-problems)
- [Storybook Issues](#storybook-issues)
- [Testing Problems](#testing-problems)
- [Git and Version Control](#git-and-version-control)
- [Performance Issues](#performance-issues)
- [TypeScript Errors](#typescript-errors)
- [macOS Specific Issues](#macos-specific-issues)

## Installation Issues

### `pnpm install` Fails

**Symptoms:**

- Package installation errors
- Dependency resolution failures
- Network timeouts

**Solutions:**

1. **Clear package manager cache:**

   ```bash
   pnpm store prune
   pnpm install --frozen-lockfile
   ```

2. **Check Node.js version:**

   ```bash
   node --version  # Should be 18.0.0 or later
   pnpm --version  # Should be 10.18.2 or later
   ```

3. **Reset workspace:**

   ```bash
   rm -rf node_modules
   rm -rf packages/*/node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

4. **Network issues:**

   ```bash
   # Use different registry
   pnpm config set registry https://registry.npmmirror.com/

   # Or use corporate proxy
   pnpm config set proxy http://proxy.company.com:8080
   ```

### Workspace Dependencies Not Found

**Symptoms:**

- `Cannot resolve module '@n00plicate/design-tokens'`
- Import errors between packages

**Solutions:**

1. **Rebuild all packages:**

   ```bash
   pnpm build
   ```

2. **Check workspace configuration:**

   ```bash
   # Verify pnpm-workspace.yaml
   cat pnpm-workspace.yaml

   # Should contain:
   # packages:
   # - 'packages/*'
   ```

3. **Verify package.json dependencies:**

   ```bash
   # Check if workspace dependencies are correctly defined
   grep -r "workspace:" packages/*/package.json
   ```

## Build Problems

### Build Fails with "Cannot find module"

**Symptoms:**

- TypeScript compilation errors
- Missing module errors during build

**Solutions:**

1. **Clean and rebuild:**

   ```bash
   pnpm clean:all
   pnpm build
   ```

2. **Check TypeScript configuration:**

   ```bash
   # Verify tsconfig.json paths
   cat tsconfig.json | grep -A 10 "paths"
   ```

3. **Rebuild dependencies in order:**

   ```bash
   pnpm run build:design-tokens
   pnpm --filter @n00plicate/shared-utils run build
   pnpm --filter @n00plicate/design-system run build
   ```

### Nx Build Cache Issues

**Symptoms:**

- Builds not reflecting changes
- Inconsistent build outputs

**Solutions:**

1. **Clear Nx cache:**

   ```bash
   # To reset the pnpm state and node_modules, use tests such as:
   pnpm store prune
   rm -rf node_modules
   ```

2. **Check cache configuration:**

   ```bash
   # Verify nx.json cache settings
   cat nx.json | grep -A 5 "cacheDirectory"
   ```

3. **Force rebuild without cache:**

   ```bash
   pnpm build
   ```

### Style Dictionary Build Errors

**Symptoms:**

- Token generation fails
- CSS variables not generated

**Solutions:**

1. **Check token JSON syntax:**

   ```bash
   # Validate JSON files
   ```

find packages/design-tokens/tokens -name "\*.json" -exec node -e "JSON.parse(require('fs').readFileSync('{}', 'utf8'))"
\;

````bash
2. **Rebuild tokens explicitly:**

```bash
cd packages/design-tokens
pnpm build:tokens
````

1. **Check Style Dictionary config:**

   ```bash

### Verify configuration

   cat packages/design-tokens/style-dictionary.config.js

   ```

# Development Server Issues

# Port Already in Use

**Symptoms:**

- `Error: listen EADDRINUSE: address already in use :::3000`
- Development server won't start

**Solutions:**

1. **Find and kill process:**

   ```bash
### Find process using port 3000
   lsof -ti:3000

### Kill the process
   kill -9 $(lsof -ti:3000)
   ```

2. **Use different port:**

   ```bash

### For Storybook

   pnpm storybook -- --port 6007

### For dev server

   PORT=3001 pnpm dev

   ```

3. **Check for background processes:**

   ```bash
### List Node.js processes
   ps aux | grep node
   ```

# Hot Reload Not Working

**Symptoms:**

- Changes not reflected in browser
- Manual refresh required

**Solutions:**

1. **Check file watchers limit (Linux/macOS):**

   ```bash

### Increase file watchers

   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p

   ```

2. **Restart development server:**

   ```bash
### Kill and restart
   pnpm dev
   ```

3. **Check firewall/antivirus:**
   - Disable firewall temporarily
   - Add Node.js to antivirus exceptions

# Design Token Problems

# Tokens Not Updating

**Symptoms:**

- CSS variables show old values
- Component styles not reflecting token changes
- `getToken()` returns stale values

**Solutions:**

1. **Rebuild token pipeline:**

   ```bash
   cd packages/design-tokens
   pnpm run clean && pnpm run build
   ```

2. **Check token imports:**

   ```typescript
   // Verify token access is working
   import { getToken } from '@n00plicate/design-tokens';
   console.log('Primary color:', getToken('color.primary.500'));
   ```

3. **Clear build cache:**

   ```bash

### Clear all caches (legacy Nx reset removed)

### pnpm nx reset  # Legacy: Nx reset example; Nx removed from toolchain

   pnpm store prune
   rm -rf packages/design-tokens/dist
   pnpm run build:tokens

   ```

4. **Verify token file changes:**

   ```bash
### Check if token files have been modified
   git status tokens/
   pnpm test  # Run validation tests
   ```

# Token Not Found Errors

**Symptoms:**

- `getToken()` returns empty string or fallback value
- Console warnings about missing tokens
- CSS variables showing as `var(--undefined)`

**Solutions:**

1. **Check token path:**

   ```typescript
   // Debug token availability
   import { getTokensByPattern } from '@n00plicate/design-tokens';

   // List all available tokens
   const allTokens = getTokensByPattern('*');
   console.table(allTokens);

   // Check specific category
   const colors = getTokensByPattern('color.*');
   console.log(
     'Available colors:',
     colors.map(t => t.path)
   );
   ```

2. **Verify token structure:**

   ```bash

### Check token files exist

   ls -la packages/design-tokens/tokens/

### Validate token structure

   pnpm test

   ```

3. **Use correct path format:**

   ```typescript
   // ✅ Correct: dot-separated path
   getToken('color.primary.500');

   // ❌ Wrong: slash or other separators
   getToken('color/primary/500');
   getToken('color-primary-500');
   ```

# CSS Variables Not Loading

**Symptoms:**

- Styles appear unstyled
- CSS custom properties showing as `var(--undefined)`
- Browser dev tools show missing CSS variables

**Solutions:**

1. **Check CSS import order:**

   ```css
   /* ✅ Import tokens before using them */
   @import '@n00plicate/design-tokens/css';

   .component {
     color: var(--color-primary-500);
   }
   ```

2. **Verify CSS generation:**

   ```bash

### Check if CSS file exists and has content

   ls -la packages/design-tokens/dist/css/
   head -20 packages/design-tokens/dist/css/tokens.css

   ```

3. **Browser compatibility:**

   ```css
   /* Provide fallbacks for older browsers */
   .component {
     color: #007bff; /* fallback */
     color: var(--color-primary-500, #007bff);
   }
   ```

4. **Check build process:**

   ```bash

### Ensure Style Dictionary build succeeds

   cd packages/design-tokens
   pnpm run build:tokens --verbose

   ```

# Token Validation Failures

**Symptoms:**

- Tests failing with validation errors
- Build process showing token structure warnings
- Missing `$value` or `$type` properties

**Solutions:**

1. **Run validation manually:**

   ```typescript
   import { validateTokens } from '@n00plicate/design-tokens';

   const result = validateTokens();
   if (!result.isValid) {
     console.error('Validation errors:', result.errors);
     console.warn('Validation warnings:', result.warnings);
   }
   ```

2. **Fix W3C DTCG format:**

   ```json
   // ✅ Correct format
   {
     "color": {
       "primary": {
         "500": {
           "$value": "#007bff",
           "$type": "color",
           "$description": "Primary brand color"
         }
       }
     }
   }

   // ❌ Wrong format
   {
     "color": {
       "primary": {
         "500": "#007bff"
       }
     }
   }
   ```

3. **Check token file syntax:**

   ```bash

### Validate JSON syntax

   pnpm exec jsonlint tokens/base.json
   pnpm exec jsonlint tokens/semantic.json

   ```

# Pattern Matching Issues

**Symptoms:**

- `getTokensByPattern()` returns empty array
- Wildcard patterns not working as expected
- Pattern matching too restrictive or too broad

**Solutions:**

1. **Test pattern matching:**

   ```typescript
   import { matchesPattern } from '@n00plicate/design-tokens';

   // Test specific patterns
   console.log(matchesPattern('color.primary.500', 'color.primary.*')); // true
   console.log(matchesPattern('color.primary.500', 'color.*')); // false
   console.log(matchesPattern('anything', '*')); // true
   ```

2. **Use correct pattern syntax:**

   ```typescript
   // ✅ Correct patterns
   getTokensByPattern('color.primary.*'); // All primary colors
   getTokensByPattern('spacing.*'); // All spacing tokens
   getTokensByPattern('*'); // All tokens

   // ❌ Wrong patterns
   getTokensByPattern('color.primary.**'); // Double asterisk not supported
   getTokensByPattern('color.*.500'); // Middle wildcards not supported
   ```

3. **Debug pattern results:**

   ```typescript
   const pattern = 'color.primary.*';
   const results = getTokensByPattern(pattern);
   console.log(
     `Pattern "${pattern}" found ${results.length} tokens:`,
     results.map(r => r.path)
   );
   ```

# Build Performance Issues

**Symptoms:**

- Slow token compilation
- Style Dictionary taking too long
- Watch mode not responding

**Solutions:**

1. **Optimize token structure:**

   ```bash

### Check for deeply nested or large token files

   find tokens/ -name "*.json" -exec wc -l {} \;

   ```

2. **Use incremental builds:**

   ```bash
### Use watch mode for development
   pnpm run watch

### Build only what changed
   pnpm -w -r build
   ```

3. **Profile build performance:**

   ```bash

### Run with timing information

   time pnpm run build:tokens

### Use verbose logging

   pnpm run build:tokens --verbose

   ```

# Integration Issues

**Symptoms:**

- Tokens not available in consuming applications
- Import/export errors
- Module resolution failures

**Solutions:**

1. **Check package exports:**

   ```json
   // Verify package.json exports are correct
   {
     "exports": {
       ".": "./dist/index.js",
       "./css": "./dist/css/tokens.css",
       "./json": "./dist/json/tokens.json"
     }
   }
   ```

2. **Verify build outputs:**

   ```bash

### Check all expected files exist

   ls -la packages/design-tokens/dist/

   ```

3. **Test import paths:**

   ```typescript
   // Test different import methods
   import { getToken } from '@n00plicate/design-tokens';
   import '@n00plicate/design-tokens/css';
   import tokens from '@n00plicate/design-tokens/json';
   ```

# Storybook Issues

# Storybook Won't Start

**Symptoms:**

- Storybook build fails
- White screen when accessing Storybook

**Solutions:**

1. **Clear Storybook cache:**

   ```bash
   rm -rf node_modules/.cache/storybook
   pnpm build-storybook
   ```

2. **Check Storybook configuration:**

   ```bash

### Verify .storybook/main.ts

   cat packages/design-system/.storybook/main.ts

   ```

3. **Update Storybook:**

   ```bash
   pnpm storybook upgrade
   ```

# Stories Not Loading

**Symptoms:**

- Components not appearing in Storybook
- Empty sidebar in Storybook

**Solutions:**

1. **Check story file patterns:**

   ```javascript
   // .storybook/main.ts should include:
   stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'];
   ```

2. **Verify story file naming:**

   ```bash

### Stories should follow pattern

   find packages/design-system/src -name "*.stories.*"

   ```

3. **Check story exports:**

   ```typescript
   // Stories must have default export
   export default {
     title: 'Components/Button',
     component: Button,
   };
   ```

# Testing Problems

# Tests Fail to Run

**Symptoms:**

- Vitest/Jest crashes on startup
- Test files not found

**Solutions:**

1. **Check test configuration:**

   ```bash

### Verify vitest.config.ts

   cat packages/*/vitest.config.ts

   ```

2. **Clear test cache:**

   ```bash
   pnpm -w -r test --clearCache
   ```

3. **Run tests with verbose output:**

   ```bash
   pnpm test --reporter=verbose
   ```

# Visual Tests Failing

**Symptoms:**

- Loki tests show differences
- Visual regression failures

**Solutions:**

1. **Update baselines after intentional changes:**

   ```bash
   pnpm visual-test --update
   ```

2. **Check rendering consistency:**

   ```bash

### Run tests in Docker for consistency

   docker run --rm -v $(pwd):/app -w /app node:18 pnpm visual-test

   ```

3. **Compare specific stories:**

   ```bash
   pnpm loki test --stories "Button.*"
   ```

# Git and Version Control

# Pre-commit Hooks Failing

**Symptoms:**

- Git commits blocked by Husky hooks
- Linting errors prevent commits

**Solutions:**

1. **Run hooks manually:**

   ```bash

### Check what's failing

   .husky/pre-commit

   ```

2. **Fix linting issues:**

   ```bash
   pnpm lint --fix
   pnpm format
   ```

3. **Skip hooks temporarily (not recommended):**

   ```bash
   git commit --no-verify -m "temporary commit"
   ```

# Git Hooks Not Running

**Symptoms:**

- Husky hooks don't execute
- No pre-commit validation

**Solutions:**

1. **Reinstall Husky:**

   ```bash
   pnpm husky install
   chmod +x .husky/*
   ```

2. **Check hook files:**

   ```bash

### Verify hook files exist and are executable

   ls -la .husky/

   ```

3. **Check Git configuration:**

   ```bash
### Verify hooks path
   git config core.hooksPath
   ```

# Performance Issues

# Slow Build Times

**Symptoms:**

- Builds take excessively long
- Development feedback loop slow

**Solutions:**

1. **Use Nx affected builds:**

   ```bash

### Only build what changed

   pnpm -w -r build

   ```

2. **Enable remote caching:**

   ```bash
### Check Nx Cloud configuration
   cat nx.json | grep "nxCloudId"
   ```

3. **Parallel builds:**

   ```bash

### Increase parallel processes

   pnpm build -- --parallel=4

   ```

# Large Bundle Sizes

**Symptoms:**

- Slow page loads
- Large JavaScript bundles

**Solutions:**

1. **Analyze bundle size:**

   ```bash
   pnpm --filter @n00plicate/design-system run analyze
   ```

2. **Check for duplicate dependencies:**

   ```bash
   pnpm ls --depth=0
   ```

3. **Tree-shake imports:**

   ```typescript
   // Use specific imports
   import { Button } from '@n00plicate/design-system/button';

   // Instead of
   import { Button } from '@n00plicate/design-system';
   ```

# TypeScript Errors

# Type Definition Errors

**Symptoms:**

- `Cannot find module` for local packages
- Missing type definitions

**Solutions:**

1. **Rebuild type definitions:**

   ```bash
   pnpm -w -r build:types
   ```

2. **Check TypeScript paths:**

   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@n00plicate/*": ["packages/*/src"]
       }
     }
   }
   ```

3. **Verify package exports:**

   ```json
   // package.json
   {
     "types": "dist/index.d.ts",
     "main": "dist/index.js"
   }
   ```

# Circular Dependency Errors

**Symptoms:**

- Import/export circular dependency warnings
- Runtime errors about undefined exports

**Solutions:**

1. **Analyze dependency graph:**

   ```bash
   pnpm -w -r list
   ```

2. **Check import patterns:**

   ```bash

### Look for circular imports

   madge --circular packages/*/src

   ```

3. **Refactor problematic imports:**
   - Move shared types to separate files
   - Use dependency injection
   - Create interface files

# macOS Specific Issues

# Apple File System Artifacts

**Symptoms:**

- `.DS_Store` files appearing everywhere
- `._*` hidden files in git

**Solutions:**

1. **Run Apple cleaner:**

   ```bash
### Use built-in cleaner
   pnpm run clean:apple

### Fast path for staged files only
   pnpm run clean:apple:staged

### Verify nothing slipped into git
   pnpm run check:apple

### Or run manually
   node tools/apple-cleaner.js --mode=full
   ```

2. **Check gitignore:**

   ```bash

### Verify Apple patterns are ignored

   grep -A 10 "Apple" .gitignore

   ```

3. **Configure Git globally:**

   ```bash
   echo ".DS_Store" >> ~/.gitignore_global
   git config --global core.excludesfile ~/.gitignore_global
   ```

# Permission Issues

**Symptoms:**

- Permission denied errors
- Cannot write to directories

**Solutions:**

1. **Fix ownership:**

   ```bash
   sudo chown -R $(whoami) /path/to/project
   ```

2. **Reset npm permissions:**

   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

3. **Use local npm prefix:**

   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```

# Getting Help

# Enable Debug Mode

```bash
## ## Enable verbose logging
DEBUG=* pnpm dev

## ### Nx debug mode (legacy)
## ### If you have a debug workflow, set DEBUG env for the underlying process, or run workspace builds with verbose logging.
## ### Example: DEBUG=* pnpm -w -r run build
## ### NOTE: Nx was used historically. Use pnpm workspace filters or bespoke scripts to run affected builds.

## ### Style Dictionary debug
DEBUG=style-dictionary pnpm run build:design-tokens
```

# Collect System Information

```bash
## ### System info script
echo "Node.js: $(node --version)"
echo "pnpm: $(pnpm --version)"
echo "OS: $(uname -a)"
echo "Nx (legacy, if installed): $(command -v nx >/dev/null && nx --version || echo 'Nx not installed')"
echo "Git: $(git --version)"

## ### Package info
pnpm ls --depth=0
```

# Common Log Locations

```bash
## ### Legacy Nx logs (if present):
## ### cat /tmp/nx-*.log

## ### npm logs
npm config get cache
ls ~/.npm/_logs/

## ### System logs (macOS)
tail -f /var/log/system.log
```

# Community Support

- **GitHub Issues**: [Report bugs](https://github.com/IAmJonoBo/n00plicate/issues)
- **Discussions**: [Ask questions](https://github.com/IAmJonoBo/n00plicate/discussions)
- **Documentation**: [Read the docs](https://github.com/IAmJonoBo/n00plicate/blob/main/README.md)

# Emergency Reset

If all else fails, here's the nuclear option:

```bash
## ### Complete workspace reset
git clean -fdx
rm -rf node_modules
rm -rf packages/*/node_modules
rm -rf packages/*/dist
rm -rf .nx
rm pnpm-lock.yaml

## ### Reinstall everything
pnpm install
pnpm build
```

Remember to commit your changes before running the emergency reset!
