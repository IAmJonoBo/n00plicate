# 🔄 Design Tokens Migration Guide

Step-by-step guide for migrating existing projects to use the n00plicate design token system.

## 📋 Overview

This guide helps teams migrate from hardcoded styles, CSS variables, or other design token systems to the
n00plicate design token architecture. The migration process ensures design consistency while minimizing development
disruption.

## 🎯 Migration Strategy

### Phase 1: Assessment & Planning

#### Current State Analysis

1. **Audit existing styles:**

   ```bash
   # Find hardcoded colors
   grep -r "#[0-9a-fA-F]\{6\}" src/

   # Find hardcoded spacing
   grep -r "[0-9]\+px" src/

   # Find CSS custom properties
   grep -r "var(--" src/
   ```

2. **Identify token categories:**

   ```typescript
   // Common token patterns to replace
   const tokensToReplace = {
     colors: ['#007bff', '#28a745', '#dc3545'],
     spacing: ['8px', '16px', '24px', '32px'],
     typography: ['16px', '18px', '24px'],
     borderRadius: ['4px', '6px', '8px'],
     shadows: ['0 2px 4px rgba(0,0,0,0.1)'],
   };
   ```

3. **Map to n00plicate tokens:**

   ```typescript
   const tokenMapping = {
     '#007bff': 'color.primary.500',
     '#28a745': 'color.success.500',
     '#dc3545': 'color.error.500',
     '16px': 'spacing.md',
     '24px': 'spacing.lg',
   };
   ```

### Phase 2: Installation & Setup

#### Install Design Tokens

```bash
# Add to your project
pnpm add @n00plicate/design-tokens
# or
# yarn add @n00plicate/design-tokens
```

#### Configure Build System

1. **Webpack/Vite Configuration:**

   ```javascript
   // vite.config.js
   import { defineConfig } from 'vite';

   export default defineConfig({
     css: {
       preprocessorOptions: {
         css: {
           additionalData: `@import '@n00plicate/design-tokens/css';`,
         },
       },
     },
   });
   ```

2. **PostCSS Configuration:**

   ```javascript
   // postcss.config.js
   module.exports = {
     plugins: {
       'postcss-import': {},
       'postcss-custom-properties': {
         preserve: false, // Convert CSS variables to static values
       },
     },
   };
   ```

### Phase 3: Gradual Migration

#### Step 1: Replace Colors

```typescript
// Before: Hardcoded colors
const styles = {
  primary: '#007bff',
  success: '#28a745',
  error: '#dc3545',
};

// After: Design tokens
import { getToken } from '@n00plicate/design-tokens';

const styles = {
  primary: getToken('color.primary.500'),
  success: getToken('color.success.500'),
  error: getToken('color.error.500'),
};
```

#### Step 2: Replace Spacing

```css
/* Before: Hardcoded spacing */
.component {
  padding: 16px;
  margin: 24px 0;
  gap: 8px;
}

/* After: Token-based spacing */
.component {
  padding: var(--spacing-md);
  margin: var(--spacing-lg) 0;
  gap: var(--spacing-sm);
}
```

#### Step 3: Replace Typography

```css
/* Before: Hardcoded typography */
.heading {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
}

/* After: Token-based typography */
.heading {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}
```

## 🛠️ Framework-Specific Migration

### React Migration

```typescript
// Before: Styled-components with hardcoded values
const Button = styled.button`
  background: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
`;

// After: Styled-components with tokens
import { getToken } from '@n00plicate/design-tokens';

const Button = styled.button`
  background: ${getToken('color.primary.500')};
  color: ${getToken('color.primary.50')};
  padding: ${getToken('spacing.sm')} ${getToken('spacing.md')};
  border-radius: ${getToken('border.radius.sm')};
  font-weight: ${getToken('font.weight.medium')};
`;
```

### Vue Migration

```vue
<!-- Before: Hardcoded styles -->
<template>
  <button class="btn-primary">Click me</button>
</template>

<style scoped>
.btn-primary {
  background: #007bff;
  padding: 8px 16px;
  border-radius: 4px;
}
</style>

<!-- After: Token-based styles -->
<template>
  <button class="btn-primary">Click me</button>
</template>

<style scoped>
@import '@n00plicate/design-tokens/css';

.btn-primary {
  background: var(--color-primary-500);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
}
</style>
```

### Angular Migration

```typescript
// Before: Hardcoded theme
const theme = {
  primary: '#007bff',
  spacing: {
    small: '8px',
    medium: '16px',
  },
};

// After: Token-based theme
import { getToken, getTokensByPattern } from '@n00plicate/design-tokens';

const theme = {
  primary: getToken('color.primary.500'),
  spacing: Object.fromEntries(
    getTokensByPattern('spacing.*').map(token => [
      token.path.split('.').pop(),
      token.value,
    ])
  ),
};
```

## 🔧 Automated Migration Tools

### Create Migration Scripts

