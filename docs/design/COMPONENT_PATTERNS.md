# 🧩 Component Patterns Guide

> **Master common UI patterns and build consistent, reusable components**

## Overview

This guide covers proven component patterns that solve common UI challenges. Learn when to use each pattern,
implementation examples, and accessibility considerations.

## Table of Contents

1. [Container/Presentational Pattern](#containerpresentational-pattern)
2. [Compound Components](#compound-components)
3. [Render Props](#render-props)
4. [Slots Pattern](#slots-pattern)
5. [Provider Pattern](#provider-pattern)
6. [Higher-Order Components](#higher-order-components)
7. [Form Patterns](#form-patterns)
8. [List & Data Display](#list--data-display)
9. [Modal & Overlay Patterns](#modal--overlay-patterns)
10. [Navigation Patterns](#navigation-patterns)

## Container/Presentational Pattern

Separate logic from presentation for better reusability and testing.

### Structure

```typescript
// Presentational Component (UI only)
export const Button = component$<{
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick$?: () => void;
}>((props) => {
  return (
    <button
      class={`btn btn-${props.variant} btn-${props.size}`}
      disabled={props.disabled}
      onClick$={props.onClick$}
      style={{
        backgroundColor: getToken(`color.${props.variant}.500`),
        padding: getToken(`spacing.${props.size === 'lg' ? 'md' : 'sm'}`),
      }}
    >
      {props.children}
    </button>
  );
});

// Container Component (logic)
export const SubmitButtonContainer = component$(() => {
  const isLoading = useSignal(false);
  const isDisabled = useSignal(false);

  const handleSubmit = $(async () => {
    isLoading.value = true;
    try {
      await submitForm();
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <Button
      variant="primary"
      disabled={isDisabled.value || isLoading.value}
      onClick$={handleSubmit}
    >
      {isLoading.value ? 'Submitting...' : 'Submit'}
    </Button>
  );
});
```

### When to Use

✅ Complex components with lots of logic
✅ Need to reuse UI in different contexts
✅ Want to test logic separately from UI
✅ Multiple variations of same component

## Compound Components

Components that work together to form a complete interface.

### Pattern

```typescript
// Tab component system
export const Tabs = component$(() => {
  const activeTab = useSignal(0);

  return (
    <div role="tablist">
      {props.children}
    </div>
  );
});

export const TabList = component$(() => {
  return (
    <div role="tablist" class="tab-list">
      {props.children}
    </div>
  );
});

export const Tab = component$<{
  isActive?: boolean;
  onSelect$?: () => void;
}>((props) => {
  return (
    <button
      role="tab"
      aria-selected={props.isActive}
      onClick$={props.onSelect$}
      class={props.isActive ? 'tab-active' : 'tab'}
    >
      {props.children}
    </button>
  );
});

export const TabPanels = component$(() => {
  return <div class="tab-panels">{props.children}</div>;
});

export const TabPanel = component$<{
  isActive?: boolean;
}>((props) => {
  if (!props.isActive) return null;

  return (
    <div role="tabpanel" class="tab-panel">
      {props.children}
    </div>
  );
});

// Usage
<Tabs>
  <TabList>
    <Tab>Profile</Tab>
    <Tab>Settings</Tab>
    <Tab>Notifications</Tab>
  </TabList>

  <TabPanels>
    <TabPanel>Profile content</TabPanel>
    <TabPanel>Settings content</TabPanel>
    <TabPanel>Notifications content</TabPanel>
  </TabPanels>
</Tabs>
```

### When to Use

✅ Complex components with multiple parts
✅ Need flexible composition
✅ Want to hide internal state management
✅ Creating design system components

## Render Props

Pass rendering logic as a prop for maximum flexibility.

### Pattern

```typescript
export const DataFetcher = component$<{
  url: string;
  render: (data: any, loading: boolean, error: Error | null) => JSXNode;
}>((props) => {
  const data = useSignal<any>(null);
  const loading = useSignal(true);
  const error = useSignal<Error | null>(null);

  useTask$(async () => {
    try {
      const response = await fetch(props.url);
      data.value = await response.json();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  });

  return props.render(data.value, loading.value, error.value);
});

// Usage
<DataFetcher
  url="/api/users"
  render={(users, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <Error message={error.message} />;

    return (
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    );
  }}
/>
```

### When to Use

✅ Need different rendering based on state
✅ Want to share stateful logic
✅ Need maximum flexibility
✅ Building reusable data-fetching components

## Slots Pattern

Named slots for flexible content placement.

### Pattern

```typescript
export const Card = component$<{
  header?: JSXNode;
  footer?: JSXNode;
}>((props) => {
  return (
    <div class="card" style={{
      background: getToken('color.background.secondary'),
      borderRadius: getToken('border.radius.lg'),
      padding: getToken('spacing.lg'),
      boxShadow: getToken('shadow.md'),
    }}>
      {props.header && (
        <div class="card-header">
          <Slot name="header" />
        </div>
      )}

      <div class="card-body">
        <Slot /> {/* Default slot */}
      </div>

      {props.footer && (
        <div class="card-footer">
          <Slot name="footer" />
        </div>
      )}
    </div>
  );
});

// Usage
<Card>
  <div q:slot="header">
    <h2>Card Title</h2>
  </div>

  <p>Card content goes here</p>

  <div q:slot="footer">
    <button>Action</button>
  </div>
</Card>
```

### When to Use

✅ Need multiple content areas
✅ Want flexible composition
✅ Building layout components
✅ Creating card/panel components

## Provider Pattern

Share state across component tree without prop drilling.

### Pattern

```typescript
import { createContextId, useContextProvider, useContext } from '@builder.io/qwik';

// Create context
export const ThemeContext = createContextId<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>('theme-context');

// Provider component
export const ThemeProvider = component$(() => {
  const theme = useSignal<'light' | 'dark'>('light');

  const toggleTheme = $(() => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  });

  useContextProvider(ThemeContext, {
    theme: theme.value,
    toggleTheme,
  });

  return <Slot />;
});

// Consumer component
export const ThemedButton = component$(() => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick$={toggleTheme}
      style={{
        background: theme === 'light'
          ? getToken('color.neutral.50')
          : getToken('color.neutral.900'),
        color: theme === 'light'
          ? getToken('color.neutral.900')
          : getToken('color.neutral.50'),
      }}
    >
      Toggle Theme
    </button>
  );
});

// Usage
<ThemeProvider>
  <App>
    <ThemedButton />
  </App>
</ThemeProvider>
```

### When to Use

✅ Need global state (theme, auth, etc.)
✅ Avoiding prop drilling
✅ State needed by many components
✅ Building design system with theming

## Form Patterns

### Controlled Forms

```typescript
export const ControlledForm = component$(() => {
  const formData = useStore({
    email: '',
    password: '',
    rememberMe: false,
  });

  const errors = useStore({
    email: '',
    password: '',
  });

  const handleSubmit = $((e: Event) => {
    e.preventDefault();

    // Validation
    if (!formData.email.includes('@')) {
      errors.email = 'Invalid email';
      return;
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      return;
    }

    // Submit
    console.log('Submitting:', formData);
  });

  return (
    <form onSubmit$={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={formData.email}
        onInput$={(e) => formData.email = e.target.value}
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />
      {errors.email && (
        <div id="email-error" role="alert">
          {errors.email}
        </div>
      )}

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={formData.password}
        onInput$={(e) => formData.password = e.target.value}
        aria-invalid={!!errors.password}
        aria-describedby={errors.password ? 'password-error' : undefined}
      />
      {errors.password && (
        <div id="password-error" role="alert">
          {errors.password}
        </div>
      )}

      <label>
        <input
          type="checkbox"
          checked={formData.rememberMe}
          onChange$={(e) => formData.rememberMe = e.target.checked}
        />
        Remember me
      </label>

      <button type="submit">Sign In</button>
    </form>
  );
});
```

### Form Field Component

```typescript
export const FormField = component$<{
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  value?: string;
  onInput$?: (value: string) => void;
}>((props) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div class="form-field">
      <label htmlFor={id}>
        {props.label}
        {props.required && <span aria-label="required">*</span>}
      </label>

      {props.helperText && (
        <div id={helperId} class="helper-text">
          {props.helperText}
        </div>
      )}

      <input
        id={id}
        type={props.type || 'text'}
        name={props.name}
        value={props.value}
        required={props.required}
        aria-required={props.required}
        aria-invalid={!!props.error}
        aria-describedby={[
          props.helperText && helperId,
          props.error && errorId,
        ].filter(Boolean).join(' ') || undefined}
        onInput$={(e) => props.onInput$?.(e.target.value)}
      />

      {props.error && (
        <div id={errorId} role="alert" class="error-text">
          {props.error}
        </div>
      )}
    </div>
  );
});

// Usage
<FormField
  label="Email"
  name="email"
  type="email"
  required
  helperText="We'll never share your email"
  error={errors.email}
  value={formData.email}
  onInput$={(value) => formData.email = value}
/>
```

## List & Data Display

### Virtual List (Performance)

```typescript
import { useVirtualizer } from '@tanstack/qwik-virtual';

export const VirtualList = component$<{
  items: any[];
  itemHeight: number;
}>((props) => {
  const parentRef = useSignal<Element>();

  const virtualizer = useVirtualizer({
    count: props.items.length,
    getScrollElement: () => parentRef.value,
    estimateSize: () => props.itemHeight,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: '400px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {props.items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
});
```

### Data Table

```typescript
export const DataTable = component$<{
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
  }>;
  data: any[];
}>((props) => {
  const sortBy = useSignal<string | null>(null);
  const sortDir = useSignal<'asc' | 'desc'>('asc');

  const handleSort = $((key: string) => {
    if (sortBy.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy.value = key;
      sortDir.value = 'asc';
    }
  });

  const sortedData = [...props.data].sort((a, b) => {
    if (!sortBy.value) return 0;

    const aVal = a[sortBy.value];
    const bVal = b[sortBy.value];

    if (sortDir.value === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return (
    <table role="table">
      <thead>
        <tr>
          {props.columns.map((col) => (
            <th key={col.key}>
              {col.sortable ? (
                <button
                  onClick$={() => handleSort(col.key)}
                  aria-label={`Sort by ${col.label}`}
                  aria-sort={
                    sortBy.value === col.key
                      ? sortDir.value === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  {col.label}
                  {sortBy.value === col.key && (
                    <span aria-hidden="true">
                      {sortDir.value === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
              ) : (
                col.label
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, i) => (
          <tr key={i}>
            {props.columns.map((col) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
});
```

## Modal & Overlay Patterns

### Accessible Modal

```typescript
export const Modal = component$<{
  isOpen: boolean;
  onClose$: () => void;
  title: string;
}>((props) => {
  const dialogRef = useSignal<HTMLElement>();

  // Focus management
  useVisibleTask$(({ track }) => {
    track(() => props.isOpen);

    if (props.isOpen) {
      const previousFocus = document.activeElement as HTMLElement;

      // Focus first element in modal
      setTimeout(() => {
        const firstFocusable = dialogRef.value?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 0);

      // Trap focus
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          props.onClose$();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Restore focus on close
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        previousFocus?.focus();
      };
    }
  });

  if (!props.isOpen) return null;

  return (
    <div
      class="modal-overlay"
      onClick$={props.onClose$}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick$={(e) => e.stopPropagation()}
        style={{
          background: getToken('color.background.primary'),
          borderRadius: getToken('border.radius.lg'),
          padding: getToken('spacing.xl'),
          maxWidth: '500px',
          width: '90%',
        }}
      >
        <h2 id="modal-title">{props.title}</h2>

        <div class="modal-content">
          <Slot />
        </div>

        <div class="modal-actions">
          <button onClick$={props.onClose$}>Close</button>
        </div>
      </div>
    </div>
  );
});
```

## Navigation Patterns

### Responsive Navigation

```typescript
export const Navigation = component$(() => {
  const isMobileMenuOpen = useSignal(false);
  const isMobile = useSignal(false);

  useVisibleTask$(() => {
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  });

  return (
    <nav aria-label="Main navigation">
      <div class="nav-container">
        <a href="/" class="logo">
          Logo
        </a>

        {isMobile.value ? (
          <>
            <button
              onClick$={() => isMobileMenuOpen.value = !isMobileMenuOpen.value}
              aria-expanded={isMobileMenuOpen.value}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen.value ? '✕' : '☰'}
            </button>

            {isMobileMenuOpen.value && (
              <div class="mobile-menu">
                <a href="/">Home</a>
                <a href="/about">About</a>
                <a href="/products">Products</a>
                <a href="/contact">Contact</a>
              </div>
            )}
          </>
        ) : (
          <div class="desktop-menu">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/products">Products</a>
            <a href="/contact">Contact</a>
          </div>
        )}
      </div>
    </nav>
  );
});
```

## Best Practices

### Component Design

✅ Keep components focused (single responsibility)
✅ Use composition over inheritance
✅ Make components configurable with props
✅ Provide sensible defaults
✅ Document props and usage

### Accessibility

✅ Use semantic HTML
✅ Provide keyboard navigation
✅ Include ARIA attributes
✅ Manage focus properly
✅ Test with screen readers

### Performance

✅ Lazy load heavy components
✅ Use virtual lists for long lists
✅ Memoize expensive calculations
✅ Avoid unnecessary re-renders
✅ Optimize bundle size

## Further Reading

- 📖 [Design Principles Guide](./DESIGN_PRINCIPLES.md)
- 📝 [Typography System](./TYPOGRAPHY_SYSTEM.md)
- 🎨 [Color Theory Guide](./COLOR_THEORY.md)
- ♿ [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)
- 🧪 [Testing Guide](../testing/comprehensive-testing.md)

---

**Need help?** Check the [Troubleshooting Guide](../TROUBLESHOOTING.md) or [open an issue](https://github.com/n00tropic/n00plicate/issues/new).
