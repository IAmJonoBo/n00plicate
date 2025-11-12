# Advanced Contributor Onboarding Guide

Comprehensive onboarding guide for contributors to the n00plicate design system, covering advanced workflows,\
tooling integration, and best practices for maintaining design-development consistency.

## Table of Contents

- [Quick Start Checklist](#quick-start-checklist)
- [Development Environment Setup](#development-environment-setup)
- [Advanced Workflow Integration](#advanced-workflow-integration)
- [Design Token Contribution](#design-token-contribution)
- [Quality Gates and Reviews](#quality-gates-and-reviews)
- [Troubleshooting Guide](#troubleshooting-guide)

## Quick Start Checklist

### Prerequisites Verification

```bash
#!/bin/bash
# scripts/verify-prerequisites.sh

echo "🔍 Verifying contributor prerequisites..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required. Current: $(node -v)"
  echo "📥 Install from: https://nodejs.org/"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm is required"
  echo "📥 Install: corepack enable && corepack prepare pnpm@latest --activate"
  exit 1
fi
echo "✅ pnpm $(pnpm -v)"

# Check Git configuration
if ! git config user.name &> /dev/null; then
  echo "❌ Git user.name not configured"
  echo "🔧 Configure: git config --global user.name 'Your Name'"
  exit 1
fi

if ! git config user.email &> /dev/null; then
  echo "❌ Git user.email not configured"
  echo "🔧 Configure: git config --global user.email 'your.email@domain.com'"
  exit 1
fi
echo "✅ Git configured for $(git config user.name)"

# Check for recommended tools
RECOMMENDED_TOOLS=("code" "docker" "brew")
for tool in "${RECOMMENDED_TOOLS[@]}"; do
  if command -v "$tool" &> /dev/null; then
    echo "✅ $tool available"
  else
    echo "⚠️  $tool recommended but not found"
  fi
done

echo ""
echo "🎉 Prerequisites check complete!"
```

### 30-Minute Setup Script

```bash
#!/bin/bash
# scripts/contributor-setup.sh

set -e

echo "🚀 n00plicate Design System - Contributor Setup"
echo "This will set up your development environment in ~30 minutes"
echo ""

# Confirm setup
read -p "Continue with automated setup? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
  echo "Setup cancelled"
  exit 0
fi

echo ""
echo "📋 Step 1/7: Verifying prerequisites..."
bash scripts/verify-prerequisites.sh

echo ""
echo "📦 Step 2/7: Installing dependencies..."
pnpm install --frozen-lockfile
echo "✅ Dependencies installed"

echo ""
echo "🛠️ Step 3/7: Setting up development tools..."

# Install VS Code extensions if VS Code is available
if command -v code &> /dev/null; then
  echo "Installing VS Code extensions..."

  extensions=(
    "ms-vscode.vscode-typescript-next"
    "bradlc.vscode-tailwindcss"
    "esbenp.prettier-vscode"
    "nx-console.nx-console"
    "unifiedjs.vscode-mdx"
    "ms-playwright.playwright"
    "github.copilot"
    "github.copilot-chat"
  )

  for ext in "${extensions[@]}"; do
    code --install-extension "$ext" --force
  done

  echo "✅ VS Code extensions installed"
fi

# Setup Git hooks
echo "Setting up Git hooks..."
pnpm husky install
echo "✅ Git hooks configured"

echo ""
echo "⚙️ Step 4/7: Configuring environment..."

# Copy environment template
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "📝 Created .env.local from template"
fi

# Setup development certificates (if needed)
if [ ! -f "certs/localhost.pem" ]; then
  mkdir -p certs

  if command -v mkcert &> /dev/null; then
    cd certs
    mkcert localhost 127.0.0.1 ::1
    cd ..
    echo "✅ Development certificates created"
  else
    echo "⚠️  mkcert not found - HTTPS development will use self-signed certs"
  fi
fi

echo ""
echo "🏗️ Step 5/7: Building core packages..."

# Build design tokens first (required by everything else)
echo "Building design tokens..."
pnpm run build:design-tokens
echo "✅ Design tokens built"

# Build shared utilities
echo "Building shared utilities..."
pnpm run build:shared-utils
echo "✅ Shared utilities built"

echo ""
echo "🧪 Step 6/7: Running initial tests..."
pnpm --filter design-tokens test
pnpm --filter design-system test
echo "✅ Initial tests passed"

echo ""
echo "📚 Step 7/7: Setting up Storybook..."
pnpm --filter design-system build-storybook
echo "✅ Storybook built"

echo ""
echo "🎉 Setup complete! Here's what you can do now:"
echo ""
echo "🚀 Start development:"
echo "  pnpm dev                    # Start all development servers"
echo "  pnpm --filter design-system storybook  # Open Storybook"
echo ""
echo "🧪 Run tests:"
echo "  pnpm test                   # Run all tests"
echo "  pnpm --filter design-system test  # Test specific project"
echo ""
echo "🔧 Build and lint:"
echo "  pnpm build                  # Build all packages"
echo "  pnpm lint                   # Lint codebase"
echo "  pnpm format                 # Format code"
echo ""
echo "📖 Learn more:"
echo "  docs/                       # Documentation"
echo "  CONTRIBUTING.md             # Contribution guidelines"
echo ""
echo "Need help? Check docs/troubleshooting.md or ask in #design-system"
echo ""
echo "Happy contributing! 🎨"
```

## Development Environment Setup

### VS Code Workspace Configuration

```json
{
  "folders": [
    {
      "name": "🎨 n00plicate Design System",
      "path": "."
    }
  ],
  "settings": {
    // Editor settings
    "editor.formatOnSave": true,
    "editor.formatOnPaste": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true,
      "source.organizeImports": true
    },
    "editor.rulers": [80, 120],
    "editor.wordWrap": "bounded",
    "editor.wordWrapColumn": 120,

    // File associations
    "files.associations": {
      "*.css": "css",
      "*.scss": "scss",
      "*.json": "jsonc"
    },

    // Search exclusions
    "search.exclude": {
      "**/node_modules": true,
      "**/dist": true,
      "**/coverage": true,
      "**/.storybook-static": true
    },

    // Language-specific settings
    "typescript.preferences.useAliasesForRenames": false,
    "typescript.preferences.includePackageJsonAutoImports": "on",
    "typescript.suggest.autoImports": true,

  // Workspace Console settings (Nx removed)

    // Design token specific
    "css.validate": true,
    "scss.validate": true,
    "less.validate": false,

    // Prettier integration
    "prettier.requireConfig": true,
    "prettier.useEditorConfig": false,

    // ESLint integration
    "eslint.workingDirectories": [
      "packages/design-tokens",
      "packages/design-system",
      "packages/shared-utils"
    ],

    // File watching
    "files.watcherExclude": {
      "**/node_modules/**": true,
      "**/dist/**": true
    }
  },

  "extensions": {
    "recommendations": [
      "ms-vscode.vscode-typescript-next",
      "bradlc.vscode-tailwindcss",
  "esbenp.prettier-vscode",
      "unifiedjs.vscode-mdx",
      "ms-playwright.playwright",
      "github.copilot",
      "github.copilot-chat",
      "streetsidesoftware.code-spell-checker",
      "yzhang.markdown-all-in-one",
      "shd101wyy.markdown-preview-enhanced"
    ]
  },

  "tasks": {
    "version": "2.0.0",
    "tasks": [
      {
        "label": "🚀 Start Development",
        "type": "shell",
        "command": "pnpm dev",
        "group": "build",
        "presentation": {
          "echo": true,
          "reveal": "always",
          "focus": false,
          "panel": "shared",
          "showReuseMessage": true
        },
        "problemMatcher": []
      },
      {
        "label": "📚 Open Storybook",
        "type": "shell",
  "command": "pnpm --filter @n00plicate/design-system run storybook",
        "group": "build",
        "presentation": {
          "echo": true,
          "reveal": "always",
          "focus": false,
          "panel": "shared"
        }
      },
      {
        "label": "🧪 Run All Tests",
        "type": "shell",
        "command": "pnpm test",
        "group": "test",
        "presentation": {
          "echo": true,
          "reveal": "always",
          "focus": false,
          "panel": "shared"
        }
      },
      {
        "label": "🔧 Build All Packages",
        "type": "shell",
        "command": "pnpm build",
        "group": "build",
        "presentation": {
          "echo": true,
          "reveal": "always",
          "focus": false,
          "panel": "shared"
        }
      },
      {
        "label": "💄 Format & Lint",
        "type": "shell",
        "command": "pnpm format && pnpm lint",
        "group": "build",
        "presentation": {
          "echo": true,
          "reveal": "always",
          "focus": false,
          "panel": "shared"
        }
      }
    ]
  },

  "launch": {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "🐛 Debug Design System Tests",
        "type": "node",
        "request": "launch",
        "program": "${workspaceFolder}/node_modules/.bin/nx",
        "args": ["test", "design-system", "--watch"],
        "console": "integratedTerminal",
        "internalConsoleOptions": "neverOpen"
      },
      {
        "name": "📚 Debug Storybook",
        "type": "node",
        "request": "launch",
        "program": "${workspaceFolder}/node_modules/.bin/nx",
        "args": ["storybook", "design-system"],
        "console": "integratedTerminal",
        "env": {
          "NODE_OPTIONS": "--inspect=9229"
        }
      }
    ]
  }
}
```

### Advanced Git Configuration

```bash
# scripts/setup-git-workflow.sh
#!/bin/bash

echo "🔧 Setting up advanced Git workflow..."

# Configure Git for better commit experience
git config core.autocrlf false
git config pull.rebase true
git config push.default simple
git config branch.autosetuprebase always

# Install helpful Git aliases
git config alias.co checkout
git config alias.br branch
git config alias.ci commit
git config alias.st status
git config alias.unstage 'reset HEAD --'
git config alias.last 'log -1 HEAD'
git config alias.visual '!gitk'

# Design system specific aliases
git config alias.token-diff 'diff --no-index packages/design-tokens/dist/'
git config alias.component-log 'log --oneline --grep="feat\\|fix" -- packages/design-system/'
git config alias.breaking-changes 'log --oneline --grep="BREAKING"'

# Setup commit message template
cat > .gitmessage << 'EOF'
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# Type should be one of the following:
# * feat: A new feature
# * fix: A bug fix
# * docs: Documentation only changes
# * style: Changes that do not affect the meaning of the code
# * refactor: A code change that neither fixes a bug nor adds a feature
# * perf: A code change that improves performance
# * test: Adding missing tests or correcting existing tests
# * build: Changes that affect the build system or external dependencies
# * ci: Changes to our CI configuration files and scripts
# * chore: Other changes that don't modify src or test files
# * revert: Reverts a previous commit
# * tokens: Design token related changes

# Scope should be one of:
# * design-tokens: Changes to token definitions or build process
# * design-system: Changes to component library
# * docs: Documentation changes
# * ci: CI/CD changes
# * deps: Dependency updates

# Subject line should:
# * Use imperative mood ("add" not "added" or "adds")
# * Not capitalize first letter
# * Not end with a period
# * Be no more than 50 characters

# Body should include:
# * Motivation for the change
# * Comparison with previous behavior

# Footer should include:
# * Breaking changes (start line with "BREAKING CHANGE:")
# * Reference issues and pull requests
EOF

git config commit.template .gitmessage

echo "✅ Git workflow configured"
```

## Advanced Workflow Integration

### AI-Assisted Development Setup

```typescript
// tools/ai/ollama-integration.ts
import { spawn, execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface AIPrompt {
  type: 'component' | 'token' | 'story' | 'test';
  context: string;
  requirements: string[];
  constraints?: string[];
}

export class OllamaDesignAssistant {
  private modelName = 'llama3';

  async isAvailable(): Promise<boolean> {
    try {
      execSync('ollama --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async ensureModelInstalled(): Promise<void> {
    try {
      const output = execSync(`ollama list | grep ${this.modelName}`, {
        encoding: 'utf-8',
      });
      if (!output.includes(this.modelName)) {
        console.log(`📥 Installing ${this.modelName} model...`);
        execSync(`ollama pull ${this.modelName}`, { stdio: 'inherit' });
      }
    } catch {
      console.log(`📥 Installing ${this.modelName} model...`);
      execSync(`ollama pull ${this.modelName}`, { stdio: 'inherit' });
    }
  }

  async generateComponent(prompt: AIPrompt): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(prompt.type);
    const userPrompt = this.buildUserPrompt(prompt);

    const fullPrompt = `${systemPrompt}\n\nUser Request:\n${userPrompt}`;

    return this.queryOllama(fullPrompt);
  }

  private buildSystemPrompt(type: string): string {
    const basePrompt = `You are an expert in design systems and React component development. 
Follow these principles:
- Use TypeScript with strict typing
- Follow atomic design principles
- Implement accessibility best practices
- Use design tokens for all styling
- Include comprehensive JSDoc comments
- Write testable, maintainable code`;

    switch (type) {
      case 'component':
        return `${basePrompt}
        
Create React components that:
- Use forwardRef for DOM element access
- Support all native HTML attributes via props spreading
- Include proper ARIA attributes
- Use CSS modules or styled-components with design tokens
- Export both named and default exports`;

      case 'token':
        return `${basePrompt}
        
Create design tokens that:
- Follow DTCG specification
- Include semantic and alias tokens
- Provide comprehensive documentation
- Consider dark mode and accessibility
- Include usage examples`;

      case 'story':
        return `${basePrompt}
        
Create Storybook stories that:
- Include all component variants
- Demonstrate accessibility features
- Include interaction tests with @storybook/test
- Show responsive behavior
- Include design documentation`;

      case 'test':
        return `${basePrompt}
        
Create comprehensive tests that:
- Test component behavior, not implementation
- Include accessibility testing with jest-axe
- Test keyboard navigation
- Test responsive behavior
- Include visual regression tests`;

      default:
        return basePrompt;
    }
  }

  private buildUserPrompt(prompt: AIPrompt): string {
    let userPrompt = `Context: ${prompt.context}\n\n`;

    if (prompt.requirements.length > 0) {
      userPrompt += `Requirements:\n${prompt.requirements.map(req => `- ${req}`).join('\n')}\n\n`;
    }

    if (prompt.constraints && prompt.constraints.length > 0) {
      userPrompt += `Constraints:\n${prompt.constraints.map(con => `- ${con}`).join('\n')}\n\n`;
    }

    // Add current design tokens context
    const tokensPath = 'packages/design-tokens/dist/tokens.json';
    if (existsSync(tokensPath)) {
      const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));
      userPrompt += `Available Design Tokens (use these for styling):\n`;
      userPrompt += `Colors: ${Object.keys(tokens.color || {}).join(', ')}\n`;
      userPrompt += `Spacing: ${Object.keys(tokens.spacing || {}).join(', ')}\n`;
      userPrompt += `Typography: ${Object.keys(tokens.typography || {}).join(', ')}\n\n`;
    }

    return userPrompt;
  }

  private async queryOllama(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ollama = spawn('ollama', ['run', this.modelName], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      ollama.stdout.on('data', data => {
        output += data.toString();
      });

      ollama.stderr.on('data', data => {
        error += data.toString();
      });

      ollama.on('close', code => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Ollama process failed: ${error}`));
        }
      });

      // Send the prompt
      ollama.stdin.write(prompt);
      ollama.stdin.end();
    });
  }

  async scaffoldComponent(name: string, type: string): Promise<void> {
    console.log(`🤖 AI scaffolding ${type} component: ${name}`);

    const prompt: AIPrompt = {
      type: 'component',
      context: `Create a ${type} component named ${name} for a design system`,
      requirements: [
        'TypeScript with proper interfaces',
        'Accessible by default',
        'Uses design tokens for styling',
        'Includes proper documentation',
        'Follows atomic design principles',
      ],
      constraints: [
        'Must support ref forwarding',
        'Must spread native HTML attributes',
        'Must include ARIA attributes where appropriate',
      ],
    };

    try {
      await this.ensureModelInstalled();
      const componentCode = await this.generateComponent(prompt);

      // Save generated component
      const componentPath = join('packages/design-system/src/components', name);
      if (!existsSync(componentPath)) {
        execSync(`mkdir -p ${componentPath}`);
      }

      writeFileSync(join(componentPath, `${name}.tsx`), componentCode);

      // Generate accompanying files
      await this.generateStory(name, componentCode);
      await this.generateTest(name, componentCode);

      console.log(`✅ Component ${name} scaffolded successfully`);
      console.log(`📝 Review and refine the generated code before committing`);
    } catch (error) {
      console.error(`❌ Failed to scaffold component: ${error.message}`);
    }
  }

  private async generateStory(
    name: string,
    componentCode: string
  ): Promise<void> {
    const prompt: AIPrompt = {
      type: 'story',
      context: `Create comprehensive Storybook stories for this component:\n\n${componentCode}`,
      requirements: [
        'Include all variants and states',
        'Add interaction tests',
        'Show accessibility features',
        'Include design documentation',
      ],
    };

    const storyCode = await this.generateComponent(prompt);
    const storyPath = join(
      'packages/design-system/src/components',
      name,
      `${name}.stories.tsx`
    );
    writeFileSync(storyPath, storyCode);
  }

  private async generateTest(
    name: string,
    componentCode: string
  ): Promise<void> {
    const prompt: AIPrompt = {
      type: 'test',
      context: `Create comprehensive tests for this component:\n\n${componentCode}`,
      requirements: [
        'Test component behavior',
        'Include accessibility tests',
        'Test keyboard navigation',
        'Test responsive behavior',
      ],
    };

    const testCode = await this.generateComponent(prompt);
    const testPath = join(
      'packages/design-system/src/components',
      name,
      `${name}.test.tsx`
    );
    writeFileSync(testPath, testCode);
  }
}

