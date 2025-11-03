# Penpot to n00plicate Design Token Workflow

Complete user-friendly guide for exporting, processing, and re-exporting design tokens from Penpot to the n00plicate monorepo
applications.

## 🎯 Overview

This workflow enables designers and developers to:

1. **Design** tokens in Penpot with full visual context
2. **Export** tokens in W3C DTCG format automatically
3. **Transform** tokens into platform-specific formats (CSS, TypeScript, React Native, Compose)
4. **Integrate** tokens across web, mobile, and desktop applications
5. **Automate** the entire pipeline for continuous design-to-code delivery

## 🏗️ Pipeline Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Penpot      │    │  Token Export   │    │ Style Dictionary│    │   Applications  │
│   Design File   │───▶│     (CLI)       │───▶│   Transform     │───▶│   (Web/Mobile)  │
│  (Token Panel)  │    │                 │    │   Pipeline      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
   🎨 Design Token         📄 base.json            🔄 Multi-Platform         💻 Live Apps
   Definitions           (W3C DTCG Format)         Output Generation       (Type-Safe APIs)

   • Colors                • Semantic tokens        • CSS Variables          • Web (Qwik)
   • Spacing               • Component tokens       • TypeScript types       • Mobile (RN)
   • Typography            • Alias references       • React Native theme     • Desktop (Tauri)
   • Shadows               • Descriptions           • Compose objects        • Storybook
```

## 🚀 Quick Start

### 1. Setup & Configuration

```bash
# Install the CLI globally
npm install -g n00plicate-token-cli
# or
pnpm add -g n00plicate-token-cli

# Navigate to your project root
cd /path/to/your-project

# Initialize configuration
n00plicate-tokens init
```

The CLI will prompt you for:

- **Penpot File ID**: Found in your Penpot file URL
- **Access Token**: Generated in Penpot Profile → Access Tokens
- **Team ID**: Found in workspace settings (optional)
- **Base URL**: Usually `https://design.penpot.app`

### 2. Verify Setup

```bash
# Check pipeline status
n00plicate-tokens status
```

This will verify:

- ✅ Penpot API connectivity
- ✅ File structure integrity
- ✅ Generated output status
- ✅ Recent activity timeline

### 3. Export & Build Tokens

```bash
# One-time sync: export from Penpot + build all platforms
n00plicate-tokens sync

# Or run steps individually:
n00plicate-tokens export  # Export from Penpot → base.json
n00plicate-tokens build   # Transform → platform outputs
```

### 4. Development Workflow

```bash
# Watch mode: auto-rebuild when tokens change
n00plicate-tokens watch

# Keep this running during development
# Changes in Penpot → export → auto-rebuild
```

## 📚 Detailed Workflow Guide

### Phase 1: Design Token Creation in Penpot

#### Setting Up Token Categories

In your Penpot file, organize tokens using this hierarchy:

```text
🎨 Token Panel Structure:
├── 🎯 Primitive Tokens
│   ├── color/
│   │   ├── primary/ (50, 100, 200...900)
│   │   ├── neutral/ (50, 100, 200...900)
│   │   └── semantic/ (success, warning, error)
│   ├── spacing/ (xs, sm, md, lg, xl, 2xl)
│   ├── typography/
│   │   ├── fontSize/ (xs, sm, base, lg, xl)
│   │   ├── fontWeight/ (normal, medium, bold)
│   │   └── fontFamily/ (sans, serif, mono)
│   └── effects/
│       ├── borderRadius/ (sm, md, lg, full)
│       └── shadow/ (sm, md, lg, xl)
│
├── 🔗 Semantic Tokens (aliases)
│   ├── text/ (primary, secondary, muted)
│   ├── surface/ (primary, secondary, accent)
│   └── border/ (primary, secondary, focus)
│
└── 🧩 Component Tokens
    ├── button/ (padding, radius, shadow)
    ├── card/ (padding, radius, shadow)
    └── input/ (padding, border, focus)
```

#### Token Naming Best Practices

- **Primitive**: `color.primary.500`, `spacing.md`, `fontSize.base`
- **Semantic**: `color.text.primary`, `color.surface.accent`
- **Component**: `button.padding.md`, `card.shadow.default`

#### Using Aliases (References)

Create semantic meaning with aliases:

```text
color.text.primary → {color.neutral.900}
color.surface.primary → {color.neutral.50}
button.color.primary → {color.primary.500}
```

