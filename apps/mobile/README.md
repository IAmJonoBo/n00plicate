# n00plicate Mobile App (React Native)

React Native mobile application demonstrating the n00plicate design token system with collision-prevention architecture.

## Features

- **Design Token Integration**: Uses `@n00plicate/design-tokens` with collision-safe `ds-` prefixed tokens
- **New Architecture**: React Native 0.76+ with Fabric renderer and TurboModules
- **Theme Provider**: Centralized theme management with system theme detection
- **Component Demos**: Token usage examples with buttons and UI components
- **Metro Workspace Support**: Proper workspace package resolution

## Getting Started

### Prerequisites

- Node.js 20 LTS
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

```bash
# Install dependencies
pnpm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro bundler
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android
```

## Architecture

### Collision Prevention

The mobile app implements collision-prevention strategies:

1. **Token Namespace**: All tokens use `ds-` prefix (`color.primary_500`, `spacing.md`)
2. **Import Paths**: Uses collision-safe import paths (`@n00plicate/design-tokens/react-native`)
3. **Metro Aliases**: Resolves workspace packages correctly
4. **Package Scoping**: Uses `@n00plicate/` scoped package names

### Theme System

```typescript
import { useTokens } from './theme/ThemeProvider';

const { getToken } = useTokens();
const primaryColor = getToken('color.primary_500', '#3b82f6');
```

### Component Structure

```markdown
src/
├── App.tsx # Main app component
├── main.tsx # Entry point
├── theme/
│ └── ThemeProvider.tsx # Theme context and token utilities
└── components/
├── TokenDemo.tsx # Design token demonstration
└── ButtonDemo.tsx # Button component examples
```

## Design Token Usage

### Colors

```typescript
backgroundColor: getToken('color.primary_500', '#3b82f6');
```

### Spacing

```typescript
padding: (getToken('spacing.md', 1) as number) * 16; // Convert rem to pixels
```

### Typography

```typescript
fontSize: (getToken('typography.fontSize_lg', 1.125) as number) * 16;
fontWeight: getToken('typography.fontWeight_medium', '500');
```

## Commands

| Command        | Description             |
| -------------- | ----------------------- |
| `pnpm start`   | Start Metro bundler     |
| `pnpm ios`     | Run on iOS simulator    |
| `pnpm android` | Run on Android emulator |
| `pnpm test`    | Run Jest tests          |
| `pnpm lint`    | Run ESLint              |

## Integration with Design System

This mobile app is part of the larger n00plicate design system:

- Shares tokens with web (`apps/web`) and desktop (`apps/desktop`)
- Uses the same collision-prevention architecture
- Demonstrates cross-platform token consistency
- Integrates with Storybook for component documentation
