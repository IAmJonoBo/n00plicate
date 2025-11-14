# Quick Reference: New Tools & Commands

## 🚀 New Development Commands

### Start All Services at Once

```bash
pnpm dev:all
# Starts: tokens watcher, Storybook, and web app concurrently
```

### Visual Testing

```bash
pnpm test:visual
# Run Chromatic visual regression tests
```

### E2E Testing

```bash
pnpm test:e2e
# Run Cypress end-to-end tests
```

## 🛠️ New Tools Available

### Build plugins & integrations

- **Cypress plugin** - E2E testing integration (via packages/tooling)
- **esbuild** - Fast JavaScript bundling
- **webpack** - Webpack integration

### Storybook Addons (in design-system)

- **addon-a11y** - Accessibility testing in Storybook
- **addon-measure** - Measure element dimensions
- **addon-outline** - Show layout grid overlay

### Development Utilities

- **concurrently** - Run multiple commands at once
- **npm-run-all** - Sequential or parallel task execution
- **wait-on** - Wait for services to be ready
- **cross-env** - Set environment variables cross-platform
- **rimraf** - Delete files cross-platform

### Testing Tools

- **Cypress** - E2E testing framework
- **Chromatic** - Visual regression testing

## 📦 Version Summary

| Tool       | Version |
| ---------- | ------- |
| Node.js    | 24.11.0 |
| pnpm       | 10.21.0 |
| TypeScript | 5.9.3   |
| Nx         | removed |
| Storybook  | 9.1.9   |

## 🎯 Quick Setup

```bash
# 1. Install correct Node version
nvm use

# 2. Install dependencies
pnpm install

# 3. Verify everything works
pnpm test && pnpm build

# 4. Start development
pnpm dev:all
```

## 📚 Learn More

- Full upgrade details: [UPGRADE_2025.md](UPGRADE_2025.md)
- Change log: [CHANGELOG.md](CHANGELOG.md)
- Upgrade playbook: [docs/devops/TOOLCHAIN_UPGRADE_PLAYBOOK.md](docs/devops/TOOLCHAIN_UPGRADE_PLAYBOOK.md)
