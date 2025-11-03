# Advanced Development Workflows

Comprehensive development workflows for the n00plicate monorepo, covering local development setup, hot reload optimization,\
debugging strategies, and contributor onboarding automation.

## Local Development Setup

### Automated Development Environment

```bash
#!/bin/bash
# scripts/setup-dev-environment.sh

set -e

echo "🚀 Setting up n00plicate development environment..."

# Check system requirements
check_requirements() {
  echo "📋 Checking system requirements..."

  # Node.js version check
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
  fi

  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ required. Current: $(node -v)"
    exit 1
  fi

  # Git check
  if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed"
    exit 1
  fi

  echo "✅ System requirements met"
}

# Install dependencies with optimization
install_dependencies() {
  echo "📦 Installing dependencies..."

  # Clean install with frozen lockfile
  npm ci --prefer-offline --no-audit

  # Install git hooks
  npx husky install

  echo "✅ Dependencies installed"
}

# Setup development tools
setup_dev_tools() {
  echo "🛠️ Setting up development tools..."

  # VS Code extensions (if using VS Code)
  if command -v code &> /dev/null; then
    echo "Installing recommended VS Code extensions..."
    code --install-extension bradlc.vscode-tailwindcss
    code --install-extension esbenp.prettier-vscode
    code --install-extension ms-vscode.vscode-typescript-next
    code --install-extension nx-console.nx-console
    code --install-extension unifiedjs.vscode-mdx
  fi

  # Setup environment variables
  if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "📝 Created .env.local from template"
  fi

  echo "✅ Development tools configured"
}

# Initialize workspace
init_workspace() {
  echo "🏗️ Initializing workspace..."

  # Build design tokens first
  npx nx build design-tokens

  # Build shared utilities
  npx nx build shared-utils

  # Generate initial Storybook build
  npx nx build-storybook design-system

  echo "✅ Workspace initialized"
}

# Run setup
main() {
  check_requirements
  install_dependencies
  setup_dev_tools
  init_workspace

  echo ""
  echo "🎉 Development environment setup complete!"
  echo ""
  echo "Next steps:"
  echo "  npm run dev          # Start development servers"
  echo "  npm run storybook    # Open Storybook"
  echo "  npm run test         # Run tests"
  echo "  npm run lint         # Lint codebase"
  echo ""
  echo "Happy coding! 🚀"
}

main "$@"
```

### Hot Reload Configuration

```typescript
// tools/dev-server/hot-reload.config.ts
import { watch } from 'chokidar';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

export interface HotReloadConfig {
  port: number;
  watchPaths: string[];
  ignorePatterns: string[];
  commands: {
    [pattern: string]: string[];
  };
}

export class HotReloadServer {
  private wss: WebSocketServer;
  private watchers: Map<string, any> = new Map();

  constructor(private config: HotReloadConfig) {
    this.wss = new WebSocketServer({ port: config.port });
    this.setupWebSocket();
  }

  start() {
    console.log(`🔥 Hot reload server starting on port ${this.config.port}`);

    this.config.watchPaths.forEach(path => {
      const watcher = watch(path, {
        ignored: this.config.ignorePatterns,
        persistent: true,
        ignoreInitial: true,
      });

      watcher.on('change', filePath => this.handleFileChange(filePath));
      watcher.on('add', filePath => this.handleFileChange(filePath));
      watcher.on('unlink', filePath => this.handleFileChange(filePath));

      this.watchers.set(path, watcher);
    });
  }

  private setupWebSocket() {
    this.wss.on('connection', ws => {
      console.log('🔌 Client connected to hot reload server');

      ws.on('close', () => {
        console.log('🔌 Client disconnected from hot reload server');
      });
    });
  }

  private async handleFileChange(filePath: string) {
    console.log(`📝 File changed: ${filePath}`);

    // Find matching command pattern
    for (const [pattern, commands] of Object.entries(this.config.commands)) {
      if (new RegExp(pattern).test(filePath)) {
        await this.executeCommands(commands);
        this.notifyClients('reload', { filePath });
        break;
      }
    }
  }

  private async executeCommands(commands: string[]) {
    for (const command of commands) {
      console.log(`🔨 Executing: ${command}`);

      try {
        const [cmd, ...args] = command.split(' ');
        const child = spawn(cmd, args, {
          stdio: 'inherit',
          shell: true,
        });

        await new Promise((resolve, reject) => {
          child.on('close', code => {
            if (code === 0) resolve(void 0);
            else reject(new Error(`Command failed with code ${code}`));
          });
        });
      } catch (error) {
        console.error(`❌ Command failed: ${command}`, error);
      }
    }
  }

  private notifyClients(type: string, data: any) {
    const message = JSON.stringify({ type, data, timestamp: Date.now() });

    this.wss.clients.forEach(client => {
      if (client.readyState === 1) {
        // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  stop() {
    this.watchers.forEach(watcher => watcher.close());
    this.wss.close();
    console.log('🛑 Hot reload server stopped');
  }
}

// Configuration for n00plicate workspace
export const n00plicateHotReloadConfig: HotReloadConfig = {
  port: 3001,
  watchPaths: [
    'packages/design-tokens/tokens/**/*.json',
    'packages/design-system/src/**/*.{ts,tsx}',
    'packages/shared-utils/src/**/*.ts',
  ],
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.nx/**',
    '**/*.test.*',
    '**/*.spec.*',
  ],
  commands: {
    'design-tokens/tokens/.*\\.json$': [
      'npx nx build design-tokens',
      'npx nx build design-system',
    ],
    'design-system/src/.*\\.(ts|tsx)$': [
      'npx nx build design-system',
      'npx nx build-storybook design-system --quiet',
    ],
    'shared-utils/src/.*\\.ts$': ['npx nx build shared-utils'],
  },
};
```

