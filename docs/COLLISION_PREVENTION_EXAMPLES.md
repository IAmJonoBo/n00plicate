# Collision Prevention Implementation Examples

**Version**: 2.2.0\
**Last Updated**: June 2025\
**Purpose**: Critical configuration examples for preventing downstream tooling conflicts

> **⚠️ Critical**: This document addresses specific warnings from Specify, Locofy FAQ, and Supernova documentation.\
> These configurations prevent token name clashes, Metro duplication, and Storybook port conflicts.

## Overview

This document provides implementation examples for the three critical collision prevention issues identified
in downstream tooling documentation:

1. **Token-name clashes** (Specify warns about Tailwind conflicts)
2. **Metro bundle duplication** (Locofy FAQ documents workspace lib naming conflicts)
3. **Storybook port conflicts** (Supernova docs note React Native vs Vite builder conflicts)

## 1. Token-Name Clashes (Specify Warning Compliance)

### Problem Statement

Specify documentation warns that un-namespaced design token CSS variables will collide with Tailwind utility
classes, causing runtime CSS conflicts and unpredictable styling behavior.

### n00plicate Solution

All design tokens use the `ds-` prefix to guarantee collision-free integration:

```css
/* ✅ Specify-compliant: No conflicts with Tailwind classes */
:root {
  --ds-color-primary: #007bff; /* No conflict with .text-primary */
  --ds-color-secondary: #6c757d; /* No conflict with .text-secondary */
  --ds-spacing-xs: 0.25rem; /* No conflict with .p-1, .m-1 */
  --ds-spacing-sm: 0.5rem; /* No conflict with .p-2, .m-2 */
  --ds-spacing-md: 1rem; /* No conflict with .p-4, .m-4 */
  --ds-spacing-lg: 1.5rem; /* No conflict with .p-6, .m-6 */
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js - Specify-compliant configuration
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,qwik}'],
  safelist: [
    {
      // Explicitly allow all ds- prefixed CSS variables
      pattern: /^ds-/,
      variants: ['hover', 'focus', 'active', 'disabled'],
    },
  ],
  theme: {
    extend: {
      colors: {
        // Map Tailwind utilities to ds- prefixed tokens
        primary: {
          50: 'var(--ds-color-primary-50)',
          100: 'var(--ds-color-primary-100)',
          500: 'var(--ds-color-primary-500)',
          900: 'var(--ds-color-primary-900)',
        },
        secondary: {
          50: 'var(--ds-color-secondary-50)',
          500: 'var(--ds-color-secondary-500)',
          900: 'var(--ds-color-secondary-900)',
        },
      },
      spacing: {
        // Map Tailwind spacing to ds- prefixed tokens
        xs: 'var(--ds-spacing-xs)',
        sm: 'var(--ds-spacing-sm)',
        md: 'var(--ds-spacing-md)',
        lg: 'var(--ds-spacing-lg)',
        xl: 'var(--ds-spacing-xl)',
      },
      typography: {
        // Map Tailwind typography to ds- prefixed tokens
        'heading-1': {
          fontSize: 'var(--ds-typography-heading-1-size)',
          lineHeight: 'var(--ds-typography-heading-1-line-height)',
          fontWeight: 'var(--ds-typography-heading-1-weight)',
        },
      },
    },
  },
};
```

### Usage Examples

```html
<!-- ✅ Works: No conflicts between Tailwind utilities and ds- tokens -->
<div class="text-primary p-md bg-secondary-50">
  <!-- Tailwind: .text-primary uses var(--ds-color-primary-500) -->
  <!-- Tailwind: .p-md uses var(--ds-spacing-md) -->
  <!-- Tailwind: .bg-secondary-50 uses var(--ds-color-secondary-50) -->
  Content with collision-free styling
</div>

<!-- ✅ Works: Direct CSS variable usage -->
<div style="color: var(--ds-color-primary); padding: var(--ds-spacing-md);">
  Direct token usage without conflicts
</div>
```

## 2. Metro Bundle Duplication (Locofy FAQ Compliance)

### Problem Statement

