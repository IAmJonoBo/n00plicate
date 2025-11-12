# Complete Implementation Guide: Penpot to Production

This guide provides step-by-step instructions to implement the design token pipeline from Penpot
design files to production applications across web, mobile, and desktop platforms. Refer to
[docs/IMPLEMENTATION_PLAN_2.0.md](./IMPLEMENTATION_PLAN_2.0.md) for the high-level roadmap and
phase-by-phase delivery status.

> **Status**: Sections 1–2 cover the living 2.0 setup (Node/pnpm baseline, Penpot export wiring).
> Sections 3–6 describe the legacy Style Dictionary pipeline and component workflows that remain
> in place until the token orchestrator + UI kernel land (Phases 2–4). Keep following this document
> for day-to-day work, but favour the new architecture as the sprints deliver it.

## 📋 Table of Contents

1. [Prerequisites & Workspace Bootstrap](#1-prerequisites--workspace-bootstrap)
2. [Penpot → Design Token Pipeline](#2-penpot--design-token-pipeline)
3. [Style Dictionary Multi-Platform Transform](#3-style-dictionary-multi-platform-transform)
4. [Web Component Library (Qwik City)](#4-web-component-library-qwik-city)
5. [Storybook Workshop & Testing](#5-storybook-workshop--testing)
6. [Mobile & Desktop Shells](#6-mobile--desktop-shells)
7. [Monorepo Plumbing & Automation](#7-monorepo-plumbing--automation)
8. [Local Development & CI Workflow](#8-local-development--ci-workflow)
9. [Next Steps & Advanced Features](#9-next-steps--advanced-features)

## 1. Prerequisites & Workspace Bootstrap

### Required Tools

| Tool        | Version                        | Installation Notes                                            |
| ----------- | ------------------------------ | ------------------------------------------------------------- |
| Node.js     | ≥ 22 LTS (22.20.0 recommended) | `corepack enable && corepack prepare pnpm@10.18.2 --activate` |
| pnpm        | ≥ 10.18.2                      | Included with Node corepack                                   |
| Rust        | Latest stable                  | Required for Tauri desktop apps                               |
| Java        | 17+                            | For Compose Multiplatform development                         |
| Xcode       | Latest                         | iOS React Native development (macOS only)                     |
| Android SDK | Latest                         | Android development                                           |
| Nx CLI      | Latest                         | `# Nx removed: use pnpm workspace tools (e.g. pnpm -w -r) or npx` |

> Optional: Configure OpenAI (via environment variables) or GitHub Copilot CLI if you want cloud-backed
> AI assistance in addition to the local Ollama-powered `n00plicate assist` experience.

### Bootstrap Existing Workspace

```bash
# The workspace is already created with Nx
cd /Volumes/MagicBag/GitHub/n00plicate

# Install dependencies
pnpm install

# Build design tokens to ensure pipeline works
pnpm run build:design-tokens
```

## 2. Penpot → Design Token Pipeline

### 2.1 Setup Penpot Design Tokens

1. **In Penpot Design File**:
   - Open the **Tokens** panel in the sidebar
   - Create Global tokens (colors, typography, spacing)
   - Create Alias tokens (semantic mappings)
   - Export follows W3C Design Token Community Group format

2. **Get Export Credentials**:

   ```bash
   # Create .env file in workspace root
   cat > .env << EOF
   PENPOT_FILE_ID=your-file-uuid-from-url
   PENPOT_ACCESS_TOKEN=your-api-token
   PENPOT_TEAM_ID=your-team-id
   EOF
   ```

### 2.2 Automated Export Setup

The dev-container is already configured with `penpot-export` service:

```bash
# Export tokens from Penpot
pnpm --filter @n00plicate/design-tokens run tokens:export

# Export and build pipeline
pnpm --filter @n00plicate/design-tokens run tokens:sync

# Watch for changes and auto-rebuild
pnpm --filter @n00plicate/design-tokens run watch
```

## 3. Style Dictionary Multi-Platform Transform

### Current Configuration

The `style-dictionary.config.js` already supports multiple platforms:

```javascript
// packages/design-tokens/style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      /* CSS variables */
    },
    ts: {
      /* TypeScript types */
    },
    json: {
      /* Raw JSON */
    },
    compose: {
      /* Kotlin for Compose */
    },
    rn: {
      /* React Native JS */
    },
  },
};
```

### Building Tokens

```bash
# Build all platform outputs
pnpm run build:design-tokens

# Build only tokens (skip TypeScript compilation)
pnpm --filter design-tokens run build:tokens

# Watch mode for development
pnpm --filter design-tokens watch
```

## 4. Web Component Library (Qwik City)

### 4.1 Create Qwik Application

```bash
# Generate new Qwik City app
pnpm create qwik@latest apps/web --no-git --qwikcity

# Add to workspace
cd apps/web
echo '{
  "name": "web",
  "targets": {
    "serve": {
  "executor": "vite:dev-server (nx legacy: @nx/vite:dev-server)",
      "options": { "port": 5173 }
    },
    "build": {
  "executor": "vite:build (nx legacy: @nx/vite:build)"
    }
  }
}' > project.json
```

### 4.2 Wire Design Tokens

```bash
# Install token dependency
pnpm add -w @n00plicate/design-tokens

# Install styling tools
pnpm add -w vanilla-extract @vanilla-extract/vite-plugin
```

Create theme integration:

```typescript
// apps/web/src/theme.css.ts
import { tokens } from '@n00plicate/design-tokens';
import { style } from '@vanilla-extract/css';

export const theme = {
  colors: {
    primary: tokens.color.primary.value,
    secondary: tokens.color.secondary.value,
  },
  spacing: {
    small: tokens.spacing.sm.value,
    medium: tokens.spacing.md.value,
    large: tokens.spacing.lg.value,
  },
};

export const buttonStyles = style({
  backgroundColor: theme.colors.primary,
  padding: theme.spacing.medium,
  borderRadius: tokens.borderRadius.medium.value,
});
```

### 4.3 Configure Vite

```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [qwikVite(), vanillaExtractPlugin()],
  // Import design token CSS
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@n00plicate/design-tokens/css";`,
      },
    },
  },
});
```

## 5. Storybook Workshop & Testing

### 5.1 Setup Storybook

```bash
# Initialize Storybook with Qwik support
cd apps/web
pnpm dlx storybook@next init --builder vite --type qwik

# Add design token addon
pnpm add -D @storybook/addon-designs @storybook/addon-controls
```

### 5.2 Configure Storybook

```typescript
// apps/web/.storybook/preview.ts
import { tokens } from '@n00plicate/design-tokens';
import '@n00plicate/design-tokens/css';

export const parameters = {
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: tokens.color.background.primary.value },
      { name: 'dark', value: tokens.color.background.inverse.value },
    ],
  },
  // Design token documentation
  designToken: {
    theme: tokens,
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
```

### 5.3 Add Testing

```bash
# Add test dependencies
pnpm add -D @storybook/test-runner playwright loki

# Configure test scripts
echo '{
  "scripts": {
    "test-storybook": "test-storybook",
    "visual-test": "loki test",
    "visual-test:update": "loki update"
  }
}' >> apps/web/package.json
```

## 6. Mobile & Desktop Shells

### 6.1 React Native Application

```bash
# Create React Native app
pnpm dlx react-native@latest init n00plicateMobile --template react-native-template-typescript

# Move to workspace
mv n00plicateMobile apps/mobile-rn

# Add workspace integration
cd apps/mobile-rn
echo '{
  "name": "mobile-rn",
  "scripts": {
    "start": "react-native start",
    "run-ios": "react-native run-ios",
    "run-android": "react-native run-android"
  }
}' > package.json

# Install design tokens
pnpm add @n00plicate/design-tokens
```

Create React Native theme:

```typescript
// apps/mobile-rn/src/theme.ts
import { tokens } from '@n00plicate/design-tokens';
import { StyleSheet } from 'react-native';

const remToPx = (rem: string) => parseInt(rem) * 16;

export const theme = StyleSheet.create({
  container: {
    backgroundColor: tokens.color.background.primary.value,
    padding: remToPx(tokens.spacing.md.value),
  },
  text: {
    color: tokens.color.text.primary.value,
    fontSize: remToPx(tokens.fontSize.medium.value),
  },
  button: {
    backgroundColor: tokens.color.primary.value,
    borderRadius: remToPx(tokens.borderRadius.medium.value),
    padding: remToPx(tokens.spacing.sm.value),
  },
});
```

### 6.2 Compose Multiplatform

```bash
# Create Compose Multiplatform project
mkdir -p apps/mobile-compose

# Add Kotlin Gradle setup (simplified for brevity)
cd apps/mobile-compose

# Create project structure
mkdir -p src/commonMain/kotlin/com/n00plicate/theme
mkdir -p src/androidMain/kotlin/com/n00plicate
mkdir -p src/iosMain/kotlin/com/n00plicate
```

Generate Compose theme from tokens:

```kotlin
// apps/mobile-compose/src/commonMain/kotlin/com/n00plicate/theme/DesignTokens.kt
// Generated from Style Dictionary
object DesignTokens {
    val ColorPrimary = Color(0xFF007BFF)
    val ColorSecondary = Color(0xFF6C757D)
    val SpacingSmall = 8.dp
    val SpacingMedium = 16.dp
    val SpacingLarge = 24.dp
    val BorderRadiusMedium = 8.dp
}

@Composable
fun n00plicateTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = DesignTokens.ColorPrimary,
            secondary = DesignTokens.ColorSecondary,
        ),
        content = content
    )
}
```

### 6.3 Tauri Desktop Application

```bash
# Create Tauri app
mkdir -p apps/desktop
cd apps/desktop

