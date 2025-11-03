# Collision Prevention Implementation Guide

This document outlines the comprehensive collision-prevention strategies implemented in the n00plicate design token
pipeline to address the three critical issues documented in our design system documentation:

## Overview

The n00plicate design token pipeline implements three key collision-prevention strategies:

1. **Token-name clashes with Tailwind** (Specify Warning Prevention)
2. **Storybook port conflicts** (Supernova Docs Compliance)
3. **Metro duplication** (Locofy FAQ Compliance)

## 1. Token-Name Clash Prevention (Specify Warning)

### Problem

Tailwind CSS uses generic utility class names and CSS custom properties that can conflict with design token names,
leading to style conflicts and unpredictable behavior.

### Solution

All design tokens use the `ds-` prefix to create a collision-safe namespace:

```css
/* ✅ Correct: All tokens use ds- prefix */
:root {
  --ds-color-primary-500: #3b82f6;
  --ds-spacing-medium: 16px;
  --ds-typography-heading-font-size: 24px;
}

.ds-button {
  background-color: var(--ds-color-primary-500);
  padding: var(--ds-spacing-medium);
}
```

```css
/* ❌ Incorrect: Generic names conflict with Tailwind */
:root {
  --color-primary: #3b82f6;
  --spacing-md: 16px;
}

.button {
  /* Conflicts with Tailwind's .button utility */
}
```

### Implementation Files

- **Token Generation**: `packages/design-tokens/style-dictionary.config.js`
- **Token Outputs**: `packages/design-tokens/libs/tokens/css/tokens.css`
- **Example Config**: `tailwind.config.example.ts`

### Validation

The CI/CD pipeline validates token naming compliance:

```bash
# Check for non-ds prefixed tokens
grep -r "^[[:space:]]*--[^d][^s]-" packages/design-tokens/libs/tokens/css/
```

## 2. Storybook Port Conflict Prevention (Supernova Docs)

### Problem

Multiple Storybook instances running simultaneously can conflict on default ports, causing build failures and
development issues.

### Solution

Fixed port assignments for each Storybook instance:

- **Web Storybook**: Port `6006` (Vite builder default)
- **Mobile Storybook**: Port `7007` (React Native default)
- **Desktop Storybook**: Port `6008` (Custom, no conflicts)

### Implementation Files

```typescript
// packages/design-system/.storybook/main.ts
export default {
  viteFinal: async config => {
    config.server = config.server || {};
    config.server.port = 6006; // Web Storybook
    return config;
  },
};

// packages/design-system/.storybook/main.mobile.ts
export default {
  viteFinal: async config => {
    config.server = config.server || {};
    config.server.port = 7007; // Mobile Storybook
    return config;
  },
};

// packages/design-system/.storybook/main.desktop.ts
export default {
  viteFinal: async config => {
    config.server = config.server || {};
    config.server.port = 6008; // Desktop Storybook
    return config;
  },
};
```

### Composition References

The main Storybook config references other instances with correct ports:

```typescript
// packages/design-system/.storybook/main.ts
export default {
  refs: {
    mobile: {
      title: 'Mobile Components',
      url: 'http://localhost:7007',
    },
    desktop: {
      title: 'Desktop Components',
      url: 'http://localhost:6008',
    },
  },
};
```

### Validation

The CI/CD pipeline validates port assignments:

```bash
# Check Storybook port configurations
grep -o "config.server.port = [0-9]*" packages/design-system/.storybook/main.*.ts
```

## 3. Metro Duplication Prevention (Locofy FAQ)

### Problem

Metro bundler can create duplicate package instances when packages are not properly scoped and aliased, leading to
runtime errors and increased bundle size.

### Solution

Implement package scoping and Metro deduplication configuration:

### Package Scoping

All packages use the `@n00plicate/` scope:

```json
{
  "name": "@n00plicate/design-tokens",
  "version": "0.1.0"
}
```

### Metro Configuration

```javascript
// metro.config.example.js
const config = {
  resolver: {
    // Prevent Metro from bundling duplicate packages
    dedupe: [
      'react',
      'react-native',
      '@n00plicate/design-tokens',
      '@n00plicate/shared-utils',
      '@n00plicate/design-system',
    ],

    // Explicit alias to prevent duplication
    alias: {
      '@n00plicate/design-tokens': path.resolve(__dirname, 'packages/design-tokens'),
      '@n00plicate/shared-utils': path.resolve(__dirname, 'packages/shared-utils'),
      '@n00plicate/design-system': path.resolve(__dirname, 'packages/design-system'),
    },

    // Enable package deduplication features
    enableGlobalPackages: true,
  },
};
```

### Implementation Files