Locofy FAQ documents that React Native Metro bundler will create duplicate packages if package.json name
fields collide with workspace library names, leading to increased bundle size and potential runtime conflicts.

### n00plicate Solution

All packages use scoped naming to prevent Metro workspace library conflicts:

```json
// packages/design-tokens/package.json - Locofy FAQ compliant
{
  "name": "@n00plicate/design-tokens", // ✅ Scoped name prevents duplication
  "version": "1.0.0",
  "description": "Design tokens for n00plicate design system",
  "main": "libs/tokens/js/tokens.js",
  "types": "libs/tokens/ts/tokens.d.ts",
  "exports": {
    ".": {
      "types": "./libs/tokens/ts/tokens.d.ts",
      "default": "./libs/tokens/js/tokens.js"
    },
    "./css": "./libs/tokens/css/tokens.css",
    "./scss": "./libs/tokens/scss/tokens.scss",
    "./react-native": "./libs/tokens/react-native/theme.ts",
    "./compose": "./libs/tokens/compose/Theme.kt"
  },
  "files": ["libs/tokens/"],
  "repository": {
    "type": "git",
    "url": "https://github.com/IAmJonoBo/n00plicate.git",
    "directory": "packages/design-tokens"
  }
}
```

### Metro Configuration

```javascript
// metro.config.js - Locofy FAQ compliant Metro setup
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Prevent Metro from bundling duplicate packages per Locofy FAQ
config.resolver.platforms = ['native', 'ios', 'android', 'web'];

// Explicit alias to prevent duplication
config.resolver.alias = {
  // Ensure @n00plicate/design-tokens resolves to single source
  '@n00plicate/design-tokens': path.resolve(__dirname, 'packages/design-tokens'),
  // Add other scoped packages as needed
  '@n00plicate/shared-utils': path.resolve(__dirname, 'packages/shared-utils'),
  '@n00plicate/design-system': path.resolve(__dirname, 'packages/design-system'),
};

// Enable package deduplication features
config.resolver.enableGlobalPackages = true;

// Dedupe common packages that might be duplicated
config.resolver.dedupe = ['react', 'react-native', '@n00plicate/design-tokens'];

// Watch for changes in workspace packages
config.watchFolders = [
  path.resolve(__dirname, 'packages/design-tokens'),
  path.resolve(__dirname, 'packages/shared-utils'),
  path.resolve(__dirname, 'packages/design-system'),
];

module.exports = config;
```

### Package Import Examples

```typescript
// React Native app - Locofy FAQ compliant imports
import { dsColors, dsSpacing } from '@n00plicate/design-tokens'; // ✅ Scoped import
import { dsTheme } from '@n00plicate/design-tokens/react-native'; // ✅ Platform-specific

// Component usage
const styles = StyleSheet.create({
  container: {
    backgroundColor: dsColors.primary500, // ✅ No duplication
    padding: dsSpacing.md, // ✅ No duplication
  },
  text: {
    color: dsColors.textPrimary, // ✅ No duplication
  },
});
```

### Validation Script

```bash
#!/bin/bash
# validate-metro-compliance.sh - Locofy FAQ compliance check

echo "Validating Metro package naming compliance..."

# Check all packages use scoped names
for pkg in packages/*/package.json; do
  name=$(jq -r '.name' "$pkg")
  if [[ ! "$name" =~ ^@.+/.+ ]]; then
    echo "❌ Error: $pkg uses unscoped name '$name'"
    echo "   Solution: Use @n00plicate/package-name format per Locofy FAQ"
    exit 1
  else
    echo "✅ $pkg uses scoped name: $name"
  fi
done

echo "✅ All packages use Locofy FAQ compliant scoped naming"
```

## 3. Storybook Port Conflicts (Supernova Issue Prevention)

### Problem Statement

Supernova documentation notes that Storybook's React Native builder defaults to port 7007 while Vite builder
defaults to port 6006, causing development machine port conflicts when running multiple Storybook instances.

### n00plicate Solution

Fixed port assignment prevents all Supernova-documented port conflicts:

