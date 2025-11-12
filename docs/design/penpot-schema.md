# Penpot Token JSON Schema & Export Configuration

This document defines the JSON schema for design tokens exported from Penpot, provides configuration guidance
for the export process, and covers advanced export mechanics and CLI automation.

## Table of Contents

- [Export Mechanics & CLI](#export-mechanics--cli)
- [Token JSON Schema](#token-json-schema)
- [Versioning & Diffs](#versioning--diffs)
- [Penpot Export Configuration](#penpot-export-configuration)
- [Schema Validation](#schema-validation)
- [Common Issues](#common-issues)
- [Advanced Configuration](#advanced-configuration)

## Export Mechanics & CLI

### DTCG-Compatible JSON Export

Penpot exports a single DTCG-compatible JSON that bundles global, alias, and semantic tokens. This unified approach
ensures consistency across the design-to-code pipeline.

#### Manual Export Process

1. **Open Penpot Design File**
2. **Navigate to Tokens Panel**: Right-hand panel → Tokens section
3. **Export Action**: Click "Export" button in the Tokens panel
4. **Select Format**: Choose "JSON (DTCG)" for W3C compliance
5. **Download**: Save as `tokens.json` to your design tokens repository

#### CLI Export Automation

For CI/CD integration, use the Penpot export CLI with file UUID targeting:

```bash
# Run Penpot CLI without installing globally
pnpm dlx @penpot/cli

# Export tokens using file UUID
penpot-export --file <FILE_UUID> --format dtcg --output ./tokens/penpot-tokens.json

# Example with real UUID
penpot-export --file a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6 \
  --format dtcg \
  --output ./packages/design-tokens/src/penpot-export.json
```

#### Advanced Export Configuration

```bash
# Export with additional metadata
penpot-export --file <FILE_UUID> \
  --format dtcg \
  --output ./tokens/penpot-tokens.json \
  --include-metadata \
  --include-aliases \
  --semantic-grouping

# Export with asset optimization
penpot-export --file <FILE_UUID> \
  --format dtcg \
  --output ./tokens/ \
  --include-assets \
  --asset-format svg,png \
  --optimize-assets
```

### Dual Export Strategy: Tokens + Assets

Configure a second export preset for optimized SVG/PNG renditions of icons and illustrations:

```bash
# Export tokens
penpot-export --file <FILE_UUID> \
  --preset tokens \
  --format dtcg \
  --output ./packages/design-tokens/src/

# Export assets (icons, illustrations)
penpot-export --file <FILE_UUID> \
  --preset assets \
  --format svg,png \
  --output ./packages/design-tokens/assets/ \
  --optimize \
  --svg-cleanup
```

Asset export configuration:

```json
{
  "penpot": {
    "export": {
      "presets": {
        "tokens": {
          "format": "dtcg",
          "include": ["tokens"],
          "exclude": ["assets", "components"]
        },
        "assets": {
          "format": ["svg", "png"],
          "include": ["icons", "illustrations"],
          "optimization": {
            "svg": {
              "removeComments": true,
              "removeMetadata": true,
              "removeXMLNS": false,
              "optimizePaths": true
            },
            "png": {
              "compression": "high",
              "stripMetadata": true
            }
          }
        }
      }
    }
  }
}
```

### CI/CD Integration

Automate token export in your CI pipeline:

```yaml
# .github/workflows/token-export.yml
name: Export Tokens from Penpot

on:
  schedule:
    - cron: '0 9 * * 1-5' # Weekdays at 9 AM
  workflow_dispatch:
    inputs:
      file_uuid:
        description: 'Penpot file UUID'
        required: true
        type: string

jobs:
  export-tokens:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: '24'

      - name: Install Penpot CLI
        run: pnpm dlx @penpot/cli --version || pnpm dlx @penpot/cli

      - name: Export tokens
        env:
          PENPOT_TOKEN: ${{ secrets.PENPOT_API_TOKEN }}
          FILE_UUID: ${{ github.event.inputs.file_uuid || vars.PENPOT_FILE_UUID }}
        run: |
          penpot-export --file $FILE_UUID \
            --format dtcg \
            --output ./packages/design-tokens/src/penpot-export.json \
            --include-metadata

      - name: Export assets
        env:
          PENPOT_TOKEN: ${{ secrets.PENPOT_API_TOKEN }}
          FILE_UUID: ${{ github.event.inputs.file_uuid || vars.PENPOT_FILE_UUID }}
        run: |
          penpot-export --file $FILE_UUID \
            --preset assets \
            --format svg,png \
            --output ./packages/design-tokens/assets/

      - name: Validate exported tokens
        run: |
          node scripts/validate-penpot-export.js

      - name: Create Pull Request
        if: github.event_name == 'schedule'
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'feat(tokens): update from Penpot export'
          title: 'Token Update: Penpot Export'
          body: |
            ## 🎨 Design Token Update

            Automated export from Penpot design file.

            ### Changes
            - Updated design tokens from Penpot
            - Exported optimized assets (SVG/PNG)

            ### Review Checklist
            - [ ] Token values are correct
            - [ ] No breaking changes to existing tokens
            - [ ] Assets are properly optimized
            - [ ] Style Dictionary build passes
          branch: feature/penpot-token-update-${{ github.run_number }}
```

## Versioning & Diffs

### Git-First Token Management

Commit `tokens.json` directly to version control for transparent change tracking:

```bash
# Recommended directory structure
packages/design-tokens/
├── src/
│   ├── penpot-export.json    # Direct Penpot export (canonical)
│   ├── tokens.json           # Processed/validated tokens
│   └── schema.json           # JSON schema for validation
├── assets/
│   ├── icons/                # Exported SVG icons
│   └── illustrations/        # Exported PNG/SVG illustrations
└── dist/                     # Style Dictionary output
```

### Semantic Diff Detection

Penpot writes flat, predictable JSON keys that enable meaningful diffs during code review:

```json
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#007bff",
      "$extensions": {
        "penpot": {
          "id": "color-primary-001",
          "lastModified": "2025-06-23T10:30:00Z",
          "author": "designer@company.com"
        }
      }
    }
  }
}
```

Git diff example showing semantic changes:

```diff
  "color": {
    "primary": {
      "$type": "color",
-     "$value": "#007bff",
+     "$value": "#0066cc",
      "$description": "Primary brand color"
    },
    "secondary": {
      "$type": "color",
-     "$value": "{color.primary}",
+     "$value": "#6c757d",
      "$description": "Secondary brand color"
    }
  }
```

### Pre-commit Validation Hook

Prevent manual edits outside the Penpot-generated directory:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if tokens.json was manually edited
if git diff --cached --name-only | grep -q "packages/design-tokens/src/penpot-export.json"; then
  echo "❌ Direct editing of Penpot export file detected!"
  echo "💡 Use Penpot UI or penpot-export CLI to update tokens"
  echo "📖 See docs/design/penpot-schema.md for guidance"
  exit 1
fi

# Validate token schema
if git diff --cached --name-only | grep -q "packages/design-tokens/"; then
  echo "🔍 Validating design tokens..."
  node scripts/validate-tokens.js

  if [ $? -ne 0 ]; then
    echo "❌ Token validation failed!"
    exit 1
  fi

  echo "✅ Token validation passed"
fi

exit 0
```

Make the hook executable:

```bash
chmod +x .git/hooks/pre-commit
```

### Token Change Classification

Automatically classify token changes for review impact:

```typescript
// scripts/classify-token-changes.ts
import { readFileSync } from 'fs';
import { diff } from 'deep-diff';

interface TokenChange {
  type: 'breaking' | 'non-breaking' | 'additive';
  path: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export function classifyTokenChanges(
  oldTokens: any,
  newTokens: any
): TokenChange[] {
  const differences = diff(oldTokens, newTokens) || [];
  const changes: TokenChange[] = [];

  differences.forEach(change => {
    const path = change.path?.join('.') || 'root';

    switch (change.kind) {
      case 'D': // Deleted
        changes.push({
          type: 'breaking',
          path,
          description: `Token "${path}" was removed`,
          impact: 'high',
        });
        break;

      case 'N': // New
        changes.push({
          type: 'additive',
          path,
          description: `Token "${path}" was added`,
          impact: 'low',
        });
        break;

      case 'E': // Edited
        const isValueChange =
          change.path?.[change.path.length - 1] === '$value';
        changes.push({
          type: isValueChange ? 'breaking' : 'non-breaking',
          path,
          description: `Token "${path}" changed from "${change.lhs}" to "${change.rhs}"`,
          impact: isValueChange ? 'medium' : 'low',
        });
        break;
    }
  });

  return changes;
}

// Usage in CI
if (require.main === module) {
  const oldTokens = JSON.parse(readFileSync('tokens-previous.json', 'utf8'));
  const newTokens = JSON.parse(
    readFileSync('packages/design-tokens/src/penpot-export.json', 'utf8')
  );

  const changes = classifyTokenChanges(oldTokens, newTokens);

  console.log('## Token Change Summary\n');

  const breakingChanges = changes.filter(c => c.type === 'breaking');
  const nonBreakingChanges = changes.filter(c => c.type === 'non-breaking');
  const additiveChanges = changes.filter(c => c.type === 'additive');

  if (breakingChanges.length > 0) {
    console.log('### ⚠️ Breaking Changes');
    breakingChanges.forEach(c => console.log(`- ${c.description}`));
    console.log('');
  }

  if (nonBreakingChanges.length > 0) {
    console.log('### 🔧 Non-Breaking Changes');
    nonBreakingChanges.forEach(c => console.log(`- ${c.description}`));
    console.log('');
  }

  if (additiveChanges.length > 0) {
    console.log('### ✨ New Additions');
    additiveChanges.forEach(c => console.log(`- ${c.description}`));
    console.log('');
  }

  // Exit with error if breaking changes detected
  if (breakingChanges.length > 0) {
    console.log('❌ Breaking changes detected - manual review required');
    process.exit(1);
  }

  console.log('✅ All changes are backwards compatible');
}
```
