import { defineConfig } from 'vitest/config';
import { sharedConfig } from './vitest.shared.ts';

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    // Define test projects
    projects: [
      // Node.js packages (design-tokens, shared-utils)
      {
        test: {
          environment: 'node',
          include: ['packages/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          name: 'packages-node',
        },
      },
      // Browser packages (design-system)
      {
        test: {
          environment: 'jsdom',
          include: ['packages/design-system/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          name: 'packages-browser',
        },
      },
      // Desktop app
      {
        test: {
          environment: 'jsdom',
          include: ['apps/desktop/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          name: 'desktop',
        },
      },
      // CLI tools
      {
        test: {
          environment: 'node',
          include: ['n00plicate-token-cli/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          name: 'cli',
        },
      },
    ],
  },
});