## Debugging Strategies

### Debug Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Storybook",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/nx",
      "args": ["storybook", "design-system"],
      "console": "integratedTerminal",
      "env": {
        "NODE_OPTIONS": "--inspect=9229"
      },
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "disableOptimisticBPs": true,
      "windows": {
        "program": "${workspaceFolder}/node_modules/jest/bin/jest"
      }
    },
    {
      "name": "Debug Nx Command",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/nx",
      "args": ["${input:nxCommand}", "${input:nxProject}"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Build Process",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/tools/build/debug-build.js",
      "console": "integratedTerminal",
      "env": {
        "DEBUG": "*",
        "NODE_ENV": "development"
      }
    }
  ],
  "inputs": [
    {
      "id": "nxCommand",
      "description": "Nx command to debug",
      "default": "build",
      "type": "pickString",
      "options": [
        "build",
        "test",
        "lint",
        "e2e",
        "storybook",
        "build-storybook"
      ]
    },
    {
      "id": "nxProject",
      "description": "Nx project to debug",
      "default": "design-system",
      "type": "pickString",
      "options": ["design-tokens", "design-system", "shared-utils"]
    }
  ]
}
```

### Advanced Debugging Tools

```typescript
// tools/debug/performance-profiler.ts
import { performance, PerformanceObserver } from 'perf_hooks';
import { writeFileSync } from 'fs';

export class PerformanceProfiler {
  private measurements: any[] = [];
  private observer: PerformanceObserver;

  constructor() {
    this.observer = new PerformanceObserver(list => {
      this.measurements.push(...list.getEntries());
    });
  }

  start(categories: string[] = ['measure', 'mark']) {
    this.observer.observe({ entryTypes: categories });
    console.log('🔍 Performance profiling started');
  }

  mark(name: string) {
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string) {
    performance.measure(name, startMark, endMark);
  }

  stop() {
    this.observer.disconnect();

    // Generate report
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-report-${timestamp}.json`;

    writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📊 Performance report saved to ${filename}`);

    return report;
  }

  private generateReport() {
    const byType = this.measurements.reduce((acc, entry) => {
      acc[entry.entryType] = acc[entry.entryType] || [];
      acc[entry.entryType].push(entry);
      return acc;
    }, {});

    return {
      summary: {
        totalMeasurements: this.measurements.length,
        measurementTypes: Object.keys(byType),
        duration: this.measurements.reduce(
          (acc, entry) => acc + (entry.duration || 0),
          0
        ),
      },
      measurements: byType,
      slowest: this.measurements
        .filter(entry => entry.duration)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
    };
  }
}

// Usage in build scripts
export const profileBuild = async (buildFn: () => Promise<void>) => {
  const profiler = new PerformanceProfiler();

  profiler.start();
  profiler.mark('build-start');

  try {
    await buildFn();
    profiler.mark('build-end');
    profiler.measure('total-build-time', 'build-start', 'build-end');
  } catch (error) {
    profiler.mark('build-error');
    profiler.measure('build-error-time', 'build-start', 'build-error');
    throw error;
  } finally {
    profiler.stop();
  }
};
```

### Memory Debugging

```typescript
// tools/debug/memory-monitor.ts
import { memoryUsage } from 'process';

export class MemoryMonitor {
  private baseline: NodeJS.MemoryUsage;
  private samples: Array<{ timestamp: number; memory: NodeJS.MemoryUsage }> =
    [];
  private interval?: NodeJS.Timeout;