// CLI integration
if (require.main === module) {
  const assistant = new OllamaDesignAssistant();

  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'scaffold':
      const [name, type = 'atom'] = args;
      if (!name) {
        console.error(
          'Usage: tsx tools/ai/ollama-integration.ts scaffold <ComponentName> [type]'
        );
        process.exit(1);
      }
      assistant.scaffoldComponent(name, type);
      break;

    case 'check':
      assistant.isAvailable().then(available => {
        console.log(
          `Ollama ${available ? '✅ available' : '❌ not available'}`
        );
      });
      break;

    default:
      console.log('Available commands:');
      console.log(
        '  scaffold <ComponentName> [type] - Scaffold a new component'
      );
      console.log(
        '  check                          - Check if Ollama is available'
      );
  }
}
```

### Biome + dprint Integration

```toml
# .trunk/trunk.yaml
version: 0.1
cli:
  version: 1.22.2

plugins:
  sources:
    - id: trunk
      ref: v1.6.0
      uri: https://github.com/trunk-io/plugins

runtimes:
  enabled:
    - node@20.9.0
    - python@3.11.5

actions:
  disabled:
    - trunk-announce
    - trunk-check-pre-push
    - trunk-fmt-pre-commit
  enabled:
    - trunk-upgrade-available

lint:
  enabled:
    # JavaScript/TypeScript
    - biome@1.8.3
    - eslint@8.57.0
    - prettier@3.3.2

    # Documentation
    - dprint@0.45.1
    - markdownlint@0.41.0

    # Security
    - semgrep@1.77.0
    - trufflehog@3.78.2

    # Configuration
    - taplo@0.8.1  # TOML formatter
    - yamllint@1.35.1

    # Design specific
    - stylelint@16.6.1

  ignore:
    - linters: [ALL]
      paths:
        - node_modules/
        - dist/
        - .nx/
        - coverage/
        - storybook-static/

