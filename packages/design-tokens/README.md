# 🎨 @n00plicate/design-tokens

Design tokens generated from Penpot using Style Dictionary, providing the single source of truth for all visual
properties across the n00plicate design system. This package implements a complete design-to-code pipeline that transforms
Penpot design files into production-ready tokens for web, mobile, and desktop applications.

## 📋 Overview

This package transforms W3C Design Token Community Group (DTCG) compliant JSON tokens exported from Penpot into
platform-specific formats using Style Dictionary. It serves as the foundation for consistent visual design across:

- **Web Applications**: Qwik City with CSS variables and TypeScript types
- **Mobile Applications**: React Native (JS/TS) and Compose Multiplatform (Kotlin)
- **Desktop Applications**: Tauri with web tech integration
- **Component Libraries**: Storybook with design token documentation

## 🔄 Complete Design-to-Code Pipeline

The design token system implements a fully automated pipeline from Penpot design files to production applications:

```text
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Penpot    │    │ Automated    │    │    Style    │    │ Multi-Platform│
│Design Files │───▶│   Export     │───▶│ Dictionary  │───▶│   Outputs    │
│(Token Panel)│    │(Dev Container)│    │(Transforms) │    │(CSS/TS/Dart) │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
       │                    │                 │                    │
       ▼                    ▼                 ▼                    ▼
  W3C DTCG             tokens.json       Build Process        App Integration
 Compliance              Format           (watch mode)       (type-safe APIs)
```

### Implementation Architecture

1. **Design Phase**: Tokens created in Penpot's design token panel using W3C DTCG standards
2. **Export Phase**: Automated headless export via the penpot-export service defined in
   `infra/containers/devcontainer/docker-compose.yml` (mounting `tools/penpot-export/`)
3. **Transform Phase**: Style Dictionary generates platform-specific outputs with custom formats
4. **Integration Phase**: Applications consume tokens through type-safe APIs and CSS variables
5. **Development**: Watch mode enables real-time updates from design to code

This workflow ensures that design changes in Penpot automatically flow to all applications while
maintaining type safety and platform consistency.

## 🎯 Key Features

- **W3C DTCG Compliant**: Standards-based token format exported from Penpot v2.8
- **Multi-Platform Output**: CSS, TypeScript, Dart, Kotlin, and JSON formats
- **Style Dictionary Integration**: Powerful transformation pipeline with custom formats for all targets
- **Type Safety**: Full TypeScript support with generated types and utility functions
- **Watch Mode**: Real-time token compilation during development with hot-reload support
- **Automated Sync**: Scheduled token export from Penpot design files via dev-container
- **Monorepo Ready**: Nx integration with affected builds and cached transformations
- **Production Ready**: Optimized outputs for web (Qwik), mobile (RN/Compose), desktop (Tauri)

## 📦 Installation & Bootstrap

### Prerequisites

Ensure you have the required tools installed:

```bash
# Node.js 20+ LTS with pnpm
corepack enable && corepack prepare pnpm@latest --activate

# For mobile development
# - Java 17+ (Compose Multiplatform)
# - Android SDK (React Native/Compose)
# - Xcode (iOS React Native)

# For desktop development
# - Rust toolchain (Tauri)
```

### Workspace Installation

```bash
# Install in existing Nx workspace
pnpm add @n00plicate/design-tokens

# Or for local development
pnpm install
```

### Bootstrap Complete Pipeline

```bash
# 1. Install dependencies
pnpm install

# 2. Build initial tokens
pnpm nx run design-tokens:build

# 3. Start development workflow
pnpm nx run design-tokens:watch
```

## 🚀 Multi-Platform Usage

### Web Applications (Qwik City)

```typescript
// Basic token access with type safety
import { tokens, getToken, getTokensByPattern } from '@n00plicate/design-tokens';

// Direct token access
const primaryColor = tokens.color.primary.value; // '#007bff'
const largeFontSize = tokens.fontSize.large.value; // '1.25rem'

// Utility functions for dynamic access
const buttonPadding = getToken('spacing.component.button.padding');
const allColors = getTokensByPattern('color.**');
```

