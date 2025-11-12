module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'simple-import-sort', 'boundaries'],
  extends: [
    'eslint:recommended',
    // root: true  // Keep legacy `.eslintrc.cjs` but disabled root flag for flat/legacy compatibility while moving to Biome
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'import/no-duplicates': 'error',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx,mts,cts}'],
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false }],
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
        '@typescript-eslint/unbound-method': 'error',
      },
    },
    {
      files: ['**/*.{js,jsx}'],
      rules: {},
    },
  ],
};