- **Package Configuration**: `packages/*/package.json` (all packages use `@n00plicate/` scope)
- **Example Config**: `metro.config.example.js`

### Validation

The CI/CD pipeline validates package scoping:

```bash
# Check package scoping
for package_file in packages/*/package.json; do
  package_name=$(jq -r '.name' "$package_file")
  if [[ ! "$package_name" =~ ^@n00plicate/ ]]; then
    echo "❌ Unscoped package: $package_name"
  fi
done
```

## Runtime Validation

The `packages/shared-utils/src/collision-prevention.ts` module provides runtime validation for all three strategies:

```typescript
import { validateCollisionPrevention } from '@n00plicate/shared-utils/collision-prevention';

const report = validateCollisionPrevention({
  cssTokenPath: 'packages/design-tokens/libs/tokens/css/tokens.css',
  storybookConfigPaths: [
    'packages/design-system/.storybook/main.ts',
    'packages/design-system/.storybook/main.mobile.ts',
    'packages/design-system/.storybook/main.desktop.ts',
  ],
  metroConfigPath: 'metro.config.js',
  packageJsonPaths: [
    'packages/design-tokens/package.json',
    'packages/shared-utils/package.json',
    'packages/design-system/package.json',
  ],
});

if (!report.isValid) {
  console.log('Collision prevention violations detected');
  process.exit(1);
}
```

## CI/CD Integration

The `.github/workflows/collision-prevention.yml` workflow validates all strategies:

### Jobs Overview

1. **Module Boundaries**: Token namespace and import path validation
2. **Token Pipeline**: Schema compliance and cross-platform consistency
3. **Storybook Composition**: Port assignment and configuration validation
4. **Security Scan**: Dependency audit and sensitive data checks
5. **Performance Budget**: Bundle size validation

### Key Validations

- ✅ All CSS tokens use `--ds-*` prefix
- ✅ All packages use `@n00plicate/` scope
- ✅ Storybook ports are correctly assigned (6006, 7007, 6008)
- ✅ Metro config includes deduplication features
- ✅ No deprecated import paths
- ✅ Bundle sizes within limits

## Usage Examples

### For App Developers

```typescript
// In your app's tailwind.config.ts
import { Config } from 'tailwindcss';

const config: Config = {
  safelist: [{ pattern: /^ds-/, variants: ['hover', 'focus'] }],
  theme: {
    extend: {
      colors: {
        primary: {
          500: 'var(--ds-color-primary-500)',
        },
      },
    },
  },
};
```

### For React Native Apps

```javascript
// In your app's metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@n00plicate/design-tokens': './node_modules/@n00plicate/design-tokens',
};

config.resolver.dedupe = ['@n00plicate/design-tokens'];
```

### For Storybook Development

```bash
# Start all Storybook instances without conflicts
pnpm storybook:web    # Runs on port 6006
pnpm storybook:mobile # Runs on port 7007
pnpm storybook:desktop # Runs on port 6008
```

## Testing

Run the comprehensive test suite:

```bash
# Run collision prevention tests
pnpm test collision-prevention

# Run CI/CD validation locally
pnpm validate:collision-prevention
```

## Best Practices

### For Token Authors

1. Always use `ds-` prefix for CSS custom properties
2. Use `ds` prefix for JavaScript/TypeScript exports
3. Test tokens in both web and mobile contexts

### For Component Authors

1. Import tokens from scoped packages (`@n00plicate/design-tokens`)
2. Use collision-safe class names (`.ds-component-name`)
3. Test components in all Storybook instances

### For App Developers

1. Configure Tailwind safelist for `ds-` patterns
2. Set up Metro deduplication for React Native apps
3. Use fixed Storybook ports in development

## Troubleshooting

### Token Conflicts

```bash
# Check for conflicting token names
grep -r "^[[:space:]]*--[^d][^s]-" packages/design-tokens/
```

### Port Conflicts

```bash
# Check which ports are in use
lsof -i :6006 -i :7007 -i :6008
```

### Metro Duplication

```bash
# Validate Metro configuration
node -e "console.log(require('./metro.config.js'))"
```

## References

- [Specify Documentation](https://specifyapp.com/concepts/token-name-conflicts) - Token naming best practices
- [Supernova Documentation](https://learn.supernova.io/latest/code/storybook.html) - Storybook composition setup
- [Locofy FAQ](https://docs.locofy.ai/locofy-for-figma/troubleshooting/faq) - Metro bundler optimization

## Contributing

When adding new tokens, components, or configurations:

1. Follow the collision-prevention naming conventions
2. Run the validation suite before committing
3. Update this documentation if introducing new patterns
4. Test in all supported platforms (web, mobile, desktop)

The collision-prevention strategies ensure a stable, predictable development experience across all platforms and
tools in the n00plicate design system.
