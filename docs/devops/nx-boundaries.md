# Monorepo Module Boundaries & DevOps (pnpm workspace)

Guidance for module boundaries, workspace configuration, and release workflows
for the n00plicate design system using a pnpm workspace. Nx has been removed. Legacy commands are commented out below.

## Overview

This guide covers Nx workspace optimization for the n00plicate design system, including module boundaries,
remote caching, and automated release workflows.

## Module Boundaries Configuration

### ESLint Module Boundaries

```json
// .eslintrc.json (use eslint-plugin-boundaries to enforce module boundaries)
{
  "extends": ["eslint:recommended", "plugin:boundaries/recommended"],
  "plugins": ["boundaries"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "boundaries/element-types": [
          "error",
          {
            "default": "disallow",
            "rules": [
              { "from": "packages/design-tokens/*", "allow": ["packages/utility/*"] },
              { "from": "packages/ui-components/*", "allow": ["packages/design-tokens/*", "packages/utility/*"] },
              { "from": "apps/*", "allow": ["packages/ui-components/*", "packages/design-tokens/*"] },
              { "sourceTag": "platform:web", "onlyDependOnLibsWithTags": ["platform:web", "platform:shared"] },
              { "sourceTag": "scope:storybook", "onlyDependOnLibsWithTags": ["type:ui-components", "type:design-tokens"] }
            ]
          }
        ]
    }
  ]
}
```

```bash
# Workspace & cache examples (pnpm workspace)
pnpm -w list --depth 0
pnpm store prune
pnpm -w -r build
# Generate a dependency graph with a dep-graph tool (madge/dependency-cruiser)
npx madge --image graph.svg packages/*/src
```

### Project Tags Configuration

#### Clean cache

              pnpm store prune
// nx.json

##### Remove unused dependencies

###### Use standalone scripts or tools (e.g. depcheck, pnpm -w dedupe) to find and remove unused deps

    "design-tokens": {

###### Fix workspace formatting

              pnpm -w -r run format --if-present
    "ui-components": {

###### Check workspace integrity

              pnpm -w -r run lint --if-present
    "mobile-components": {

###### Validate project configuration

###### Use workspace tools, dev-runner or dependency graph tools (madge/depcruise) to inspect projects

    "storybook": {

###### Check for circular dependencies

###### Use dep graph tools to create a visualization

###### Example: npx madge --image graph.svg packages/*/src

    "docs-site": {

###### Check migration status

###### Legacy Nx migration command; use pnpm upgrade and check changelogs

  },

###### Run migrations

###### pnpm exec nx migrate @nx/workspace@latest  <-- legacy (use pnpm upgrade and verify changes)

    },

###### Check workspace lint details

                pnpm -w -r run lint --if-present --verbose
    },
                pnpm -w -r run lint --if-present --fix
      "cache": true
                pnpm store prune
  }

###### Nx daemon is removed; not applicable

```

# Workspace Visualization

We no longer use Nx; use pnpm workspace tooling and small scripts to inspect and operate on the workspace.

Examples:

```bash
## Show all packages in the workspace (top-level):
pnpm -w list --depth 0

## Run lint across the workspace (recursive):
pnpm -w -r run lint --if-present --silent --fix

## Build all packages in the workspace (ordered by root orchestrator script):
pnpm run build:ordered

## Use a dep-graph tool (eg. madge, depcruise) to visualize module graph:
npx madge --image graph.svg packages/*/src
```

# Remote Caching Setup

# Remote Caching & CI configuration

We don't use Nx Cloud. Use the pnpm store and standard CI cache actions for Node modules and pnpm store. Keep your workflows lean by using the root orchestrator scripts and pnpm workspace filters.

Examples:

```bash
## Enable pnpm store caching in GitHub Actions:
action: pnpm/action-setup@v2

## Generate a workspace-aware CI workflow from templates or use existing CI templates in the repo.
```

# Cache Configuration

```json
// nx.json
  run: # previously used Nx affected; use a pnpm workspace filter or a git-based script to identify affected packages
  run: pnpm -w -r --filter './*' run test --if-present
  "tasksRunnerOptions": {
    "default": {
  run: pnpm -w -r run build --if-present
        "cacheableOperations": ["build", "test", "lint", "e2e", "tokens:build"],
        "accessToken": "YOUR_ACCESS_TOKEN"
  run: pnpm --filter @n00plicate/design-tokens run build:tokens
    }
  },
  run: # previously used Nx release; use changesets or a custom release script
  run: pnpm -w -r run changeset --if-present
    "tokens:build": {
      "cache": true,
  run: pnpm -w -r --filter './*' run publish --if-present
        "{projectRoot}/tokens/**/*",
        "{workspaceRoot}/style-dictionary.config.js"
      ],
      "outputs": ["{projectRoot}/dist"]
    }
  }
}
```

# Local Cache Optimization

```json
// nx.json cache configuration
{
  "cacheDirectory": "node_modules/.cache/nx",
  "defaultCollection": "@nx/react",
  "generators": {
    "@nx/react": {
      "application": {
        "style": "css",
        "linter": "eslint",
        "bundler": "vite"
      }
    }
  }
}
```

# Release Workflow

pnpm -w list --depth 0

# Semantic Release Configuration


pnpm store prune && pnpm -w -r build
// release.config.js
module.exports = {
  branches: ['main', 'next'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
  assets: ['CHANGELOG.md', 'package.json', 'pnpm-lock.yaml'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    '@semantic-release/github'
  ]
};

```

