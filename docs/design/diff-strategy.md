# Design Token Diff Strategy & Change Detection

This document outlines strategies for detecting, reviewing, and managing changes to design tokens throughout
the design-to-code pipeline.

## Table of Contents

- [Overview](#overview)
- [Diff Detection Methods](#diff-detection-methods)
- [Change Review Workflow](#change-review-workflow)
- [Automated Change Detection](#automated-change-detection)
- [Impact Analysis](#impact-analysis)
- [Best Practices](#best-practices)

## Overview

Design token changes can have far-reaching effects across multiple platforms and components. A robust diff strategy
helps teams:

- **Detect Changes**: Automatically identify when tokens are added, modified, or removed
- **Review Impact**: Understand which components and platforms are affected
- **Validate Changes**: Ensure changes meet design system guidelines
- **Communicate Changes**: Notify stakeholders of breaking or significant changes
- **Track History**: Maintain a comprehensive audit trail

## Diff Detection Methods

### 1. Semantic Versioning Integration

Token changes are automatically categorized using semantic versioning:

```bash
# Patch: Non-breaking changes (descriptions, comments)
pnpm run tokens:diff -- --level patch

# Minor: Additive changes (new tokens, new platforms)
pnpm run tokens:diff -- --level minor

# Major: Breaking changes (removed tokens, value changes)
pnpm run tokens:diff -- --level major
```

### 2. Git-Based Diff Analysis

Compare token files between Git references:

```bash
# Compare current branch with main
pnpm run tokens:diff -- --base main

# Compare specific commits
pnpm run tokens:diff -- --base commit1 --head commit2

# Compare with last release tag
pnpm run tokens:diff -- --base $(git describe --tags --abbrev=0)
```

### 3. Schema-Aware Diffing

Understand the semantic meaning of changes:

```typescript
interface TokenDiff {
  type: 'added' | 'removed' | 'modified';
  path: string[];
  oldValue?: TokenValue;
  newValue?: TokenValue;
  impact: 'breaking' | 'non-breaking' | 'additive';
  platforms: Platform[];
  components: string[];
}

// Example diff output
const diff: TokenDiff = {
  type: 'modified',
  path: ['color', 'primary', '500'],
  oldValue: '#007bff',
  newValue: '#0066cc',
  impact: 'breaking',
  platforms: ['web', 'mobile', 'desktop'],
  components: ['Button', 'Link', 'Badge'],
};
```

## Change Review Workflow

### 1. Automated Diff Reports

Generate comprehensive diff reports in CI/CD:

```yaml
# .github/workflows/token-diff.yml
name: Token Diff Analysis

on:
  pull_request:
    paths:
      - 'packages/design-tokens/**'
      - 'tools/penpot-export/**'

jobs:
  token-diff:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Token Diff
        run: pnpm run tokens:diff -- --format github --output diff-report.md

      - name: Comment PR with Diff
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const diff = fs.readFileSync('diff-report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: diff
            });
```

### 2. Visual Diff Generation

Create visual comparisons of token changes:

```bash
# Generate visual diffs for color tokens
pnpm run tokens:visual-diff -- --type color --output visual-diff/

# Compare typography scales
pnpm run tokens:visual-diff -- --type typography --format html
```

### 3. Interactive Review Tools

Use Storybook for interactive token comparison:

```typescript
// .storybook/token-diff.stories.ts
export default {
  title: 'Design Tokens/Diff Review',
  parameters: {
    layout: 'fullscreen'
  }
};

export const ColorDiff = () => {
  const { added, removed, modified } = useTokenDiff();

  return (
    <TokenDiffViewer
      added={added}
      removed={removed}
      modified={modified}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
};
```

## Automated Change Detection

### 1. Continuous Monitoring

Watch for changes in real-time:

```bash
# Start token watch mode with diff detection
pnpm run tokens:watch -- --diff

# Monitor Penpot exports for changes
pnpm run penpot:watch -- --diff-on-change
```

### 2. Slack/Teams Integration

Notify teams of significant changes:

```javascript
// tools/diff/notify.js
export async function notifyChanges(diff) {
  if (diff.hasBreakingChanges) {
    await slack.postMessage({
      channel: '#design-system',
      text: `🚨 Breaking token changes detected in PR #${prNumber}`,
      attachments: [
        {
          color: 'danger',
          fields: [
            {
              title: 'Affected Tokens',
              value: diff.breakingChanges.map(c => c.path.join('.')).join('\n'),
              short: false,
            },
          ],
        },
      ],
    });
  }
}
```

### 3. Automated Impact Analysis

Scan codebase for token usage:

```bash
# Find all usages of changed tokens
pnpm run tokens:find-usage -- --changed-only

# Generate impact report
pnpm run tokens:impact-analysis -- --format json --output impact.json
```

## Impact Analysis

### 1. Platform Impact Matrix

Understand cross-platform effects:

| Token Change            | Web           | Mobile        | Desktop       | Storybook |
| ----------------------- | ------------- | ------------- | ------------- | --------- |
| `color.primary.500`     | 🔴 Breaking   | 🔴 Breaking   | 🔴 Breaking   | 🟡 Visual |
| `spacing.large`         | 🟡 Layout     | 🟡 Layout     | 🟡 Layout     | 🟡 Visual |
| `typography.heading.h1` | 🟡 Typography | 🟡 Typography | 🟡 Typography | 🟡 Visual |

### 2. Component Dependency Graph

Map token dependencies:

```typescript
interface ComponentTokenDependency {
  component: string;
  tokens: string[];
  platform: Platform;
  breaking: boolean;
}

// Example dependency analysis
const dependencies: ComponentTokenDependency[] = [
  {
    component: 'Button',
    tokens: ['color.primary.500', 'spacing.medium', 'border.radius.small'],
    platform: 'web',
    breaking: true,
  },
  {
    component: 'Card',
    tokens: ['color.surface', 'shadow.medium', 'border.radius.medium'],
    platform: 'mobile',
    breaking: false,
  },
];
```

### 3. Usage Analytics

Track token adoption and usage:

```sql
-- Query token usage analytics
SELECT
  token_path,
  COUNT(*) as usage_count,
  platform,
  last_used
FROM token_usage_analytics
WHERE modified_in_pr = :pr_number
GROUP BY token_path, platform;
```

## Best Practices

### 1. Change Classification

Classify changes by impact level:

#### 🟢 Safe Changes

- Adding new tokens
- Updating descriptions/metadata
- Adding platform-specific values
- Non-visual token modifications

#### 🟡 Review Required

- Modifying existing token values
- Renaming tokens (with aliases)
- Changing token structure
- Platform-specific overrides

#### 🔴 Breaking Changes

- Removing tokens without aliases
- Changing token types
- Modifying core primitive values
- Breaking reference chains

### 2. Migration Planning

For breaking changes, provide migration paths:

```typescript
// Migration helper for breaking changes
export const tokenMigrations = {
  'v2.0.0': {
    removed: {
      'color.brand.primary': 'color.primary.500',
      'spacing.xl': 'spacing.large',
    },
    renamed: {
      'typography.body': 'typography.body.medium',
    },
    valueChanged: {
      'border.radius.default': {
        old: '4px',
        new: '6px',
        reason: 'Updated to match new design specifications',
      },
    },
  },
};
```

### 3. Rollback Strategy

Prepare for rollbacks:

```bash
# Create rollback point before changes
pnpm run tokens:snapshot -- --tag pre-release-v2.0.0

# Rollback to previous version
pnpm run tokens:rollback -- --tag pre-release-v2.0.0

# Validate rollback
pnpm run tokens:validate && pnpm test
```

### 4. Documentation Updates

Automatically update documentation:

```typescript
// Auto-generate change documentation
export function generateChangeDoc(diff: TokenDiff[]): string {
  return `
# Token Changes - ${new Date().toISOString()}

## Breaking Changes
${diff
  .filter(d => d.impact === 'breaking')
  .map(formatChange)
  .join('\n')}

## New Tokens
${diff
  .filter(d => d.type === 'added')
  .map(formatChange)
  .join('\n')}

## Migration Guide
${generateMigrationGuide(diff)}
  `;
}
```

### 5. Testing Strategy

Test token changes comprehensively:

```bash
# Visual regression testing
pnpm run test:visual -- --changed-tokens-only

# Cross-platform validation
pnpm run test:platforms -- --tokens

# Component integration tests
pnpm run test:components -- --token-changes

# Performance impact testing
pnpm run test:performance -- --baseline
```

## Integration with CI/CD

### 1. Pre-commit Hooks

Validate changes before commit:

```bash
#!/bin/sh
# .husky/pre-commit

# Check for token changes
if git diff --cached --name-only | grep -q "packages/design-tokens/"; then
  echo "🔍 Detecting token changes..."

  # Run token validation
  pnpm run tokens:validate || exit 1

  # Generate diff report
  pnpm run tokens:diff -- --staged

  # Check for breaking changes
  if pnpm run tokens:breaking-changes --silent; then
    echo "⚠️  Breaking token changes detected. Please review carefully."
    echo "📖 See DESIGN_TOKENS_MIGRATION.md for migration guidance."
  fi
fi
```

### 2. Release Automation

Automate version bumps based on token changes:

```yaml
# .github/workflows/release.yml
- name: Determine Version Bump
  id: version
  run: |
  if pnpm run tokens:breaking-changes --silent; then
      echo "bump=major" >> $GITHUB_OUTPUT
  elif pnpm run tokens:has-new-tokens --silent; then
      echo "bump=minor" >> $GITHUB_OUTPUT
    else
      echo "bump=patch" >> $GITHUB_OUTPUT
    fi

- name: Release
  run: pnpm version ${{ steps.version.outputs.bump }}
```

## Tools and Scripts

### Available Commands

```bash
pnpm run tokens:diff                    # Compare with main branch
pnpm run tokens:diff -- --format json  # JSON output
pnpm run tokens:diff -- --visual       # Generate visual diffs
pnpm run tokens:diff -- --visual       # Generate visual diffs

# Change detection
pnpm run tokens:breaking-changes        # Check for breaking changes
pnpm run tokens:has-new-tokens         # Check for new tokens
pnpm run tokens:validate-changes       # Validate all changes

# Impact analysis
pnpm run tokens:find-usage             # Find token usage in codebase
pnpm run tokens:impact-analysis        # Analyze change impact
pnpm run tokens:dependency-graph       # Generate dependency graph

# Utilities
pnpm run tokens:snapshot               # Create snapshot for rollback
pnpm run tokens:rollback               # Rollback to snapshot
pnpm run tokens:migrate                # Apply migration scripts
```

### Configuration

Configure diff behavior in `package.json`:

```json
{
  "designTokens": {
    "diff": {
      "ignorePaths": ["$description", "$extensions.internal"],
      "breakingChangeTypes": ["removed", "typeChanged", "valueChanged"],
      "platforms": ["web", "mobile", "desktop"],
      "outputFormats": ["markdown", "json", "html"]
    }
  }
}
```

## Next Steps

- [Token Governance](../quality/token-governance.md)
- [CI/CD Integration](../cicd/token-drift-check.md)
- [Change Notification Setup](../development/notifications.md)
- [Visual Testing with Loki](../quality/loki-review.md)

---

_This documentation is automatically updated when token diff strategies change._
