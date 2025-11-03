# 📚 n00plicate API Documentation

Complete API reference for all n00plicate packages and their exported functions, components, and types.

## 📋 Table of Contents

- [@n00plicate/design-tokens API](#n00plicatedesign-tokens-api)
- [@n00plicate/design-system API](#n00plicatedesign-system-api)
- [@n00plicate/shared-utils API](#n00plicateshared-utils-api)
- [Type Definitions](#type-definitions)
- [Integration Examples](#integration-examples)

## @n00plicate/design-tokens API

### Core Functions

#### `getToken(path, fallback?)`

Retrieves a token value by its path with optional fallback.

```typescript
function getToken(path: string, fallback?: string): string;
```

**Parameters:**

- `path` - Dot-separated token path (e.g., 'color.primary.500')
- `fallback` - Optional fallback value if token is not found

**Returns:** Token value as string or fallback

**Examples:**

```typescript
import { getToken } from '@n00plicate/design-tokens';

// Get a color token
const primaryColor = getToken('color.primary.500'); // '#007bff'

// With fallback
const customColor = getToken('color.brand.custom', '#000000');

// Spacing token
const padding = getToken('spacing.md'); // '1rem'
```

#### `getTokensByPattern(pattern)`

Retrieves all tokens matching a glob-like pattern.

```typescript
function getTokensByPattern(pattern: string): Array<{
  path: string;
  value: string;
  type?: string;
}>;
```

**Parameters:**

- `pattern` - Glob pattern with wildcard support (e.g., 'color.primary._', '_')

**Returns:** Array of token objects with path, value, and optional type

**Examples:**

```typescript
import { getTokensByPattern } from '@n00plicate/design-tokens';

// Get all primary colors
const primaryColors = getTokensByPattern('color.primary.*');
// Returns: [{ path: 'color.primary.50', value: '#eff6ff' }, ...]

// Get all spacing tokens
const spacing = getTokensByPattern('spacing.*');

// Get all tokens
const allTokens = getTokensByPattern('*');
```

#### `validateTokens(tokenObj?)`

Validates token structure against W3C DTCG standards.

```typescript
interface TokenValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateTokens(
  tokenObj?: Record<string, unknown>
): TokenValidationResult;
```

**Parameters:**

- `tokenObj` - Optional token object to validate (defaults to built-in tokens)

**Returns:** Validation result with errors and warnings

**Examples:**

```typescript
import { validateTokens } from '@n00plicate/design-tokens';

// Validate built-in tokens
const result = validateTokens();
console.log('Valid:', result.isValid);

// Validate custom tokens
const customTokens = {
  color: { primary: { $value: '#007bff', $type: 'color' } },
};
const customResult = validateTokens(customTokens);
if (!customResult.isValid) {
  console.error('Validation errors:', customResult.errors);
}
```

#### `matchesPattern(path, pattern)`

Utility function for testing if a token path matches a pattern.

```typescript
function matchesPattern(path: string, pattern: string): boolean;
```

**Parameters:**

- `path` - Token path to test
- `pattern` - Pattern with wildcard support

**Returns:** Boolean indicating if path matches pattern

**Examples:**

```typescript
import { matchesPattern } from '@n00plicate/design-tokens';

matchesPattern('color.primary.500', 'color.primary.*'); // true
matchesPattern('spacing.md', 'color.*'); // false
matchesPattern('any.token.path', '*'); // true
```

### Token Structure

Our tokens follow W3C DTCG format with the following structure:

```typescript
interface Token {
  $value: string | number;
  $type?:
    | 'color'
    | 'dimension'
    | 'fontFamily'
    | 'fontWeight'
    | 'duration'
    | 'cubicBezier'
    | 'number'
    | 'strokeStyle'
    | 'border'
    | 'transition'
    | 'shadow'
    | 'gradient'
    | 'typography';
  $description?: string;
}

interface TokenGroup {
  $type?: string;
  $description?: string;
  [key: string]: Token | TokenGroup | string | undefined;
}
```

### Available Token Categories

#### Colors

```typescript
// Base color scale (50-900)
getToken('color.primary.50'); // Lightest
getToken('color.primary.500'); // Base
getToken('color.primary.900'); // Darkest

// Semantic colors
getToken('color.success.500'); // Success state
getToken('color.warning.500'); // Warning state
getToken('color.error.500'); // Error state
getToken('color.info.500'); // Info state

// Neutral scale
getToken('color.neutral.100'); // Light background
getToken('color.neutral.600'); // Text color
getToken('color.neutral.900'); // Dark text
```

#### Typography

```typescript
// Font families
getToken('font.family.sans'); // System sans-serif
getToken('font.family.serif'); // System serif
getToken('font.family.mono'); // System monospace

// Font sizes (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl)
getToken('font.size.base'); // 1rem (16px)
getToken('font.size.lg'); // 1.125rem (18px)
getToken('font.size.2xl'); // 1.5rem (24px)

// Font weights
getToken('font.weight.normal'); // 400
getToken('font.weight.medium'); // 500
getToken('font.weight.bold'); // 700

// Line heights
getToken('line.height.tight'); // 1.25
getToken('line.height.normal'); // 1.5
getToken('line.height.relaxed'); // 1.75
```

#### Spacing

```typescript
// T-shirt scale (xs, sm, md, lg, xl, 2xl, 3xl)
getToken('spacing.xs'); // 0.25rem (4px)
getToken('spacing.sm'); // 0.5rem (8px)
getToken('spacing.md'); // 1rem (16px)
getToken('spacing.lg'); // 1.5rem (24px)
getToken('spacing.xl'); // 2rem (32px)
```

#### Borders & Shadows

```typescript
// Border radius
getToken('border.radius.sm'); // 0.125rem (2px)
getToken('border.radius.md'); // 0.375rem (6px)
getToken('border.radius.lg'); // 0.5rem (8px)
getToken('border.radius.full'); // 9999px

// Shadows
getToken('shadow.sm'); // Subtle shadow
getToken('shadow.md'); // Card shadow
getToken('shadow.lg'); // Modal shadow
getToken('shadow.xl'); // Floating elements
```

### Component Tokens

Component-specific tokens for consistent UI patterns:

```typescript
// Button tokens
getToken('component.button.padding.sm'); // Small button padding
getToken('component.button.padding.md'); // Medium button padding
getToken('component.button.border.radius'); // Button border radius
getToken('component.button.font.weight'); // Button text weight

// Card tokens
getToken('component.card.padding'); // Card internal padding
getToken('component.card.border.radius'); // Card corner radius
getToken('component.card.shadow'); // Card elevation
getToken('component.card.background'); // Card background
```

### Platform Exports

#### CSS Variables

```css
/* Automatically generated CSS custom properties */
:root {
  --color-primary-500: #007bff;
  --spacing-md: 1rem;
  --font-size-lg: 1.125rem;
  /* ... all tokens as CSS variables */
}
```

#### TypeScript Types

```typescript
// Generated TypeScript definitions
export interface Tokens {
  color: {
    primary: {
      50: string;
      100: string;
      // ... complete type definitions
    };
  };
  spacing: {
    xs: string;
    sm: string;
    // ... complete spacing scale
  };
}
```

#### JSON Output

```json
{
  "color": {
    "primary": {
      "500": {
        "value": "#007bff",
        "type": "color"
      }
    }
  }
}
```

### Breakpoint Tokens

```typescript
interface BreakpointTokens {
  xs: Token<string>; // 0px
  sm: Token<string>; // 640px
  md: Token<string>; // 768px
  lg: Token<string>; // 1024px
  xl: Token<string>; // 1280px
  '2xl': Token<string>; // 1536px
}
```

### Token Type

```typescript
interface Token<T> {
  value: T;
  type: string;
  description?: string;
  deprecated?: boolean;
}
```

## @n00plicate/design-system API

### Component Exports

```typescript
// Layout Components
export { Card } from './components/Card';
export { Container } from './components/Container';
export { Stack } from './components/Stack';
export { Grid } from './components/Grid';

// Form Components
export { Button } from './components/Button';
export { Input } from './components/Input';
export { Select } from './components/Select';
export { Checkbox } from './components/Checkbox';
export { Radio } from './components/Radio';
export { Switch } from './components/Switch';
export { Textarea } from './components/Textarea';

// Feedback Components
export { Alert } from './components/Alert';
export { Loading } from './components/Loading';
export { Skeleton } from './components/Skeleton';
export { Toast } from './components/Toast';

// Typography Components
export { Text } from './components/Text';
export { Heading } from './components/Heading';

// Navigation Components
export { Link } from './components/Link';
export { Breadcrumb } from './components/Breadcrumb';

// Data Display Components
export { Badge } from './components/Badge';
export { Avatar } from './components/Avatar';
export { Tag } from './components/Tag';
```

### Component Props

#### Button Component

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
  onClick$?: QRL<(event: MouseEvent) => void>;
  type?: 'button' | 'submit' | 'reset';
  class?: string;
  children?: Slot;
}
```

#### Input Component

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  autoComplete?: string;
  leftIcon?: string;
  rightIcon?: string;
  onInput$?: QRL<(event: InputEvent) => void>;
  onChange$?: QRL<(event: Event) => void>;
  onBlur$?: QRL<(event: FocusEvent) => void>;
  class?: string;
}
```

#### Card Component

```typescript
interface CardProps {
  variant?: 'flat' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick$?: QRL<(event: MouseEvent) => void>;
  class?: string;
  children?: Slot;
}
```

#### Text Component

```typescript
interface TextProps {
  as?: 'p' | 'span' | 'div' | 'label';
  variant?: 'body' | 'caption' | 'overline' | 'code';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'error';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  class?: string;
  children?: Slot;
}
```

#### Alert Component

```typescript
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  onDismiss$?: QRL<() => void>;
  class?: string;
  children?: Slot;
}
```

### Hook Exports

```typescript
// Theme and styling hooks
export { useTheme } from './hooks/useTheme';
export { useBreakpoint } from './hooks/useBreakpoint';
export { useColorScheme } from './hooks/useColorScheme';

// Form hooks
export { useForm } from './hooks/useForm';
export { useInput } from './hooks/useInput';
export { useValidation } from './hooks/useValidation';

// UI state hooks
export { useDisclosure } from './hooks/useDisclosure';
export { useClipboard } from './hooks/useClipboard';
export { useLocalStorage } from './hooks/useLocalStorage';
```

### Style Utilities

```typescript
// CSS-in-JS utilities
export { createTheme } from './styles/createTheme';
export { createTokens } from './styles/createTokens';
export { responsive } from './styles/responsive';

// Component styles
export { buttonStyles } from './styles/button.css';
export { cardStyles } from './styles/card.css';
export { inputStyles } from './styles/input.css';
```

## @n00plicate/shared-utils API

### String Utilities

```typescript
/**
 * Conditionally join class names
 */
export function cn(
  ...classes: Array<string | undefined | null | boolean>
): string;

/**
 * Convert string to URL-safe slug
 */
export function slugify(text: string): string;

/**
 * Truncate string with ellipsis
 */
export function truncate(text: string, length: number, suffix?: string): string;

/**
 * Capitalize first letter of string
 */
export function capitalize(text: string): string;

/**
 * Convert string to camelCase
 */
export function camelCase(text: string): string;

/**
 * Convert string to kebab-case
 */
export function kebabCase(text: string): string;

/**
 * Convert string to PascalCase
 */
export function pascalCase(text: string): string;
```

### Object Utilities

```typescript
/**
 * Check if object is empty
 */
export function isEmptyObject(obj: unknown): boolean;

/**
 * Pick specific properties from object
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;

/**
 * Omit specific properties from object
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;

/**
 * Deep merge multiple objects
 */
export function deepMerge<T extends Record<string, any>>(...objects: T[]): T;

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T;

/**
 * Get nested property value safely
 */
export function get<T>(obj: any, path: string, defaultValue?: T): T;

/**
 * Set nested property value
 */
export function set(obj: any, path: string, value: any): void;
```

### Array Utilities

```typescript
/**
 * Remove duplicate values from array
 */
export function unique<T>(arr: T[]): T[];
export function unique<T, K>(arr: T[], keyFn: (item: T) => K): T[];

/**
 * Group array elements by key
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, T[]>;

/**
 * Split array into chunks
 */
export function chunk<T>(arr: T[], size: number): T[][];

/**
 * Flatten nested arrays
 */
export function flatten<T>(arr: (T | T[])[]): T[];

/**
 * Sort array by property or function
 */
export function sortBy<T>(arr: T[], keyFn: (item: T) => any): T[];

/**
 * Find intersection of multiple arrays
 */
export function intersection<T>(...arrays: T[][]): T[];

/**
 * Find difference between arrays
 */
export function difference<T>(arr: T[], ...others: T[][]): T[];
```

### Function Utilities

```typescript
/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void;

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void;

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T;

/**
 * Compose functions
 */
export function compose<T>(...fns: Function[]): (value: T) => T;

/**
 * Pipe functions
 */
export function pipe<T>(...fns: Function[]): (value: T) => T;

/**
 * Curry function
 */
export function curry<T extends (...args: any[]) => any>(fn: T): any;
```

### Date Utilities

```typescript
/**
 * Format date with pattern
 */
export function formatDate(date: Date, pattern: string): string;

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date, baseDate?: Date): string;

/**
 * Check if date is valid
 */
export function isValidDate(date: any): date is Date;

/**
 * Add time to date
 */
export function addDays(date: Date, days: number): Date;
export function addHours(date: Date, hours: number): Date;
export function addMinutes(date: Date, minutes: number): Date;

/**
 * Get start/end of time period
 */
export function startOfDay(date: Date): Date;
export function endOfDay(date: Date): Date;
export function startOfWeek(date: Date): Date;
export function endOfWeek(date: Date): Date;
```

### Validation Utilities

```typescript
/**
 * Email validation
 */
export function isEmail(email: string): boolean;

/**
 * URL validation
 */
export function isURL(url: string): boolean;

/**
 * UUID validation
 */
export function isUUID(uuid: string): boolean;

/**
 * Phone number validation
 */
export function isPhoneNumber(phone: string): boolean;

/**
 * Credit card validation
 */
export function isCreditCard(card: string): boolean;

/**
 * Password strength validation
 */
export function isStrongPassword(password: string): boolean;

/**
 * Generic validation schema
 */
export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export function validate<T>(value: T, rules: ValidationRule<T>[]): string[];
```

### ID Generation

```typescript
/**
 * Generate unique ID
 */
export function createId(
  length?: number,
  charset?: 'alphanumeric' | 'numeric' | 'alpha'
): string;

/**
 * Generate UUID v4
 */
export function createUUID(): string;

/**
 * Generate slug with optional uniqueness
 */
export function createSlug(text: string, unique?: boolean): string;

/**
 * Generate random string
 */
export function randomString(length: number, charset?: string): string;
```

### Platform Detection

```typescript
export type Platform = 'web' | 'mobile' | 'desktop' | 'server';

/**
 * Detect current platform
 */
export function detectPlatform(): Platform;

/**
 * Check if running in browser
 */
export function isBrowser(): boolean;

/**
 * Check if running on server
 */
export function isServer(): boolean;

/**
 * Check if running on mobile
 */
export function isMobile(): boolean;

/**
 * Get user agent information
 */
export function getUserAgent(): {
  browser: string;
  version: string;
  os: string;
  device: string;
};
```

## Type Definitions

### Global Types

```typescript
// Utility types
export type Primitive = string | number | boolean | null | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type NonEmptyArray<T> = [T, ...T[]];
export type ValueOf<T> = T[keyof T];
export type KeyOf<T> = keyof T;
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Component types
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ColorScheme = 'light' | 'dark' | 'auto';
export type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

// Form types
export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url';
export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

// Event types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;
```

### Design System Types

```typescript
// Theme configuration
export interface ThemeConfig {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  breakpoints: BreakpointTokens;
}

// Component configuration
export interface ComponentConfig {
  defaultSize: ComponentSize;
  defaultVariant: ComponentVariant;
  colorScheme: ColorScheme;
}

// Style system types
export interface StyleProps {
  margin?: ResponsiveValue<string>;
  padding?: ResponsiveValue<string>;
  color?: ResponsiveValue<string>;
  backgroundColor?: ResponsiveValue<string>;
  fontSize?: ResponsiveValue<string>;
  fontWeight?: ResponsiveValue<string>;
}
```

## Integration Examples

### Full Application Setup

```typescript
// app.tsx
import { component$ } from '@builder.io/qwik';
import {
  Button,
  Card,
  Input,
  Text,
  Alert
} from '@n00plicate/design-system';
import {
  cn,
  debounce,
  formatDate,
  isEmail
} from '@n00plicate/shared-utils';
import { tokens } from '@n00plicate/design-tokens';

export default component$(() => {
  const handleSearch = debounce((query: string) => {
    console.log('Searching:', query);
  }, 300);

  return (
    <div class={cn('app', 'min-h-screen')}
         style={{ backgroundColor: tokens.color.background.value }}>

      <Card variant="elevated" padding="lg">
        <Text variant="heading" size="xl">
          Welcome to n00plicate
        </Text>

        <Text color="muted">
          Built on {formatDate(new Date(), 'MMM DD, YYYY')}
        </Text>

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          onInput$={(e) => {
            const email = (e.target as HTMLInputElement).value;
            if (isEmail(email)) {
              handleSearch(email);
            }
          }}
        />

        <Button variant="primary" fullWidth>
          Get Started
        </Button>

        <Alert variant="info" dismissible>
          Welcome to the n00plicate design system!
        </Alert>
      </Card>
    </div>
  );
});
```

### Custom Component with Tokens

```typescript
// custom-component.tsx
import { component$ } from '@builder.io/qwik';
import { style } from '@vanilla-extract/css';
import { tokens } from '@n00plicate/design-tokens';
import { cn } from '@n00plicate/shared-utils';

interface CustomComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const customStyle = style({
  padding: tokens.spacing.md.value,
  borderRadius: tokens.borderRadius.base.value,
  fontFamily: tokens.fontFamily.sans.value,
  transition: 'all 0.2s ease',

  selectors: {
    '&[data-variant="primary"]': {
      backgroundColor: tokens.color.primary.value,
      color: tokens.color.text.inverse.value,
    },
    '&[data-variant="secondary"]': {
      backgroundColor: tokens.color.secondary.value,
      color: tokens.color.text.primary.value,
    },
    '&[data-size="sm"]': {
      fontSize: tokens.fontSize.sm.value,
      padding: tokens.spacing.sm.value,
    },
    '&[data-size="lg"]': {
      fontSize: tokens.fontSize.lg.value,
      padding: tokens.spacing.lg.value,
    },
  },
});

export const CustomComponent = component$<CustomComponentProps>(({
  variant = 'primary',
  size = 'md',
}) => {
  return (
    <div
      class={cn(customStyle, 'custom-component')}
      data-variant={variant}
      data-size={size}
    >
      Custom Component
    </div>
  );
});
```

### Form with Validation

```typescript
// form-example.tsx
import { component$, useSignal } from '@builder.io/qwik';
import { Button, Input, Alert } from '@n00plicate/design-system';
import { isEmail, isStrongPassword } from '@n00plicate/shared-utils';

export const FormExample = component$(() => {
  const email = useSignal('');
  const password = useSignal('');
  const errors = useSignal<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isEmail(email.value)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isStrongPassword(password.value)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form onSubmit$={(e) => {
      e.preventDefault();
      if (validateForm()) {
        console.log('Form submitted:', { email: email.value, password: password.value });
      }
    }}>

      <Input
        label="Email"
        type="email"
        value={email.value}
        error={errors.value.email}
        onInput$={(e) => {
          email.value = (e.target as HTMLInputElement).value;
          if (errors.value.email) {
            errors.value = { ...errors.value, email: '' };
          }
        }}
      />

      <Input
        label="Password"
        type="password"
        value={password.value}
        error={errors.value.password}
        onInput$={(e) => {
          password.value = (e.target as HTMLInputElement).value;
          if (errors.value.password) {
            errors.value = { ...errors.value, password: '' };
          }
        }}
      />

      {Object.keys(errors.value).length > 0 && (
        <Alert variant="error">
          Please fix the errors above
        </Alert>
      )}

      <Button type="submit" variant="primary" fullWidth>
        Submit
      </Button>
    </form>
  );
});
```

This comprehensive API documentation provides complete reference material for all n00plicate packages, making it easy for
developers to understand and use the design system effectively.