```css
/* CSS Variables (automatically generated) */
.button {
  background-color: var(--color-primary);
  font-size: var(--font-size-medium);
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-component-button-padding);
}
```

### Mobile Applications

#### React Native

```typescript
// apps/mobile-rn/src/theme.ts
import { tokens } from '@n00plicate/design-tokens';
import { StyleSheet } from 'react-native';

export const theme = StyleSheet.create({
  container: {
    backgroundColor: tokens.color.background.primary.value,
    padding: parseInt(tokens.spacing.md.value) * 16, // Convert rem to px
  },
  primaryButton: {
    backgroundColor: tokens.color.primary.value,
    borderRadius: parseInt(tokens.borderRadius.medium.value) * 16,
  },
});
```

#### Compose Multiplatform

```kotlin
// mobile-compose/src/main/kotlin/Theme.kt
// Generated from Style Dictionary Compose format
object DesignTokens {
    val ColorPrimary = Color(0xFF007BFF)
    val SpacingMd = 16.dp
    val BorderRadiusMedium = 8.dp
}

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = DesignTokens.ColorPrimary,
            // ... other colors from tokens
        ),
        content = content
    )
}
```

### Token lookup order & platform overrides

The runtime helpers (`getToken`, `getTokensByPattern`) resolve values using the following precedence so
adapters can reason about overrides:

1. **CSS Custom Properties** – When running in a browser, we read from `document.documentElement` to
   respect runtime theming overrides first.
2. **Base Tokens** – Canonical tokens exported from Penpot.
3. **Semantic Tokens** – Contracted aliases that map to base tokens.
4. **Component Tokens** – Component-specific shorthands.
5. **Platform Tokens** – Web and mobile trees override everything else. By default the helper prefers
   web values, but you can opt into the mobile precedence by either:
   - Setting `process.env.MIMIC_PLATFORM=mobile` at build/runtime, or
   - Running in an environment where `globalThis.navigator.product === 'ReactNative'` (React Native
     sets this automatically).

This guarantees that platform-specific overrides (for example, React Native touch targets) are returned
even when the base token tree defines the same path.

### Desktop Applications (Tauri)

```typescript
// apps/desktop/src/theme.ts
import { tokens } from '@n00plicate/design-tokens';

// Tauri uses web technologies, so CSS variables and TypeScript work directly
export const desktopTheme = {
  colors: {
    primary: tokens.color.primary.value,
    surface: tokens.color.surface.primary.value,
  },
  spacing: {
    windowPadding: tokens.spacing.xl.value,
    componentGap: tokens.spacing.md.value,
  },
};
```

### Storybook Integration

```typescript
// .storybook/preview.ts
import { tokens } from '@n00plicate/design-tokens';
import '@n00plicate/design-tokens/css';

export const parameters = {
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: tokens.color.background.primary.value },
      { name: 'dark', value: tokens.color.background.inverse.value },
    ],
  },
  // Design token addon configuration
  designToken: {
    theme: tokens,
  },
};
```

import { getToken, getTokensByPattern } from '@n00plicate/design-tokens';

// Access individual tokens with fallback support
const primaryColor = getToken('color.primary.500', '#007bff');
const mediumSpacing = getToken('spacing.md', '1rem');

// Pattern-based token discovery
const allColors = getTokensByPattern('color._');
const primaryShades = getTokensByPattern('color.primary._');

// Component-specific tokens
const buttonPadding = getToken('component.button.padding.md');
const cardShadow = getToken('component.card.shadow');

````javascript
### CSS Variables (Web)

```css
/* Import generated CSS variables */
@import '@n00plicate/design-tokens/css';

.component {
  background-color: var(--color-primary-500);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}
````

### Qwik + Vanilla Extract Integration

```typescript
// apps/web/src/theme.css.ts
import { style } from '@vanilla-extract/css';
import { getToken } from '@n00plicate/design-tokens';

