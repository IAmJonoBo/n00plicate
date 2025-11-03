# 🔧 @n00plicate/shared-utils

Shared utilities and helper functions for the n00plicate monorepo, providing common functionality across web, mobile, and
desktop applications.

## 📋 Overview

This package contains reusable TypeScript utilities, type definitions, and helper functions that are shared across all
n00plicate packages. It provides a foundation of common functionality to reduce code duplication and ensure consistency.

## 🎯 Key Features

- **Type-Safe Utilities**: Full TypeScript support with strict typing
- **Cross-Platform**: Works across web, mobile, and desktop environments
- **Tree-Shakable**: Import only what you need for optimal bundle size
- **Well-Tested**: Comprehensive unit tests for all utilities
- **Zero Dependencies**: No external runtime dependencies

## 📦 Installation

```bash
# Install via pnpm (workspace dependency)
pnpm add @n00plicate/shared-utils

# Or if developing locally
pnpm install
```

## 🚀 Usage

### Basic Import

```typescript
import {
  cn,
  formatDate,
  debounce,
  isEmptyObject,
  createId,
} from '@n00plicate/shared-utils';

// Use utilities in your components
const className = cn('base-class', condition && 'conditional-class');
const formattedDate = formatDate(new Date(), 'YYYY-MM-DD');
```

## 🛠️ Utility Categories

### String Utilities

#### `cn` - Class Name Helper

Utility for conditionally joining class names together.

```typescript
import { cn } from '@n00plicate/shared-utils';

// Basic usage
cn('btn', 'btn-primary'); // 'btn btn-primary'

// Conditional classes
cn('btn', isActive && 'active', isDisabled && 'disabled');

// Object syntax
cn('btn', {
  'btn-primary': variant === 'primary',
  'btn-secondary': variant === 'secondary',
  'btn-disabled': disabled,
});

// Array syntax
cn(['btn', 'btn-primary'], condition && 'active');
```

#### `slugify` - URL-Safe String Conversion

Convert strings to URL-safe slugs.

```typescript
import { slugify } from '@n00plicate/shared-utils';

slugify('Hello World!'); // 'hello-world'
slugify('My Article Title'); // 'my-article-title'
slugify('Special@Characters#Here'); // 'special-characters-here'
```

#### `truncate` - String Truncation

Safely truncate strings with optional ellipsis.

```typescript
import { truncate } from '@n00plicate/shared-utils';

truncate('This is a long string', 10); // 'This is a...'
truncate('Short', 10); // 'Short'
truncate('Custom ellipsis', 10, '---'); // 'Custom el---'
```

### Date and Time Utilities

#### `formatDate` - Date Formatting

Format dates with various patterns.

```typescript
import { formatDate } from '@n00plicate/shared-utils';

const date = new Date('2023-12-25');

formatDate(date, 'YYYY-MM-DD'); // '2023-12-25'
formatDate(date, 'DD/MM/YYYY'); // '25/12/2023'
formatDate(date, 'MMM DD, YYYY'); // 'Dec 25, 2023'
formatDate(date, 'DD MMM YYYY HH:mm'); // '25 Dec 2023 00:00'
```

#### `getRelativeTime` - Relative Time Display

Get human-readable relative time strings.

```typescript
import { getRelativeTime } from '@n00plicate/shared-utils';

const now = new Date();
const pastDate = new Date(now.getTime() - 3600000); // 1 hour ago

getRelativeTime(pastDate); // '1 hour ago'
getRelativeTime(new Date(now.getTime() + 3600000)); // 'in 1 hour'
```

#### `isValidDate` - Date Validation

Check if a value is a valid date.

```typescript
import { isValidDate } from '@n00plicate/shared-utils';

isValidDate(new Date()); // true
isValidDate('2023-12-25'); // false
isValidDate(new Date('invalid')); // false
```

### Object Utilities

#### `isEmptyObject` - Empty Object Check

Check if an object is empty.

```typescript
import { isEmptyObject } from '@n00plicate/shared-utils';

isEmptyObject({}); // true
isEmptyObject({ key: 'value' }); // false
isEmptyObject([]); // true (arrays are objects)
```

#### `pick` - Object Property Selection

Create a new object with only specified properties.

