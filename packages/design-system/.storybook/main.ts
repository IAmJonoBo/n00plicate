import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {
      builder: {
        viteConfigPath: './vite.config.storybook.ts',
      },
    },
  },
  typescript: {
    check: true,
  },
  refs: {
    // Enable composition for cross-platform documentation with fixed port assignments
    mobile: {
      title: 'Mobile Components',
      url: 'http://localhost:7007', // Mobile Storybook: Port 7007 (React Native default)
      expanded: false,
    },
    desktop: {
      title: 'Desktop Components',
      url: 'http://localhost:6008', // Desktop Storybook: Port 6008 (custom, no conflicts)
      expanded: false,
    },
  },
  viteFinal: async (config) => {
    // Fixed port assignment to prevent Supernova-documented conflicts
    config.server = config.server || {};
    config.server.port = 6006; // Web Storybook: Port 6006 (Vite builder default)

    // Ensure design tokens are available with collision-safe paths
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@n00plicate/design-tokens/web': require.resolve('../../design-tokens/libs/tokens/css/tokens.css'),
      '@n00plicate/design-tokens/js': require.resolve('../../design-tokens/libs/tokens/js/tokens.js'),
      '@n00plicate/design-tokens/types': require.resolve('../../design-tokens/libs/tokens/ts/tokens.ts'),
    };

    // Add CSS preprocessing for design tokens
    config.css = config.css || {};
    config.css.preprocessorOptions = {
      ...config.css.preprocessorOptions,
      scss: {
        additionalData: `@import "@n00plicate/design-tokens/scss/tokens.scss";`,
      },
    };

    return config;
  },
};

export default config;
