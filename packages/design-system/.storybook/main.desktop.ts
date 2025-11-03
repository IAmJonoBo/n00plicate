import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.desktop.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {
      builder: {
        viteConfigPath: './vite.config.desktop.ts',
      },
    },
  },
  typescript: {
    check: true,
  },
  // The viteFinal function customizes the Vite configuration for Storybook desktop builds.
  // It sets a fixed port (6008) to avoid conflicts with other Storybook instances (per Supernova docs).
  // It also configures module aliases for design tokens, ensuring desktop-specific styling and token usage.
  viteFinal: async (config) => {
    // Fixed port assignment to prevent Supernova-documented conflicts
    config.server = config.server || {};
    config.server.port = 6008; // Desktop Storybook: Port 6008 (custom, prevents conflicts)

    // Desktop-specific token configuration (uses web tokens with desktop styling)
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@n00plicate/design-tokens/desktop': require.resolve('../../design-tokens/libs/tokens/css/tokens.css'),
      '@n00plicate/design-tokens/js': require.resolve('../../design-tokens/libs/tokens/js/tokens.js'),
      '@n00plicate/design-tokens': require.resolve('../../design-tokens/libs/tokens/ts/tokens.ts'),
    };

    return config;
  },
};
export default config;