```typescript
import { pick } from '@n00plicate/shared-utils';

const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret',
};
const publicUser = pick(user, ['id', 'name', 'email']);
// { id: 1, name: 'John', email: 'john@example.com' }
```

#### `omit` - Object Property Exclusion

Create a new object excluding specified properties.

```typescript
import { omit } from '@n00plicate/shared-utils';

const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret',
};
const publicUser = omit(user, ['password']);
// { id: 1, name: 'John', email: 'john@example.com' }
```

#### `deepMerge` - Deep Object Merging

Recursively merge multiple objects.

```typescript
import { deepMerge } from '@n00plicate/shared-utils';

const obj1 = { a: 1, b: { c: 2 } };
const obj2 = { b: { d: 3 }, e: 4 };
const merged = deepMerge(obj1, obj2);
// { a: 1, b: { c: 2, d: 3 }, e: 4 }
```

### Array Utilities

#### `unique` - Array Deduplication

Remove duplicate values from an array.

```typescript
import { unique } from '@n00plicate/shared-utils';

unique([1, 2, 2, 3, 1]); // [1, 2, 3]
unique(['a', 'b', 'a', 'c']); // ['a', 'b', 'c']

// With custom key function for objects
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 1, name: 'John' },
];
unique(users, user => user.id); // [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
```

#### `groupBy` - Array Grouping

Group array elements by a key function.

```typescript
import { groupBy } from '@n00plicate/shared-utils';

const users = [
  { name: 'John', role: 'admin' },
  { name: 'Jane', role: 'user' },
  { name: 'Bob', role: 'admin' },
];

const grouped = groupBy(users, user => user.role);
// {
//   admin: [{ name: 'John', role: 'admin' }, { name: 'Bob', role: 'admin' }],
//   user: [{ name: 'Jane', role: 'user' }]
// }
```

#### `chunk` - Array Chunking

Split an array into chunks of specified size.

```typescript
import { chunk } from '@n00plicate/shared-utils';

chunk([1, 2, 3, 4, 5, 6], 2); // [[1, 2], [3, 4], [5, 6]]
chunk([1, 2, 3, 4, 5], 3); // [[1, 2, 3], [4, 5]]
```

### Function Utilities

#### `debounce` - Function Debouncing

Delay function execution until after a specified time has passed.

```typescript
import { debounce } from '@n00plicate/shared-utils';

const searchHandler = debounce((query: string) => {
  console.log('Searching for:', query);
}, 300);

// Only logs after 300ms of no calls
searchHandler('a');
searchHandler('ap');
searchHandler('app'); // Only this will execute
```

#### `throttle` - Function Throttling

Limit function execution to once per specified time period.

```typescript
import { throttle } from '@n00plicate/shared-utils';

const scrollHandler = throttle(() => {
  console.log('Scroll event handled');
}, 100);

// Will execute at most once every 100ms
window.addEventListener('scroll', scrollHandler);
```

#### `memoize` - Function Memoization

Cache function results for improved performance.

```typescript
import { memoize } from '@n00plicate/shared-utils';

const expensiveFunction = memoize((n: number) => {
  console.log('Computing for', n);
  return n * n;
});

expensiveFunction(5); // Logs "Computing for 5", returns 25
expensiveFunction(5); // Returns 25 (cached, no log)
```

### Validation Utilities

#### `isEmail` - Email Validation

Validate email addresses.

```typescript
import { isEmail } from '@n00plicate/shared-utils';

isEmail('user@example.com'); // true
isEmail('invalid-email'); // false
isEmail('user@domain'); // false
```

#### `isURL` - URL Validation

Validate URLs.

```typescript
import { isURL } from '@n00plicate/shared-utils';

isURL('https://example.com'); // true
isURL('http://localhost:3000'); // true
isURL('not-a-url'); // false
```

#### `isUUID` - UUID Validation

Validate UUID strings.

```typescript
import { isUUID } from '@n00plicate/shared-utils';

isUUID('123e4567-e89b-12d3-a456-426614174000'); // true
isUUID('invalid-uuid'); // false
```

### ID Generation

#### `createId` - Unique ID Generation

Generate unique identifiers.

```typescript
import { createId } from '@n00plicate/shared-utils';

createId(); // 'cm0x1y2z3'
createId(10); // '1a2b3c4d5e' (10 characters)
createId(8, 'numeric'); // '12345678' (numeric only)
```