tools:
  enabled:
    - node@20.9.0
    - npm@10.1.0
    - pnpm@9.4.0

repos:
  trunk:
    ref: v1.6.0
```

```json
{
  "dprint": {
    "incremental": true,
    "typescript": {
      "indentWidth": 2,
      "lineWidth": 120,
      "useTabs": false,
      "semiColons": "always",
      "quoteStyle": "alwaysSingle",
      "nextControlFlowPosition": "nextLine",
      "operatorPosition": "nextLine"
    },
    "json": {
      "indentWidth": 2,
      "useTabs": false
    },
    "markdown": {
      "lineWidth": 120,
      "textWrap": "always"
    },
    "toml": {
      "indentWidth": 2,
      "useTabs": false
    },
    "dockerfile": {},
    "includes": ["**/*.{ts,tsx,js,jsx,json,md,toml,dockerfile}"],
    "excludes": [
      "node_modules/",
      "dist/",
      ".nx/",
      "coverage/",
      "storybook-static/",
      "CHANGELOG.md"
    ],
    "plugins": [
      "https://plugins.dprint.dev/typescript-0.91.1.wasm",
      "https://plugins.dprint.dev/json-0.19.3.wasm",
      "https://plugins.dprint.dev/markdown-0.17.2.wasm",
      "https://plugins.dprint.dev/toml-0.6.2.wasm",
      "https://plugins.dprint.dev/dockerfile-0.3.2.wasm"
    ]
  }
}
```

## Design Token Contribution

### Token Contribution Workflow

```typescript
// tools/contribution/token-workflow.ts
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TokenContribution {
  type: 'new' | 'modify' | 'deprecate';
  category: 'color' | 'spacing' | 'typography' | 'border' | 'shadow';
  name: string;
  value: any;
  description: string;
  reasoning: string;
  breaking: boolean;
}

