# 🤖 AI-Powered Design Assistant

> **Leverage AI to enhance your design workflow and make professional design accessible to everyone**

## Overview

n00plicate integrates AI capabilities to assist with design decisions, accessibility checks, and workflow automation.
This guide covers how to use AI features for faster, smarter design work.

## Table of Contents

1. [AI Features Overview](#ai-features-overview)
2. [Design Token Assistant](#design-token-assistant)
3. [Accessibility AI](#accessibility-ai)
4. [Color Palette Generation](#color-palette-generation)
5. [Layout Suggestions](#layout-suggestions)
6. [Component Generation](#component-generation)
7. [Design Critique](#design-critique)
8. [Setup & Configuration](#setup--configuration)

## AI Features Overview

n00plicate provides AI assistance across multiple design workflows:

```typescript
// AI capabilities
const aiFeatures = {
  tokenSelection: 'Suggest appropriate design tokens for components',
  a11yCheck: 'Automated accessibility auditing with fix suggestions',
  colorPalette: 'Generate harmonious color palettes from brand colors',
  typography: 'Recommend font pairings and type scales',
  layout: 'Suggest optimal layouts based on content',
  components: 'Generate component variants automatically',
  critique: 'Provide design feedback and improvements',
  naming: 'Suggest semantic names for tokens and components',
};
```

### AI Models Supported

```typescript
const aiProviders = {
  local: {
    name: 'Ollama',
    models: ['llama2', 'codellama', 'mistral'],
    privacy: 'Fully local, no data sent externally',
    setup: 'Run `n00plicate ai setup --provider=ollama`',
  },

  cloud: {
    openai: {
      models: ['gpt-4', 'gpt-3.5-turbo'],
      privacy: 'Data sent to OpenAI',
      apiKey: 'Required',
    },
    copilot: {
      integration: 'GitHub Copilot',
      privacy: 'Data sent to GitHub',
    },
  },
};
```

## Design Token Assistant

AI helps you select the right design tokens for your components.

### Token Suggestion

```typescript
// CLI usage
$ n00plicate ai suggest-tokens --component="primary button"

AI Response:
Recommended tokens for primary button:
✓ Background: color.primary.500
✓ Text: color.neutral.50
✓ Padding: spacing.sm spacing.md
✓ Border Radius: border.radius.md
✓ Font Size: font.size.base
✓ Font Weight: font.weight.semibold

Reasoning:
- Primary color for brand consistency
- High contrast (4.8:1) meets WCAG AA
- Standard button spacing follows UI patterns
- Medium border radius balances modern/accessible
```

### Programmatic API

```typescript
import { aiAssistant } from '@n00plicate/ai-assistant';

// Get token suggestions
const suggestions = await aiAssistant.suggestTokens({
  component: 'error alert',
  context: 'destructive action confirmation',
  constraints: {
    contrast: 'AAA',
    mood: 'urgent',
  },
});

console.log(suggestions);
// {
//   background: 'color.danger.50',
//   border: 'color.danger.200',
//   text: 'color.danger.900',
//   icon: 'color.danger.600',
//   contrast: { ratio: 8.5, level: 'AAA' },
//   reasoning: 'Red palette for errors, high contrast for urgency'
// }
```

### Context-Aware Suggestions

```typescript
// AI considers component context
const buttonSuggestions = await aiAssistant.suggestTokens({
  component: 'submit button',
  context: {
    location: 'checkout form',
    action: 'complete purchase',
    importance: 'high',
    previousActions: ['filled form', 'reviewed order'],
  },
});

// AI provides: High-contrast primary button with success indicators
// - Uses primary brand color
// - High contrast for visibility
// - Success green accent for positive action
// - Larger touch target for mobile
```

## Accessibility AI

Automated accessibility checking with actionable fixes.

### Real-Time A11y Auditing

```typescript
import { a11yAI } from '@n00plicate/ai-assistant';

// Analyze component for accessibility issues
const audit = await a11yAI.analyze({
  component: ComponentCode,
  wcagLevel: 'AA',
});

console.log(audit);
// {
//   issues: [
//     {
//       type: 'contrast',
//       severity: 'error',
//       element: 'button.secondary',
//       current: '3.2:1',
//       required: '4.5:1',
//       fix: {
//         suggested: 'color.neutral.700',
//         reasoning: 'Increases contrast to 5.1:1 (AA)',
//         autofix: true,
//       }
//     },
//     {
//       type: 'keyboard',
//       severity: 'warning',
//       element: 'div.clickable',
//       issue: 'Non-semantic element used for interaction',
//       fix: {
//         suggested: 'Replace with <button> element',
//         code: '<button onClick={handleClick}>...</button>',
//         autofix: true,
//       }
//     }
//   ],
//   score: 85,
//   summary: '2 issues found, 2 auto-fixable'
// }
```

### Auto-Fix Suggestions

```bash
# CLI auto-fix
$ n00plicate ai fix-a11y src/components/Button.tsx

Analyzing Button.tsx...
Found 3 accessibility issues:

1. [ERROR] Insufficient contrast ratio (3.8:1)
   → Auto-fix: Change text color to 'color.neutral.900'
   → New ratio: 12.6:1 (AAA ✓)

2. [WARNING] Missing aria-label for icon button
   → Auto-fix: Add aria-label="Close dialog"

3. [INFO] Consider adding focus-visible styling
   → Suggestion: Add :focus-visible pseudo-class

Apply all fixes? (y/n): y
✓ All fixes applied successfully
✓ Component now meets WCAG 2.1 AA standards
```

### Continuous Monitoring

```typescript
// Watch mode: Monitor components for a11y issues
import { a11yMonitor } from '@n00plicate/ai-assistant';

a11yMonitor.watch({
  paths: ['src/components/**/*.tsx'],
  rules: {
    contrast: 'AA',
    keyboard: true,
    semanticHTML: true,
    aria: 'strict',
  },
  onIssue: issue => {
    console.warn(`A11y issue detected: ${issue.message}`);

    if (issue.autoFixable) {
      // Optionally auto-fix in development
      a11yMonitor.applyFix(issue);
    }
  },
});
```

## Color Palette Generation

AI generates harmonious color palettes from your brand colors.

### Generate from Brand Color

```typescript
import { colorAI } from '@n00plicate/ai-assistant';

// Generate full palette from brand color
const palette = await colorAI.generatePalette({
  brandColor: '#3b82f6',
  harmony: 'complementary',
  accessibility: 'AA',
  shades: 10,
});

console.log(palette);
// {
//   primary: {
//     50: '#eff6ff',
//     100: '#dbeafe',
//     // ... full scale
//     900: '#1e3a8a'
//   },
//   accent: {
//     50: '#fff7ed',
//     // ... complementary orange scale
//     900: '#7c2d12'
//   },
//   neutral: {
//     // ... gray scale
//   },
//   semantic: {
//     success: '#10b981',
//     warning: '#f59e0b',
//     danger: '#ef4444',
//     info: '#3b82f6'
//   },
//   accessibility: {
//     allPairsMeetAA: true,
//     textOnBackground: '14.5:1',
//     recommendations: [...]
//   }
// }
```

### Palette Variations

```bash
# CLI palette generation
$ n00plicate ai palette --brand="#3b82f6" --harmony=analogous

Generating color palette...

Primary (Blue): #3b82f6
Secondary (Cyan): #06b6d4
Accent (Indigo): #6366f1

✓ All combinations meet WCAG AA
✓ Generated 30 token definitions
✓ Exported to: tokens/colors-generated.json

Preview palette: n00plicate ai palette --preview
```

### Smart Color Adjustments

```typescript
// AI adjusts colors for accessibility
const adjusted = await colorAI.ensureAccessibility({
  foreground: '#6b7280', // Gray
  background: '#f9fafb', // Off-white
  targetRatio: 4.5, // AA standard
});

console.log(adjusted);
// {
//   original: { fg: '#6b7280', bg: '#f9fafb', ratio: 3.8 },
//   adjusted: { fg: '#4b5563', bg: '#f9fafb', ratio: 4.6 },
//   changes: 'Darkened foreground by 12%',
//   meetsAA: true
// }
```

## Layout Suggestions

AI suggests optimal layouts based on content and context.

### Content-Based Layout

```typescript
import { layoutAI } from '@n00plicate/ai-assistant';

// AI analyzes content and suggests layout
const layout = await layoutAI.suggest({
  content: {
    heading: 'Product Features',
    items: 6,
    itemType: 'feature card',
    hasImages: true,
  },
  constraints: {
    responsive: true,
    accessibility: 'AA',
  },
});

console.log(layout);
// {
//   type: 'grid',
//   columns: {
//     mobile: 1,
//     tablet: 2,
//     desktop: 3
//   },
//   gap: 'spacing.lg',
//   reasoning: 'Grid layout optimal for equal-weight items',
//   code: `
//     <div style={{
//       display: 'grid',
//       gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//       gap: getToken('spacing.lg')
//     }}>
//       {items.map(item => <Card {...item} />)}
//     </div>
//   `
// }
```

### Layout Optimization

```typescript
// AI optimizes existing layout
const optimized = await layoutAI.optimize({
  currentLayout: layoutCode,
  issues: ['inconsistent spacing', 'poor mobile experience'],
  goals: ['improve readability', 'reduce cognitive load'],
});

console.log(optimized.improvements);
// [
//   {
//     issue: 'Inconsistent spacing',
//     fix: 'Use design token spacing scale',
//     impact: 'High - improves visual rhythm',
//     code: '/* Updated spacing values */'
//   },
//   {
//     issue: 'Poor mobile experience',
//     fix: 'Implement mobile-first responsive design',
//     impact: 'Critical - 60% of users on mobile',
//     code: '/* Responsive styles */'
//   }
// ]
```

## Component Generation

AI generates component variants and boilerplate.

### Generate Component Variants

```typescript
import { componentAI } from '@n00plicate/ai-assistant';

// Generate button variants
const variants = await componentAI.generateVariants({
  baseComponent: 'Button',
  variants: ['primary', 'secondary', 'danger', 'ghost'],
  features: ['loading', 'disabled', 'icon'],
});

// AI generates complete component code
console.log(variants.code);
// Full TypeScript component with all variants
// - Proper type safety
// - Accessibility built-in
// - Design tokens integrated
// - Storybook stories included
```

### Scaffold New Components

```bash
# CLI component generation
$ n00plicate ai generate component --name="DataTable" --features="sorting,filtering,pagination"

Generating DataTable component...

✓ Created src/components/DataTable.tsx
✓ Created src/components/DataTable.stories.tsx
✓ Created src/components/DataTable.test.tsx
✓ Added design tokens
✓ Implemented accessibility features
✓ Generated TypeScript types

Features included:
- Sortable columns with keyboard support
- Client-side filtering
- Pagination with page size options
- Responsive design (mobile-first)
- WCAG AA compliant
- Full keyboard navigation

Next steps:
1. Review generated code
2. Customize styling
3. Run tests: pnpm test DataTable
4. View in Storybook: pnpm storybook
```

## Design Critique

AI provides actionable feedback on your designs.

### Component Critique

```typescript
import { designCritic } from '@n00plicate/ai-assistant';

// Get design feedback
const feedback = await designCritic.analyze({
  component: ComponentCode,
  aspects: ['visual-hierarchy', 'accessibility', 'consistency', 'usability'],
});

console.log(feedback);
// {
//   score: 82,
//   strengths: [
//     'Clear visual hierarchy with proper heading structure',
//     'Good use of design tokens for consistency',
//     'Meets WCAG AA contrast requirements'
//   ],
//   improvements: [
//     {
//       aspect: 'spacing',
//       issue: 'Inconsistent button spacing',
//       severity: 'medium',
//       suggestion: 'Use spacing.sm for compact buttons, spacing.md for default',
//       impact: 'Improves visual consistency'
//     },
//     {
//       aspect: 'accessibility',
//       issue: 'Missing aria-label on icon-only button',
//       severity: 'high',
//       suggestion: 'Add aria-label="Close" to close button',
//       impact: 'Critical for screen reader users'
//     }
//   ],
//   bestPractices: [
//     'Consider adding loading states',
//     'Add focus-visible styles for better keyboard navigation',
//     'Document component props in JSDoc'
//   ]
// }
```

### Design System Audit

```bash
# Audit entire design system
$ n00plicate ai audit --scope=design-system

Auditing design system...

📊 Overall Score: 87/100

Consistency: 92/100
✓ All components use design tokens
✓ Naming conventions followed
⚠ 3 components missing TypeScript types

Accessibility: 85/100
✓ All components keyboard navigable
✓ ARIA labels present
⚠ 2 components need contrast improvements

Documentation: 83/100
✓ Storybook stories for all components
⚠ 5 components missing usage examples
⚠ API documentation incomplete

Performance: 90/100
✓ Bundle size optimized
✓ No unnecessary re-renders
✓ Proper code splitting

Recommendations:
1. Add TypeScript types to Form, Modal, Tooltip
2. Improve contrast in secondary buttons
3. Complete API documentation
4. Add more usage examples

Generate report: n00plicate ai audit --format=html > report.html
```

## Setup & Configuration

### Installation

```bash
# Install AI assistant package
pnpm add @n00plicate/ai-assistant

# Setup local AI (Ollama)
n00plicate ai setup --provider=ollama

# Or configure cloud provider
n00plicate ai setup --provider=openai --api-key=your-key
```

### Configuration

```typescript
// n00plicate.config.ts
export default {
  ai: {
    // Default provider
    provider: 'ollama', // or 'openai', 'copilot'

    // Local AI settings
    ollama: {
      host: 'http://localhost:11434',
      model: 'llama2',
    },

    // OpenAI settings
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      temperature: 0.7,
    },

    // Feature flags
    features: {
      tokenSuggestions: true,
      a11yAutoFix: true,
      colorGeneration: true,
      layoutSuggestions: true,
      componentGeneration: true,
      designCritique: true,
    },

    // Privacy settings
    privacy: {
      sendTelemetry: false,
      cacheLocally: true,
      shareAnonymousUsage: false,
    },
  },
};
```

### CLI Commands

```bash
# AI assistant commands
n00plicate ai suggest-tokens --component="button"
n00plicate ai fix-a11y --path=src/components
n00plicate ai palette --brand="#3b82f6"
n00plicate ai layout --content="feature cards" --count=6
n00plicate ai generate component --name="Modal"
n00plicate ai critique --component=src/components/Button.tsx
n00plicate ai audit --scope=design-system

# Interactive mode
n00plicate ai chat
> How can I improve the contrast in my primary button?
> Generate a color palette from #3b82f6
> What layout should I use for 6 feature cards?
```

### API Usage

```typescript
import { n00plicate AI } from '@n00plicate/ai-assistant';

// Initialize
const ai = new n00plicateAI({
  provider: 'ollama',
  model: 'llama2',
});

// Use AI features
const tokens = await ai.suggestTokens({ component: 'button' });
const a11y = await ai.checkAccessibility({ component: Code });
const palette = await ai.generatePalette({ brand: '#3b82f6' });
const layout = await ai.suggestLayout({ content: { items: 6 } });
const feedback = await ai.critique({ component: Code });
```

## Best Practices

### When to Use AI

✅ **Good Uses**:

- Quick token suggestions
- Accessibility auditing
- Color palette generation
- Layout exploration
- Boilerplate generation
- Design feedback

❌ **Not Recommended**:

- Final design decisions (always review AI suggestions)
- Brand-critical choices (requires human judgment)
- Complex custom logic (AI-generated code needs review)
- Production deployment without testing

### Privacy & Security

```typescript
// Privacy-first configuration
const config = {
  ai: {
    // Use local AI for sensitive projects
    provider: 'ollama',

    // Don't send proprietary code to cloud
    features: {
      componentGeneration: false, // Disable if code is sensitive
    },

    // Cache responses locally
    cache: {
      enabled: true,
      ttl: 86400, // 24 hours
      location: '.n00plicate/ai-cache',
    },

    // Anonymize data
    anonymize: {
      tokens: true,
      colorValues: true,
      componentNames: true,
    },
  },
};
```

## Limitations & Considerations

### Current Limitations

- AI suggestions should always be reviewed by humans
- Color generation may not match exact brand guidelines
- Layout suggestions are starting points, not final designs
- Accessibility fixes cover common issues, not all edge cases
- Component generation requires customization

### Future Enhancements

Planned AI features:

- [ ] Visual design analysis from screenshots
- [ ] Automatic design system documentation generation
- [ ] Real-time design collaboration suggestions
- [ ] Predictive component usage analytics
- [ ] Multi-language support for design descriptions
- [ ] Integration with Figma/Sketch/Penpot plugins

## Examples & Tutorials

### Complete Workflow

```bash
# 1. Generate color palette
$ n00plicate ai palette --brand="#3b82f6" --output=tokens/colors.json

# 2. Create component with AI
$ n00plicate ai generate component --name="FeatureCard"

# 3. Get token suggestions
$ n00plicate ai suggest-tokens --component="FeatureCard"

# 4. Check accessibility
$ n00plicate ai fix-a11y src/components/FeatureCard.tsx

# 5. Get design feedback
$ n00plicate ai critique --component=src/components/FeatureCard.tsx

# 6. Generate layout
$ n00plicate ai layout --content="6 feature cards" --output=src/pages/features.tsx
```

## Further Reading

- 📖 [Design Principles Guide](./DESIGN_PRINCIPLES.md)
- 🎨 [Color Theory Guide](./COLOR_THEORY.md)
- ♿ [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)
- 🧩 [Component Patterns](./COMPONENT_PATTERNS.md)

---

**Need help?** Check the [Troubleshooting Guide](../TROUBLESHOOTING.md) or [open an issue](https://github.com/IAmJonoBo/n00plicate/issues/new).