# Initialize Tauri
pnpm dlx create-tauri-app@latest . --before-dev-command "pnpm --filter web serve" --dev-path "http://localhost:5173"

# Add workspace integration
echo '{
  "name": "desktop",
  "targets": {
    "tauri": {
  "executor": "# Legacy: @nx/run-commands - use pnpm scripts or a workspace-runner (e.g., pnpm -w -r run <script>)",
      "options": {
        "command": "tauri dev"
      }
    },
    "build": {
  "executor": "# Legacy: @nx/run-commands - use pnpm scripts or a workspace-runner (e.g., pnpm -w -r run <script>)",
      "options": {
        "command": "tauri build"
      }
    }
  }
}' > project.json
```

Configure Tauri to use Qwik app:

```json
// apps/desktop/src-tauri/tauri.conf.json
{
  "build": {
  "beforeDevCommand": "pnpm --filter web serve",
  "beforeBuildCommand": "pnpm --filter web build",
    "devPath": "http://localhost:5173",
    "distDir": "../web/dist"
  }
}
```

## 7. Monorepo Plumbing & Automation

### 7.1 Add Global Targets

Create workspace-level automation:

```bash
# Add global targets for token management
pnpm run tokens:build-all \
  --command="pnpm tokens:build && pnpm build" \
  --project=workspace-format

