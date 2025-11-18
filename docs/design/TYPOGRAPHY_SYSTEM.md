# 📝 Typography System Guide

> **Master typography principles and create beautiful, readable interfaces**

## Overview

Typography is the art and technique of arranging type to make written language legible, readable, and appealing.
This guide covers everything from font selection to implementing a type scale that works across all platforms.

## Table of Contents

1. [Type Fundamentals](#type-fundamentals)
2. [Font Selection](#font-selection)
3. [Type Scale & Hierarchy](#type-scale--hierarchy)
4. [Readability & Legibility](#readability--legibility)
5. [Responsive Typography](#responsive-typography)
6. [Implementation Guide](#implementation-guide)

## Type Fundamentals

### Anatomy of Type

Understanding type anatomy helps you make informed decisions:

- **Baseline**: The line upon which letters sit
- **Cap Height**: Height of capital letters
- **X-height**: Height of lowercase letters (excluding ascenders/descenders)
- **Ascender**: Parts of letters that extend above x-height (b, d, h)
- **Descender**: Parts that extend below baseline (g, p, q)
- **Leading/Line Height**: Vertical space between lines of text
- **Kerning**: Space between individual letter pairs
- **Tracking**: Overall spacing between all letters

### Font Classifications

#### Serif Fonts

**Characteristics**: Small decorative strokes (serifs) at the ends of letters

**Best For**:

- Long-form reading (books, articles)
- Traditional or formal contexts
- Print materials

**Examples**: Georgia, Times New Roman, Merriweather, Lora

```typescript
import { getToken } from '@n00plicate/design-tokens';

const serifStyle = {
  fontFamily: getToken('font.family.serif'),
  fontSize: getToken('font.size.base'),
  lineHeight: '1.6',
  letterSpacing: '0.01em',
};
```

#### Sans-Serif Fonts

**Characteristics**: Clean, without decorative strokes

**Best For**:

- UI/UX design
- Screen reading
- Modern, minimal aesthetics
- Short text and headlines

**Examples**: Inter, Roboto, Helvetica, Arial

```typescript
const sansSerifStyle = {
  fontFamily: getToken('font.family.sans'),
  fontSize: getToken('font.size.base'),
  lineHeight: '1.5',
};
```

#### Monospace Fonts

**Characteristics**: Fixed-width characters

**Best For**:

- Code snippets
- Data tables
- Technical documentation

**Examples**: Fira Code, Monaco, Consolas, Courier

```typescript
const monospaceStyle = {
  fontFamily: getToken('font.family.mono'),
  fontSize: getToken('font.size.sm'),
  lineHeight: '1.6',
  letterSpacing: '-0.02em',
};
```

## Font Selection

### Choosing the Right Fonts

#### Single Font Family (Recommended for Beginners)

Use one versatile sans-serif for everything:

```typescript
const singleFontSystem = {
  heading: {
    family: getToken('font.family.sans'),
    weight: getToken('font.weight.bold'),
  },
  body: {
    family: getToken('font.family.sans'),
    weight: getToken('font.weight.normal'),
  },
  caption: {
    family: getToken('font.family.sans'),
    weight: getToken('font.weight.medium'),
  },
};
```

**Pros**: Consistent, cohesive, easier to manage
**Cons**: Less visual contrast, may feel monotonous

#### Two Font Pairing

Combine fonts for visual interest:

```typescript
const pairedFontSystem = {
  // Display: Serif for headings
  heading: {
    family: getToken('font.family.serif'),
    weight: getToken('font.weight.bold'),
  },
  // Text: Sans-serif for body
  body: {
    family: getToken('font.family.sans'),
    weight: getToken('font.weight.normal'),
  },
  // Technical: Monospace for code
  code: {
    family: getToken('font.family.mono'),
    weight: getToken('font.weight.normal'),
  },
};
```

**Pros**: Visual hierarchy, personality, variety
**Cons**: Requires careful pairing, more complex to manage

### Font Pairing Guidelines

#### Successful Pairing Strategies

**Contrast**: Pair fonts that are noticeably different

- ✅ Serif heading + Sans-serif body
- ❌ Two similar sans-serifs

**Mood**: Ensure fonts share a similar mood/era

- ✅ Modern geometric sans + Modern serif
- ❌ Classical serif + Futuristic sans

**Hierarchy**: Use weight and size to create clear hierarchy

```typescript
const hierarchy = {
  h1: {
    family: getToken('font.family.serif'),
    size: getToken('font.size.4xl'),
    weight: getToken('font.weight.bold'),
  },
  h2: {
    family: getToken('font.family.serif'),
    size: getToken('font.size.3xl'),
    weight: getToken('font.weight.semibold'),
  },
  body: {
    family: getToken('font.family.sans'),
    size: getToken('font.size.base'),
    weight: getToken('font.weight.normal'),
  },
};
```

## Type Scale & Hierarchy

### Understanding Type Scale

A type scale is a progression of font sizes that creates visual harmony. Common approaches:

#### Modular Scale (Recommended)

Based on mathematical ratios:

#### Golden Ratio (1.618)

```typescript
// Perfect Fifth scale
const goldenScale = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
};
```

#### Major Third (1.25)

```typescript
// More subtle progression
const majorThird = {
  xs: '0.8rem', // 12.8px
  sm: '0.9rem', // 14.4px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.563rem', // 25px
  '3xl': '1.953rem', // 31.2px
  '4xl': '2.441rem', // 39px
};
```

### Implementing Type Hierarchy

```typescript
import { getToken } from '@n00plicate/design-tokens';

// Complete type system
const typeSystem = {
  // Display text (hero sections)
  display: {
    fontSize: getToken('font.size.5xl'),
    fontWeight: getToken('font.weight.bold'),
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
  },

  // Headings
  h1: {
    fontSize: getToken('font.size.4xl'),
    fontWeight: getToken('font.weight.bold'),
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: getToken('font.size.3xl'),
    fontWeight: getToken('font.weight.semibold'),
    lineHeight: '1.3',
  },
  h3: {
    fontSize: getToken('font.size.2xl'),
    fontWeight: getToken('font.weight.semibold'),
    lineHeight: '1.4',
  },
  h4: {
    fontSize: getToken('font.size.xl'),
    fontWeight: getToken('font.weight.semibold'),
    lineHeight: '1.4',
  },
  h5: {
    fontSize: getToken('font.size.lg'),
    fontWeight: getToken('font.weight.semibold'),
    lineHeight: '1.5',
  },

  // Body text
  bodyLarge: {
    fontSize: getToken('font.size.lg'),
    fontWeight: getToken('font.weight.normal'),
    lineHeight: '1.6',
  },
  body: {
    fontSize: getToken('font.size.base'),
    fontWeight: getToken('font.weight.normal'),
    lineHeight: '1.6',
  },
  bodySmall: {
    fontSize: getToken('font.size.sm'),
    fontWeight: getToken('font.weight.normal'),
    lineHeight: '1.5',
  },

  // UI text
  caption: {
    fontSize: getToken('font.size.xs'),
    fontWeight: getToken('font.weight.normal'),
    lineHeight: '1.4',
  },
  overline: {
    fontSize: getToken('font.size.xs'),
    fontWeight: getToken('font.weight.semibold'),
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    lineHeight: '1.4',
  },

  // Code
  code: {
    fontFamily: getToken('font.family.mono'),
    fontSize: getToken('font.size.sm'),
    lineHeight: '1.6',
  },
};
```

## Readability & Legibility

### Optimizing for Reading

#### Line Length (Measure)

**Optimal**: 45-75 characters per line (avg ~66)

```css
.readable-content {
  max-width: 65ch; /* 65 characters */
  /* or */
  max-width: 700px; /* ~45-75 characters at 16px */
}
```

#### Line Height (Leading)

**Body Text**: 1.4-1.6 (1.5 recommended)
**Headings**: 1.1-1.3
**Small Text**: 1.5-1.6

```typescript
const lineHeights = {
  tight: '1.2', // Headings
  normal: '1.5', // Body
  relaxed: '1.75', // Large text blocks
};
```

#### Letter Spacing (Tracking)

- **All Caps**: Increase by 0.05-0.1em
- **Large Text**: Reduce by -0.01 to -0.02em
- **Body Text**: Default (0)
- **Small Text**: Increase slightly (0.01em)

```typescript
const letterSpacing = {
  tight: '-0.02em', // Large headings
  normal: '0', // Body text
  wide: '0.05em', // All caps, small text
  wider: '0.1em', // Overline, labels
};
```

### Contrast & Color

#### Text Color Guidelines

```typescript
// High contrast for body text
const textColors = {
  primary: getToken('color.text.primary'), // 900 on 50 (16.7:1)
  secondary: getToken('color.text.secondary'), // 700 on 50 (8.2:1)
  disabled: getToken('color.text.disabled'), // 400 on 50 (4.6:1)
};

// Size matters: smaller text needs higher contrast
const smallText = {
  color: getToken('color.text.primary'),
  fontSize: getToken('font.size.sm'),
  // Needs higher contrast (7:1 for AAA)
};

const largeText = {
  color: getToken('color.text.secondary'),
  fontSize: getToken('font.size.2xl'),
  // Can use lower contrast (4.5:1 for AAA)
};
```

#### Minimum Contrast Ratios (WCAG)

| Text Size                             | AA    | AAA   |
| ------------------------------------- | ----- | ----- |
| Small text (<18px normal, <14px bold) | 4.5:1 | 7:1   |
| Large text (≥18px normal, ≥14px bold) | 3:1   | 4.5:1 |

## Responsive Typography

### Fluid Typography

Scale typography smoothly across screen sizes:

```css
/* Fluid type scale using clamp() */
.heading-1 {
  font-size: clamp(
    2rem,
    /* Min: 32px on mobile */ 5vw + 1rem,
    /* Scales with viewport */ 3.5rem /* Max: 56px on desktop */
  );
}

.body-text {
  font-size: clamp(
    1rem,
    /* Min: 16px */ 2vw + 0.5rem,
    /* Scales */ 1.125rem /* Max: 18px */
  );
}
```

### Breakpoint-Based Scaling

```typescript
// Mobile-first approach
const responsiveType = {
  h1: {
    // Mobile
    fontSize: getToken('font.size.2xl'),
    lineHeight: '1.2',

    // Tablet
    '@media (min-width: 768px)': {
      fontSize: getToken('font.size.3xl'),
    },

    // Desktop
    '@media (min-width: 1024px)': {
      fontSize: getToken('font.size.4xl'),
      lineHeight: '1.1',
    },
  },

  body: {
    // Mobile
    fontSize: getToken('font.size.base'),
    lineHeight: '1.6',

    // Desktop - slightly larger
    '@media (min-width: 1024px)': {
      fontSize: getToken('font.size.lg'),
    },
  },
};
```

### Mobile Typography Tips

- ✅ Use larger touch targets (minimum 44x44px)
- ✅ Increase line height for easier reading
- ✅ Simplify font stacks (fewer variations)
- ✅ Test on actual devices
- ❌ Don't make text too small to read
- ❌ Avoid long lines of text

## Implementation Guide

### Using Design Tokens

```typescript
// Import tokens
import { getToken } from '@n00plicate/design-tokens';

// Build type components
const Heading1 = styled.h1`
  font-family: ${getToken('font.family.sans')};
  font-size: ${getToken('font.size.4xl')};
  font-weight: ${getToken('font.weight.bold')};
  line-height: 1.2;
  color: ${getToken('color.text.primary')};
  margin-bottom: ${getToken('spacing.lg')};
`;

const Body = styled.p`
  font-family: ${getToken('font.family.sans')};
  font-size: ${getToken('font.size.base')};
  font-weight: ${getToken('font.weight.normal')};
  line-height: 1.6;
  color: ${getToken('color.text.body')};
  margin-bottom: ${getToken('spacing.md')};
`;
```

### CSS Custom Properties

```css
/* Define type system */
:root {
  /* Font families */
  --font-sans: var(--ds-font-family-sans);
  --font-serif: var(--ds-font-family-serif);
  --font-mono: var(--ds-font-family-mono);

  /* Font sizes */
  --text-xs: var(--ds-font-size-xs);
  --text-sm: var(--ds-font-size-sm);
  --text-base: var(--ds-font-size-base);
  --text-lg: var(--ds-font-size-lg);
  --text-xl: var(--ds-font-size-xl);
  --text-2xl: var(--ds-font-size-2xl);
  --text-3xl: var(--ds-font-size-3xl);
  --text-4xl: var(--ds-font-size-4xl);

  /* Font weights */
  --font-normal: var(--ds-font-weight-normal);
  --font-medium: var(--ds-font-weight-medium);
  --font-semibold: var(--ds-font-weight-semibold);
  --font-bold: var(--ds-font-weight-bold);
}

/* Apply to elements */
h1 {
  font-family: var(--font-sans);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: 1.2;
}

p {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: 1.6;
}
```

## Typography Checklist

### Before You Start

- [ ] Choose 1-2 font families max
- [ ] Define your type scale
- [ ] Set up design tokens
- [ ] Plan responsive behavior

### During Design

- [ ] Create clear visual hierarchy
- [ ] Use consistent line heights
- [ ] Check line length (45-75 chars)
- [ ] Apply appropriate font weights
- [ ] Test readability at all sizes

### Testing

- [ ] Check contrast ratios (4.5:1 minimum)
- [ ] Test on multiple devices
- [ ] Verify with different zoom levels
- [ ] Check with screen readers
- [ ] Test with actual content (not Lorem Ipsum)

### Accessibility

- [ ] Use semantic HTML (h1-h6, p, etc.)
- [ ] Don't rely on size/color alone
- [ ] Provide text alternatives for icons
- [ ] Ensure focusable elements are visible
- [ ] Test keyboard navigation

## Common Mistakes to Avoid

❌ **Too many font families**: Stick to 2-3 max
❌ **Insufficient contrast**: Always check ratios
❌ **Lines too long**: Keep under 75 characters
❌ **Inconsistent spacing**: Use design tokens
❌ **Too many weights**: 3-4 weights are plenty
❌ **All caps overuse**: Use sparingly, increase tracking
❌ **Justified text**: Causes rivers of white space
❌ **Tiny text**: Minimum 14px for body, 12px for captions

## Advanced Topics

### Variable Fonts

Modern browsers support variable fonts with adjustable weight, width, and slant:

```css
@font-face {
  font-family: 'Inter Variable';
  src: url('Inter-Variable.woff2') format('woff2');
  font-weight: 100 900; /* Range */
  font-display: swap;
}

.custom-weight {
  font-family: 'Inter Variable';
  font-weight: 650; /* Any value in range */
}
```

### Performance Optimization

```typescript
// Load critical fonts first
const fontLoadStrategy = {
  // Preload critical fonts
  critical: ['font-sans-regular', 'font-sans-bold'],

  // Lazy load decorative fonts
  deferred: ['font-serif', 'font-display'],

  // System font fallbacks
  fallback: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Menlo, Monaco, Consolas, "Courier New", monospace',
  },
};
```

## Tools & Resources

### Type Scale Generators

- [Type Scale](https://typescale.com/)
- [Modular Scale](https://www.modularscale.com/)
- [Fluid Type Scale Calculator](https://fluid-type-scale.com/)

### Font Pairing Tools

- [Font Pair](https://fontpair.co/)
- [Google Font Pairs](https://fonts.google.com/)
- [Type Connection](http://www.typeconnection.com/)

### Testing Tools

- [Contrast Ratio Checker](/tools/contrast-checker)
- [Type Tester](/tools/type-tester)
- [Responsive Type Checker](/tools/responsive-type)

## Further Reading

- 📖 [Design Principles Guide](./DESIGN_PRINCIPLES.md)
- 🎨 [Color Theory Guide](./COLOR_THEORY.md)
- ♿ [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)
- 📐 [Layout Systems](./LAYOUT_SYSTEMS.md)

---

**Need help?** Check the [Troubleshooting Guide](../TROUBLESHOOTING.md) or [open an issue](https://github.com/n00tropic/n00plicate/issues/new).
