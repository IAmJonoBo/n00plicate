import { resolve } from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      // Desktop-specific collision-safe token paths
      '@n00plicate/design-tokens/desktop': resolve(__dirname, '../../design-tokens/libs/tokens/css/tokens.css'),
      '@n00plicate/design-tokens/scss': resolve(__dirname, '../../design-tokens/libs/tokens/scss/tokens.scss'),
      '@n00plicate/design-tokens/js': resolve(__dirname, '../../design-tokens/libs/tokens/js/tokens.js'),
      '@n00plicate/design-tokens': resolve(__dirname, '../../design-tokens/libs/tokens/ts/tokens.ts'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Auto-import design tokens with desktop-specific overrides
        additionalData: `@import "${resolve(__dirname, '../../design-tokens/libs/tokens/scss/tokens.scss')}";`,
      },
    },
  },
  optimizeDeps: {
    include: ['@n00plicate/design-tokens'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'design-tokens-desktop': ['@n00plicate/design-tokens/desktop'],
        },
      },
    },
  },
  server: {
    port: 4402, // Desktop Storybook port
    fs: {
      allow: ['../..'],
    },
  },
  define: {
    // Desktop environment detection
    __DESKTOP_BUILD__: true,
    __PLATFORM__: '"desktop"',
  },
});
