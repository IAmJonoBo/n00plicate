import { resolve } from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      // Collision-safe token paths for Storybook
      '@n00plicate/design-tokens/css': resolve(__dirname, '../../design-tokens/libs/tokens/css/tokens.css'),
      '@n00plicate/design-tokens/scss': resolve(__dirname, '../../design-tokens/libs/tokens/scss/tokens.scss'),
      '@n00plicate/design-tokens/js': resolve(__dirname, '../../design-tokens/libs/tokens/js/tokens.js'),
      '@n00plicate/design-tokens/ts': resolve(__dirname, '../../design-tokens/libs/tokens/ts/tokens.ts'),
      '@n00plicate/design-tokens': resolve(__dirname, '../../design-tokens/libs/tokens/ts/tokens.ts'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Auto-import design tokens for all SCSS files
        additionalData: `@import "${resolve(__dirname, '../../design-tokens/libs/tokens/scss/tokens.scss')}";`,
      },
    },
  },
  optimizeDeps: {
    include: ['@n00plicate/design-tokens'],
  },
  build: {
    // Ensure proper chunk splitting for performance
    rollupOptions: {
      output: {
        manualChunks: {
          'design-tokens': ['@n00plicate/design-tokens'],
        },
      },
    },
  },
  server: {
    fs: {
      // Allow serving files from token directories
      allow: ['../..'],
    },
  },
});