export const button = style({
  backgroundColor: getToken('color.primary.500'),
  color: getToken('color.primary.50'),
  padding: `${getToken('spacing.sm')} ${getToken('spacing.md')}`,
  borderRadius: getToken('border.radius.md'),
  fontWeight: getToken('font.weight.medium'),
});
```

### React Native Integration

```typescript
// apps/mobile/src/theme.ts
import { getToken } from '@n00plicate/design-tokens';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: getToken('color.primary.500'),
    paddingHorizontal: parseInt(getToken('spacing.md')),
    paddingVertical: parseInt(getToken('spacing.sm')),
    borderRadius: parseInt(getToken('border.radius.md')),
  },
});
```

### Token Categories

Our token system provides comprehensive coverage for all design decisions:

#### Colors

```typescript
// Primary brand colors (50-900 scale)
getToken('color.primary.50'); // #eff6ff
getToken('color.primary.500'); // #3b82f6 (base)
getToken('color.primary.900'); // #1e3a8a

// Semantic state colors
getToken('color.success.500'); // #22c55e
getToken('color.warning.500'); // #f59e0b
getToken('color.error.500'); // #ef4444
getToken('color.info.500'); // #3b82f6

// Neutral scale for backgrounds and text
getToken('color.neutral.50'); // #f9fafb
getToken('color.neutral.500'); // #6b7280
getToken('color.neutral.900'); // #111827
```

#### Typography

```typescript
// Font families
getToken('font.family.sans'); // System sans-serif stack
getToken('font.family.serif'); // System serif stack
getToken('font.family.mono'); // System monospace stack

// Font sizes (responsive scale)
getToken('font.size.xs'); // 0.75rem (12px)
getToken('font.size.base'); // 1rem (16px)
getToken('font.size.xl'); // 1.25rem (20px)
getToken('font.size.3xl'); // 1.875rem (30px)

// Font weights
getToken('font.weight.normal'); // 400
getToken('font.weight.medium'); // 500
getToken('font.weight.semibold'); // 600
getToken('font.weight.bold'); // 700

// Line heights
getToken('line.height.tight'); // 1.25
getToken('line.height.normal'); // 1.5
getToken('line.height.relaxed'); // 1.75
```

#### Spacing & Layout

```typescript
// T-shirt sizing scale
getToken('spacing.xs'); // 0.25rem (4px)
getToken('spacing.sm'); // 0.5rem (8px)
getToken('spacing.md'); // 1rem (16px)
getToken('spacing.lg'); // 1.5rem (24px)
getToken('spacing.xl'); // 2rem (32px)
getToken('spacing.2xl'); // 2.5rem (40px)
getToken('spacing.3xl'); // 3rem (48px)
```

#### Borders & Effects

```typescript
// Border radius scale
getToken('border.radius.none'); // 0
getToken('border.radius.sm'); // 0.125rem (2px)
getToken('border.radius.md'); // 0.375rem (6px)
getToken('border.radius.lg'); // 0.5rem (8px)
getToken('border.radius.full'); // 9999px (circle)

// Elevation shadows
getToken('shadow.sm'); // 0 1px 2px 0 rgb(0 0 0 / 0.05)
getToken('shadow.md'); // 0 4px 6px -1px rgb(0 0 0 / 0.1)
getToken('shadow.lg'); // 0 10px 15px -3px rgb(0 0 0 / 0.1)
getToken('shadow.xl'); // 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

## 🛠️ Development

### Building Tokens

```bash
# Build all token outputs
pnpm build

# Build only tokens (skip TypeScript compilation)
pnpm build:tokens

# Build only TypeScript types
pnpm build:types

# Watch for changes and rebuild
pnpm watch
```

### Token File Structure

