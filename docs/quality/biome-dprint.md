# Biome & dprint Configuration

Advanced code formatting and linting setup with Biome and dprint for the n00plicate design system.

## Overview

This guide covers the setup and configuration of Biome for TypeScript/JavaScript linting and formatting,
and dprint for additional file formatting across the n00plicate workspace.

## Biome Configuration

### Biome Installation & Setup

```bash
# Install Biome
pnpm add -D @biomejs/biome

# Initialize configuration
pnpm dlx @biomejs/biome init
```

### Core Configuration

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.0.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "useImportType": "error",
        "useExportType": "error",
        "noNonNullAssertion": "warn"
      },
      "nursery": {
        "useSortedClasses": "error"
      },
      "performance": {
        "noAccumulatingSpread": "error"
      },
      "security": {
        "noDangerouslySetInnerHtml": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf",
    "attributePosition": "auto"
  },
  "javascript": {
    "formatter": {
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "trailingComma": "es5",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSpacing": true,
      "bracketSameLine": false,
      "quoteStyle": "single"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  },
  "files": {
    "include": [
      "src/**/*.ts",
      "src/**/*.tsx",
      "src/**/*.js",
      "src/**/*.jsx",
      "src/**/*.json",
      "packages/**/*.ts",
      "packages/**/*.tsx",
      "apps/**/*.ts",
      "apps/**/*.tsx"
    ],
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/.nx/cache/**"
    ]
  }
}
```

### Design System Specific Rules

```json
// biome.json - Design system specific extensions
{
  "linter": {
    "rules": {
      "style": {
        "useNamingConvention": {
          "level": "error",
          "options": {
            "strictCase": false,
            "conventions": [
              {
                "selector": {
                  "kind": "function",
                  "modifiers": ["exported"]
                },
                "match": "PascalCase",
                "formats": ["PascalCase"]
              },
              {
                "selector": {
                  "kind": "variable",
                  "modifiers": ["const", "exported"]
                },
                "match": "^[A-Z][a-zA-Z0-9]*$|^[A-Z_][A-Z0-9_]*$"
              },
              {
                "selector": {
                  "kind": "typeLike"
                },
                "match": "PascalCase"
              }
            ]
          }
        }
      },
      "complexity": {
        "noBannedTypes": {
          "level": "error",
          "options": {
            "types": {
              "String": "Use 'string' instead",
              "Number": "Use 'number' instead",
              "Boolean": "Use 'boolean' instead",
              "Object": "Use 'object' or a more specific type instead"
            }
          }
        }
      }
    }
  }
}
```

### Token-Specific Linting

```json
// biome.json - Token validation rules
{
  "overrides": [
    {
      "include": ["**/tokens/**/*.ts", "**/design-tokens/**/*.ts"],
      "linter": {
        "rules": {
          "style": {
            "useEnumInitializers": "error",
            "useExportType": "off"
          },
          "suspicious": {
            "noExplicitAny": "error"
          }
        }
      }
    },
    {
      "include": ["**/*.stories.ts", "**/*.stories.tsx"],
      "linter": {
        "rules": {
          "style": {
            "noDefaultExport": "off"
          }
        }
      }
    }
  ]
}
```

## dprint Configuration

### Installation & Setup

```bash
# Install dprint
pnpm add -D dprint

