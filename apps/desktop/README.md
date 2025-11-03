# n00plicate Desktop App (Tauri)

Desktop application for the n00plicate design token system built with Tauri 2.0, demonstrating
collision-prevention architecture with web technologies and native performance.

## Features

- **Design Token Integration**: Uses `@n00plicate/design-tokens` with collision-safe `ds-` prefixed CSS variables
- **Tauri 2.0**: Native desktop performance with web technologies
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **Collision Prevention**: Implements the complete collision-prevention architecture
- **Interactive Demo**: Live demonstration of design tokens in action

## Getting Started

### Prerequisites

- Node.js 20 LTS
- Rust and Cargo (latest stable)
- Platform-specific requirements:
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Build essentials and webkit2gtk

### Installation

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build for production
pnpm build
```

## Architecture

### Collision Prevention

The desktop app implements collision-prevention strategies:

1. **Token Namespace**: All CSS variables use `ds-` prefix (`--ds-color-primary-500`, `--ds-spacing-md`)
2. **Import Paths**: Uses collision-safe import paths (`@n00plicate/design-tokens/css`)
3. **Asset Isolation**: Tauri `distDir` configuration prevents path conflicts
4. **Package Scoping**: Uses `@n00plicate/` scoped package names

### Design Token Usage

```css
/* Collision-safe CSS variables with ds- prefix */
color: var(--ds-color-primary-500, #3b82f6);
padding: var(--ds-spacing-md, 1rem);
font-size: var(--ds-typography-fontSize-lg, 1.125rem);
```

### File Structure

```markdown
apps/desktop/
├── src/
│ ├── main.ts # Frontend entry point
│ └── style.css # Design token styles
├── src-tauri/
│ ├── src/
│ │ ├── main.rs # Rust main entry
│ │ └── lib.rs # Tauri app logic
│ ├── Cargo.toml # Rust dependencies
│ └── tauri.conf.json # Tauri configuration
├── index.html # HTML entry point
└── package.json # Node.js dependencies
```

## Design Token Demo

The desktop app showcases:

### Color System

- Primary colors with proper namespace (`--ds-color-primary-*`)
- Secondary colors (`--ds-color-secondary-*`)
- Neutral palette (`--ds-color-neutral-*`)

### Typography

- Font families (`--ds-typography-font-family-*`)
- Font sizes (`--ds-typography-fontSize-*`)
- Font weights (`--ds-typography-fontWeight-*`)

### Spacing System

- Consistent spacing scale (`--ds-spacing-xs` to `--ds-spacing-3xl`)
- Button padding (`--ds-button-padding-*`)

### Interactive Components

- Button variants (primary, secondary, outline)
- Hover and active states
- Dark mode support

## Commands

| Command            | Description                |
| ------------------ | -------------------------- |
| `pnpm dev`         | Start development server   |
| `pnpm build`       | Build for production       |
| `pnpm tauri dev`   | Run Tauri development mode |
| `pnpm tauri build` | Build Tauri application    |

## Integration with Design System

This desktop app is part of the larger n00plicate design system:

- Shares tokens with web (`apps/web`) and mobile (`apps/mobile`)
- Uses the same collision-prevention architecture
- Demonstrates cross-platform token consistency
- Integrates with Storybook for component documentation

## Platform-Specific Features

- **Auto-updater**: Secure automatic updates (configurable)
- **Code Signing**: Digital signature for security
- **Native Menus**: Platform-appropriate menu systems
- **File System Access**: Secure file operations
- **System Theme**: Automatic dark/light mode detection