### Phase 2: Automated Export

#### Manual Export (When Needed)

```bash
# Export latest tokens from Penpot
n00plicate-tokens export

# With custom output location
n00plicate-tokens export --output packages/design-tokens/tokens/custom.json

# Force overwrite existing files
n00plicate-tokens export --force
```

#### Automated CI/CD Export

The pipeline includes GitHub Actions for automated export:

```yaml
# Runs every 6 hours or manually
# .github/workflows/token-sync.yml
name: Token Sync Pipeline

on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  sync-tokens:
    runs-on: ubuntu-latest
    steps:
      - name: Export & Build Tokens
        run: |
          n00plicate-tokens sync

      - name: Create PR if changes
        # Auto-creates PR with token updates
```

### Phase 3: Style Dictionary Transformation

#### Platform-Specific Outputs

The build process generates optimized outputs for each platform:

```text
packages/design-tokens/libs/tokens/
├── css/
│   ├── tokens.css           # CSS custom properties
│   └── theme.css           # CSS theme utilities
├── ts/
│   ├── tokens.ts           # TypeScript definitions
│   └── types.d.ts          # Type declarations
├── react-native/
│   ├── theme.ts            # RN theme object
│   └── tokens.json         # Platform values
├── compose/
│   ├── Theme.kt            # Compose theme object
│   └── Tokens.kt           # Kotlin definitions
├── dart/
│   └── tokens.dart         # Flutter theme class
└── json/
    ├── tokens.json         # Nested structure
    └── tokens-flat.json    # Flat key-value pairs
```

#### Custom Platform Configuration

Modify `packages/design-tokens/style-dictionary.config.js`:

```javascript
// Add new platform
platforms: {
  'ios-swift': {
    transformGroup: 'ios',
    buildPath: 'libs/tokens/ios/',
    files: [{
      destination: 'Tokens.swift',
      format: 'ios-swift/class.swift',
      options: { className: 'n00plicateTokens' }
    }]
  }
}
```

### Phase 4: Application Integration

#### Web Applications (Qwik, React)

```typescript
// Import CSS variables
import '@n00plicate/design-tokens/css';

// Or import TypeScript tokens
import { tokens } from '@n00plicate/design-tokens';

// Usage in components
const Button = () => (
  <button
    style={{
      backgroundColor: tokens.color.primary[500],
      padding: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
    }}
  >
    Click me
  </button>
);
```

#### React Native

```tsx
import { theme } from '@n00plicate/design-tokens/react-native';

const Button = () => (
  <TouchableOpacity
    style={{
      backgroundColor: theme.color.primary[500],
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    }}
  >
    <Text style={{ color: theme.color.text.primary }}>Click me</Text>
  </TouchableOpacity>
);
```

#### Android Compose

```kotlin
import com.n00plicate.tokens.n00plicateTheme

@Composable
fun n00plicateButton() {
    Button(
        colors = ButtonDefaults.buttonColors(
            backgroundColor = n00plicateTheme.ColorPrimary500
        ),
        modifier = Modifier.padding(n00plicateTheme.SpacingMd)
    ) {
        Text("Click me")
    }
}
```

## 🔧 Advanced Features

### Token Validation

```bash
# Validate tokens against W3C DTCG schema
n00plicate-tokens validate

# Validate specific files
n00plicate-tokens validate --tokens packages/design-tokens/tokens/base.json

# Custom schema
n00plicate-tokens validate --schema schemas/custom-dtcg.json
```

### Token Diffing

```bash
# Compare tokens between branches
n00plicate-tokens diff --base main --head feature/new-colors

# Generate diff report
n00plicate-tokens diff --output token-changes.md

# Compare specific commits
n00plicate-tokens diff --base abc123 --head def456
```

### Platform-Specific Builds

```bash
# Build only specific platforms
n00plicate-tokens build --platform css
n00plicate-tokens build --platform react-native

# Watch specific platform
n00plicate-tokens build --platform ts --watch
```

## 🚦 Development Workflow Examples

### Scenario 1: Designer Updates Colors

1. **Designer** opens Penpot, modifies `color.primary.500`
2. **System** auto-exports every 6 hours OR manual trigger:

   ```bash
   n00plicate-tokens export
   ```

3. **Build** updated platform outputs:

   ```bash
   n00plicate-tokens build
   ```

4. **Developers** see changes in their apps automatically
5. **CI/CD** creates PR with visual regression tests