# Initialize configuration
pnpm dlx dprint init
```

### Core Configuration

```json
// dprint.json
{
  "$schema": "https://dprint.dev/schemas/v0.json",
  "projectType": "openSource",
  "incremental": true,
  "includes": [
    "**/*.{md,json,yaml,yml,toml}",
    "**/*.{css,scss,less}",
    "packages/**/*.{ts,tsx,js,jsx}",
    "apps/**/*.{ts,tsx,js,jsx}",
    "docs/**/*.md"
  ],
  "excludes": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**",
    "**/.nx/cache/**",
    "**/target/**"
  ],
  "plugins": [
    "https://plugins.dprint.dev/typescript-0.87.1.wasm",
    "https://plugins.dprint.dev/json-0.19.2.wasm",
    "https://plugins.dprint.dev/markdown-0.16.4.wasm",
    "https://plugins.dprint.dev/toml-0.6.0.wasm",
    "https://plugins.dprint.dev/dockerfile-0.3.0.wasm",
    "https://plugins.dprint.dev/malva-0.6.0.wasm"
  ],
  "typescript": {
    "lineWidth": 100,
    "indentWidth": 2,
    "useTabs": false,
    "semiColons": "always",
    "quoteStyle": "alwaysSingle",
    "quoteProps": "asNeeded",
    "trailingComma": "es5",
    "useParentheses": "force",
    "singleBodyPosition": "maintain",
    "nextControlFlowPosition": "nextLine",
    "operatorPosition": "nextLine",
    "arrowFunction.useParentheses": "force"
  },
  "json": {
    "lineWidth": 100,
    "indentWidth": 2,
    "useTabs": false,
    "trailingCommas": "never"
  },
  "markdown": {
    "lineWidth": 100,
    "proseWrap": "always",
    "emphasisKind": "asterisks",
    "strongKind": "asterisks"
  },
  "malva": {
    "lineWidth": 100,
    "indentWidth": 2,
    "useTabs": false,
    "printWidth": 100,
    "singleQuote": true
  }
}
```

### Documentation Formatting

```json
// dprint.json - Documentation specific settings
{
  "markdown": {
    "lineWidth": 120,
    "proseWrap": "always",
    "emphasisKind": "asterisks",
    "strongKind": "asterisks",
    "codeBlockLanguagePosition": "nextLine",
    "textWrap": "always"
  },
  "toml": {
    "lineWidth": 100,
    "indentWidth": 2,
    "useTabs": false
  }
}
```

## VS Code Integration

### Settings Configuration

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "dprint.dprint"
  },
  "[markdown]": {
    "editor.defaultFormatter": "dprint.dprint",
    "editor.wordWrap": "on",
    "editor.rulers": [120]
  },
  "[css]": {
    "editor.defaultFormatter": "dprint.dprint"
  },
  "[scss]": {
    "editor.defaultFormatter": "dprint.dprint"
  },
  "files.associations": {
    "*.json": "json",
    "*.jsonc": "jsonc",
    "*.md": "markdown"
  }
}
```

### Extensions Configuration

```json
// .vscode/extensions.json
{
  "recommendations": ["biomejs.biome", "dprint.dprint"],
  "unwantedRecommendations": ["esbenp.prettier-vscode"]
}
```

## Package.json Scripts

### Formatting & Linting Scripts

```json
// package.json
{
  "scripts": {
    "format": "biome format --write . && dprint fmt",
    "format:check": "biome format . && dprint check",
    "lint": "biome lint .",
    "lint:fix": "biome lint --apply .",
    "lint:unsafe": "biome lint --apply-unsafe .",
    "check": "biome check .",
    "check:fix": "biome check --apply .",
    "ci:format": "biome ci . && dprint check",
    "ci:lint": "biome ci ."
  }
}
```

### Nx Integration Scripts

```json
// package.json - Nx specific scripts
{
  "scripts": {
    "format:affected": "nx affected --target=format",
    "lint:affected": "nx affected --target=lint",
    "check:affected": "nx affected --target=check"
  }
}
```

## Pre-commit Hooks

### Husky Setup

```json
// package.json
{
  "devDependencies": {
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "biome check --apply --no-errors-on-unmatched",
      "git add"
    ],
    "*.{md,json,yaml,yml,css,scss}": [
      "dprint fmt --config dprint.json",
      "git add"
    ]
  }
}
```

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

echo "🔍 Running pre-commit checks..."

# Run lint-staged
pnpm lint-staged

# Check for formatting issues
echo "📝 Checking formatting..."
pnpm run format:check

if [ $? -ne 0 ]; then
  echo "❌ Formatting issues detected. Run 'pnpm format' to fix."
  exit 1
fi

# Run linting
echo "🔍 Running linter..."
pnpm run lint

if [ $? -ne 0 ]; then
  echo "❌ Linting issues detected. Run 'pnpm lint:fix' to fix."
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  format-and-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check formatting
        run: pnpm run ci:format

      - name: Check linting
        run: pnpm run ci:lint

      - name: Check affected projects
  run: pnpm -w -r lint --filter --changed --base=origin/main
        if: github.event_name == 'pull_request'
