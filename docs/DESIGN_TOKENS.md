# 🎨 Design Tokens Guide

Complete guide to the n00plicate design system's collision-free token architecture, usage patterns, and best practices.

## 📋 Overview

The `@n00plicate/design-tokens` package provides the foundation for consistent visual design across all n00plicate
applications with comprehensive collision prevention. Built with W3C Design Token Community Group (DTCG)
standards and powered by Style Dictionary, it transforms design tokens exported from Penpot into
platform-specific, namespaced formats for web, mobile, and desktop applications.

## 🔄 Penpot to Production Workflow

Our design token system follows a complete design-to-code pipeline with collision-free architecture:

```text
Penpot Design → Token Export → Style Dictionary → Namespaced Outputs → Applications
     ↓              ↓              ↓                    ↓                ↓
  Design File   tokens.json    Transforms         Platform-Rooted      Web/Mobile/Desktop
                                   +               CSS/TS/Dart/Kotlin   with ds- Prefixes
                               Collision            (libs/tokens/)
                              Prevention
```

### 1. Design in Penpot

Designers create and manage tokens directly in Penpot v2.8 using the built-in design token panel:

- **Global Tokens**: Base values (colors, spacing, typography)
- **Alias Tokens**: Semantic references (primary, secondary, success)
- **W3C DTCG Format**: Automatic compliance with industry standards
- **Collision-Safe Naming**: Following ds- prefix conventions

### 2. Automated Export

The `penpot-export` service defined in `infra/containers/devcontainer/docker-compose.yml` (mounting
`tools/penpot-export/` as its workspace) automatically pulls the latest tokens:

```bash
# Manual export for development (requires .env)
pnpm run tokens:export

# Automated sync (CI workflow)
pnpm run tokens:sync
```

### 3. Style Dictionary Transform with Collision Prevention

The exported `tokens.json` flows through Style Dictionary to generate collision-free outputs:

- **CSS Variables**: `--ds-color-primary-500` for web styling (namespaced)
- **TypeScript**: `dsColorPrimary500` type-safe token access (prefixed)
- **Dart**: `DsTokens.primary_500` classes for Flutter (prefixed)
- **Kotlin**: `ds.theme.DsTokens` Material Design integration (namespaced)
- **JSON**: Platform-agnostic token data
- **Platform-Rooted Paths**: `libs/tokens/{platform}/` structure

### 4. Multi-Platform Distribution

Generated tokens are consumed by:

- **Web Apps**: Qwik City with vanilla-extract styling
- **Mobile**: React Native and Compose Multiplatform
- **Desktop**: Tauri wrapper with token-driven themes
- **Storybook**: Design workshop with live token previews

## 🎯 Key Concepts

### What Are Design Tokens?

Design tokens are named entities that store visual design decisions. They provide a single source of truth for
design properties like colors, spacing, typography, and more.

```typescript
// Instead of magic values scattered throughout code
backgroundColor: '#007bff';
padding: '16px';

// Use semantic, maintainable tokens
backgroundColor: getToken('color.primary.500');
padding: getToken('spacing.md');
```

### Token Hierarchy

```text
Base Tokens (primitives)
    ↓ reference
Semantic Tokens (contextual)
    ↓ reference
Component Tokens (specific)
    ↓ reference
Platform Tokens (overrides)
```

## 🔧 Installation & Setup

### In Applications

```bash
# Install the package
pnpm add @n00plicate/design-tokens

# Import in your app
import { getToken, getTokensByPattern } from '@n00plicate/design-tokens';
```

### In CSS/SCSS

```css
/* Import CSS variables */
@import '@n00plicate/design-tokens/css';

.component {
  color: var(--ds-color-primary-500);
  margin: var(--ds-spacing-md);
}
```

### In Build Tools

```javascript
// Vite/Webpack - import as modules
import tokens from '@n00plicate/design-tokens/json';

// Use in styled-components
const Button = styled.button`
  background: ${getToken('color.primary.500')};
  padding: ${getToken('spacing.sm')} ${getToken('spacing.md')};
`;
```

## 🎨 Token Categories

### Colors

Our color system provides semantic meaning and accessibility compliance:

#### Base Colors

```typescript
// Primary brand colors
getToken('color.primary.50'); // Lightest
getToken('color.primary.500'); // Base
getToken('color.primary.900'); // Darkest

// Secondary colors
getToken('color.secondary.500');

// Neutral scale (50-900)
getToken('color.neutral.100'); // Light backgrounds
getToken('color.neutral.600'); // Text colors
getToken('color.neutral.900'); // Dark text
```

#### Semantic Colors

```typescript
// State colors
getToken('color.success.500'); // #22c55e
getToken('color.warning.500'); // #f59e0b
getToken('color.error.500'); // #ef4444
getToken('color.info.500'); // #3b82f6
```

#### Usage Examples

```css
/* Light theme button */
.btn-primary {
  background-color: var(--color-primary-500);
  color: var(--color-primary-50);
  border: 1px solid var(--color-primary-600);
}

/* Success alert */
.alert-success {
  background-color: var(--color-success-50);
  color: var(--color-success-800);
  border-left: 4px solid var(--color-success-500);
}
```