1. **Color replacement script:**

   ```bash
   #!/bin/bash
   # replace-colors.sh

   # Replace common color values
   find src/ -name "*.css" -o -name "*.scss" -o -name "*.ts" -o -name "*.tsx" | \
   xargs sed -i '' \
     -e 's/#007bff/var(--color-primary-500)/g' \
     -e 's/#28a745/var(--color-success-500)/g' \
     -e 's/#dc3545/var(--color-error-500)/g'
   ```

2. **Spacing replacement script:**

   ```bash
   #!/bin/bash
   # replace-spacing.sh

   find src/ -name "*.css" -o -name "*.scss" | \
   xargs sed -i '' \
     -e 's/8px/var(--spacing-sm)/g' \
     -e 's/16px/var(--spacing-md)/g' \
     -e 's/24px/var(--spacing-lg)/g' \
     -e 's/32px/var(--spacing-xl)/g'
   ```

3. **Validation script:**

   ```javascript
   // validate-migration.js
   const fs = require('fs');
   const glob = require('glob');

   const hardcodedPatterns = [
     /#[0-9a-fA-F]{6}/g, // Hex colors
     /\d+px/g, // Pixel values
     /rgba?\([^)]+\)/g, // RGB/RGBA colors
   ];

   glob('src/**/*.{css,scss,ts,tsx}', (err, files) => {
     files.forEach(file => {
       const content = fs.readFileSync(file, 'utf8');
       hardcodedPatterns.forEach(pattern => {
         const matches = content.match(pattern);
         if (matches) {
           console.log(`${file}: Found hardcoded values:`, matches);
         }
       });
     });
   });
   ```

## 📊 Migration Checklist

### Pre-Migration

- [ ] Audit existing styles and identify token categories
- [ ] Create mapping between current values and n00plicate tokens
- [ ] Set up development environment with design tokens
- [ ] Create backup branch of current implementation

### During Migration

- [ ] Install and configure @n00plicate/design-tokens
- [ ] Import CSS variables or TypeScript functions
- [ ] Replace colors with token equivalents
- [ ] Replace spacing with token equivalents
- [ ] Replace typography with token equivalents
- [ ] Replace border radius and shadows
- [ ] Update component libraries and utilities
- [ ] Test visual regression

### Post-Migration

- [ ] Remove hardcoded style values
- [ ] Update style guides and documentation
- [ ] Set up linting rules to prevent hardcoded values
- [ ] Train team on token usage patterns
- [ ] Monitor for visual inconsistencies

## 🚨 Common Migration Pitfalls

### 1. Token Overuse

```css
/* ❌ Bad: Using tokens for one-off values */
.special-component {
  margin-top: var(--spacing-md);
  margin-left: calc(var(--spacing-md) + 3px); /* Don't add arbitrary offsets */
}

/* ✅ Good: Use tokens for systematic values */
.special-component {
  margin: var(--spacing-md) 0 0 var(--spacing-lg);
}
```

### 2. Breaking Existing Designs

```typescript
// ❌ Bad: Direct replacement without visual verification
const oldBlue = '#0066cc';
const newBlue = getToken('color.primary.500'); // Might be different shade

// ✅ Good: Verify visual impact and adjust if needed
const brandBlue = getToken('color.primary.500'); // Test in UI first
```

### 3. Missing Fallbacks

```css
/* ❌ Bad: No fallback for unsupported browsers */
.component {
  color: var(--color-primary-500);
}

/* ✅ Good: Provide fallbacks */
.component {
  color: #007bff; /* fallback */
  color: var(--color-primary-500);
}
```

## 🎯 Best Practices

### 1. Incremental Migration

```typescript
// Migrate component by component, not all at once
const migratedComponents = [
  'Button',
  'Card',
  'Input',
  // Add more as you migrate
];
```

### 2. Team Training

```typescript
// Create team utilities for common patterns
const useTokens = () => ({
  getPrimaryColor: (shade = 500) => getToken(`color.primary.${shade}`),
  getSpacing: size => getToken(`spacing.${size}`),
  getShadow: level => getToken(`shadow.${level}`),
});
```

### 3. Documentation Updates

```markdown
<!-- Update style guides with token usage -->

## Color Usage

- Primary actions: `var(--color-primary-500)`
- Success states: `var(--color-success-500)`
- Error states: `var(--color-error-500)`
```

## 📚 Resources

- **[Design Tokens Guide](./DESIGN_TOKENS.md)** - Complete token usage guide
- **[API Documentation](./API.md#n00plicatedesign-tokens-api)** - Token API reference
- **[Troubleshooting](./TROUBLESHOOTING.md#design-token-problems)** - Common issues and solutions
- **[Package Documentation](../packages/design-tokens/README.md)** - Technical implementation details

## 🤝 Support

For migration assistance:

1. Review existing documentation and examples
2. Check troubleshooting guide for common issues
3. Open an issue with specific migration questions
4. Join team discussions for collaborative problem-solving

The migration to design tokens ensures long-term maintainability and design consistency across your application.