```

### Quality Gates

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run quality checks
        run: |
          echo "🔍 Running quality gate checks..."

          # Format check
          pnpm run format:check

          # Lint check
          pnpm run lint

          # Type check
          pnpm run type-check

          # Test affected
          pnpm -w -r test --filter --changed --base=origin/main

          echo "✅ Quality gate passed"

      - name: Comment PR
        uses: actions/github-script@v7
        if: failure()
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Quality gate failed. Please check the formatting and linting errors.'
            })
```

## Custom Rules & Plugins

### Custom Biome Rules

```typescript
// tools/biome-rules/design-token-rules.ts
import { Rule } from '@biomejs/biome';

export const noHardcodedColors: Rule = {
  name: 'noHardcodedColors',
  create(context) {
    return {
      StringLiteral(node) {
        const value = node.value;

        // Check for hex colors
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(value)) {
          context.report({
            node,
            message: 'Use design tokens instead of hardcoded colors',
            suggest: [
              {
                desc: 'Replace with design token',
                fix: fixer => {
                  return fixer.replaceText(node, `tokens.color.primary`);
                },
              },
            ],
          });
        }

        // Check for rgb/rgba colors
        if (/rgb\(|rgba\(/.test(value)) {
          context.report({
            node,
            message: 'Use design tokens instead of hardcoded RGB colors',
          });
        }
      },
    };
  },
};
```

### Custom dprint Plugin

```typescript
// tools/dprint-plugins/design-docs.ts
import { PluginConfig } from 'dprint';

export interface DesignDocsConfig {
  maxLineLength: number;
  enforceTokenReferences: boolean;
  validateCodeBlocks: boolean;
}

export function createDesignDocsPlugin(config: DesignDocsConfig) {
  return {
    name: 'design-docs',
    format: (text: string, filePath: string) => {
      let formatted = text;

      // Validate token references in markdown
      if (config.enforceTokenReferences && filePath.includes('docs/')) {
        formatted = validateTokenReferences(formatted);
      }

      // Format code blocks
      if (config.validateCodeBlocks) {
        formatted = formatCodeBlocks(formatted);
      }

      return formatted;
    },
  };
}
```

## Performance Optimization

### Incremental Checking

```json
// biome.json
{
  "files": {
    "maxSize": 1048576
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false
  }
}
```

### Parallel Processing

```bash
# Run formatting in parallel
pnpm run --parallel format

# Run linting with max workers
biome lint --max-diagnostics=50 .
```

## Troubleshooting

### Common Issues

1. **Biome vs Prettier Conflicts**

   ```bash
   # Remove Prettier configuration
   rm -f .prettierrc .prettierrc.js .prettierrc.json

   # Update VS Code settings
   # Remove prettier extensions and configs
   ```

2. **dprint Performance Issues**

   ```bash
   # Clear dprint cache
   dprint clear-cache

   # Run incremental formatting
   dprint fmt --incremental
   ```

3. **VS Code Integration Issues**

   ```bash
   # Reload VS Code window
   # Check extension conflicts
   # Verify settings.json configuration
   ```

### Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Biome",
      "type": "node",
      "request": "launch",
      "program": "node_modules/@biomejs/biome/bin/biome",
      "args": ["check", "--verbose", "."],
      "console": "integratedTerminal"
    }
  ]
}
```

## Migration Guide

### From Prettier + ESLint

1. **Remove old tools**

   ```bash
   pnpm remove prettier eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   rm -f .prettierrc .eslintrc.js
   ```

2. **Install Biome**

   ```bash
   pnpm add -D @biomejs/biome

  pnpm dlx @biomejs/biome init

   ```

3. **Update scripts**

   ```json
   {
     "scripts": {
       "format": "biome format --write .",
       "lint": "biome lint ."
     }
   }
   ```

4. **Update CI/CD**

   ```yaml
   - name: Format and lint
     run: |
       pnpm run format
       pnpm run lint
   ```

## Next Steps

- [ ] Set up custom rules for design token validation
- [ ] Configure automated formatting in pre-commit hooks
- [ ] Integrate with design system documentation
- [ ] Set up performance monitoring for large codebases
- [ ] Create team-specific linting configurations

## Related Documentation

- [Nx Module Boundaries](../devops/nx-boundaries.md)
- [Token Governance](./token-governance.md)
- [CI/CD Workflows](../cicd/workflows.md)
