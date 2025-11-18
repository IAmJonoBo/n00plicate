# 📐 Layout Systems Guide

> **Master layout principles and create well-structured, responsive interfaces**

## Overview

Layout is the foundation of good design. It determines how users navigate and understand your interface.
This guide covers grid systems, spacing, composition principles, and responsive design patterns.

## Table of Contents

1. [Grid Systems](#grid-systems)
2. [Spacing & Rhythm](#spacing--rhythm)
3. [Composition Principles](#composition-principles)
4. [Responsive Layouts](#responsive-layouts)
5. [Common Layout Patterns](#common-layout-patterns)
6. [Implementation Guide](#implementation-guide)

## Grid Systems

Grids bring order and consistency to your layouts. They help align elements and create visual rhythm.

### 12-Column Grid (Most Versatile)

The 12-column grid is the most flexible for responsive design.

**Why 12?** Divides evenly by 1, 2, 3, 4, 6, and 12 - perfect for various layouts.

```typescript
// Grid configuration
const gridSystem = {
  columns: 12,
  gutter: getToken('spacing.md'), // 1rem (16px)
  margin: getToken('spacing.lg'), // 1.5rem (24px)
  maxWidth: '1280px',
};

// Common column spans
const layouts = {
  full: 12, // Full width
  half: 6, // 50%
  third: 4, // 33.33%
  quarter: 3, // 25%
  twoThirds: 8, // 66.66%
  sidebar: 3, // 25% sidebar
  main: 9, // 75% main content
};
```

#### Implementation

```css
/* CSS Grid Implementation */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--ds-spacing-md);
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--ds-spacing-lg);
}

.col-12 {
  grid-column: span 12;
}
.col-9 {
  grid-column: span 9;
}
.col-6 {
  grid-column: span 6;
}
.col-4 {
  grid-column: span 4;
}
.col-3 {
  grid-column: span 3;
}

/* Responsive */
@media (max-width: 768px) {
  .col-md-12 {
    grid-column: span 12;
  }
  .col-md-6 {
    grid-column: span 6;
  }
}
```

```typescript
// Qwik/React component
import { component$ } from '@builder.io/qwik';
import { getToken } from '@n00plicate/design-tokens';

export const Grid = component$<{ columns?: number }>((props) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${props.columns || 12}, 1fr)`,
        gap: getToken('spacing.md'),
        maxWidth: '1280px',
        margin: '0 auto',
        padding: `0 ${getToken('spacing.lg')}`,
      }}
    >
      {props.children}
    </div>
  );
});

export const GridItem = component$<{ span?: number }>((props) => {
  return (
    <div style={{ gridColumn: `span ${props.span || 1}` }}>
      {props.children}
    </div>
  );
});
```

### 8-Point Grid System

All spacing uses multiples of 8px for consistency and alignment.

**Why 8?**

- Most screen sizes are divisible by 8
- Easy to calculate (8, 16, 24, 32, 40, 48...)
- Aligns perfectly with common icon sizes

```typescript
import { getToken } from '@n00plicate/design-tokens';

const spacing = {
  xs: getToken('spacing.xs'), // 0.5rem (8px)
  sm: getToken('spacing.sm'), // 0.75rem (12px)
  md: getToken('spacing.md'), // 1rem (16px)
  lg: getToken('spacing.lg'), // 1.5rem (24px)
  xl: getToken('spacing.xl'), // 2rem (32px)
  '2xl': getToken('spacing.2xl'), // 3rem (48px)
  '3xl': getToken('spacing.3xl'), // 4rem (64px)
};

// Component spacing
const component = {
  padding: spacing.md, // 16px
  margin: spacing.lg, // 24px
  gap: spacing.sm, // 12px (exception for tighter spacing)
  iconSize: spacing.lg, // 24px
};
```

#### Best Practices

```css
/* ✅ Good: Multiples of 8 */
.card {
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 8px;
}

/* ❌ Bad: Random values */
.card {
  padding: 15px;
  margin-bottom: 23px;
  border-radius: 7px;
}
```

### Baseline Grid

Aligns text to a vertical rhythm for visual harmony.

```css
:root {
  --baseline: 8px;
  --line-height: 1.5; /* 24px for 16px font */
}

/* All text aligns to 8px baseline */
h1 {
  font-size: 2.25rem; /* 36px */
  line-height: 1.333; /* 48px (6 × 8px) */
  margin-bottom: 24px; /* 3 × 8px */
}

p {
  font-size: 1rem; /* 16px */
  line-height: 1.5; /* 24px (3 × 8px) */
  margin-bottom: 24px; /* 3 × 8px */
}
```

## Spacing & Rhythm

Consistent spacing creates visual hierarchy and improves readability.

### Spacing Scale

```typescript
// T-shirt sizing scale
const spacingScale = {
  xs: '0.5rem', // 8px  - Tight spacing
  sm: '0.75rem', // 12px - Related items
  md: '1rem', // 16px - Default
  lg: '1.5rem', // 24px - Section spacing
  xl: '2rem', // 32px - Major sections
  '2xl': '3rem', // 48px - Large gaps
  '3xl': '4rem', // 64px - Hero sections
};
```

### Applying Spacing

#### Component Spacing

```typescript
// Button internal spacing
const button = {
  paddingX: getToken('spacing.md'), // 16px horizontal
  paddingY: getToken('spacing.sm'), // 12px vertical
  gap: getToken('spacing.xs'), // 8px between icon and text
};

// Card spacing
const card = {
  padding: getToken('spacing.lg'), // 24px
  gap: getToken('spacing.md'), // 16px between elements
  marginBottom: getToken('spacing.xl'), // 32px from next card
};

// Form spacing
const form = {
  fieldGap: getToken('spacing.md'), // 16px between fields
  labelGap: getToken('spacing.xs'), // 8px label to input
  sectionGap: getToken('spacing.xl'), // 32px between sections
};
```

#### Layout Spacing

```css
/* Content sections */
.section {
  padding: var(--ds-spacing-3xl) 0; /* 64px top/bottom */
  margin-bottom: var(--ds-spacing-2xl); /* 48px */
}

/* Related content groups */
.content-group {
  margin-bottom: var(--ds-spacing-xl); /* 32px */
}

.content-group > * + * {
  margin-top: var(--ds-spacing-md); /* 16px between siblings */
}

/* Compact lists */
.list-item + .list-item {
  margin-top: var(--ds-spacing-sm); /* 12px */
}
```

### White Space (Negative Space)

Strategic use of white space improves clarity and focus.

```typescript
// Generous spacing for emphasis
const hero = {
  padding: getToken('spacing.3xl'), // 64px
  marginBottom: getToken('spacing.2xl'), // 48px
};

// Moderate spacing for content
const content = {
  padding: getToken('spacing.xl'), // 32px
  gap: getToken('spacing.lg'), // 24px
};

// Tight spacing for related items
const menu = {
  padding: getToken('spacing.sm'), // 12px
  gap: getToken('spacing.xs'), // 8px
};
```

## Composition Principles

### Rule of Thirds

Divide layout into thirds horizontally and vertically. Place important elements at intersections.

```css
/* Two-thirds content, one-third sidebar */
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--ds-spacing-lg);
}

