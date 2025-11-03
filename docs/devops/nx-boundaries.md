# Nx Module Boundaries & DevOps

Advanced Nx workspace management, module boundaries, and release workflows.

## Overview

This guide covers Nx workspace optimization for the n00plicate design system, including module boundaries,
remote caching, and automated release workflows.

## Module Boundaries Configuration

### ESLint Module Boundaries

```json
// .eslintrc.json
{
  "extends": ["@nx/eslint-plugin"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "type:design-tokens",
                "onlyDependOnLibsWithTags": ["type:utility"]
              },
              {
                "sourceTag": "type:ui-components",
                "onlyDependOnLibsWithTags": [
                  "type:design-tokens",
                  "type:utility"
                ]
              },
              {
                "sourceTag": "type:app",
                "onlyDependOnLibsWithTags": [
                  "type:ui-components",
                  "type:design-tokens",
                  "type:utility",
                  "type:feature"
                ]
              },
              {
                "sourceTag": "platform:web",
                "onlyDependOnLibsWithTags": ["platform:web", "platform:shared"]
              },
              {
                "sourceTag": "platform:mobile",
                "onlyDependOnLibsWithTags": [
                  "platform:mobile",
                  "platform:shared"
                ]
              },
              {
                "sourceTag": "scope:storybook",
                "onlyDependOnLibsWithTags": [
                  "type:ui-components",
                  "type:design-tokens"
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

### Project Tags Configuration

```json
// nx.json
{
  "projects": {
    "design-tokens": {
      "tags": ["type:design-tokens", "platform:shared"]
    },
    "ui-components": {
      "tags": ["type:ui-components", "platform:web"]
    },
    "mobile-components": {
      "tags": ["type:ui-components", "platform:mobile"]
    },
    "storybook": {
      "tags": ["scope:storybook", "type:app"]
    },
    "docs-site": {
      "tags": ["type:app", "platform:web", "scope:documentation"]
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "test": {
      "cache": true
    },
    "lint": {
      "cache": true
    }
  }
}
```

### Workspace Visualization

```bash
# Generate dependency graph
npx nx graph

# Show project dependencies
npx nx show projects --with-target=build

# Analyze bundle impact
npx nx affected:graph --base=main

# Check module boundary violations
npx nx lint --fix
```

## Remote Caching Setup

### Nx Cloud Configuration

```bash
# Connect to Nx Cloud
npx nx connect-to-nx-cloud

# Configure remote caching
npx nx g @nx/workspace:ci-workflow --ci=github
```

### Cache Configuration

```json
// nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "@nrwl/nx-cloud": {
        "cacheableOperations": ["build", "test", "lint", "e2e", "tokens:build"],
        "accessToken": "YOUR_ACCESS_TOKEN"
      }
    }
  },
  "targetDefaults": {
    "tokens:build": {
      "cache": true,
      "inputs": [
        "{projectRoot}/tokens/**/*",
        "{workspaceRoot}/style-dictionary.config.js"
      ],
      "outputs": ["{projectRoot}/dist"]
    }
  }
}
```

### Local Cache Optimization

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

## Release Workflow

### Semantic Release Configuration

```json
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
        assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    '@semantic-release/github'
  ]
};
```

### Nx Release Configuration

```json
// nx.json
{
  "release": {
    "projects": ["design-tokens", "ui-components"],
    "version": {
      "conventionalCommits": true,
      "generatorOptions": {
        "packageRoot": "dist/{projectName}",
        "currentVersionResolver": "git-tag"
      }
    },
    "changelog": {
      "workspaceChangelog": {
        "createRelease": "github"
      },
      "projectChangelogs": {
        "createRelease": "github"
      }
    }
  }
}
```

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
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GH_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run affected tests
        run: npx nx affected --target=test --base=last-release

      - name: Build affected projects
        run: npx nx affected --target=build --base=last-release

      - name: Build design tokens
        run: npx nx run design-tokens:tokens:build

      - name: Version and release
        run: npx nx release --verbose
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish to npm
        run: npx nx affected --target=publish --base=last-release
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Workspace Generators

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
npx nx report

# Analyze cache effectiveness
npx nx reset && npx nx run-many --target=build --all
npx nx run-many --target=build --all  # Second run should be cached

# Check daemon status
npx nx daemon --help
```

## Workspace Maintenance

### Dependency Updates

```bash
# Update Nx workspace
npx nx migrate latest
npm install
npx nx migrate --run-migrations

# Update dependencies
npx nx g @nx/workspace:update-packages-in-package-json
```

### Workspace Cleanup

```bash
# Clean cache
npx nx reset

# Remove unused dependencies
npx nx g @nx/workspace:remove-unused-dependencies

# Fix workspace formatting
npx nx format:write
```

### Health Checks

```bash
# Check workspace integrity
npx nx workspace-lint

# Validate project configuration
npx nx show projects --affected

# Check for circular dependencies
npx nx graph --file=graph.html
```

## Migration Strategies

### Nx Version Migrations

```bash
# Check migration status
npx nx migrate --check

# Run migrations
npx nx migrate @nx/workspace@latest
npm install
npx nx migrate --run-migrations
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
   npx nx lint --verbose

   # Fix auto-fixable issues
   npx nx lint --fix
   ```

2. **Cache Issues**

   ```bash
   # Clear Nx cache
   npx nx reset

   # Clear npm cache
   npm cache clean --force
   ```

3. **Performance Issues**

   ```bash
   # Analyze build performance
   npx nx run-many --target=build --all --verbose

   # Check daemon status
   npx nx daemon
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
