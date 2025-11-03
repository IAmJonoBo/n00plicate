import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mobile.stories.@(js|jsx|ts|tsx|mdx)'],
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
        viteConfigPath: './vite.config.mobile.ts',
      },
    },
  },
  typescript: {
    check: true,
  },
  viteFinal: async (config) => {
    // Fixed port assignment to prevent Supernova-documented conflicts
    config.server = config.server || {};
    config.server.port = 7007; // Mobile Storybook: Port 7007 (React Native builder default)

    // Mobile-specific token configuration
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@n00plicate/design-tokens/mobile': require.resolve('../../design-tokens/libs/tokens/react-native/theme.ts'),
      '@n00plicate/design-tokens/json': require.resolve('../../design-tokens/libs/tokens/json/tokens.json'),
      '@n00plicate/design-tokens': require.resolve('../../design-tokens/libs/tokens/react-native/theme.ts'),
    };

    return config;
  },
};

export default config;