### Typography

Typography tokens ensure consistent text rendering:

#### Font Families

```typescript
getToken('font.family.sans'); // Primary sans-serif stack
getToken('font.family.serif'); // Serif for headings
getToken('font.family.mono'); // Code and monospace
```

#### Font Sizes

```typescript
// Scale: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
getToken('font.size.xs'); // 0.75rem (12px)
getToken('font.size.base'); // 1rem (16px)
getToken('font.size.2xl'); // 1.5rem (24px)
```

#### Font Weights

```typescript
getToken('font.weight.normal'); // 400
getToken('font.weight.medium'); // 500
getToken('font.weight.semibold'); // 600
getToken('font.weight.bold'); // 700
```

#### Line Heights

```typescript
getToken('line.height.tight'); // 1.25
getToken('line.height.normal'); // 1.5
getToken('line.height.relaxed'); // 1.75
```

### Spacing

Consistent spacing creates visual rhythm:

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

#### Usage Patterns

```css
/* Component spacing */
.card {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

/* Grid gaps */
.grid {
  gap: var(--spacing-md);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

### Border Radius

```typescript
getToken('border.radius.none'); // 0
getToken('border.radius.sm'); // 0.125rem (2px)
getToken('border.radius.md'); // 0.375rem (6px)
getToken('border.radius.lg'); // 0.5rem (8px)
getToken('border.radius.full'); // 9999px (circle)
```

### Shadows

Elevation system for depth and hierarchy:

```typescript
getToken('shadow.sm'); // Subtle shadow
getToken('shadow.md'); // Card shadow
getToken('shadow.lg'); // Modal shadow
getToken('shadow.xl'); // Floating elements
```

## 🛠️ Advanced Usage

### Pattern Matching

Find multiple tokens using glob patterns:

```typescript
// Get all primary colors
const primaryColors = getTokensByPattern('color.primary.*');
// Returns: [{ path: 'color.primary.50', value: '#eff6ff' }, ...]

// Get all spacing tokens
const spacing = getTokensByPattern('spacing.*');

// Get all tokens (useful for debugging)
const allTokens = getTokensByPattern('*');
```

### Dynamic Token Access

```typescript
// Build token paths dynamically
const getColorVariant = (color: string, shade: number) => {
  return getToken(`color.${color}.${shade}`);
};

const primaryButton = getColorVariant('primary', 500);
const successAlert = getColorVariant('success', 100);
```

### Validation

Validate token structure during development:

```typescript
import { validateTokens } from '@n00plicate/design-tokens';

const result = validateTokens(customTokens);
if (!result.isValid) {
  console.error('Token validation failed:', result.errors);
}
```

## 🏗️ Component Token Patterns

### Button Component

```typescript
// Component-specific tokens
getToken('component.button.padding.sm'); // Small button padding
getToken('component.button.padding.md'); // Medium button padding
getToken('component.button.border.radius'); // Button border radius
getToken('component.button.font.weight'); // Button text weight
```

### Card Component

```typescript
getToken('component.card.padding'); // Card internal padding
getToken('component.card.border.radius'); // Card corner radius
getToken('component.card.shadow'); // Card elevation shadow
getToken('component.card.background'); // Card background color
```

## 🎯 Best Practices

### Do's ✅

1. **Use Semantic Names**: Prefer `color.primary.500` over `color.blue.500`
2. **Reference, Don't Duplicate**: Let semantic tokens reference base tokens
3. **Test All Outputs**: Verify CSS, JS, and mobile formats work correctly
4. **Follow Naming Conventions**: Stick to the established hierarchy
5. **Document New Tokens**: Add descriptions for custom tokens

### Don'ts ❌

1. **Don't Use Magic Values**: Always use tokens instead of hardcoded values
2. **Don't Bypass the System**: Don't create component-specific overrides outside tokens
3. **Don't Break Hierarchy**: Maintain the base → semantic → component flow
4. **Don't Forget Accessibility**: Ensure color contrast meets WCAG standards
5. **Don't Skip Validation**: Always validate tokens before deploying

### Code Examples

```typescript
// ✅ Good: Semantic token usage
const Button = styled.button`
  background: ${getToken('color.primary.500')};
  padding: ${getToken('spacing.sm')} ${getToken('spacing.md')};
  border-radius: ${getToken('border.radius.md')};
  font-weight: ${getToken('font.weight.medium')};
`;

// ❌ Bad: Magic values
const Button = styled.button`
  background: #007bff;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
`;

// ✅ Good: Responsive patterns
const responsiveSpacing = {
  mobile: getToken('spacing.sm'),
  tablet: getToken('spacing.md'),
  desktop: getToken('spacing.lg'),
};

