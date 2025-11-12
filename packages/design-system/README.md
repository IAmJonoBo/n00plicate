# 🧩 @n00plicate/design-system

A modern Qwik-based design system component library built with design tokens, featuring Storybook documentation and
comprehensive testing.

## 📋 Overview

This package provides a collection of reusable, accessible UI components built with Qwik and styled using design tokens
from `@n00plicate/design-tokens`. It includes comprehensive documentation through Storybook, visual regression testing, and
accessibility testing.

## 🎯 Key Features

- **Qwik Components**: Optimized for performance with resumability
- **Design Token Integration**: Consistent styling using centralized tokens
- **Storybook Documentation**: Interactive component playground and documentation
- **Visual Testing**: Automated visual regression testing with Loki
- **Accessibility**: Built-in a11y testing and WCAG compliance
- **Type Safety**: Full TypeScript support
- **Modern CSS**: Vanilla Extract for zero-runtime styling

## 📦 Installation

```bash
# Install via pnpm (workspace dependency)
pnpm add @n00plicate/design-system @n00plicate/design-tokens

# Or if developing locally
pnpm install
```

## 🚀 Usage

### Basic Component Usage

```typescript
import { Button, Card, Input } from '@n00plicate/design-system';

export default component$(() => {
  return (
    <Card>
      <h2>Welcome</h2>
      <Input placeholder="Enter your name" />
      <Button variant="primary" onClick$={() => console.log('Clicked!')}>
        Submit
      </Button>
    </Card>
  );
});
```

### Styling with Tokens

Components automatically use design tokens, but you can also access them directly:

```typescript
import { style } from '@vanilla-extract/css';
import { tokens } from '@n00plicate/design-tokens';

export const customStyle = style({
  backgroundColor: tokens.color.primary.value,
  padding: tokens.spacing.md.value,
  borderRadius: tokens.borderRadius.medium.value,
});
```

## 🧩 Component Library

### Layout Components

#### Card

A flexible container component for grouping related content.

```typescript
import { Card } from '@n00plicate/design-system';

// Basic usage
<Card>
  <p>Card content</p>
</Card>

// With variants
<Card variant="elevated" padding="large">
  <h3>Elevated Card</h3>
  <p>This card has a drop shadow and large padding.</p>
</Card>
```

**Props:**

- `variant`: `'flat' | 'elevated' | 'outlined'` (default: `'flat'`)
- `padding`: `'small' | 'medium' | 'large'` (default: `'medium'`)

#### Container

A responsive layout container with consistent max-width and padding.

```typescript
import { Container } from '@n00plicate/design-system';

<Container size="large">
  <h1>Page Content</h1>
  <p>Responsive container content</p>
</Container>
```

**Props:**

- `size`: `'small' | 'medium' | 'large' | 'xlarge'` (default: `'medium'`)

### Form Components

#### Button

A versatile button component with multiple variants and states.

```typescript
import { Button } from '@n00plicate/design-system';

// Primary button
<Button variant="primary" onClick$={() => handleClick()}>
  Primary Action
</Button>

// Secondary button with icon
<Button variant="secondary" leftIcon="star">
  Favorite
</Button>

// Loading state
<Button loading={isLoading.value} disabled={isLoading.value}>
  {isLoading.value ? 'Saving...' : 'Save'}
</Button>
```

**Props:**

- `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`
- `size`: `'small' | 'medium' | 'large'`
- `loading`: `boolean`
- `disabled`: `boolean`
- `leftIcon`: `string` (icon name)
- `rightIcon`: `string` (icon name)

#### Input

A text input component with validation and error states.

```typescript
import { Input } from '@n00plicate/design-system';

<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  error={emailError.value}
  onInput$={(event) => setEmail(event.target.value)}
/>
```

**Props:**

- `label`: `string`
- `type`: `'text' | 'email' | 'password' | 'number'`
- `placeholder`: `string`
- `error`: `string`
- `disabled`: `boolean`
- `required`: `boolean`

#### Select

A dropdown select component with search and multi-select capabilities.

```typescript
import { Select } from '@n00plicate/design-system';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

<Select
  label="Choose an option"
  options={options}
  value={selectedValue.value}
  onChange$={(value) => setSelectedValue(value)}
/>
```

