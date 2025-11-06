import { defineConfig } from 'vitest/config';

/**
 * Shared Vitest configuration for n00plicate workspace
 * Individual packages can import and extend this configuration
 */
export const sharedConfig = {
  test: {
    globals: true,
    coverage: {
      provider: 'v8' as const,
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/.storybook/**',
        '**/storybook-static/**',
      ],
    },
  },
};

/**
 * Node.js environment configuration for packages
 */
export const nodeConfig = {
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'node' as const,
  },
};

/**
 * Browser environment configuration for packages
 */
export const browserConfig = {
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'jsdom' as const,
  },
};

export default defineConfig(sharedConfig);