export class TokenContributionWorkflow {
  async validateContribution(
    contribution: TokenContribution
  ): Promise<string[]> {
    const errors: string[] = [];

    // Naming validation
    if (!this.validateNaming(contribution.name, contribution.category)) {
      errors.push(
        `Invalid naming pattern for ${contribution.category}: ${contribution.name}`
      );
    }

    // Value validation
    if (!this.validateValue(contribution.value, contribution.category)) {
      errors.push(
        `Invalid value for ${contribution.category}: ${contribution.value}`
      );
    }

    // Semantic validation
    if (!this.validateSemantics(contribution)) {
      errors.push(`Token doesn't follow semantic naming conventions`);
    }

    // Breaking change validation
    if (contribution.breaking && !this.validateBreakingChange(contribution)) {
      errors.push(`Breaking change not properly justified`);
    }

    return errors;
  }

  private validateNaming(name: string, category: string): boolean {
    const patterns = {
      color:
        /^(color-)?(base|semantic|surface|text|border|action|feedback|overlay)-/,
      spacing: /^(spacing-|space-)(xs|sm|md|lg|xl|2xl|3xl|\d+)$/,
      typography: /^(font-)?(size|weight|family|height|spacing)-/,
      border: /^border-(width|radius|style)-/,
      shadow: /^shadow-(xs|sm|md|lg|xl|inner)$/,
    };

    return patterns[category]?.test(name) || false;
  }