```text
tokens/
├── base.json                 # Base token definitions
├── semantic.json            # Semantic color mappings (future)
├── components.json          # Component-specific tokens (future)
└── platforms/
    ├── web.json             # Web-specific overrides (future)
    ├── mobile.json          # Mobile-specific overrides (future)
    └── desktop.json         # Desktop-specific overrides (future)
```

### Style Dictionary Configuration

The `style-dictionary.config.js` file defines how tokens are transformed:

```javascript
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
      ],
    },
  },
};
```

## 📁 Output Structure

Style Dictionary generates platform-specific outputs for the entire n00plicate ecosystem:

```text
dist/
├── css/
│   └── tokens.css           # CSS custom properties for web
├── scss/
│   └── tokens.scss          # Sass variables for enhanced styling
├── js/
│   └── tokens.js            # JavaScript ES modules
├── types/
│   └── tokens.ts            # TypeScript definitions
├── json/
│   ├── tokens.json          # Structured JSON for any platform
│   └── tokens-flat.json     # Flattened JSON for simple access
├── dart/                    # Flutter/Compose Multiplatform (future)
│   └── tokens.dart
└── kotlin/                  # Android Compose themes (future)
    └── Theme.kt
```

### Platform Integration

| Platform            | Import Path                 | Usage Example                   |
| ------------------- | --------------------------- | ------------------------------- |
| **Web (CSS)**       | `@n00plicate/design-tokens/css`  | `var(--color-primary-500)`      |
| **Web (JS/TS)**     | `@n00plicate/design-tokens`      | `getToken('color.primary.500')` |
| **React Native**    | `@n00plicate/design-tokens`      | `getToken('spacing.md')`        |
| **Storybook**       | `@n00plicate/design-tokens/json` | Token documentation             |
| **Mobile (Future)** | `@n00plicate/design-tokens/dart` | Flutter theming                 |
| **Desktop**         | Inherits from web           | Tauri web view styling          |

## 🎨 Token Design Philosophy

### Naming Convention

Tokens follow a hierarchical naming pattern:

```text
{category}.{type}.{item}.{subitem}.{state}
```

Examples:

- `color.primary.500` - Primary color at 500 weight
- `spacing.component.button.padding` - Button padding value
- `fontSize.heading.h1` - H1 heading font size

### Token Types

1. **Primitive Tokens**: Raw values (colors, numbers, strings)
2. **Semantic Tokens**: Meaningful aliases (primary, secondary, success)
3. **Component Tokens**: Component-specific values (button-padding, card-shadow)

### Design Token Hierarchy

```text
Primitive Tokens (base.json)
    ↓
Semantic Tokens (semantic.json)
    ↓
Component Tokens (components.json)
    ↓
Platform Overrides (platforms/*.json)
```

## 🔄 Penpot Integration Workflow

This package is central to our design-to-code workflow using Penpot v2.8:

### 1. Design Token Creation

**In Penpot:**

- Open any design file and navigate to the **Tokens** panel
- Create **Global Tokens** for primitive values (colors, spacing, typography)
- Create **Alias Tokens** for semantic references (primary, secondary, success)
- All tokens automatically follow W3C DTCG format

### 2. Automated Export

**Via Dev Container:**

```bash
# Manual export for development
pnpm run tokens:export

# Automated via the penpot-export service (infra/containers/devcontainer/docker-compose.yml, workspace mount `tools/penpot-export/`)
pnpm run tokens:sync
```

**The export process:**

1. `penpot-export` CLI connects to your Penpot instance
2. Downloads the latest design token definitions
3. Writes `tokens/tokens.json` in W3C DTCG format
4. Triggers Style Dictionary rebuild

### 3. Transform & Distribution

**Style Dictionary Processing:**

```bash
# Manual rebuild
pnpm run build:tokens

# Watch mode for development
pnpm run watch

# Automated in CI/CD
nx affected -t build:tokens
```

### 4. Platform Consumption

**Web Applications (Qwik City):**

