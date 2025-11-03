# Penpot Token Schema & Integration

Complete guide to Penpot v2.8 token export, W3C DTCG JSON schema, and automated integration with Style Dictionary.

## Table of Contents

- [Token Export Workflow](#token-export-workflow)
- [W3C DTCG JSON Schema](#w3c-dtcg-json-schema)
- [Style Dictionary Mapping](#style-dictionary-mapping)
- [CLI Automation](#cli-automation)
- [Git Workflow Integration](#git-workflow-integration)

## Token Export Workflow

### Manual Export from Penpot

Designers can export tokens directly from Penpot v2.8:

1. **Open Design File** - Navigate to your Penpot design file
2. **Access Tokens Panel** - Click on the **Tokens** panel in the right sidebar
3. **Export Tokens** - Click **Export** → **Download JSON**
4. **Save to Repository** - Place the file at `tokens/design-tokens.json`

### Automated Export via CLI

For CI/CD integration, use the Penpot export CLI:

```bash
# Export tokens from Penpot file
penpot-export --file $UUID --out tokens/design-tokens.json

# With authentication
PENPOT_ACCESS_TOKEN=your_token penpot-export \
  --file 12345678-1234-1234-1234-123456789abc \
  --out tokens/design-tokens.json \
  --format dtcg
```

### Environment Configuration

```bash
# .env (required for automated export)
PENPOT_ACCESS_TOKEN=your_api_token_here
PENPOT_FILE_ID=your_file_uuid_here
PENPOT_TEAM_ID=your_team_uuid_here
PENPOT_BASE_URL=https://design.penpot.app
```

## W3C DTCG JSON Schema

Penpot v2.8 exports tokens in W3C Design Token Community Group (DTCG) format. Here's the complete schema structure:

### Basic Token Structure

```json
{
  "$schema": "https://schemas.w3.org/design-tokens/",
  "color": {
    "primary": {
      "50": {
        "value": "#eff6ff",
        "type": "color",
        "description": "Lightest primary color"
      },
      "500": {
        "value": "#3b82f6",
        "type": "color",
        "description": "Base primary color"
      },
      "900": {
        "value": "#1e3a8a",
        "type": "color",
        "description": "Darkest primary color"
      }
    }
  },
  "spacing": {
    "xs": {
      "value": "0.25rem",
      "type": "dimension",
      "description": "Extra small spacing"
    },
    "sm": {
      "value": "0.5rem",
      "type": "dimension",
      "description": "Small spacing"
    },
    "md": {
      "value": "1rem",
      "type": "dimension",
      "description": "Medium spacing"
    }
  },
  "typography": {
    "fontSize": {
      "xs": {
        "value": "0.75rem",
        "type": "dimension"
      },
      "base": {
        "value": "1rem",
        "type": "dimension"
      }
    },
    "fontWeight": {
      "normal": {
        "value": 400,
        "type": "fontWeight"
      },
      "bold": {
        "value": 700,
        "type": "fontWeight"
      }
    },
    "fontFamily": {
      "sans": {
        "value": ["Inter", "system-ui", "sans-serif"],
        "type": "fontFamily"
      }
    }
  }
}
```

### Alias Tokens (Semantic References)

```json
{
  "semantic": {
    "text": {
      "primary": {
        "value": "{color.neutral.900}",
        "type": "color",
        "description": "Primary text color"
      },
      "secondary": {
        "value": "{color.neutral.600}",
        "type": "color",
        "description": "Secondary text color"
      }
    },
    "surface": {
      "primary": {
        "value": "{color.neutral.50}",
        "type": "color",
        "description": "Primary surface background"
      }
    },
    "action": {
      "primary": {
        "value": "{color.primary.500}",
        "type": "color",
        "description": "Primary action color"
      }
    }
  }
}
```

### Component-Specific Tokens

```json
{
  "component": {
    "button": {
      "padding": {
        "sm": {
          "value": "{spacing.sm} {spacing.md}",
          "type": "dimension",
          "description": "Small button padding"
        }
      },
      "borderRadius": {
        "value": "{border.radius.md}",
        "type": "dimension"
      }
    },
    "card": {
      "shadow": {
        "value": "{shadow.md}",
        "type": "shadow",
        "description": "Default card shadow"
      }
    }
  }
}
```

## Style Dictionary Mapping

Complete mapping from Penpot DTCG JSON to Style Dictionary platform outputs:

### Token Category Mapping

| Penpot Token Path             | Style Dictionary Path         | CSS Variable                    | TypeScript Export                    |
| ----------------------------- | ----------------------------- | ------------------------------- | ------------------------------------ |
| `color.primary.500`           | `color.primary.500`           | `--color-primary-500`           | `tokens.color.primary[500]`          |
| `spacing.md`                  | `spacing.md`                  | `--spacing-md`                  | `tokens.spacing.md`                  |
| `typography.fontSize.base`    | `fontSize.base`               | `--font-size-base`              | `tokens.fontSize.base`               |
| `semantic.text.primary`       | `color.text.primary`          | `--color-text-primary`          | `tokens.color.text.primary`          |
| `component.button.padding.sm` | `component.button.padding.sm` | `--component-button-padding-sm` | `tokens.component.button.padding.sm` |

### Platform Transform Groups

```javascript
// style-dictionary.config.js - Platform configurations
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    // CSS Variables for web
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            selector: ':root',
          },
        },
      ],
    },

    // TypeScript for web and React Native
    ts: {
      transformGroup: 'js',
      buildPath: 'dist/ts/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
          options: {
            exportDefault: false,
          },
        },
      ],
    },

    // Dart for Flutter/Compose Multiplatform
    dart: {
      transformGroup: 'flutter',
      buildPath: 'dist/dart/',
      files: [
        {
          destination: 'tokens.dart',
          format: 'flutter/class.dart',
          options: {
            className: 'DesignTokens',
          },
        },
      ],
    },

    // Kotlin for Android Compose
    compose: {
      transformGroup: 'android',
      buildPath: 'dist/compose/',
      files: [
        {
          destination: 'Theme.kt',
          format: 'compose/object',
          options: {
            packageName: 'com.n00plicate.tokens',
            objectName: 'n00plicateTheme',
          },
        },
      ],
    },
  },
};
```

### Custom Transform Examples

```javascript
// Custom transform for Compose dp values
StyleDictionary.registerTransform({
  name: 'size/compose/dp',
  type: 'value',
  matcher: token => token.type === 'dimension',
  transformer: token => {
    const value = parseFloat(token.value);
    return `${value * 16}.dp`; // Convert rem to dp
  },
});

// Custom format for Compose theme object
StyleDictionary.registerFormat({
  name: 'compose/object',
  formatter: (dictionary, config) => {
    const { packageName, objectName } = config.options;

    return `package ${packageName}

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object ${objectName} {
${dictionary.allTokens
  .map(token => {
    const name = token.name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    if (token.type === 'color') {
      return `    val ${name} = Color(0x${token.value.replace('#', '')})`;
    } else if (token.type === 'dimension') {
      return `    val ${name} = ${token.value}`;
    }
    return `    val ${name} = "${token.value}"`;
  })
  .join('\n')}
}`;
  },
});
```

## CLI Automation

### Watch Mode for Development

```javascript
// watch-tokens.js - Development watch script
const StyleDictionary = require('style-dictionary');
const chokidar = require('chokidar');

function buildTokens() {
  const sd = StyleDictionary.extend('./style-dictionary.config.js');
  sd.buildAllPlatforms();
  console.log('✅ Tokens rebuilt successfully');
}

// Watch for changes
chokidar.watch('tokens/**/*.json').on('change', path => {
  console.log(`🔄 Token file changed: ${path}`);
  buildTokens();
});

console.log('👀 Watching for token changes...');
buildTokens(); // Initial build
```

### CI/CD Integration

```yaml
# .github/workflows/tokens.yml
name: Token Pipeline

on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch: # Manual trigger

jobs:
  sync-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Export tokens from Penpot
        env:
          PENPOT_ACCESS_TOKEN: ${{ secrets.PENPOT_ACCESS_TOKEN }}
          PENPOT_FILE_ID: ${{ secrets.PENPOT_FILE_ID }}
        run: |
          pnpm penpot-export \
            --file $PENPOT_FILE_ID \
            --out tokens/design-tokens.json

      - name: Build Style Dictionary outputs
        run: |
          pnpm nx run design-tokens:build

      - name: Check for changes
        id: changes
        run: |
          if git diff --quiet; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Create Pull Request
        if: steps.changes.outputs.changed == 'true'
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'feat(tokens): sync design tokens from Penpot'
          body: |
            Automated token sync from Penpot design file.

            ### Changes
            - Updated design tokens from Penpot
            - Regenerated platform-specific outputs

            ### Review Checklist
            - [ ] Verify token changes are intentional
            - [ ] Check visual regression tests pass
            - [ ] Confirm no breaking changes
          branch: tokens/sync-${{ github.run_id }}
          commit-message: 'feat(tokens): sync design tokens from Penpot'
```

## Git Workflow Integration

### Pre-commit Hook Protection

```bash
#!/bin/sh
# .husky/pre-commit - Prevent manual token edits

# Check if design-tokens.json is being modified
if git diff --cached --name-only | grep -q "tokens/design-tokens.json"; then
  echo "❌ Manual edits to design-tokens.json are not allowed"
  echo "   This file is automatically generated from Penpot"
  echo "   Please make changes in Penpot and run: pnpm tokens:sync"
  exit 1
fi

# Validate token structure if Style Dictionary outputs are staged
if git diff --cached --name-only | grep -q "tokens/.*\.json"; then
  echo "🔍 Validating token structure..."

  # Check W3C DTCG compliance
  pnpm exec ajv validate \
    -s schemas/dtcg.schema.json \
    -d "tokens/**/*.json"

  if [ $? -ne 0 ]; then
    echo "❌ Token validation failed"
    echo "   Tokens must comply with W3C DTCG format"
    exit 1
  fi

  # Rebuild outputs to ensure consistency
  pnpm nx run design-tokens:build

  # Stage regenerated files
  git add dist/

  echo "✅ Token validation passed"
fi
```

### Token Diff Workflow

```bash
# scripts/token-diff.sh - Compare token changes
#!/bin/bash

# Compare tokens between branches
git show main:tokens/design-tokens.json > /tmp/tokens-main.json
git show HEAD:tokens/design-tokens.json > /tmp/tokens-head.json

# Generate human-readable diff
node scripts/compare-tokens.js \
  /tmp/tokens-main.json \
  /tmp/tokens-head.json \
  --output token-changes.md

echo "📊 Token changes summary:"
cat token-changes.md
```

### Development Scripts

```json
{
  "scripts": {
    "tokens:export": "penpot-export --file $PENPOT_FILE_ID --out tokens/design-tokens.json",
    "tokens:build": "style-dictionary build",
    "tokens:watch": "node scripts/watch-tokens.js",
    "tokens:sync": "pnpm tokens:export && pnpm tokens:build",
    "tokens:validate": "ajv validate -s schemas/dtcg.schema.json -d 'tokens/**/*.json'",
    "tokens:diff": "./scripts/token-diff.sh"
  }
}
```

## Troubleshooting

### Common Issues

#### Export Fails with Authentication Error

```bash
# Verify credentials
echo $PENPOT_ACCESS_TOKEN | cut -c1-10
# Should show first 10 characters of your token

# Test API access
curl -H "Authorization: Bearer $PENPOT_ACCESS_TOKEN" \
  https://design.penpot.app/api/rpc/command/get-file-object-thumbnails
```

#### Style Dictionary Build Fails

```bash
# Check token structure
pnpm tokens:validate

# Debug with verbose output
DEBUG=style-dictionary:* pnpm tokens:build

# Clear cache and rebuild
rm -rf dist/ && pnpm tokens:build
```

#### Watch Mode Not Triggering

```bash
# Check file permissions
ls -la tokens/

# Restart with polling (for network drives)
CHOKIDAR_USEPOLLING=true pnpm tokens:watch
```

## Best Practices

### Token Organization

1. **Consistent Naming** - Use the established hierarchy: `category.type.item.variant`
2. **Semantic Layers** - Create alias tokens for semantic meaning
3. **Component Tokens** - Define component-specific values as references to semantic tokens
4. **Documentation** - Include descriptions for all tokens

### Workflow Guidelines

1. **Single Source** - Always edit tokens in Penpot, never manually in JSON
2. **Regular Sync** - Run automated sync at least daily during active design phases
3. **Review Process** - All token changes should go through PR review
4. **Testing** - Run visual regression tests after token updates

### Performance Optimization

1. **Incremental Builds** - Only rebuild changed platforms
2. **Parallel Processing** - Build multiple platforms simultaneously
3. **Caching** - Cache Style Dictionary outputs in CI
4. **Tree Shaking** - Import only needed tokens in applications

---

This documentation ensures that the Penpot → Style Dictionary → Multi-platform pipeline is fully traceable and
maintainable.
