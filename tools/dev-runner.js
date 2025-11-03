#!/usr/bin/env node
/* eslint-disable no-console */
/* global console */

import { execSync } from 'node:child_process';
import process from 'node:process';

const tasks = [
  {
    id: 'build',
    label: '🏗️ build',
    aliases: ['build', '🏗️', 'build-all'],
    command: 'cross-env NX_NO_CLOUD=true nx run-many -t build --exclude=workspace-format && pnpm run postbuild:clean',
    description: 'Build all packages (offline safe)',
  },
  {
    id: 'test',
    label: '🧪 test',
    aliases: ['test', '🧪'],
    command: 'cross-env NX_NO_CLOUD=true pnpm nx run-many -t test --exclude=workspace-format',
    description: 'Run all tests',
  },
  {
    id: 'lint',
    label: '🔍 lint',
    aliases: ['lint', '🔍'],
    command: 'cross-env NX_NO_CLOUD=true pnpm nx run-many -t lint --exclude=workspace-format',
    description: 'Lint all packages',
  },
  {
    id: 'storybook',
    label: '📚 storybook',
    aliases: ['storybook', 'docs'],
    command: 'pnpm storybook',
    description: 'Start Storybook development server',
  },
  {
    id: 'tokens',
    label: '🎨 tokens',
    aliases: ['tokens', 'watch-tokens'],
    command: 'pnpm tokens:watch',
    description: 'Watch and build design tokens',
  },
  {
    id: 'clean',
    label: '🧹 clean',
    aliases: ['clean', 'cleanup'],
    command: 'pnpm clean:all',
    description: 'Clean workspace and Apple junk',
  },
  {
    id: 'graph',
    label: '📊 graph',
    aliases: ['graph', 'dep-graph'],
    command: 'pnpm graph',
    description: 'Show dependency graph',
  },
  {
    id: 'affected',
    label: '⚡ affected',
    aliases: ['affected', 'affected:build'],
    command: 'cross-env NX_NO_CLOUD=true pnpm nx affected -t build --exclude=workspace-format',
    description: 'Build only affected projects',
  },
  {
    id: 'deps-plan',
    label: '🧭 deps:plan',
    aliases: ['deps-plan', 'renovate-plan'],
    command: 'pnpm run upgrade:plan',
    description: 'Generate Nx migration plan (dependency audit)',
  },
  {
    id: 'deps-verify',
    label: '🛡️ deps:verify',
    aliases: ['deps-verify', 'renovate-verify'],
    command: 'pnpm run upgrade:verify',
    description: 'Install, rebuild, lint, and test after dependency updates',
  },
  {
    id: 'setup',
    label: '🔧 setup',
    aliases: ['setup', 'dx'],
    command: './scripts/setup-dx.sh',
    description: 'Setup modern DX tools',
  },
];

const taskIndex = new Map();

for (const task of tasks) {
  const keys = new Set([task.id, task.label, ...(task.aliases ?? [])]);
  for (const key of keys) {
    if (typeof key !== 'string') {
      continue;
    }
    taskIndex.set(key.toLowerCase(), task);
  }
}

function showMenu() {
  console.log('\n🎨 n00plicate Development Task Runner\n');
  for (const task of tasks) {
    const aliasList = task.aliases?.filter((alias) => alias !== task.id && alias !== task.label);
    const aliasDisplay = aliasList?.length ? ` (aliases: ${aliasList.join(', ')})` : '';
    console.log(`${task.label.padEnd(15)} ${task.description}${aliasDisplay}`);
  }
  console.log('\n');
}

function runTask(taskKey) {
  const task = taskIndex.get(taskKey.toLowerCase());
  if (!task) {
    console.error(`❌ Task "${taskKey}" not found`);
    console.log('Available tasks:\n');
    showMenu();
    process.exit(1);
  }

  console.log(`🚀 Running: ${task.description}`);
  console.log(`📝 Command: ${task.command}\n`);

  try {
    execSync(task.command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: process.env,
    });
    console.log(`\n✅ Task "${taskKey}" completed successfully!`);
  } catch (error) {
    console.error(`\n❌ Task "${taskKey}" failed with exit code ${error.status}`);
    process.exit(error.status || 1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  showMenu();
  process.exit(0);
}

const taskKey = args[0];
runTask(taskKey);