```javascript
// .storybook/main.js - Web Storybook (Supernova-safe)
export default {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|qwik)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-design-tokens',
  ],
  framework: {
    name: '@storybook/qwik-vite',
    options: {},
  },
  viteFinal: config => {
    // Fixed port to prevent Supernova-documented conflicts
    config.server = config.server || {};
    config.server.port = 6006; // Vite builder default (no conflict)
    return config;
  },
  docs: {
    autodocs: 'tag',
  },
};
```

```javascript
// .storybook/main.mobile.js - Mobile Storybook (Supernova-safe)
export default {
  stories: ['../src/**/*.mobile.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-react-native-web'],
  framework: {
    name: '@storybook/react-native',
    options: {},
  },
  core: {
    builder: '@storybook/builder-react-native',
  },
  // Fixed port to prevent Supernova-documented conflicts
  server: {
    port: 7007, // React Native builder default (no conflict)
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};
```

```javascript
// .storybook/main.desktop.js - Desktop Storybook (Supernova-safe)
export default {
  stories: ['../src/**/*.desktop.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-design-tokens',
  ],
  framework: {
    name: '@storybook/vite',
    options: {},
  },
  viteFinal: config => {
    // Custom port to prevent any conflicts
    config.server = config.server || {};
    config.server.port = 6008; // Custom assignment (prevents conflicts)
    return config;
  },
  docs: {
    autodocs: 'tag',
  },
};
```

### Development Commands

```bash
# Supernova-compliant Storybook commands (no port conflicts)
pnpm nx run design-system:storybook          # Port 6006 (Web/Vite default)
pnpm nx run design-system:storybook:mobile   # Port 7007 (React Native default)
pnpm nx run design-system:storybook:desktop  # Port 6008 (Custom, no conflicts)

# All three can run simultaneously without conflicts
pnpm nx run design-system:storybook &
pnpm nx run design-system:storybook:mobile &
pnpm nx run design-system:storybook:desktop &
wait

# Production builds (no port dependencies)
pnpm nx run design-system:build-storybook
pnpm nx run design-system:build-storybook:mobile
pnpm nx run design-system:build-storybook:desktop
```

### Package.json Scripts

```json
{
  "scripts": {
    "storybook:web": "nx run design-system:storybook",
    "storybook:mobile": "nx run design-system:storybook:mobile",
    "storybook:desktop": "nx run design-system:storybook:desktop",
    "storybook:all": "concurrently \"npm run storybook:web\" \"npm run storybook:mobile\" \"npm run storybook:desktop\"",
    "storybook:build": "nx run design-system:build-storybook",
    "storybook:build:mobile": "nx run design-system:build-storybook:mobile",
    "storybook:build:desktop": "nx run design-system:build-storybook:desktop",
    "storybook:build:all": "nx run-many -t build-storybook --parallel=3"
  }
}
```

### Port Validation Script

```bash
#!/bin/bash
# validate-storybook-ports.sh - Supernova compliance check

echo "Validating Storybook port assignments..."

# Check Web Storybook uses port 6006
if grep -q "port.*6006" .storybook/main.js; then
  echo "✅ Web Storybook correctly configured for port 6006"
else
  echo "❌ Web Storybook should use port 6006 (Vite default)"
  exit 1
fi

# Check Mobile Storybook uses port 7007
if grep -q "port.*7007" .storybook/main.mobile.js; then
  echo "✅ Mobile Storybook correctly configured for port 7007"
else
  echo "❌ Mobile Storybook should use port 7007 (React Native default)"
  exit 1
fi

# Check Desktop Storybook uses port 6008
if grep -q "port.*6008" .storybook/main.desktop.js; then
  echo "✅ Desktop Storybook correctly configured for port 6008"
else
  echo "❌ Desktop Storybook should use port 6008 (custom, no conflicts)"
  exit 1
fi

echo "✅ All Storybook ports comply with Supernova best practices"
```

## CI/CD Validation

### GitHub Actions Workflow