// ✅ Good: Dynamic token access
const getStatusColor = (status: string) => {
  const statusMap = {
    success: getToken('color.success.500'),
    warning: getToken('color.warning.500'),
    error: getToken('color.error.500'),
    info: getToken('color.info.500'),
  };
  return statusMap[status] || getToken('color.neutral.500');
};
```

## 🔄 Development Workflow

### Adding New Tokens

1. **Define in JSON**: Add to appropriate token file (`base.json`, `semantic.json`, etc.)
2. **Follow W3C Format**: Use `$value`, `$type`, and `$description`
3. **Build Tokens**: Run `pnpm build:tokens` to generate outputs
4. **Test Integration**: Verify tokens work in target applications
5. **Update Documentation**: Document new tokens and usage patterns

### Token File Structure

```text
tokens/
├── base.json           # Primitive values (colors, sizes, etc.)
├── semantic.json       # Meaningful aliases (primary, secondary)
├── components.json     # Component-specific tokens
└── platforms/
    ├── web.json       # Web-specific overrides
    ├── mobile.json    # Mobile-specific values
    └── desktop.json   # Desktop-specific values
```

### Building and Testing

```bash
# Build all token outputs
pnpm run build

# Watch for changes during development
pnpm run watch

# Run validation tests
pnpm test

# Test specific token access
pnpm run test:tokens
```

## 📱 Platform-Specific Usage

### Web (CSS Variables)

```css
/* Automatic CSS custom properties */
:root {
  --color-primary-500: #007bff;
  --spacing-md: 1rem;
  --font-size-lg: 1.125rem;
}

.component {
  color: var(--color-primary-500);
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
}
```

### JavaScript/TypeScript

```typescript
// ES modules
import { getToken } from '@n00plicate/design-tokens';

// Use in styled-components
const theme = {
  colors: {
    primary: getToken('color.primary.500'),
    text: getToken('color.neutral.900'),
  },
  spacing: {
    small: getToken('spacing.sm'),
    medium: getToken('spacing.md'),
  },
};
```

### React Native (Future)

```typescript
// Platform-specific mobile tokens
import { tokens } from '@n00plicate/design-tokens/mobile';

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.color.primary['500'],
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
  },
});
```

## 🚨 Troubleshooting

### Common Issues

#### Token Not Found

```typescript
// Check token exists
const token = getToken('color.primary.500', 'fallback-value');
if (token === 'fallback-value') {
  console.warn('Token not found: color.primary.500');
}
```

#### CSS Variables Not Loading

```css
/* Ensure CSS is imported */
@import '@n00plicate/design-tokens/css';

/* Check browser support */
.fallback {
  color: #007bff; /* fallback */
  color: var(--color-primary-500, #007bff); /* with fallback */
}
```

#### Build Failures

```bash
# Clear cache and rebuild
pnpm run clean && pnpm run build

# Validate token structure
pnpm run test
```

### Debug Utilities

```typescript
// List all available tokens
const allTokens = getTokensByPattern('*');
console.table(allTokens);

// Check specific category
const colors = getTokensByPattern('color.*');
console.log(
  'Available colors:',
  colors.map(t => t.path)
);

// Validate custom tokens
import { validateTokens } from '@n00plicate/design-tokens';
const result = validateTokens(myTokens);
console.log('Validation:', result);
```

## 📊 Token Metrics

Current token system includes:

- **115+ Total Tokens**: Comprehensive coverage across all categories
- **10 Color Scales**: Primary, secondary, neutral, and semantic colors
- **7 Spacing Steps**: T-shirt sizing from xs to 3xl
- **5 Font Sizes**: xs to 4xl scale
- **4 Border Radius**: none to full
- **4 Shadow Levels**: sm to xl elevation

## 🔗 Integration Examples

### Qwik Components

```typescript
// Component using design tokens
export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      class={`
        bg-[var(--color-primary-500)]
        text-[var(--color-primary-50)]
        px-[var(--spacing-md)]
        py-[var(--spacing-sm)]
        rounded-[var(--border-radius-md)]
        font-[var(--font-weight-medium)]
      `}
    >
      {props.children}
    </button>
  );
});
```

### Tailwind CSS Integration

```javascript
// tailwind.config.js
const { getToken } = require('@n00plicate/design-tokens');

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: getToken('color.primary.50'),
          500: getToken('color.primary.500'),
          900: getToken('color.primary.900'),
        },
      },
      spacing: {
        xs: getToken('spacing.xs'),
        sm: getToken('spacing.sm'),
        md: getToken('spacing.md'),
      },
    },
  },
};
```

## 📚 References

- **[W3C Design Token Community Group](https://www.w3.org/community/design-tokens/)** - Standards and specifications
- **[Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)** - Build tool documentation
- **[Design Tokens Handbook](https://designtokens.dev/)** - Best practices and patterns
- **[Figma Tokens](https://docs.tokens.studio/)** - Design tool integration
- **[Package Documentation](../packages/design-tokens/README.md)** - Technical implementation details

## 🤝 Contributing

### Adding New Token Categories

1. Define the token structure in the appropriate JSON file
2. Add TypeScript types if needed
3. Update this documentation with usage examples
4. Add tests for the new tokens
5. Update the package README

### Proposing Changes

1. Open an issue describing the token changes
2. Provide use cases and rationale
3. Include accessibility considerations
4. Test across all output formats
5. Update relevant documentation

For detailed contribution guidelines, see [CONTRIBUTING.md](../CONTRIBUTING.md).