**Props:**

- `options`: `Array<{ value: string; label: string }>`
- `value`: `string | string[]`
- `multiple`: `boolean`
- `searchable`: `boolean`
- `disabled`: `boolean`

### Feedback Components

#### Alert

Display important messages with different severity levels.

```typescript
import { Alert } from '@n00plicate/design-system';

<Alert variant="success" dismissible>
  Your changes have been saved successfully!
</Alert>

<Alert variant="error" title="Error">
  Failed to save changes. Please try again.
</Alert>
```

**Props:**

- `variant`: `'info' | 'success' | 'warning' | 'error'`
- `title`: `string`
- `dismissible`: `boolean`

#### Loading

Display loading states with spinners or skeletons.

```typescript
import { Loading, Skeleton } from '@n00plicate/design-system';

// Spinner
<Loading size="large" text="Loading content..." />

// Skeleton placeholder
<Skeleton width="100%" height="200px" />
```

### Typography Components

#### Text

A flexible text component with semantic styling.

```typescript
import { Text } from '@n00plicate/design-system';

<Text variant="heading" size="large">
  Page Title
</Text>

<Text variant="body" color="muted">
  Body text with muted color
</Text>

<Text variant="code" size="small">
  const example = 'code';
</Text>
```

**Props:**

- `variant`: `'heading' | 'body' | 'caption' | 'code'`
- `size`: `'small' | 'medium' | 'large' | 'xlarge'`
- `color`: `'default' | 'muted' | 'accent' | 'error' | 'success'`
- `weight`: `'normal' | 'medium' | 'bold'`

## 🎨 Theming

### Design Token Integration

All components use design tokens for consistent styling:

```typescript
// Components automatically use these token categories:
// - color.*        (backgrounds, text, borders)
// - spacing.*      (padding, margins, gaps)
// - fontSize.*     (text sizes)
// - borderRadius.* (rounded corners)
// - fontWeight.*   (text weights)
// - boxShadow.*    (elevations)
```

### Custom Styling

Override component styles using Vanilla Extract:

```typescript
import { style } from '@vanilla-extract/css';
import { Button } from '@n00plicate/design-system';

const customButtonStyle = style({
  backgroundColor: 'purple',
  ':hover': {
    backgroundColor: 'darkpurple',
  },
});

<Button class={customButtonStyle}>
  Custom Styled Button
</Button>
```

## 📚 Storybook Documentation

### Local Development

```bash
# Start Storybook dev server
pnpm storybook

# Build static Storybook
pnpm build-storybook

# Run Storybook tests
pnpm test-storybook
```

### Story Structure

Each component includes comprehensive stories:

```typescript
// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/html';
import { Button } from './Button';

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'A versatile button component with multiple variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const AllVariants: Story = {
  render: () => `
    <div style="display: flex; gap: 1rem;">
      ${Button({ variant: 'primary', children: 'Primary' })}
      ${Button({ variant: 'secondary', children: 'Secondary' })}
      ${Button({ variant: 'outline', children: 'Outline' })}
    </div>
  `,
};
```

## 🧪 Testing

### Visual Regression Testing

```bash
# Run visual tests with Loki
pnpm visual-test

# Update visual baselines
pnpm visual-test --update
```

### Unit Testing

```bash
# Run component unit tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

The Vitest suite now includes integration coverage that exercises the `@n00plicate/tokens-core`
bridge. The `token-integration.test.ts` spec ensures our design-system utilities resolve
tokens through the shared helpers and continue to produce the expected CSS variable
contracts when design tokens or validation guards change.

### Accessibility Testing

Accessibility tests run automatically in Storybook:

```typescript
// Example accessibility test
import { expect } from '@storybook/test';
import { within } from '@storybook/testing-library';

export const AccessibilityTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Test keyboard navigation
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-label');
  },
};
```

## 🔧 Development

### Building Components

```bash
# Build the component library
pnpm build

# Build for client-side usage
pnpm build.client

# Build TypeScript declarations
pnpm build.types

# Start development server
pnpm dev
```

### Adding New Components

1. **Create Component File**:

```typescript
// src/components/NewComponent/NewComponent.tsx
import { component$, Slot } from '@builder.io/qwik';
import { style } from '@vanilla-extract/css';
import { tokens } from '@n00plicate/design-tokens';