#### `createSlug` - Slug Generation

Generate URL-safe slugs with optional uniqueness.

```typescript
import { createSlug } from '@n00plicate/shared-utils';

createSlug('My Article Title'); // 'my-article-title'
createSlug('My Article Title', true); // 'my-article-title-x1y2z3'
```

## 🎯 Type Definitions

### Common Types

```typescript
// Utility types exported by the package
export type Primitive = string | number | boolean | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type ValueOf<T> = T[keyof T];

export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

### Platform Detection

```typescript
import {
  Platform,
  detectPlatform,
  isBrowser,
  isServer,
} from '@n00plicate/shared-utils';

// Platform detection
const platform: Platform = detectPlatform();
// Returns: 'web' | 'mobile' | 'desktop' | 'server'

// Environment checks
if (isBrowser()) {
  // Browser-specific code
}

if (isServer()) {
  // Server-specific code
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Test Structure

```typescript
// Example test file
import { describe, it, expect } from 'vitest';
import { cn, formatDate, debounce } from '../src';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should join class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'active', false && 'inactive')).toBe(
        'base active'
      );
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2023-12-25');
    });
  });
});
```

## 🔧 Development

### Building

```bash
# Build the package
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Adding New Utilities

1. **Create Utility File**:

```typescript
// src/utilities/newUtility.ts
export function newUtility<T>(input: T): T {
  // Implementation
  return input;
}
```

1. **Add Tests**:

```typescript
// src/utilities/newUtility.test.ts
import { describe, it, expect } from 'vitest';
import { newUtility } from './newUtility';

describe('newUtility', () => {
  it('should work correctly', () => {
    expect(newUtility('test')).toBe('test');
  });
});
```

1. **Export Utility**:

```typescript
// src/index.ts
export { newUtility } from './utilities/newUtility';
```

1. **Update Documentation**: Add the new utility to this README

### Code Guidelines

- **Pure Functions**: Utilities should be pure functions when possible
- **Type Safety**: Use strict TypeScript typing
- **Performance**: Consider performance implications
- **Testing**: Add comprehensive tests
- **Documentation**: Include JSDoc comments

````typescript
/**
 * Combines class names conditionally
 * @param classes - Class names to combine
 * @returns Combined class name string
 * @example
 * ```typescript
 * cn('btn', isActive && 'active') // 'btn active'
 * ```
 */
export function cn(...classes: unknown[]): string {
  // Implementation
}
````

## 📊 Bundle Size

- **Total Size**: ~5KB (minified + gzipped)
- **Tree-Shakable**: Import only what you use
- **Zero Dependencies**: No external runtime dependencies

## 🤝 Contributing

### Guidelines

1. **Add Tests**: All new utilities must have comprehensive tests
2. **Type Safety**: Use strict TypeScript typing
3. **Documentation**: Include JSDoc comments and README updates
4. **Performance**: Consider bundle size and runtime performance
5. **Compatibility**: Ensure cross-platform compatibility

### Pull Request Process

1. Add utility with proper TypeScript types
2. Include comprehensive unit tests
3. Update documentation
4. Ensure all tests pass
5. Verify bundle size impact

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Tree Shaking Guide](https://webpack.js.org/guides/tree-shaking/)

## 🐛 Troubleshooting

### Common Issues

#### Import Errors

```bash
# Check if package is built
pnpm build

# Verify exports in package.json
cat package.json | grep -A 10 "exports"
```

#### Type Errors

```bash
# Regenerate TypeScript declarations
pnpm build

# Check TypeScript configuration
pnpm typecheck
```

#### Test Failures

```bash
# Run tests with verbose output
pnpm test --reporter=verbose

# Check test coverage
pnpm test --coverage
```

## 📚 Advanced Documentation

For comprehensive guides on advanced workflows and enterprise features:

- **[Advanced Development Workflows](../../docs/development/advanced-workflows.md)** - Development tooling and optimization
- **[Security Compliance Framework](../../docs/security/security-compliance-framework.md)** - Security scanning and validation
- **[Advanced Contributor Guide](../../docs/onboarding/advanced-contributor-guide.md)** - Comprehensive setup automation

## 📄 License

MIT License - see the [LICENSE](../../LICENSE) file for details.