/* Three equal sections */
.three-column {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ds-spacing-md);
}
```

### Visual Weight & Balance

#### Symmetrical Balance

```css
/* Centered, equal weight on both sides */
.symmetrical {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

#### Asymmetrical Balance

```css
/* Different weights, balanced by position and size */
.asymmetrical {
  display: grid;
  grid-template-columns: 2fr 1fr;
}

.large-item {
  /* Heavier visual weight on left */
  font-size: var(--ds-font-size-2xl);
  font-weight: var(--ds-font-weight-bold);
}

.small-items {
  /* Multiple lighter items on right balance it out */
  font-size: var(--ds-font-size-sm);
}
```

### F-Pattern and Z-Pattern

#### F-Pattern (Content-Heavy Pages)

Users scan in an F-shape: top, left, then down.

```css
/* Optimize for F-pattern scanning */
.article {
  max-width: 65ch;
}

.article h2 {
  /* Strong left alignment for scanning */
  text-align: left;
  margin-top: var(--ds-spacing-2xl);
}

.article p {
  text-align: left;
  margin-bottom: var(--ds-spacing-md);
}
```

#### Z-Pattern (Simple Pages)

Eyes move in a Z: top-left → top-right → bottom-left → bottom-right.

```css
/* Header: top-left to top-right */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Hero: center-left */
.hero {
  text-align: left;
  padding: var(--ds-spacing-3xl) 0;
}

/* CTA: bottom-right */
.cta {
  display: flex;
  justify-content: flex-end;
  padding: var(--ds-spacing-xl);
}
```

### Proximity

Group related items close together.

```typescript
// Related form fields
const formGroup = {
  marginBottom: getToken('spacing.xl'), // 32px from other groups
};

const formLabel = {
  marginBottom: getToken('spacing.xs'), // 8px from input (close)
};

const formInput = {
  marginBottom: getToken('spacing.xs'), // 8px from helper text (close)
};

const formHelper = {
  marginBottom: 0, // No gap within group
};
```

## Responsive Layouts

### Mobile-First Approach

Start with mobile, progressively enhance for larger screens.

```css
/* Base (mobile) */
.container {
  padding: var(--ds-spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: var(--ds-spacing-lg);
    flex-direction: row;
    gap: var(--ds-spacing-lg);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: var(--ds-spacing-xl);
    max-width: 1280px;
    margin: 0 auto;
  }
}
```

### Breakpoint Strategy

```typescript
const breakpoints = {
  xs: '0px', // Mobile portrait
  sm: '640px', // Mobile landscape
  md: '768px', // Tablet
  lg: '1024px', // Desktop
  xl: '1280px', // Large desktop
  '2xl': '1536px', // Extra large
};

// Component responsive behavior
const responsive = {
  mobile: {
    columns: 1,
    padding: getToken('spacing.md'),
    fontSize: getToken('font.size.base'),
  },
  tablet: {
    columns: 2,
    padding: getToken('spacing.lg'),
    fontSize: getToken('font.size.lg'),
  },
  desktop: {
    columns: 3,
    padding: getToken('spacing.xl'),
    fontSize: getToken('font.size.lg'),
  },
};
```

### Container Queries (Modern)

```css
/* Layout adapts to container size, not viewport */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}

@container (min-width: 600px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

## Common Layout Patterns

### Holy Grail Layout

Header, footer, main content with sidebars.

```css
.holy-grail {
  display: grid;
  grid-template-areas:
    'header header header'
    'left main right'
    'footer footer footer';
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: var(--ds-spacing-lg);
}

.header {
  grid-area: header;
}
.left-sidebar {
  grid-area: left;
}
.main-content {
  grid-area: main;
}
.right-sidebar {
  grid-area: right;
}
.footer {
  grid-area: footer;
}

/* Responsive */
@media (max-width: 768px) {
  .holy-grail {
    grid-template-areas:
      'header'
      'main'
      'left'
      'right'
      'footer';
    grid-template-columns: 1fr;
  }
}
```

### Card Grid Layout

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-xl);
}

.card {
  background: var(--ds-color-background-secondary);
  border-radius: var(--ds-border-radius-lg);
  padding: var(--ds-spacing-lg);
  box-shadow: var(--ds-shadow-md);
}
```

### Sidebar Layout

```css
.sidebar-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: var(--ds-spacing-xl);
  min-height: 100vh;
}

.sidebar {
  background: var(--ds-color-background-secondary);
  padding: var(--ds-spacing-lg);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.main-content {
  padding: var(--ds-spacing-xl);
  max-width: 1200px;
}

/* Mobile: Stack */
@media (max-width: 768px) {
  .sidebar-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
  }
}
```

### Hero Section

```css
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: var(--ds-spacing-3xl) var(--ds-spacing-xl);
  text-align: center;
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: var(--ds-font-size-5xl);
  font-weight: var(--ds-font-weight-bold);
  margin-bottom: var(--ds-spacing-lg);
}

.hero-description {
  font-size: var(--ds-font-size-xl);
  margin-bottom: var(--ds-spacing-2xl);
}
```

### Split Screen

```css
.split-screen {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.split-left,
.split-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-3xl);
}

.split-left {
  background: var(--ds-color-primary-500);
  color: var(--ds-color-neutral-50);
}

.split-right {
  background: var(--ds-color-background-primary);
}

/* Mobile: Stack */
@media (max-width: 768px) {
  .split-screen {
    grid-template-columns: 1fr;
  }
}
```

## Implementation Guide

### Flexbox vs Grid

#### Use Flexbox When

- One-dimensional layouts (row or column)
- Content size determines layout
- Alignment is the primary concern
- You need flexibility

```css
/* Flexbox for navigation */
.nav {
  display: flex;
  gap: var(--ds-spacing-md);
  align-items: center;
}

/* Flexbox for centering */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

#### Use Grid When:

- Two-dimensional layouts
- Layout determines content size
- Complex overlapping needed
- You need precise control

```css
/* Grid for page layout */
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
}