### Scenario 2: Developer Needs New Token

1. **Request** new token from designer via Penpot comments
2. **Designer** adds token in Penpot token panel
3. **Export** new tokens:

   ```bash
   n00plicate-tokens sync
   ```

4. **Integration** in code:

   ```typescript
   // Now available in all platforms
   tokens.newCategory.newToken;
   ```

### Scenario 3: Breaking Change Prevention

1. **Validation** before every build:

   ```bash
   n00plicate-tokens validate
   ```

2. **Diff checking** in PR workflow:

   ```bash
   n00plicate-tokens diff --base main --output pr-changes.md
   ```

3. **Visual regression** tests run automatically
4. **Manual review** for breaking changes

## 🔄 Automation & CI/CD

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
# Prevent manual token edits
if git diff --cached --name-only | grep -q "tokens/base.json"; then
  echo "❌ Manual token edits not allowed. Use Penpot!"
  exit 1
fi

# Validate any token changes
if git diff --cached --name-only | grep -q "tokens/"; then
  n00plicate-tokens validate
fi
```

### GitHub Actions Integration

```yaml
# .github/workflows/token-pipeline.yml
name: Design Token Pipeline

on:
  push:
    paths: ['packages/design-tokens/**']

jobs:
  validate-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Validate tokens
        run: n00plicate-tokens validate

      - name: Build all platforms
        run: n00plicate-tokens build

      - name: Run visual regression tests
        run: pnpm test:visual
```

### Automated Penpot Image Upgrades

To keep the local Penpot stack aligned with upstream releases, the repository includes a scheduled automation:

- **Workflow:** `.github/workflows/penpot-upgrade.yml` (runs every Monday at 07:00 UTC or on demand)
- **Script:** `scripts/update-penpot-images.mjs` fetches the latest shared version available for the
  `penpotapp/backend`, `penpotapp/frontend`, and `penpotapp/exporter` images.
- **Behaviour:** When a newer coordinated version exists, the workflow updates
  `infra/containers/devcontainer/docker-compose.yml` and opens a PR with the change. If the images are already
  current, the job exits without modifications.

You can trigger the same update locally:

```bash
node scripts/update-penpot-images.mjs
```

Pass `--output <file>` to write CI-friendly outputs (`current_version`, `latest_version`, `updated`) when scripting:

```bash
node scripts/update-penpot-images.mjs --output /tmp/penpot.out
cat /tmp/penpot.out
```

> ℹ️ The updater only promotes versions that exist across all three Penpot images to keep the stack consistent.

## 🎯 Best Practices

### 1. Token Organization

- ✅ Use semantic layers (primitive → semantic → component)
- ✅ Consistent naming convention
- ✅ Document token purposes
- ❌ Avoid deeply nested hierarchies

### 2. Workflow Management

- ✅ Single source of truth (Penpot)
- ✅ Regular automated syncs
- ✅ PR review for all changes
- ❌ Manual JSON edits

### 3. Performance Optimization

- ✅ Import only needed tokens
- ✅ Use tree-shaking builds
- ✅ Cache Style Dictionary outputs
- ❌ Import entire token object in components

### 4. Team Collaboration

- ✅ Clear change communication
- ✅ Visual regression testing
- ✅ Documentation updates
- ❌ Breaking changes without notice

## 🐛 Troubleshooting

### Common Issues

#### Export Fails

```bash
# Check credentials
n00plicate-tokens status

# Test specific file ID
n00plicate-tokens export --file-id your-file-id --force
```

#### Build Errors

```bash
# Clean and rebuild
rm -rf packages/design-tokens/libs
n00plicate-tokens build

# Check Style Dictionary config
n00plicate-tokens validate --tokens packages/design-tokens/style-dictionary.config.js
```

#### Watch Mode Not Working

```bash
# Use polling mode for network drives
CHOKIDAR_USEPOLLING=true n00plicate-tokens watch

# Check file permissions
ls -la packages/design-tokens/tokens/
```

### Getting Help

1. **Check status**: `n00plicate-tokens status`
2. **View logs**: Check terminal output for detailed errors
3. **Validate tokens**: `n00plicate-tokens validate`
4. **Review docs**: `/docs/design/penpot-token-schema.md`
5. **GitHub Issues**: Report bugs with reproduction steps

---

This workflow ensures a seamless, automated design-to-code pipeline that scales with your team and maintains consistency
across all platforms.