### Release configuration

We use Changesets for workspace release automation (instead of Nx releases). See the `changeset` docs and the GitHub Actions workflows in `.github/workflows/release.yml`.

### GitHub Actions Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  release:
    # Legacy: pnpm exec nx migrate --check
    # Use `npx npm-check-updates --target minor` to review available updates without automatically applying them

    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    # Legacy: pnpm exec nx migrate @nx/workspace@latest  <-- use `pnpm upgrade` and review changelogs
    # Legacy: pnpm exec nx migrate --run-migrations  <-- run migration scripts provided by the package or follow upgrade notes
          fetch-depth: 0
          token: ${{ secrets.GH_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v6
        run: corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile

    - name: Run affected tests
  run: # Previously used Nx affected; use a workspace diff script or run all builds when unsure
  run: pnpm -w -r run build --if-present

      - name: Build design tokens
  run: pnpm --filter @n00plicate/design-tokens run build:tokens

    - name: Version and release
  run: # Previously used Nx release; use changesets or a custom release script
  run: pnpm -w -r run changeset --if-present
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

    - name: Publish to npm
  run: # Use pnpm workspace filter or a changeset-based release action
  run: pnpm -w -r run publish --if-present
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Workspace Generators

          <!-- Nx daemon functionality removed; pnpm does not use a daemon. Legacy command removed. -->
### Custom Token Generator

```typescript
// tools/generators/token-package/index.ts
import { Tree, formatFiles, generateFiles, names } from '@nx/devkit';

export default async function (tree: Tree, schema: any) {
  const templatePath = join(__dirname, 'files');
  const projectName = names(schema.name).fileName;
  const projectRoot = `packages/${projectName}`;

  generateFiles(tree, templatePath, projectRoot, {
    ...schema,
    ...names(schema.name),
    template: '',
  });

  await formatFiles(tree);
}

export const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Token package name',
    },
    platform: {
      type: 'string',
      enum: ['web', 'mobile', 'desktop'],
      description: 'Target platform',
    },
  },
  required: ['name', 'platform'],
};
```

### Component Generator

```typescript
// tools/generators/component/index.ts
import { Tree, formatFiles, generateFiles, names } from '@nx/devkit';

export default async function (tree: Tree, schema: ComponentSchema) {
  const projectRoot = `libs/ui-components`;
  const componentPath = `${projectRoot}/src/lib/${names(schema.name).fileName}`;

  generateFiles(tree, join(__dirname, 'files'), componentPath, {
    ...schema,
    ...names(schema.name),
    template: '',
  });

  // Update barrel export
  const indexPath = `${projectRoot}/src/index.ts`;
  const indexContent = tree.read(indexPath, 'utf-8') || '';
  const exportLine = `export * from './lib/${names(schema.name).fileName}';`;

  if (!indexContent.includes(exportLine)) {
    tree.write(indexPath, `${indexContent}\n${exportLine}`);
  }

  await formatFiles(tree);
}
```

## Performance Monitoring

### Build Performance Tracking

```json
// nx.json
{
  "cli": {
    "analytics": "YOUR_ANALYTICS_ID"
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nx/workspace/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"],
        "useDaemonProcess": true,
        "parallel": 3
      }
    }
  }
}
```

### Performance Dashboard

```bash
# Generate performance report
<!-- Legacy: 'pnpm exec nx report' -->
# Use `pnpm -w list` or dependency-introspection tools for a workspace report

# Analyze cache effectiveness
pnpm store prune && pnpm -w -r build
pnpm -w -r build  # Second run should be cached when outputs exist

# Check daemon status
<!-- Legacy: 'pnpm exec nx daemon --help' -- Nx daemon no longer used -->
# Nx daemon is removed; no daemon control is required when using pnpm workspaces
```

## Workspace Maintenance

### Dependency Updates

```bash
# Update Nx workspace
<!-- Legacy: 'pnpm exec nx migrate latest' -->
# Use `pnpm upgrade` and `npx npm-check-updates` for upgrading package versions
corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile
<!-- Legacy: 'pnpm exec nx migrate --run-migrations' -->
# If a package ships migrations, run them using their migration scripts or follow upgrade notes

# Update dependencies
<!-- Legacy generator: '@nx/workspace:update-packages-in-package-json' -->
# Use `npx npm-check-updates` or a custom script to update package.json versions
```

### Workspace Cleanup

```bash
# Clean cache
<!-- Legacy: 'pnpm exec nx reset' -->
# Reset action is legacy; to reset caches use `pnpm store prune` and remove any temporary caches

# Remove unused dependencies
<!-- Legacy: 'pnpm exec nx g @nx/workspace:remove-unused-dependencies' -->
# Use `depcheck` or a similar tool to find unused dependencies and then remove them manually

# Fix workspace formatting
pnpm -w -r run format --if-present
```

### Health Checks

```bash
# Check workspace integrity
pnpm -w -r run workspace-lint --if-present

# Validate project configuration
<!-- Legacy: 'pnpm exec nx show projects --affected' -->
# Use a git-based script to detect touched files and map them to workspace packages for affected builds

# Check for circular dependencies
npx madge --image graph.svg packages/*/src
```

## Migration Strategies

### Nx Version Migrations

```bash
# Check migration status
<!-- Legacy: 'pnpm exec nx migrate --check' -->
# Use `npx npm-check-updates --target minor` to review available updates without automatically applying them

# Run migrations
# Legacy: pnpm exec nx migrate @nx/workspace@latest  <-- use `pnpm upgrade` and review changelogs
pnpm install
# Legacy: pnpm exec nx migrate --run-migrations  <-- run migration scripts from the package or follow upgrade notes
```

### Token Schema Migrations

```typescript
// tools/migrations/token-v2/index.ts
import { Tree, visitNotIgnoredFiles } from '@nx/devkit';

export default async function (tree: Tree) {
  visitNotIgnoredFiles(tree, 'tokens', filePath => {
    if (filePath.endsWith('.json')) {
      const content = tree.read(filePath, 'utf-8');
      if (content) {
        const tokens = JSON.parse(content);
        const migratedTokens = migrateTokenSchema(tokens);
        tree.write(filePath, JSON.stringify(migratedTokens, null, 2));
      }
    }
  });
}

function migrateTokenSchema(tokens: any): any {
  // Implement token schema migration logic
  return tokens;
}
```

## Troubleshooting

### Common Issues

1. **Module Boundary Violations**

   ```bash
   # Check specific violations

  pnpm -w -r run lint --if-present --verbose

# Fix auto-fixable issues

  pnpm -w -r run lint --if-present --fix

   ```

2. **Cache Issues**

   ```bash
   # Clear Nx cache
  # pnpm exec nx reset (legacy) - instead use `pnpm store prune` and clear temporary caches

   # Clear npm cache
   npm cache clean --force
   ```

3. **Performance Issues**

   ```bash
   # Analyze build performance

  pnpm -w -r build --loglevel=info

# Check daemon status

# pnpm exec nx daemon  # Legacy - Nx daemon removed; pnpm workspaces do not use a daemon

   ```

## Next Steps

- [ ] Set up workspace linting rules
- [ ] Configure automated dependency updates
- [ ] Implement workspace analytics
- [ ] Set up release preview environments
- [ ] Create workspace documentation generator

## Related Documentation

- [CI/CD Token Drift Detection](../cicd/token-drift-check.md)
- [Quality Assurance](../quality/biome-dprint.md)
- [Visual Testing Setup](../cicd/visual-testing.md)