pnpm run tokens:sync-all \
  --command="pnpm tokens:sync && pnpm build" \
  --project=workspace-format

pnpm run dev:full-stack \
  --command="concurrently 'pnpm --filter design-tokens watch' 'pnpm --filter web serve' 'pnpm --filter web run storybook'" \
  --project=workspace-format
```

### 7.2 Update Nx Configuration

Add token dependencies to nx.json:

```json
// nx.json (add to targetDefaults)
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build", "design-tokens:build"]
    }
  }
}
```

## 8. Local Development & CI Workflow

### 8.1 Development Commands

```bash
# Initial setup
pnpm install && pnpm run tokens:build-all

# Full development environment
pnpm run dev:full-stack

# Individual platforms
pnpm --filter web serve                    # Qwik City dev
pnpm --filter web run storybook               # Storybook workshop
pnpm --filter mobile-rn run start             # React Native Metro
pnpm --filter ./apps/desktop run tauri               # Tauri desktop dev

# Testing
pnpm -w -r test && pnpm -w -r lint           # Unit & lint tests
pnpm --filter ./apps/web run test-storybook          # Storybook interaction tests
pnpm --filter ./apps/web run visual-test             # Visual regression tests
```

### 8.2 CI/CD Pipeline

Update GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
  - uses: pnpm/action-setup@v4

      # Setup environment
      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: 'pnpm'

      # Install and build
      - run: pnpm install
  - run: pnpm run build:core

      # Test affected projects
  - run: pnpm -w -r lint && pnpm -w -r test && pnpm -w -r build

      # Visual regression tests
  - run: pnpm --filter ./apps/web run build-storybook
  - run: pnpm --filter ./apps/web run visual-test
        env:
          LOKI_REFERENCE_URL: ${{ secrets.LOKI_REFERENCE_URL }}
```

## 9. Next Steps & Advanced Features

### 9.1 Automated Token Sync

```bash
# Add cron job for nightly token sync
# .github/workflows/token-sync.yml
```

### 9.2 AI-Powered Code Generation

```bash
# Add Ollama service integration for component scaffolding
# tools/ollama-scaffold/
```

### 9.3 Semantic Versioning & Publishing

```bash
# Enable nx release for package publishing
pnpm dlx @changesets/cli init
```

### 9.4 Advanced Visual Testing

```bash
# Add Chromatic for advanced visual testing
pnpm add -D chromatic
```

## 🎯 Verification Checklist

After implementing this guide, verify:

- [ ] Penpot tokens export to `packages/design-tokens/tokens/base.json`
- [ ] Style Dictionary generates outputs for all platforms
- [ ] Qwik City app uses tokens via CSS variables and TypeScript
- [ ] Storybook displays components with token documentation
- [ ] React Native app applies tokens through StyleSheet
- [ ] Tauri desktop app bundles and runs the web app
- [ ] All tests pass (`pnpm -w -r test` and `pnpm -w -r lint`)
- [ ] Visual regression tests capture changes
- [ ] Watch mode enables real-time design-to-code updates

## 📚 Resources

- [Penpot Design Tokens Guide](https://penpot.app/design-tokens)
- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)
- [W3C Design Token Format](https://tr.designtokens.org/format/)
- [Nx Workspace Configuration](https://nx.dev/concepts/mental-model)
- [Qwik City Framework](https://qwik.builder.io/qwikcity/overview/)
- [Tauri Desktop Apps](https://tauri.app/v1/guides/)

This implementation provides a complete, production-ready design token pipeline that maintains
consistency across all platforms while enabling real-time design-to-code workflows.