  start(sampleInterval = 1000) {
    this.baseline = memoryUsage();
    console.log('🧠 Memory monitoring started');
    console.log('Baseline memory:', this.formatMemory(this.baseline));

    this.interval = setInterval(() => {
      const current = memoryUsage();
      this.samples.push({
        timestamp: Date.now(),
        memory: current,
      });

      if (this.samples.length % 10 === 0) {
        this.logCurrentUsage(current);
      }
    }, sampleInterval);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    const report = this.generateReport();
    console.log('🧠 Memory monitoring stopped');
    console.log('Memory Report:', report);

    return report;
  }

  private formatMemory(memory: NodeJS.MemoryUsage) {
    return {
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memory.external / 1024 / 1024)} MB`,
    };
  }

  private logCurrentUsage(current: NodeJS.MemoryUsage) {
    const formatted = this.formatMemory(current);
    const heapDiff = current.heapUsed - this.baseline.heapUsed;
    const heapDiffMB = Math.round(heapDiff / 1024 / 1024);

    console.log(
      `Memory: ${formatted.heapUsed} (${heapDiffMB >= 0 ? '+' : ''}${heapDiffMB} MB)`
    );
  }

  private generateReport() {
    if (this.samples.length === 0) return null;

    const final = this.samples[this.samples.length - 1].memory;
    const peak = this.samples.reduce((max, sample) =>
      sample.memory.heapUsed > max.heapUsed ? sample.memory : max
    ).memory;

    return {
      baseline: this.formatMemory(this.baseline),
      final: this.formatMemory(final),
      peak: this.formatMemory(peak),
      samples: this.samples.length,
      leakDetected: final.heapUsed > this.baseline.heapUsed * 1.5,
    };
  }
}
```

## Contributor Onboarding

### Automated Onboarding Script

```typescript
// scripts/onboard-contributor.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import inquirer from 'inquirer';
import chalk from 'chalk';

const execAsync = promisify(exec);

interface ContributorInfo {
  name: string;
  email: string;
  role: 'developer' | 'designer' | 'tester' | 'docs';
  experience: 'beginner' | 'intermediate' | 'expert';
  interests: string[];
}

export class ContributorOnboarding {
  async start() {
    console.log(chalk.blue('🎉 Welcome to the n00plicate Design System!'));
    console.log(chalk.gray("Let's get you set up for contributing...\\n"));

    const info = await this.gatherContributorInfo();
    await this.setupGitConfig(info);
    await this.setupDevelopmentEnvironment();
    await this.runInteractiveTour(info);
    await this.createContributorProfile(info);

    console.log(
      chalk.green('\\n✅ Onboarding complete! Happy contributing! 🚀')
    );
  }

  private async gatherContributorInfo(): Promise<ContributorInfo> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: "What's your name?",
        validate: input => input.length > 0 || 'Name is required',
      },
      {
        type: 'input',
        name: 'email',
        message: "What's your email address?",
        validate: input =>
          /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input) ||
          'Valid email required',
      },
      {
        type: 'list',
        name: 'role',
        message: "What's your primary role?",
        choices: [
          { name: '👨‍💻 Developer', value: 'developer' },
          { name: '🎨 Designer', value: 'designer' },
          { name: '🧪 Tester/QA', value: 'tester' },
          { name: '📚 Documentation', value: 'docs' },
        ],
      },
      {
        type: 'list',
        name: 'experience',
        message: 'How would you rate your experience with design systems?',
        choices: [
          { name: '🌱 Beginner - New to design systems', value: 'beginner' },
          { name: '🌿 Intermediate - Some experience', value: 'intermediate' },
          { name: '🌳 Expert - Extensive experience', value: 'expert' },
        ],
      },
      {
        type: 'checkbox',
        name: 'interests',
        message: 'What areas interest you most? (Select all that apply)',
        choices: [
          'Design Tokens',
          'Component Development',
          'Accessibility',
          'Performance',
          'Testing',
          'Documentation',
          'Tooling/Build Process',
          'Mobile Integration',
          'Design Tools Integration',
        ],
      },
    ]);

    return answers as ContributorInfo;
  }

  private async setupGitConfig(info: ContributorInfo) {
    console.log(chalk.blue('\\n🔧 Setting up Git configuration...'));

    try {
      await execAsync(`git config user.name "${info.name}"`);
      await execAsync(`git config user.email "${info.email}"`);

      // Setup useful Git aliases
      const aliases = [
        'git config alias.co checkout',
        'git config alias.br branch',
        'git config alias.ci commit',
        'git config alias.st status',
        'git config alias.unstage "reset HEAD --"',
        'git config alias.last "log -1 HEAD"',
        'git config alias.visual "!gitk"',
      ];

      for (const alias of aliases) {
        await execAsync(alias);
      }

      console.log(chalk.green('✅ Git configuration complete'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Git configuration failed:', error));
    }
  }

  private async setupDevelopmentEnvironment() {
    console.log(chalk.blue('\\n📦 Setting up development environment...'));

    const steps = [
      { name: 'Installing dependencies', command: 'npm ci' },
      { name: 'Building design tokens', command: 'npx nx build design-tokens' },
      {
        name: 'Building shared utilities',
        command: 'npx nx build shared-utils',
      },
      { name: 'Running initial tests', command: 'npx nx test shared-utils' },
      { name: 'Setting up Git hooks', command: 'npx husky install' },
    ];

    for (const step of steps) {
      console.log(chalk.gray(`  Running: ${step.name}...`));
      try {
        await execAsync(step.command);
        console.log(chalk.green(`  ✅ ${step.name} complete`));
      } catch (error) {
        console.log(chalk.red(`  ❌ ${step.name} failed:`, error));
      }
    }
  }

  private async runInteractiveTour(info: ContributorInfo) {
    console.log(
      chalk.blue('\\n🗺️ Interactive tour based on your interests...')
    );

    const tours = {
      'Design Tokens': async () => {
        console.log(chalk.yellow('\\n📋 Design Tokens Tour:'));
        console.log('  • Token files: packages/design-tokens/tokens/');
        console.log('  • Build config: packages/design-tokens/config/');
        console.log('  • Documentation: docs/design/');

        const runDemo = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'run',
            message: 'Would you like to see a token build in action?',
            default: true,
          },
        ]);

        if (runDemo.run) {
          await execAsync('npx nx build design-tokens');
          console.log(
            chalk.green('  ✅ Check packages/design-tokens/dist/ for output')
          );
        }
      },

      'Component Development': async () => {
        console.log(chalk.yellow('\\n🧩 Component Development Tour:'));
        console.log('  • Components: packages/design-system/src/components/');
        console.log('  • Stories: Look for *.stories.tsx files');
        console.log('  • Tests: Look for *.test.tsx files');

        const openStorybook = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'open',
            message: 'Would you like to open Storybook?',
            default: true,
          },
        ]);

        if (openStorybook.open) {
          console.log(
            chalk.blue('Opening Storybook... (this may take a moment)')
          );
          exec('npx nx storybook design-system');
        }
      },
    };

    // Run tours for user's interests
    for (const interest of info.interests) {
      if (tours[interest as keyof typeof tours]) {
        await tours[interest as keyof typeof tours]();
      }
    }
  }

  private async createContributorProfile(info: ContributorInfo) {
    const profile = {
      name: info.name,
      email: info.email,
      role: info.role,
      experience: info.experience,
      interests: info.interests,
      joinedAt: new Date().toISOString(),
      onboardingCompleted: true,
    };

    // Save profile for future reference
    const fs = require('fs').promises;
    await fs.writeFile(
      '.contributor-profile.json',
      JSON.stringify(profile, null, 2)
    );

    console.log(chalk.blue('\\n👤 Contributor profile created'));
    console.log(
      chalk.gray('  Saved to .contributor-profile.json (git-ignored)')
    );
  }
}

// CLI entry point
if (require.main === module) {
  const onboarding = new ContributorOnboarding();
  onboarding.start().catch(console.error);
}
```

## Workspace Optimization

### Build Cache Configuration

```typescript
// nx.json cache optimization
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": [
          "build",
          "test",
          "lint",
          "e2e",
          "build-storybook"
        ],
        "accessToken": "your-nx-cloud-token",
        "canTrackAnalytics": false,
        "showUsageWarnings": true,
        "useDaemonProcess": true
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "production",
        "^production",
        {
          "externalDependencies": ["@n00plicate/design-tokens"]
        }
      ],
      "outputs": ["{options.outputPath}"],
      "cache": true
    },
    "test": {
      "inputs": [
        "default",
        "^production",
        "{workspaceRoot}/jest.preset.js"
      ],
      "cache": true
    },
    "lint": {
      "inputs": [
        "default",
        "{workspaceRoot}/.eslintrc.json",
        "{workspaceRoot}/.eslintignore"
      ],
      "cache": true
    }
  }
}
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:tokens\" \"npm run dev:storybook\"",
    "dev:tokens": "npx nx build design-tokens --watch",
    "dev:storybook": "npx nx storybook design-system",
    "dev:full": "concurrently \"npm run dev\" \"npm run dev:docs\"",
    "dev:docs": "npx nx serve docs",
    "onboard": "ts-node scripts/onboard-contributor.ts",
    "profile": "node --prof scripts/profile-build.js",
    "debug:build": "node --inspect-brk=9229 node_modules/.bin/nx build design-system",
    "clean": "npx nx reset && rimraf node_modules/.cache",
    "fresh": "npm run clean && npm ci && npm run build",
    "health": "node scripts/health-check.js"
  }
}
```

This comprehensive development workflow documentation ensures contributors can quickly get up to speed and maintain\
high productivity throughout the development lifecycle.