```typescript
// apps/web/src/components/Button.tsx
import { style } from '@vanilla-extract/css';
import { getToken } from '@n00plicate/design-tokens';

export const buttonStyle = style({
  backgroundColor: getToken('color.primary.500'),
  padding: `${getToken('spacing.sm')} ${getToken('spacing.md')}`,
  borderRadius: getToken('border.radius.md'),
});
```

**Mobile Applications (React Native):**

```typescript
// apps/mobile/src/theme/colors.ts
import { getToken } from '@n00plicate/design-tokens';

export const colors = {
  primary: getToken('color.primary.500'),
  success: getToken('color.success.500'),
  text: getToken('color.neutral.900'),
} as const;
```

**Desktop Applications (Tauri):**

```css
/* Inherits web styling via CSS variables */
@import '@n00plicate/design-tokens/css';

.desktop-frame {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
}
```

### 5. Storybook Integration

**Design Workshop:**

```typescript
// packages/design-system/.storybook/preview.ts
import '@n00plicate/design-tokens/css';

export const parameters = {
  docs: {
    theme: {
      colorPrimary: 'var(--color-primary-500)',
      colorSecondary: 'var(--color-secondary-500)',
    },
  },
};
```

### Continuous Sync

```bash
# Planned automation features
pnpm run tokens:sync     # Pull latest from Penpot
pnpm run tokens:validate # Verify W3C DTCG compliance
pnpm run tokens:diff     # Compare with previous version
```

This workflow ensures that design changes in Penpot automatically flow to all applications while
maintaining type safety and platform consistency.

## 📊 Token Metrics

- **Token Count**: ~50 base tokens
- **Generated Files**: 8 platform-specific formats
- **Build Time**: <1 second (incremental)
- **Bundle Size**: <2KB (minified CSS)

## 🧪 Testing

```bash
# Run token validation tests
pnpm test

# Validate token structure
pnpm test:tokens

# Check generated output
pnpm test:output
```

## 🤝 Contributing

When adding new tokens:

1. **Follow Naming Convention**: Use the established hierarchy
2. **Add Documentation**: Include JSDoc comments for new token categories
3. **Test Outputs**: Verify all platform formats generate correctly
4. **Update Types**: Ensure TypeScript definitions are complete

### Adding New Tokens

```json
// tokens/base.json
{
  "color": {
    "brand": {
      "tertiary": {
        "value": "#6f42c1",
        "type": "color",
        "description": "Tertiary brand color for accents"
      }
    }
  }
}
```

## 📚 Advanced Documentation

For comprehensive guides on advanced workflows and enterprise features:

- **[Style Dictionary Advanced Configuration](../../docs/build/style-dictionary.md)** - Custom transforms and optimization
- **[Penpot Schema and Integration](../../docs/design/penpot-schema.md)** - JSON schema, CLI configuration, and governance
- **[Token Governance Framework](../../docs/quality/token-governance.md)** - Validation rules and automated enforcement
- **[CI/CD Token Drift Detection](../../docs/cicd/token-drift-check.md)** - Automated sync monitoring and alerting
- **[Security Compliance](../../docs/security/security-compliance-framework.md)** - Token security and enterprise compliance

## 📚 Resources

- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)
- [Design Token Community Group](https://www.w3.org/community/design-tokens/)
- [W3C Design Token Format](https://tr.designtokens.org/format/)
- [Penpot Design Token Guide](https://penpot.app/design-tokens)

## 🐛 Troubleshooting

### Common Issues

#### Token Build Fails

```bash
# Clear dist directory and rebuild
pnpm clean && pnpm build
```

#### TypeScript Errors

```bash
# Regenerate TypeScript definitions
pnpm build:types
```

#### Watch Mode Not Working

```bash
# Restart with verbose logging
pnpm watch --verbose
```

#### CSS Variables Not Loading

- Ensure `dist/css/variables.css` is imported in your application
- Check that CSS custom properties are supported in your target browsers

## 📄 License

MIT License - see the [LICENSE](../../LICENSE) file for details.
