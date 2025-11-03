# ♿ Accessibility Guidelines

> **Build inclusive interfaces accessible to everyone**

## Overview

Accessibility (a11y) ensures that people with disabilities can use your product. It's not just the right thing to do—
it's often legally required and benefits all users. This guide covers WCAG standards, practical implementation,
and testing strategies.

## Table of Contents

1. [Why Accessibility Matters](#why-accessibility-matters)
2. [WCAG Principles](#wcag-principles)
3. [Visual Accessibility](#visual-accessibility)
4. [Keyboard Navigation](#keyboard-navigation)
5. [Screen Readers](#screen-readers)
6. [Interactive Elements](#interactive-elements)
7. [Testing & Validation](#testing--validation)
8. [Implementation Guide](#implementation-guide)

## Why Accessibility Matters

### Statistics

- **1 in 4** adults in the US has a disability
- **15%** of the world's population experiences some form of disability
- **8%** of men have color vision deficiency
- **2.2 billion** people have vision impairment worldwide

### Benefits Beyond Accessibility

- **Better SEO**: Semantic HTML improves search rankings
- **Improved UX**: Clear structure helps all users
- **Legal Compliance**: Required in many jurisdictions (ADA, Section 508)
- **Wider Audience**: Reach more users
- **Better Code**: Forces good practices

## WCAG Principles

Web Content Accessibility Guidelines (WCAG) are built on four principles: **POUR**

### 1. Perceivable

Information must be presentable to users in ways they can perceive.

#### Guidelines:

- **Text Alternatives**: Provide alt text for images
- **Time-based Media**: Captions for audio/video
- **Adaptable**: Content can be presented in different ways
- **Distinguishable**: Easy to see and hear content

```typescript
// ✅ Good: Meaningful alt text
<img
  src="chart.png"
  alt="Bar chart showing 40% increase in sales from Q1 to Q2"
/>

// ❌ Bad: Generic or missing alt text
<img src="chart.png" alt="chart" />
<img src="chart.png" />
```

### 2. Operable

Interface components and navigation must be operable.

#### Guidelines:

- **Keyboard Accessible**: All functionality available via keyboard
- **Enough Time**: Users have enough time to read and use content
- **Seizures**: Don't use content that causes seizures
- **Navigable**: Help users navigate and find content

```typescript
// ✅ Good: Keyboard accessible button
<button
  onClick={handleClick}
  onKeyPress={handleKeyPress}
>
  Submit
</button>

// ❌ Bad: Non-semantic, not keyboard accessible
<div onClick={handleClick}>Submit</div>
```

### 3. Understandable

Information and operation of the interface must be understandable.

#### Guidelines:

- **Readable**: Text is readable and understandable
- **Predictable**: Appear and operate in predictable ways
- **Input Assistance**: Help users avoid and correct mistakes

```typescript
// ✅ Good: Clear error messages with recovery
<form>
  <input
    type="email"
    aria-describedby="email-error"
    aria-invalid={hasError}
  />
  {hasError && (
    <div id="email-error" role="alert">
      Please enter a valid email address (example@domain.com)
    </div>
  )}
</form>

// ❌ Bad: Vague error message
{hasError && <div>Invalid input</div>}
```

### 4. Robust

Content must be robust enough to work with current and future technologies.

#### Guidelines:

- **Compatible**: Maximize compatibility with current and future tools
- **Valid HTML**: Use semantic, valid markup
- **ARIA**: Use ARIA correctly when needed

```typescript
// ✅ Good: Semantic HTML with proper ARIA
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// ❌ Bad: Non-semantic markup
<div class="nav">
  <div class="link">Home</div>
  <div class="link">About</div>
</div>
```

## Visual Accessibility

### Color Contrast

Sufficient contrast ensures text is readable for users with low vision or color blindness.

#### WCAG Contrast Requirements

| Content Type                      | Level AA | Level AAA |
| --------------------------------- | -------- | --------- |
| Normal text (<18px or <14px bold) | 4.5:1    | 7:1       |
| Large text (≥18px or ≥14px bold)  | 3:1      | 4.5:1     |
| UI components                     | 3:1      | -         |

```typescript
import { getToken } from '@n00plicate/design-tokens';

// ✅ Good: High contrast combinations
const accessibleColors = {
  // Text on background (16.7:1 - AAA)
  highContrast: {
    text: getToken('color.neutral.900'), // #1a1a1a
    background: getToken('color.neutral.50'), // #f9fafb
  },

  // Medium contrast for secondary text (8.2:1 - AA)
  mediumContrast: {
    text: getToken('color.neutral.700'),
    background: getToken('color.neutral.50'),
  },

  // Button contrast (4.8:1 - AA)
  buttonContrast: {
    text: getToken('color.neutral.50'),
    background: getToken('color.primary.600'),
  },
};

// ❌ Bad: Insufficient contrast (2.5:1 - Fails)
const poorContrast = {
  text: getToken('color.neutral.400'), // Too light
  background: getToken('color.neutral.50'),
};
```

#### Testing Contrast

```typescript
// Contrast ratio calculator
function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    // Convert color to RGB
    const rgb = hexToRgb(color);

    // Calculate relative luminance
    const [r, g, b] = rgb.map(val => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Usage
const ratio = getContrastRatio('#000000', '#FFFFFF');
console.log(`Contrast ratio: ${ratio.toFixed(2)}:1`); // 21:1 (Perfect)

const meetsAA = ratio >= 4.5;
const meetsAAA = ratio >= 7.0;
```

### Don't Rely on Color Alone

Use multiple indicators to convey information.

```typescript
// ✅ Good: Color + icon + text
const StatusIndicator = component$<{ status: 'success' | 'error' | 'warning' }>((props) => {
  const config = {
    success: { icon: '✓', label: 'Success', color: getToken('color.success.600') },
    error: { icon: '✗', label: 'Error', color: getToken('color.danger.600') },
    warning: { icon: '⚠', label: 'Warning', color: getToken('color.warning.600') },
  }[props.status];

  return (
    <div
      style={{ color: config.color }}
      role="status"
      aria-label={config.label}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
});

// ❌ Bad: Color only
<div style={{ color: 'red' }}>Error</div>
```

### Text Size and Readability

```typescript
// ✅ Good: Readable text sizes
const textSizes = {
  body: getToken('font.size.base'), // 1rem (16px) - minimum
  small: getToken('font.size.sm'), // 0.875rem (14px)
  caption: getToken('font.size.xs'), // 0.75rem (12px) - use sparingly
};

// Line height for readability
const lineHeights = {
  body: '1.6', // 1.5-1.6 for body text
  heading: '1.2', // 1.1-1.3 for headings
};

// Maximum line length
const readableContent = {
  maxWidth: '65ch', // 45-75 characters per line
};
```

## Keyboard Navigation

All interactive elements must be keyboard accessible.

### Focus Management

```typescript
// ✅ Good: Clear focus indicators
const Button = styled.button`
  background: ${getToken('color.primary.500')};
  color: ${getToken('color.neutral.50')};
  padding: ${getToken('spacing.sm')} ${getToken('spacing.md')};
  border: 2px solid transparent;
  border-radius: ${getToken('border.radius.md')};
  cursor: pointer;

  /* Clear focus indicator */
  &:focus {
    outline: none; /* Remove default */
    border-color: ${getToken('color.primary.700')};
    box-shadow: 0 0 0 3px ${getToken('color.primary.200')};
  }

  &:focus-visible {
    /* Only show for keyboard focus */
    outline: 3px solid ${getToken('color.primary.500')};
    outline-offset: 2px;
  }
`;

// ❌ Bad: No focus indicator
button:focus {
  outline: none; /* Never do this without replacement! */
}
```

### Keyboard Shortcuts

Standard keyboard patterns users expect:

```typescript
// Common keyboard patterns
const keyboardPatterns = {
  navigation: {
    Tab: 'Move forward',
    'Shift+Tab': 'Move backward',
    Enter: 'Activate button/link',
    Space: 'Activate button, toggle checkbox',
    Escape: 'Close dialog, cancel action',
    ArrowKeys: 'Navigate between options',
  },

  forms: {
    'Arrow Up/Down': 'Navigate select options',
    Home: 'First option',
    End: 'Last option',
    'Page Up/Down': 'Scroll by page',
  },
};

// Implementation example: Custom select
const CustomSelect = component$(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectPrevious();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleOpen();
        break;
      case 'Escape':
        close();
        break;
      case 'Home':
        e.preventDefault();
        selectFirst();
        break;
      case 'End':
        e.preventDefault();
        selectLast();
        break;
    }
  };

  return (
    <div
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      tabIndex={0}
      onKeyDown$={handleKeyDown}
    >
      {/* Select content */}
    </div>
  );
});
```

### Skip Links

Allow keyboard users to skip repetitive content.

```typescript
// ✅ Good: Skip navigation link
const SkipLink = component$(() => {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '0',
        // Show on focus
        '&:focus': {
          left: '0',
          zIndex: '9999',
          padding: getToken('spacing.sm'),
          background: getToken('color.primary.500'),
          color: getToken('color.neutral.50'),
        },
      }}
    >
      Skip to main content
    </a>
  );
});

// Usage in layout
<>
  <SkipLink />
  <header>{/* Navigation */}</header>
  <main id="main-content">
    {/* Main content */}
  </main>
</>
```

## Screen Readers

### Semantic HTML

Use appropriate HTML elements for their intended purpose.

```typescript
// ✅ Good: Semantic HTML
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Article content...</p>
  </article>

  <aside aria-label="Related articles">
    {/* Related content */}
  </aside>
</main>

<footer>
  {/* Footer content */}
</footer>

// ❌ Bad: Non-semantic divs
<div class="header">
  <div class="nav">
    <div class="link">Home</div>
  </div>
</div>
```

### ARIA Attributes

Use ARIA to enhance accessibility when semantic HTML isn't enough.

#### Common ARIA Attributes

```typescript
// Roles
const ariaRoles = {
  'role="button"': 'Interactive element that triggers an action',
  'role="navigation"': 'Collection of navigational elements',
  'role="banner"': 'Site-wide header',
  'role="contentinfo"': 'Site-wide footer',
  'role="main"': 'Main content of document',
  'role="complementary"': 'Supporting content',
  'role="search"': 'Search functionality',
  'role="alert"': 'Important, time-sensitive message',
  'role="dialog"': 'Dialog window',
  'role="status"': 'Status updates',
};

// States and properties
const ariaStates = {
  'aria-label': 'Accessible name for element',
  'aria-labelledby': 'ID(s) of labeling element(s)',
  'aria-describedby': 'ID(s) of describing element(s)',
  'aria-expanded': 'Whether element is expanded',
  'aria-hidden': 'Hide from accessibility tree',
  'aria-live': 'Announce dynamic changes',
  'aria-current': 'Current item in set',
  'aria-disabled': 'Element is disabled',
  'aria-required': 'Field is required',
  'aria-invalid': 'Field has error',
};
```

#### Practical Examples

```typescript
// Button with icon
<button aria-label="Close dialog">
  <span aria-hidden="true">×</span>
</button>

// Expandable section
<button
  aria-expanded={isOpen}
  aria-controls="section-content"
  onClick={toggle}
>
  Section Title
</button>
<div id="section-content" hidden={!isOpen}>
  Content...
</div>

// Form field with error
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && (
  <div id="email-error" role="alert">
    Please enter a valid email
  </div>
)}

// Live region for updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Alt Text Guidelines

```typescript
// ✅ Good: Descriptive alt text
<img
  src="graph.png"
  alt="Line graph showing temperature increase from 60°F to 85°F between 8am and 2pm"
/>

// ✅ Good: Decorative image (hide from screen readers)
<img
  src="decoration.png"
  alt=""
  role="presentation"
/>

// ✅ Good: Complex image with long description
<img
  src="complex-chart.png"
  alt="Sales data visualization"
  aria-describedby="chart-description"
/>
<div id="chart-description">
  Detailed description of the chart data...
</div>

// ❌ Bad: Vague or redundant alt text
<img src="photo.jpg" alt="image" />
<img src="photo.jpg" alt="Photo of photo" />
```

## Interactive Elements

### Buttons vs Links

```typescript
// ✅ Good: Button for actions
<button onClick={handleSubmit}>
  Submit Form
</button>

// ✅ Good: Link for navigation
<a href="/about">
  Learn More
</a>

// ❌ Bad: Link styled as button doing action
<a href="#" onClick={handleSubmit}>Submit</a>

// ❌ Bad: Div as button
<div onClick={handleClick}>Click me</div>
```

### Form Accessibility

```typescript
// ✅ Good: Accessible form
<form onSubmit={handleSubmit}>
  {/* Always associate labels with inputs */}
  <label htmlFor="name">
    Full Name
    <span aria-label="required">*</span>
  </label>
  <input
    id="name"
    type="text"
    required
    aria-required="true"
    aria-describedby="name-hint"
  />
  <div id="name-hint">
    Enter your first and last name
  </div>

  {/* Group related fields */}
  <fieldset>
    <legend>Contact Preference</legend>
    <label>
      <input type="radio" name="contact" value="email" />
      Email
    </label>
    <label>
      <input type="radio" name="contact" value="phone" />
      Phone
    </label>
  </fieldset>

  {/* Clear error messages */}
  {errors.name && (
    <div role="alert" id="name-error">
      {errors.name}
    </div>
  )}

  <button type="submit">
    Submit
  </button>
</form>
```

### Modal Dialogs

```typescript
const Modal = component$<{ isOpen: boolean; onClose: () => void }>((props) => {
  const dialogRef = useSignal<HTMLElement>();

  // Trap focus in modal
  useVisibleTask$(({ track }) => {
    track(() => props.isOpen);

    if (props.isOpen) {
      // Save previous focus
      const previousFocus = document.activeElement;

      // Focus first focusable element
      dialogRef.value?.focus();

      // Return focus on close
      return () => {
        (previousFocus as HTMLElement)?.focus();
      };
    }
  });

  if (!props.isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      ref={dialogRef}
      tabIndex={-1}
    >
      <div role="document">
        <h2 id="dialog-title">Dialog Title</h2>
        <p id="dialog-description">Dialog content</p>

        <button onClick={props.onClose}>
          Close
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={props.onClose}
        aria-hidden="true"
      />
    </div>
  );
});
```

## Testing & Validation

### Automated Testing

```typescript
// Using @axe-core/react for automated testing
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('Button component', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Vitest + Testing Library
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Accessibility tests', () => {
  it('has accessible name', () => {
    render(<button aria-label="Close">×</button>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('form fields have labels', () => {
    render(
      <>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />
      </>
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

#### Keyboard Testing

- [ ] Tab through all interactive elements
- [ ] Shift+Tab navigates backwards
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate menus/selects
- [ ] Escape closes modals/menus
- [ ] Focus indicators always visible
- [ ] No keyboard traps

#### Screen Reader Testing

- [ ] Test with NVDA (Windows), VoiceOver (Mac), or JAWS
- [ ] All content is announced
- [ ] Interactive elements have clear labels
- [ ] Form fields have associated labels
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced
- [ ] Heading structure is logical

#### Visual Testing

- [ ] Zoom to 200% - no horizontal scrolling
- [ ] Test with high contrast mode
- [ ] Check color contrast (4.5:1 minimum)
- [ ] Text can be resized
- [ ] No information conveyed by color alone

### Browser Extensions

```typescript
// Recommended testing tools
const a11yTools = {
  automated: ['axe DevTools', 'WAVE', 'Lighthouse', 'IBM Equal Access'],

  contrast: ['WebAIM Contrast Checker', 'Colour Contrast Analyser'],

  screenReaders: [
    'NVDA (Windows)',
    'JAWS (Windows)',
    'VoiceOver (Mac/iOS)',
    'TalkBack (Android)',
  ],

  simulation: [
    'NoCoffee (vision impairment)',
    'Color Oracle (color blindness)',
  ],
};
```

## Implementation Guide

### Component Accessibility Pattern

```typescript
import { component$, useSignal, useId } from '@builder.io/qwik';
import { getToken } from '@n00plicate/design-tokens';

export const AccessibleInput = component$<{
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}>((props) => {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const hasError = !!props.error;

  const describedBy = [
    props.hint && hintId,
    hasError && errorId,
  ].filter(Boolean).join(' ');

  return (
    <div>
      <label htmlFor={inputId}>
        {props.label}
        {props.required && (
          <span aria-label="required">*</span>
        )}
      </label>

      {props.hint && (
        <div id={hintId}>
          {props.hint}
        </div>
      )}

      <input
        id={inputId}
        type={props.type || 'text'}
        required={props.required}
        aria-required={props.required}
        aria-invalid={hasError}
        aria-describedby={describedBy || undefined}
        style={{
          borderColor: hasError
            ? getToken('color.danger.500')
            : getToken('color.border.default'),
        }}
      />

      {hasError && (
        <div
          id={errorId}
          role="alert"
          style={{ color: getToken('color.danger.600') }}
        >
          {props.error}
        </div>
      )}
    </div>
  );
});
```

## Accessibility Checklist

### Design Phase

- [ ] Color contrast meets 4.5:1 minimum
- [ ] Text size minimum 16px for body
- [ ] Touch targets minimum 44×44px
- [ ] Don't rely on color alone
- [ ] Clear focus indicators designed
- [ ] Consistent navigation patterns

### Development Phase

- [ ] Semantic HTML elements used
- [ ] All images have alt text
- [ ] Forms have associated labels
- [ ] Keyboard navigation works
- [ ] ARIA used correctly (when needed)
- [ ] Focus management implemented
- [ ] Error messages clear and helpful

### Testing Phase

- [ ] Automated testing (axe, Lighthouse)
- [ ] Keyboard navigation tested
- [ ] Screen reader testing completed
- [ ] Zoom to 200% tested
- [ ] High contrast mode tested
- [ ] Color blindness simulation tested

## Further Reading

- 📖 [Design Principles Guide](./DESIGN_PRINCIPLES.md)
- 📝 [Typography System](./TYPOGRAPHY_SYSTEM.md)
- 🎨 [Color Theory Guide](./COLOR_THEORY.md)
- 📐 [Layout Systems](./LAYOUT_SYSTEMS.md)

### External Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)

---

**Need help?** Check the [Troubleshooting Guide](../TROUBLESHOOTING.md) or [open an issue](https://github.com/IAmJonoBo/n00plicate/issues/new).