  private validateValue(value: any, category: string): boolean {
    switch (category) {
      case 'color':
        return (
          /^#[0-9A-Fa-f]{6}$/.test(value) ||
          /^rgb\(\d+,\s*\d+,\s*\d+\)$/.test(value) ||
          /^hsl\(\d+,\s*\d+%,\s*\d+%\)$/.test(value)
        );

      case 'spacing':
        return /^\d+(\.\d+)?(px|rem|em)$/.test(value);

      case 'typography':
        if (typeof value === 'object') {
          return value.fontSize && value.lineHeight;
        }
        return /^\d+(\.\d+)?(px|rem|em)$/.test(value);

      default:
        return true;
    }
  }

  private validateSemantics(contribution: TokenContribution): boolean {
    // Check if token follows semantic naming
    const semanticKeywords = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'info',
      'surface',
      'background',
      'foreground',
      'subtle',
      'muted',
      'emphasis',
    ];

    return semanticKeywords.some(keyword =>
      contribution.name.toLowerCase().includes(keyword)
    );
  }

  private validateBreakingChange(contribution: TokenContribution): boolean {
    // Breaking changes require detailed reasoning
    return (
      contribution.reasoning.length > 50 &&
      contribution.reasoning.toLowerCase().includes('breaking')
    );
  }

  async applyContribution(contribution: TokenContribution): Promise<void> {
    console.log(`🎨 Applying token contribution: ${contribution.name}`);

    // Validate first
    const errors = await this.validateContribution(contribution);
    if (errors.length > 0) {
      throw new Error(`Validation failed:\n${errors.join('\n')}`);
    }

    // Apply the token change
    const tokensPath = `packages/design-tokens/tokens/${contribution.category}.json`;
    let tokens = {};

    if (existsSync(tokensPath)) {
      tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));
    }

    switch (contribution.type) {
      case 'new':
        this.addToken(tokens, contribution);
        break;
      case 'modify':
        this.modifyToken(tokens, contribution);
        break;
      case 'deprecate':
        this.deprecateToken(tokens, contribution);
        break;
    }

    // Save updated tokens
    writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));

    // Rebuild tokens
  execSync('pnpm run build:design-tokens', { stdio: 'inherit' });

    // Run validation suite
    await this.runValidationSuite(contribution);

    console.log(`✅ Token contribution applied successfully`);
  }

  private addToken(tokens: any, contribution: TokenContribution): void {
    const path = contribution.name.split('-');
    let current = tokens;

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    current[path[path.length - 1]] = {
      $value: contribution.value,
      $description: contribution.description,
      $type: this.getTokenType(contribution.category),
    };
  }

  private modifyToken(tokens: any, contribution: TokenContribution): void {
    // Find and update existing token
    const path = contribution.name.split('-');
    let current = tokens;

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        throw new Error(`Token path not found: ${contribution.name}`);
      }
      current = current[path[i]];
    }

    const tokenName = path[path.length - 1];
    if (!current[tokenName]) {
      throw new Error(`Token not found: ${contribution.name}`);
    }

    current[tokenName].$value = contribution.value;
    current[tokenName].$description = contribution.description;
  }

  private deprecateToken(tokens: any, contribution: TokenContribution): void {
    // Mark token as deprecated
    const path = contribution.name.split('-');
    let current = tokens;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    const tokenName = path[path.length - 1];
    current[tokenName].$deprecated = true;
    current[tokenName].$deprecationReason = contribution.reasoning;
  }

  private getTokenType(category: string): string {
    const typeMap = {
      color: 'color',
      spacing: 'dimension',
      typography: 'typography',
      border: 'border',
      shadow: 'shadow',
    };

    return typeMap[category] || 'other';
  }

  private async runValidationSuite(
    contribution: TokenContribution
  ): Promise<void> {
    console.log('🧪 Running validation suite...');

    // Run token schema validation
  execSync('pnpm --filter design-tokens run validate', { stdio: 'inherit' });

    // Run component tests to ensure no breakage
  execSync('pnpm --filter design-system test', { stdio: 'inherit' });

    // Build Storybook to validate visual changes
  execSync('pnpm --filter design-system build-storybook', { stdio: 'inherit' });

    console.log('✅ Validation suite passed');
  }

  async createContributionPR(contribution: TokenContribution): Promise<void> {
    const branchName = `token/${contribution.type}-${contribution.name.replace(/[^a-zA-Z0-9]/g, '-')}`;

    // Create feature branch
    execSync(`git checkout -b ${branchName}`);

    // Apply contribution
    await this.applyContribution(contribution);

    // Commit changes
    const commitMessage = this.generateCommitMessage(contribution);
    execSync('git add .');
    execSync(`git commit -m "${commitMessage}"`);

    // Push branch
    execSync(`git push origin ${branchName}`);

    console.log(`🚀 Created PR branch: ${branchName}`);
    console.log(
      `📝 Create PR with title: ${this.generatePRTitle(contribution)}`
    );
  }

  private generateCommitMessage(contribution: TokenContribution): string {
    const type = contribution.breaking ? 'tokens!' : 'tokens';
    const scope = contribution.category;
    const action = {
      new: 'add',
      modify: 'update',
      deprecate: 'deprecate',
    }[contribution.type];

    return `${type}(${scope}): ${action} ${contribution.name}\n\n${contribution.reasoning}`;
  }

  private generatePRTitle(contribution: TokenContribution): string {
    const action = {
      new: 'Add',
      modify: 'Update',
      deprecate: 'Deprecate',
    }[contribution.type];

    return `${action} ${contribution.category} token: ${contribution.name}`;
  }
}
```

## Quality Gates and Reviews

### Automated Quality Checks

```typescript
// tools/quality/quality-gates.ts
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