interface NewComponentProps {
  variant?: 'default' | 'accent';
  size?: 'small' | 'medium' | 'large';
}

const newComponentStyle = style({
  padding: tokens.spacing.md.value,
  borderRadius: tokens.borderRadius.medium.value,
  backgroundColor: tokens.color.surface.value,
});

export const NewComponent = component$<NewComponentProps>(({
  variant = 'default',
  size = 'medium',
}) => {
  return (
    <div class={newComponentStyle}>
      <Slot />
    </div>
  );
});
```

1. **Create Stories**:

```typescript
// src/components/NewComponent/NewComponent.stories.ts
import type { Meta, StoryObj } from '@storybook/html';
import { NewComponent } from './NewComponent';

const meta: Meta = {
  title: 'Components/NewComponent',
  component: NewComponent,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
};
```

1. **Export Component**:

```typescript
// src/index.ts
export { NewComponent } from './components/NewComponent/NewComponent';
```

1. **Add Tests**:

```typescript
// src/components/NewComponent/NewComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@builder.io/qwik/testing';
import { NewComponent } from './NewComponent';

describe('NewComponent', () => {
  it('should render', async () => {
    const { screen } = await render(<NewComponent />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });
});
```

## 📊 Performance

### Bundle Analysis

```bash
# Analyze bundle size
pnpm analyze

# Check component bundle sizes
pnpm bundle-analyzer
```

### Optimization Guidelines

- **Tree Shaking**: Import only the components you need
- **Code Splitting**: Components are automatically code-split by Qwik
- **CSS Optimization**: Vanilla Extract provides automatic CSS optimization
- **Token Efficiency**: Design tokens add minimal runtime overhead

## 🤝 Contributing

### Component Guidelines

1. **Accessibility First**: All components must be keyboard navigable and screen reader friendly
2. **Design Token Usage**: Use design tokens for all styling values
3. **Performance**: Optimize for minimal bundle size and runtime overhead
4. **Documentation**: Include comprehensive Storybook stories
5. **Testing**: Add unit tests and visual regression tests

### Code Style

```typescript
// ✅ Good: Use design tokens
const buttonStyle = style({
  backgroundColor: tokens.color.primary.value,
  padding: tokens.spacing.md.value,
});

// ❌ Bad: Hard-coded values
const buttonStyle = style({
  backgroundColor: '#007bff',
  padding: '16px',
});
```

### Pull Request Process

1. **Component Development**: Create component with proper TypeScript types
2. **Storybook Stories**: Add comprehensive documentation and examples
3. **Tests**: Include unit tests and accessibility tests
4. **Visual Tests**: Ensure visual regression tests pass
5. **Documentation**: Update README if needed

## 📚 Advanced Documentation

For comprehensive guides on advanced workflows and enterprise features:

- **[Qwik Integration Advanced](../../docs/platforms/qwik.md)** - SSR optimization, image handling, and service worker integration
- **[Storybook 9.1 Features](../../docs/platforms/storybook.md)** - Interaction testing and test-runner automation
- **[Comprehensive Testing Strategy](../../docs/testing/comprehensive-testing.md)** - Visual regression and accessibility
- **[Advanced Development Workflows](../../docs/development/advanced-workflows.md)** - Hot reload optimization and debugging
- **[Security Compliance](../../docs/security/security-compliance-framework.md)** - Component security scanning and validation

## 📚 Resources

- [Qwik Documentation](https://qwik.builder.io/)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Vanilla Extract Documentation](https://vanilla-extract.style/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🐛 Troubleshooting

### Common Issues

#### Component Not Rendering

```bash
# Check if component is properly exported
pnpm build && node -e "console.log(require('./dist/index.js'))"
```

#### Storybook Build Fails

```bash
# Clear Storybook cache
rm -rf node_modules/.cache/storybook
pnpm build-storybook
```

#### Visual Tests Failing

```bash
# Update visual baselines after intentional changes
pnpm visual-test --update
```

#### Styling Issues

```bash
# Rebuild design tokens
pnpm run build:design-tokens
pnpm build
```

## 📄 License

MIT License - see the [LICENSE](../../LICENSE) file for details.
