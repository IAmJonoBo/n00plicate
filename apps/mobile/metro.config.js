/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
/**
 * @format
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration for React Native with collision prevention and workspace support
 * https://reactnative.dev/docs/metro
 */

const config = {
  transformer: {
    experimental: {
      enableNewArchitecture: true,
    },
  },
  resolver: {
    alias: {
      // Collision-safe design token imports
      '@n00plicate/design-tokens': '../../../packages/design-tokens/libs/tokens/react-native/theme.ts',
      '@n00plicate/shared-utils': '../../../packages/shared-utils/src/index.ts',
    },
    // Enable workspace package resolution
    nodeModulesPath: '../../../node_modules',
  },
  watchFolders: [
    // Watch workspace packages for changes
    '../../../packages/design-tokens',
    '../../../packages/shared-utils',
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
