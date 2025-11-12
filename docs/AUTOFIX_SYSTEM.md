# 🔧 Automated Code Quality & Autofixes

This document explains the automated code quality and autofix system implemented in this Nx monorepo.

## Overview

We have implemented a **safe, non-blocking autofix system** that automatically maintains code quality without
interfering with development workflow. The system operates on three levels:

1. **🚀 CI Autofixes** - Automatic fixes applied on main branch
2. **📅 Weekly Comprehensive Fixes** - Scheduled maintenance with PR creation
3. **👨‍💻 Local Developer Autofixes** - Manual trigger for immediate fixes

## 🎯 Safe Autofix Philosophy

### What Gets Auto-Fixed ✅

- **Code formatting** (Biome, Prettier, dprint)
- **CSS/SCSS linting** (Stylelint fixes)
- **Markdown formatting** (markdownlint fixes)
- **Line length adjustments** (markdown)
- **Temporary file cleanup** (Apple/system files)
- **Whitespace normalization**

### What Doesn't Get Auto-Fixed ❌

- **Logic errors** or code bugs
- **Type errors** or compilation issues
- **Complex linting rules** that require human judgment
- **Breaking changes** to APIs or interfaces
- **Security vulnerabilities** (flagged for manual review)

## 🔄 CI Integration

### Main Branch Autofixes (`ci.yml`)

**Trigger**: Every push to `main` branch
**Behavior**: Automatic commit with fixes
**Safety**: Non-blocking - never fails the build

```yaml
# Runs after successful CI
autofix:
  if: github.ref == 'refs/heads/main'
  # Applies safe fixes and commits directly
```

**What it does:**

1. Formats code with Trunk (Biome/Prettier/dprint)
2. Fixes Stylelint CSS issues
3. Fixes markdownlint issues
4. Cleans temporary files
5. Fixes markdown line lengths
6. Commits changes with descriptive message

### Weekly Comprehensive Fixes (`autofix.yml`)

**Trigger**: Every Monday at 9 AM UTC + manual trigger
**Behavior**: Creates PR for review by default
**Safety**: All changes reviewable before merge

```yaml
# Scheduled weekly + manual trigger
weekly-autofix:
  schedule: '0 9 * * 1' # Monday 9 AM UTC
  workflow_dispatch: # Manual trigger available
```

**What it does:**

1. All CI autofix actions
2. Trunk tool upgrades
3. Comprehensive cleanup
4. Creates PR with detailed summary
5. Auto-assigns to triggering user

## 🛠️ Local Development

### Quick Autofix

```bash
# Run safe autofixes locally
pnpm autofix

# Alternative command
./scripts/autofix.sh
```

### Manual Tool Usage

```bash
# Format code
pnpm format                    # Trunk (all formatters)
pnpm -w -r format:biome    # Biome only
pnpm -w -r format:prettier # Prettier only

# Fix linting issues
pnpm -w -r lint:css        # Stylelint
pnpm -w -r lint:md         # markdownlint

# Clean temporary files
pnpm -w -r clean:apple     # Apple files
pnpm -w -r clean:temp      # Temp files
```

## 📊 Monitoring & Observability

### CI Job Summaries

Each autofix run creates a GitHub Actions summary showing:

- Number of files changed
- Types of fixes applied
- Before/after comparison
- Safety confirmation

### Example Summary

```text
🔧 Autofix Applied

Files changed: 12

### Fixed Issues
- ✅ Code formatting (Trunk/Biome/Prettier/dprint)
- ✅ CSS/SCSS linting (Stylelint)
- ✅ Markdown linting (markdownlint)
- ✅ Cleaned temporary files
- ✅ Fixed markdown line lengths

### Changed Files
package.json
src/components/Button.tsx
docs/README.md
...
```

## 🚦 Safety Mechanisms

### 1. **Non-Blocking Pipeline**

- Autofixes never cause CI to fail
- Main pipeline continues regardless of autofix status
- Uses `continue-on-error: true` for safety

### 2. **Selective Triggering**

- CI autofixes only on `main` branch pushes
- PR autofixes only on schedule/manual trigger
- No autofixes on pull requests to avoid conflicts

### 3. **Comprehensive Testing**

- All changes go through full CI after autofix
- Tests validate that fixes don't break functionality
- Manual review available for weekly PRs

### 4. **Rollback Capability**

- All autofix commits are clearly labeled
- Easy to identify and revert if needed
- Git history preserved with detailed messages

## 🔧 Configuration

### Trunk Configuration (`.trunk/trunk.yaml`)

```yaml
lint:
  enabled:
    - eslint@9.29.0:
        config_path: eslint.config.js
    - biome@2.0.4
    - prettier@3.5.3:
        include: ['**/*.html', '**/*.astro']
    - stylelint@16.21.0:
        include: ['**/*.{css,scss,sass}']
    - markdownlint-cli2@0.18.1

actions:
  enabled:
    - trunk-fmt-pre-commit # Local formatting
    - trunk-check-pre-push # Local validation
```

### Nx Target Configuration

```json
{
  "format": {
    "executor": "nx:run-commands",
    "options": {
      "command": "trunk fmt --fix"
    },
    "configurations": {
      "check": {
        "command": "trunk fmt --no-fix --print-failures"
      }
    }
  }
}
```

## 📈 Benefits

### For Developers

- **Zero maintenance** - Code stays formatted automatically
- **Consistent style** - No more format arguments in PRs
- **Clean history** - Less noise from formatting commits
- **Fast feedback** - Issues caught and fixed immediately

### For Code Quality

- **Continuous improvement** - Code quality never degrades
- **Standardization** - Consistent formatting across team
- **Reduced debt** - Technical debt cleaned automatically
- **Focus on logic** - Less time on formatting, more on features

### For CI/CD

- **Faster builds** - Pre-formatted code builds faster
- **Fewer failures** - Style issues caught before CI
- **Cleaner PRs** - No formatting noise in diffs
- **Automated maintenance** - Self-healing codebase

## 🔮 Advanced Usage

### Manual Weekly Trigger

```bash
# Trigger weekly autofix with PR creation
gh workflow run autofix.yml -f create_pr=true
```

### Disable Autofixes Temporarily

```bash
# Skip CI autofix (commit message)
git commit -m "feat: new feature [skip autofix]"

# Or via workflow file (temporarily)
# Comment out the autofix job in .github/workflows/ci.yml
```

### Custom Autofix Rules

Edit `scripts/autofix.sh` to add project-specific autofix rules:

```bash
# Add custom fixes
echo "  🎯 Custom project fixes..."
# Your custom commands here
```

## 🆘 Troubleshooting

### Autofix Job Failing

1. Check GitHub Actions logs
2. Run `pnpm autofix` locally to reproduce
3. Check tool configurations (eslint.config.js, biome.json, etc.)
4. Verify all dependencies are installed

### Conflicting Formatters

1. Check `.trunk/trunk.yaml` includes/excludes
2. Verify tool precedence in `scripts/autofix.sh`
3. Run individual formatters to isolate issues

### Too Many Changes

1. Review weekly PR carefully
2. Consider splitting large changes
3. Adjust autofix frequency if needed

## 📚 Related Documentation

- [Code Quality Audit Complete](./CODE_QUALITY_AUDIT_COMPLETE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

🤖 **This autofix system is designed to be invisible when working well, and helpful when things need fixing.**