```yaml
# .github/workflows/collision-prevention.yml
name: Collision Prevention Validation

on:
  pull_request:
    paths:
      - 'packages/design-tokens/**'
      - '.storybook/**'
      - 'metro.config.js'
      - 'tailwind.config.js'

jobs:
  validate-collision-prevention:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Validate Specify Compliance (Token Naming)
        run: |
          echo "Checking for Specify-compliant token naming..."
          # Ensure all CSS tokens use --ds-* prefix
          if grep -r "^[[:space:]]*--[^d][^s]-" packages/design-tokens/libs/tokens/css/; then
            echo "❌ Found CSS tokens without ds- prefix (Specify conflict risk)"
            exit 1
          fi
          echo "✅ All CSS tokens use ds- prefix (Specify compliant)"

      - name: Validate Locofy FAQ Compliance (Metro Naming)
        run: |
          echo "Checking for Locofy FAQ compliant package naming..."
          # Check design-tokens package uses scoped name
          if ! grep -q '"name": "@n00plicate/design-tokens"' packages/design-tokens/package.json; then
            echo "❌ design-tokens package should use @n00plicate/design-tokens (Metro duplication risk)"
            exit 1
          fi

          # Check all packages use scoped names
          for pkg in packages/*/package.json; do
            name=$(jq -r '.name' "$pkg")
            if [[ ! "$name" =~ ^@.+/.+ ]]; then
              echo "❌ $pkg uses unscoped name '$name' (Metro duplication risk per Locofy FAQ)"
              exit 1
            fi
          done
          echo "✅ All packages use scoped names (Locofy FAQ compliant)"

      - name: Validate Supernova Compliance (Storybook Ports)
        run: |
          echo "Checking for Supernova-compliant Storybook port assignments..."
          # Check Web Storybook port
          if ! grep -q "port.*6006" .storybook/main.js; then
            echo "❌ Web Storybook should use port 6006 (Supernova best practice)"
            exit 1
          fi

          # Check Mobile Storybook port
          if ! grep -q "port.*7007" .storybook/main.mobile.js; then
            echo "❌ Mobile Storybook should use port 7007 (Supernova best practice)"
            exit 1
          fi

          # Check Desktop Storybook port
          if ! grep -q "port.*6008" .storybook/main.desktop.js; then
            echo "❌ Desktop Storybook should use port 6008 (Supernova best practice)"
            exit 1
          fi
          echo "✅ All Storybook ports comply with Supernova recommendations"

      - name: Test Storybook Builds
        run: |
          echo "Testing all Storybook builds for conflicts..."
          pnpm nx run design-system:build-storybook
          pnpm nx run design-system:build-storybook:mobile
          pnpm nx run design-system:build-storybook:desktop
          echo "✅ All Storybook builds successful"

  validate-runtime-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Test Tailwind Integration
        run: |
          echo "Testing Tailwind CSS integration with ds- tokens..."
          # Build CSS and check for conflicts
          pnpm nx run design-tokens:build-all

          # Ensure Tailwind config is valid
          npx tailwindcss build --config tailwind.config.js --output test-output.css

          # Check generated CSS for proper token usage
          if grep -q "var(--ds-" test-output.css; then
            echo "✅ Tailwind correctly uses ds- prefixed tokens"
          else
            echo "❌ Tailwind integration may have issues"
            exit 1
          fi

      - name: Test Metro Configuration
        run: |
          echo "Testing Metro configuration for bundle deduplication..."
          # Validate Metro config exists and is properly configured
          if [[ -f "metro.config.js" ]]; then
            # Check for dedupe configuration
            if grep -q "dedupe.*@n00plicate/design-tokens" metro.config.js; then
              echo "✅ Metro config includes deduplication settings"
            else
              echo "❌ Metro config missing deduplication settings"
              exit 1
            fi
          fi
```

## Summary

These implementations address all three critical collision prevention issues documented in the downstream
tooling ecosystem:

1. **✅ Specify Warning Resolved**: `ds-` prefix prevents all Tailwind utility class conflicts
2. **✅ Locofy FAQ Issue Resolved**: Scoped package naming prevents Metro bundle duplication
3. **✅ Supernova Issue Resolved**: Fixed port assignment prevents Storybook builder conflicts

The configurations provided here should be used as the canonical reference for implementing collision-free
design token integration across all supported platforms.