interface QualityGate {
  name: string;
  description: string;
  check: () => Promise<boolean>;
  required: boolean;
  errorMessage?: string;
}

export class QualityGateRunner {
  private gates: QualityGate[] = [
    {
      name: 'Token Schema Validation',
      description: 'Validates all design tokens against JSON schema',
      required: true,
      check: async () => {
        try {
          execSync('pnpm --filter design-tokens run validate', {
            stdio: 'pipe',
          });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage:
        'Design token schema validation failed. Check token structure and naming.',
    },

    {
      name: 'Component Tests',
      description: 'Runs all component unit tests',
      required: true,
      check: async () => {
        try {
          execSync('pnpm --filter design-system test --passWithNoTests', {
            stdio: 'pipe',
          });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage:
        'Component tests failed. Fix failing tests before proceeding.',
    },

    {
      name: 'Accessibility Tests',
      description: 'Validates WCAG compliance',
      required: true,
      check: async () => {
        try {
          execSync('pnpm --filter design-system run test:a11y', { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage:
        'Accessibility tests failed. Ensure components meet WCAG 2.1 AA standards.',
    },

    {
      name: 'Visual Regression Tests',
      description: 'Checks for unintended visual changes',
      required: false,
      check: async () => {
        try {
          execSync('pnpm --filter design-system run test:visual', { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage:
        'Visual regression detected. Review changes in Loki diff report.',
    },

    {
      name: 'Bundle Size Check',
      description: 'Ensures bundle size is within limits',
      required: true,
      check: async () => {
        try {
          const report = execSync(
            'pnpm --filter @n00plicate/design-system run analyze-bundle --json',
            { encoding: 'utf-8' }
          );
          const bundleData = JSON.parse(report);
          return bundleData.gzippedSize < 50000; // 50KB limit
        } catch {
          return false;
        }
      },
      errorMessage:
        'Bundle size exceeds 50KB limit. Optimize components or split bundles.',
    },

    {
      name: 'Performance Benchmarks',
      description: 'Validates component performance metrics',
      required: false,
      check: async () => {
        try {
          execSync('pnpm --filter design-system run benchmark', { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage:
        'Performance benchmarks failed. Check component render times.',
    },

    {
      name: 'Security Audit',
      description: 'Scans for security vulnerabilities',
      required: true,
      check: async () => {
        try {
          execSync('pnpm audit --audit-level moderate', { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      },
      errorMessage: 'Security vulnerabilities detected. Run pnpm audit fix.',
    },

    {
      name: 'License Compliance',
      description: 'Validates all dependencies have compatible licenses',
      required: true,
      check: async () => {
        try {
          execSync(
            'pnpm dlx license-checker --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC"',
            { stdio: 'pipe' }
          );
          return true;
        } catch {
          return false;
        }
      },
      errorMessage:
        'Non-compatible licenses detected. Review dependency licenses.',
    },
  ];

  async runAll(): Promise<boolean> {
    console.log('🚪 Running quality gates...\n');

    let allPassed = true;
    const results = [];

    for (const gate of this.gates) {
      console.log(`🔍 ${gate.name}...`);

      const startTime = Date.now();
      const passed = await gate.check();
      const duration = Date.now() - startTime;

      results.push({
        name: gate.name,
        passed,
        required: gate.required,
        duration,
        errorMessage: gate.errorMessage,
      });

      if (passed) {
        console.log(`  ✅ Passed (${duration}ms)`);
      } else {
        console.log(`  ❌ Failed (${duration}ms)`);
        if (gate.errorMessage) {
          console.log(`     ${gate.errorMessage}`);
        }

        if (gate.required) {
          allPassed = false;
        }
      }

      console.log('');
    }

    // Generate detailed report
    this.generateReport(results);

    // Summary
    const required = results.filter(r => r.required);
    const requiredPassed = required.filter(r => r.passed);

    console.log('📊 Quality Gate Summary:');
    console.log(
      `   Required: ${requiredPassed.length}/${required.length} passed`
    );
    console.log(
      `   Optional: ${results.filter(r => !r.required && r.passed).length}/${results.filter(r => !r.required).length} passed`
    );
    console.log(
      `   Total Duration: ${results.reduce((sum, r) => sum + r.duration, 0)}ms`
    );

    if (allPassed) {
      console.log('\n🎉 All required quality gates passed!');
    } else {
      console.log(
        '\n❌ Some required quality gates failed. Fix issues before proceeding.'
      );
    }

    return allPassed;
  }

  private generateReport(results: any[]): void {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        required: results.filter(r => r.required).length,
        requiredPassed: results.filter(r => r.required && r.passed).length,
      },
      gates: results,
      recommendations: this.generateRecommendations(results),
    };

    writeFileSync('quality-gate-report.json', JSON.stringify(report, null, 2));

    // Also generate markdown report for PR comments
    const markdown = this.generateMarkdownReport(report);
    writeFileSync('quality-gate-report.md', markdown);
  }

  private generateRecommendations(results: any[]): string[] {
    const recommendations = [];

    const failedRequired = results.filter(r => r.required && !r.passed);
    if (failedRequired.length > 0) {
      recommendations.push(
        '🚨 Address all required quality gate failures before merging'
      );
    }

    const slowGates = results.filter(r => r.duration > 30000); // 30 seconds
    if (slowGates.length > 0) {
      recommendations.push(
        '⚡ Optimize slow quality gates to improve CI performance'
      );
    }

    const failedOptional = results.filter(r => !r.required && !r.passed);
    if (failedOptional.length > 0) {
      recommendations.push(
        '💡 Consider addressing optional quality gate failures for better quality'
      );
    }

    return recommendations;
  }

  private generateMarkdownReport(report: any): string {
    return `# Quality Gate Report

Generated: ${report.timestamp}

## Summary

| Metric | Count |
|--------|-------|
| Total Gates | ${report.summary.total} |
| ✅ Passed | ${report.summary.passed} |
| ❌ Failed | ${report.summary.failed} |
| 🔴 Required | ${report.summary.required} |
| ✅ Required Passed | ${report.summary.requiredPassed} |

## Gate Results

${report.gates
  .map(
    gate => `
### ${gate.passed ? '✅' : '❌'} ${gate.name} ${gate.required ? '(Required)' : '(Optional)'}

- **Duration**: ${gate.duration}ms
${gate.passed ? '' : `- **Error**: ${gate.errorMessage || 'No error message'}`}
`
  )
  .join('\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}
`;
  }
}

// Pre-commit hook integration
if (require.main === module) {
  const runner = new QualityGateRunner();

  runner.runAll().then(passed => {
    process.exit(passed ? 0 : 1);
  });
}
```

This comprehensive contributor onboarding guide provides everything needed for new contributors to quickly\
become productive with the advanced n00plicate design system workflows. It includes automated setup scripts,\
AI-assisted development tools, quality gates, and complete workflow integration guidance.
