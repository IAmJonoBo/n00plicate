# 🎨 Color Theory Guide

> **Master color theory and create stunning, accessible color palettes**

## Overview

Color is one of the most powerful tools in design. It can evoke emotions, guide attention, communicate meaning,
and establish brand identity. This guide covers color theory fundamentals and practical application in UI design.

## Table of Contents

1. [Color Fundamentals](#color-fundamentals)
2. [Color Psychology](#color-psychology)
3. [Color Harmony](#color-harmony)
4. [Accessibility & Contrast](#accessibility--contrast)
5. [Building Color Systems](#building-color-systems)
6. [Implementation Guide](#implementation-guide)

## Color Fundamentals

### Color Models

#### RGB (Red, Green, Blue)

**Use for**: Screens, digital design

```typescript
const rgb = {
  red: 'rgb(59, 130, 246)',
  green: 'rgb(16, 185, 129)',
  blue: 'rgb(37, 99, 235)',
};
```

#### Hex (Hexadecimal)

**Use for**: CSS, digital design (compact format)

```typescript
const hex = {
  primary: '#3b82f6', // Blue
  success: '#10b981', // Green
  danger: '#ef4444', // Red
};
```

#### HSL (Hue, Saturation, Lightness)

**Use for**: Creating color variations, understanding relationships

```typescript
// HSL makes it easy to create variations
const hsl = {
  base: 'hsl(217, 91%, 60%)', // Primary blue
  lighter: 'hsl(217, 91%, 70%)', // Lighter (+10% lightness)
  darker: 'hsl(217, 91%, 50%)', // Darker (-10% lightness)
  desaturated: 'hsl(217, 50%, 60%)', // Less vibrant
};
```

**HSL Parameters**:

- **Hue**: 0-360° (color wheel position)
  - 0°/360° = Red
  - 120° = Green
  - 240° = Blue
- **Saturation**: 0-100% (color intensity)
  - 0% = Gray
  - 100% = Full color
- **Lightness**: 0-100% (brightness)
  - 0% = Black
  - 50% = Pure color
  - 100% = White

### Color Properties

#### Hue

The actual color (red, blue, green, etc.)

```typescript
const hues = {
  red: 'hsl(0, 70%, 50%)',
  orange: 'hsl(30, 70%, 50%)',
  yellow: 'hsl(60, 70%, 50%)',
  green: 'hsl(120, 70%, 50%)',
  cyan: 'hsl(180, 70%, 50%)',
  blue: 'hsl(240, 70%, 50%)',
  purple: 'hsl(300, 70%, 50%)',
};
```

#### Saturation

How intense or pure the color is

```typescript
const saturationScale = {
  gray: 'hsl(217, 0%, 50%)', // No saturation
  muted: 'hsl(217, 30%, 50%)', // Low saturation
  balanced: 'hsl(217, 60%, 50%)', // Medium saturation
  vibrant: 'hsl(217, 90%, 50%)', // High saturation
};
```

#### Lightness/Value

How light or dark the color is

```typescript
const lightnessScale = {
  veryDark: 'hsl(217, 70%, 10%)',
  dark: 'hsl(217, 70%, 30%)',
  medium: 'hsl(217, 70%, 50%)',
  light: 'hsl(217, 70%, 70%)',
  veryLight: 'hsl(217, 70%, 90%)',
};
```

## Color Psychology

Colors evoke emotional responses and communicate meaning. Understanding this helps create effective designs.

### Color Meanings (Western Context)

#### 🔴 Red

**Emotions**: Energy, passion, urgency, danger, excitement
**Use Cases**:

- Error messages and alerts
- Call-to-action buttons (sparingly)
- Sale/discount indicators
- Important warnings

```typescript
import { getToken } from '@n00plicate/design-tokens';

const redUsage = {
  error: getToken('color.danger.500'),
  errorBackground: getToken('color.danger.50'),
  errorBorder: getToken('color.danger.200'),
};
```

#### 🔵 Blue

**Emotions**: Trust, calm, professional, stable, reliable
**Use Cases**:

- Primary brand color (most common)
- Links and interactive elements
- Professional/corporate interfaces
- Technology and finance

```typescript
const blueUsage = {
  primary: getToken('color.primary.500'),
  link: getToken('color.primary.600'),
  hover: getToken('color.primary.700'),
};
```

#### 🟢 Green

**Emotions**: Success, growth, nature, health, go
**Use Cases**:

- Success messages
- Confirmation actions
- Environmental/sustainability
- Financial growth indicators

```typescript
const greenUsage = {
  success: getToken('color.success.500'),
  successBackground: getToken('color.success.50'),
  approve: getToken('color.success.600'),
};
```

#### 🟡 Yellow/Orange

**Emotions**: Caution, warmth, optimism, attention
**Use Cases**:

- Warning messages
- Highlight important info
- Call-to-action accents
- Energy and enthusiasm

```typescript
const warningUsage = {
  warning: getToken('color.warning.500'),
  warningBackground: getToken('color.warning.50'),
  highlight: getToken('color.warning.200'),
};
```

#### 🟣 Purple

**Emotions**: Luxury, creativity, wisdom, spirituality
**Use Cases**:

- Premium features
- Creative tools
- Spiritual/wellness
- Innovation-focused brands

#### ⚫ Black/Gray

**Emotions**: Sophistication, power, elegance, neutrality
**Use Cases**:

- Text (high contrast)
- Backgrounds
- Minimalist designs
- Luxury brands

```typescript
const neutralUsage = {
  text: getToken('color.neutral.900'),
  background: getToken('color.neutral.50'),
  border: getToken('color.neutral.200'),
};
```

### Cultural Considerations

⚠️ **Important**: Color meanings vary significantly across cultures:

- **Red**: Prosperity in China, mourning in South Africa
- **White**: Purity in West, mourning in East Asia
- **Yellow**: Imperial in China, cowardice in some Western contexts
- **Green**: Islam's holy color, luck in Ireland

**Best Practice**: Research your target audience's cultural context and test with diverse users.

## Color Harmony

Color harmony creates pleasing combinations based on color wheel relationships.

### Monochromatic

**What**: Variations of a single hue (different shades, tints, tones)
**Pros**: Cohesive, elegant, easy to create
**Cons**: Can lack contrast, may feel monotonous

```typescript
import { getToken } from '@n00plicate/design-tokens';

const monochromaticPalette = {
  lightest: getToken('color.primary.50'), // Tint (add white)
  lighter: getToken('color.primary.100'),
  light: getToken('color.primary.200'),
  base: getToken('color.primary.500'), // Base hue
  dark: getToken('color.primary.700'),
  darker: getToken('color.primary.800'),
  darkest: getToken('color.primary.900'), // Shade (add black)
};

// Use case: Subtle UI with depth
const buttonStates = {
  default: monochromaticPalette.base,
  hover: monochromaticPalette.dark,
  active: monochromaticPalette.darker,
  disabled: monochromaticPalette.lighter,
};
```

### Analogous

**What**: Colors next to each other on color wheel (30° apart)
**Pros**: Harmonious, natural, serene
**Cons**: Lacks strong contrast

```typescript
// Blue-based analogous (Blue, Blue-Green, Green)
const analogousPalette = {
  primary: 'hsl(240, 70%, 50%)', // Blue
  secondary: 'hsl(210, 70%, 50%)', // Blue-Cyan
  tertiary: 'hsl(180, 70%, 50%)', // Cyan
};

// Use case: Nature, calm interfaces
const natureTheme = {
  primary: getToken('color.primary.500'), // Blue
  accent1: getToken('color.info.500'), // Cyan
  accent2: getToken('color.success.500'), // Green
};
```

### Complementary

**What**: Colors opposite on color wheel (180° apart)
**Pros**: Maximum contrast, vibrant, energetic
**Cons**: Can be jarring if overused

```typescript
// Blue and Orange
const complementaryPalette = {
  primary: 'hsl(240, 70%, 50%)', // Blue
  accent: 'hsl(60, 70%, 50%)', // Orange (opposite)
};

// Use case: Call-to-action with high contrast
const ctaDesign = {
  background: getToken('color.primary.600'), // Blue
  button: getToken('color.warning.500'), // Orange
  buttonHover: getToken('color.warning.600'),
};
```

### Split-Complementary

**What**: Base color + two colors adjacent to its complement
**Pros**: High contrast but more balanced than complementary
**Cons**: Complex to balance

```typescript
// Blue, Yellow-Orange, Red-Orange
const splitComplementary = {
  primary: 'hsl(240, 70%, 50%)', // Blue
  accent1: 'hsl(30, 70%, 50%)', // Yellow-Orange
  accent2: 'hsl(0, 70%, 50%)', // Red-Orange
};
```

### Triadic

**What**: Three colors evenly spaced (120° apart)
**Pros**: Vibrant, balanced, versatile
**Cons**: Can feel busy if all are prominent

```typescript
// Red, Yellow, Blue (primary colors)
const triadicPalette = {
  primary: 'hsl(0, 70%, 50%)', // Red
  secondary: 'hsl(120, 70%, 50%)', // Yellow
  tertiary: 'hsl(240, 70%, 50%)', // Blue
};

// Use case: Colorful, playful interfaces
const playfulTheme = {
  primary: getToken('color.primary.500'),
  success: getToken('color.success.500'),
  warning: getToken('color.warning.500'),
};
```

### Tetradic (Double Complementary)

**What**: Two complementary pairs
**Pros**: Rich, works well with one dominant color
**Cons**: Hard to balance, can overwhelm

```typescript
// Blue + Orange, Red + Green
const tetradicPalette = {
  primary: 'hsl(240, 70%, 50%)', // Blue
  complement: 'hsl(60, 70%, 50%)', // Orange
  secondary: 'hsl(0, 70%, 50%)', // Red
  accent: 'hsl(120, 70%, 50%)', // Green
};
```

## Accessibility & Contrast

Ensuring sufficient contrast is critical for accessibility and usability.

### WCAG Standards

#### Contrast Ratio Requirements

| Content Type                     | AA (Minimum) | AAA (Enhanced) |
| -------------------------------- | ------------ | -------------- |
| Normal text (<18px)              | 4.5:1        | 7:1            |
| Large text (≥18px or ≥14px bold) | 3:1          | 4.5:1          |
| UI components & graphics         | 3:1          | -              |

### Checking Contrast

```typescript
// High contrast combinations from design tokens
const accessiblePairs = {
  // Black on white (highest contrast)
  maxContrast: {
    text: getToken('color.neutral.900'), // #1a1a1a
    background: getToken('color.neutral.50'), // #f9fafb
    ratio: '16.7:1', // AAA for all sizes
  },

  // Dark gray on white
  highContrast: {
    text: getToken('color.neutral.700'),
    background: getToken('color.neutral.50'),
    ratio: '8.2:1', // AAA for normal, AA for large
  },

  // Primary blue on white
  brandContrast: {
    text: getToken('color.primary.600'),
    background: getToken('color.neutral.50'),
    ratio: '4.8:1', // AA for normal text
  },

  // White on primary
  inverseContrast: {
    text: getToken('color.neutral.50'),
    background: getToken('color.primary.600'),
    ratio: '4.8:1', // AA for normal text
  },
};
```

### Testing Tools

```typescript
// Contrast checker utility
function getContrastRatio(foreground: string, background: string): number {
  // Calculate relative luminance
  const getLuminance = (color: string): number => {
    // Parse color and calculate luminance
    // (Implementation simplified for example)
    return 0.5; // Placeholder
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Usage
const ratio = getContrastRatio('#000000', '#FFFFFF');
console.log(`Contrast ratio: ${ratio}:1`); // 21:1 (perfect)
```

### Color Blindness Considerations

Approximately 8% of men and 0.5% of women have color vision deficiency.

**Types**:

- **Deuteranopia** (most common): Red-green blindness
- **Protanopia**: Red-green blindness (different type)
- **Tritanopia** (rare): Blue-yellow blindness

**Best Practices**:

```typescript
// Don't rely on color alone
const statusIndicators = {
  success: {
    color: getToken('color.success.600'),
    icon: '✓',
    label: 'Success',
  },
  error: {
    color: getToken('color.danger.600'),
    icon: '✗',
    label: 'Error',
  },
  warning: {
    color: getToken('color.warning.600'),
    icon: '⚠',
    label: 'Warning',
  },
};

// Use patterns in addition to color
const chartColors = {
  series1: { color: '#3b82f6', pattern: 'solid' },
  series2: { color: '#10b981', pattern: 'striped' },
  series3: { color: '#f59e0b', pattern: 'dotted' },
};
```

## Building Color Systems

### Creating a Color Scale

A complete color scale provides flexibility while maintaining consistency.

#### 10-Step Scale (Recommended)

```typescript
// Generate a scale from a base color
const generateColorScale = (baseHue: number) => ({
  50: `hsl(${baseHue}, 90%, 95%)`, // Lightest
  100: `hsl(${baseHue}, 90%, 90%)`,
  200: `hsl(${baseHue}, 90%, 80%)`,
  300: `hsl(${baseHue}, 90%, 70%)`,
  400: `hsl(${baseHue}, 90%, 60%)`,
  500: `hsl(${baseHue}, 90%, 50%)`, // Base
  600: `hsl(${baseHue}, 90%, 40%)`,
  700: `hsl(${baseHue}, 90%, 30%)`,
  800: `hsl(${baseHue}, 90%, 20%)`,
  900: `hsl(${baseHue}, 90%, 10%)`, // Darkest
});

// Apply to color system
const colorSystem = {
  primary: generateColorScale(217), // Blue
  success: generateColorScale(142), // Green
  warning: generateColorScale(38), // Orange
  danger: generateColorScale(0), // Red
  neutral: generateColorScale(217), // Gray (low saturation)
};
```

### Semantic Color Tokens

Map colors to meaning and purpose:

```typescript
import { getToken } from '@n00plicate/design-tokens';

const semanticColors = {
  // Brand
  brand: {
    primary: getToken('color.primary.500'),
    secondary: getToken('color.secondary.500'),
  },

  // Feedback
  feedback: {
    success: getToken('color.success.500'),
    warning: getToken('color.warning.500'),
    danger: getToken('color.danger.500'),
    info: getToken('color.info.500'),
  },

  // Text
  text: {
    primary: getToken('color.text.primary'), // Highest contrast
    secondary: getToken('color.text.secondary'), // Medium contrast
    disabled: getToken('color.text.disabled'), // Low contrast
    inverse: getToken('color.text.inverse'), // For dark backgrounds
  },

  // Backgrounds
  background: {
    primary: getToken('color.background.primary'), // Main background
    secondary: getToken('color.background.secondary'), // Cards, panels
    tertiary: getToken('color.background.tertiary'), // Subtle highlights
    inverse: getToken('color.background.inverse'), // Dark mode
  },

  // Borders
  border: {
    default: getToken('color.border.default'),
    hover: getToken('color.border.hover'),
    focus: getToken('color.border.focus'),
    error: getToken('color.border.error'),
  },

  // Interactive
  interactive: {
    default: getToken('color.interactive.default'),
    hover: getToken('color.interactive.hover'),
    active: getToken('color.interactive.active'),
    disabled: getToken('color.interactive.disabled'),
  },
};
```

### Component-Specific Colors

```typescript
const componentColors = {
  button: {
    primary: {
      background: getToken('color.primary.500'),
      backgroundHover: getToken('color.primary.600'),
      backgroundActive: getToken('color.primary.700'),
      text: getToken('color.neutral.50'),
    },
    secondary: {
      background: getToken('color.neutral.100'),
      backgroundHover: getToken('color.neutral.200'),
      backgroundActive: getToken('color.neutral.300'),
      text: getToken('color.neutral.900'),
    },
    danger: {
      background: getToken('color.danger.500'),
      backgroundHover: getToken('color.danger.600'),
      backgroundActive: getToken('color.danger.700'),
      text: getToken('color.neutral.50'),
    },
  },

  input: {
    background: getToken('color.background.primary'),
    border: getToken('color.border.default'),
    borderFocus: getToken('color.primary.500'),
    borderError: getToken('color.danger.500'),
    text: getToken('color.text.primary'),
    placeholder: getToken('color.text.disabled'),
  },
};
```

## Implementation Guide

### Setting Up Color Tokens

```typescript
// packages/design-tokens/tokens/colors.json
{
  "color": {
    "primary": {
      "50": { "$value": "#eff6ff", "$type": "color" },
      "100": { "$value": "#dbeafe", "$type": "color" },
      "200": { "$value": "#bfdbfe", "$type": "color" },
      "300": { "$value": "#93c5fd", "$type": "color" },
      "400": { "$value": "#60a5fa", "$type": "color" },
      "500": { "$value": "#3b82f6", "$type": "color" },
      "600": { "$value": "#2563eb", "$type": "color" },
      "700": { "$value": "#1d4ed8", "$type": "color" },
      "800": { "$value": "#1e40af", "$type": "color" },
      "900": { "$value": "#1e3a8a", "$type": "color" }
    }
  }
}
```

### Using Colors in Components

```typescript
// React/Qwik component
import { getToken } from '@n00plicate/design-tokens';
import { component$ } from '@builder.io/qwik';

export const Button = component$((props) => {
  return (
    <button
      style={{
        backgroundColor: getToken('color.primary.500'),
        color: getToken('color.neutral.50'),
        padding: `${getToken('spacing.sm')} ${getToken('spacing.md')}`,
        borderRadius: getToken('border.radius.md'),
        border: 'none',
        cursor: 'pointer',
      }}
      {...props}
    >
      {props.children}
    </button>
  );
});
```

### CSS Variables

```css
/* Global color definitions */
:root {
  /* Primary scale */
  --color-primary-50: var(--ds-color-primary-50);
  --color-primary-500: var(--ds-color-primary-500);
  --color-primary-900: var(--ds-color-primary-900);

  /* Semantic colors */
  --color-text-primary: var(--ds-color-text-primary);
  --color-background: var(--ds-color-background-primary);
  --color-border: var(--ds-color-border-default);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: var(--ds-color-neutral-50);
    --color-background: var(--ds-color-neutral-900);
  }
}

/* Usage */
.card {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

## Color Checklist

### Planning

- [ ] Define brand colors (1-2 primary colors)
- [ ] Create complete color scales (50-900)
- [ ] Establish semantic color mappings
- [ ] Plan for dark mode
- [ ] Consider accessibility from the start

### Design

- [ ] Check all contrast ratios (4.5:1 minimum)
- [ ] Don't rely on color alone for meaning
- [ ] Test with color blindness simulators
- [ ] Use consistent color meanings
- [ ] Limit color palette (5-7 main colors)

### Implementation

- [ ] Use design tokens consistently
- [ ] Document color usage guidelines
- [ ] Create reusable color components
- [ ] Test across different displays
- [ ] Validate with automated tools

## Tools & Resources

### Color Palette Generators

- [Coolors](https://coolors.co/) - Generate color schemes
- [Adobe Color](https://color.adobe.com/) - Color wheel tool
- [Paletton](https://paletton.com/) - Advanced color scheme designer

### Accessibility Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- [Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)

### n00plicate Tools

- [Contrast Checker](/tools/contrast-checker) - Built-in contrast testing
- [Color Palette Generator](/tools/palette-generator) - Create harmonious palettes
- [Accessibility Audit](/tools/a11y-audit) - Full accessibility check

## Further Reading

- 📖 [Design Principles Guide](./DESIGN_PRINCIPLES.md)
- 📝 [Typography System](./TYPOGRAPHY_SYSTEM.md)
- ♿ [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)
- 🧩 [Component Patterns](./COMPONENT_PATTERNS.md)

---

**Need help?** Check the [Troubleshooting Guide](../TROUBLESHOOTING.md) or [open an issue](https://github.com/IAmJonoBo/n00plicate/issues/new).