/* Grid for card layouts */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--ds-spacing-lg);
}
```

### Reusable Layout Components

```typescript
// Qwik layout components
import { component$, Slot } from '@builder.io/qwik';
import { getToken } from '@n00plicate/design-tokens';

// Stack: vertical spacing
export const Stack = component$<{ gap?: string }>((props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: props.gap || getToken('spacing.md'),
      }}
    >
      <Slot />
    </div>
  );
});

// Inline: horizontal spacing
export const Inline = component$<{ gap?: string; align?: string }>((props) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: props.gap || getToken('spacing.md'),
        alignItems: props.align || 'center',
      }}
    >
      <Slot />
    </div>
  );
});

// Container: max-width and centering
export const Container = component$<{ maxWidth?: string }>((props) => {
  return (
    <div
      style={{
        maxWidth: props.maxWidth || '1280px',
        margin: '0 auto',
        padding: `0 ${getToken('spacing.lg')}`,
      }}
    >
      <Slot />
    </div>
  );
});

// Box: spacing utilities
export const Box = component$<{
  padding?: string;
  margin?: string;
}>((props) => {
  return (
    <div
      style={{
        padding: props.padding,
        margin: props.margin,
      }}
    >
      <Slot />
    </div>
  );
});
```

## Layout Checklist

### Planning

- [ ] Choose appropriate grid system (12-column recommended)
- [ ] Define spacing scale (8-point system)
- [ ] Plan responsive breakpoints
- [ ] Consider content hierarchy
- [ ] Map user flow patterns

### Design

- [ ] Use consistent spacing throughout
- [ ] Align elements to grid
- [ ] Create clear visual hierarchy
- [ ] Apply proximity for grouping
- [ ] Balance visual weight
- [ ] Provide adequate white space

### Implementation

- [ ] Use design tokens for spacing
- [ ] Choose flex or grid appropriately
- [ ] Test all breakpoints
- [ ] Ensure touch targets (44×44px minimum)
- [ ] Test with real content
- [ ] Verify keyboard navigation

### Accessibility

- [ ] Logical reading order
- [ ] Sufficient contrast
- [ ] Focus indicators visible
- [ ] No horizontal scrolling
- [ ] Content reflows at 200% zoom

## Tools & Resources

### Layout Tools

- [CSS Grid Generator](https://cssgrid-generator.netlify.app/)
- [Flexbox Froggy](https://flexboxfroggy.com/) - Learn flexbox
- [Grid Garden](https://cssgridgarden.com/) - Learn grid

### n00plicate Tools

- [Grid Inspector](/tools/grid-inspector) - Visualize grid system
- [Spacing Calculator](/tools/spacing) - Calculate spacing values
- [Layout Builder](/tools/layout-builder) - Build layouts visually

## Further Reading

- 📖 [Design Principles Guide](./DESIGN_PRINCIPLES.md)
- 📝 [Typography System](./TYPOGRAPHY_SYSTEM.md)
- 🎨 [Color Theory Guide](./COLOR_THEORY.md)
- ♿ [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)

---

**Need help?** Check the [Troubleshooting Guide](../TROUBLESHOOTING.md) or [open an issue](https://github.com/n00tropic/n00plicate/issues/new).
