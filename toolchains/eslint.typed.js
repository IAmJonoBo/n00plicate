import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from '@typescript-eslint/eslint-plugin';
import baseConfig from './eslint.base.js';

const workspaceRoot = dirname(fileURLToPath(new URL('..', import.meta.url)));

const typeCheckedFiles = [
  'apps/docs/**/*.{ts,tsx,mts,cts}',
  'apps/workflows/**/*.{ts,tsx,mts,cts}',
  'apps/examples/**/*.{ts,tsx,mts,cts}',
  'packages/platform-bridges/**/*.{ts,tsx,mts,cts}',
  'packages/token-*/**/*.{ts,tsx,mts,cts}',
  'packages/tokens-*/**/*.{ts,tsx,mts,cts}',
  'packages/ui-*/**/*.{ts,tsx,mts,cts}',
  'tools/**/*.{ts,tsx,mts,cts}',
];

const restrictToTypeScript = (configs) =>
  (Array.isArray(configs) ? configs : [configs]).map((config) => ({
    ...config,
    files: config.files ?? typeCheckedFiles,
  }));

const typedOnlyRules = [
  ...restrictToTypeScript(tseslint.configs['recommended-requiring-type-checking'] || tseslint.configs.recommended || []),
  {
    files: typeCheckedFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: workspaceRoot,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
      '@typescript-eslint/prefer-regexp-exec': 'warn',
      '@typescript-eslint/restrict-template-expressions': [
        'warn',
        { allowNumber: true, allowBoolean: true, allowNullish: true },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    },
  },
];

export default [...baseConfig, ...typedOnlyRules];
