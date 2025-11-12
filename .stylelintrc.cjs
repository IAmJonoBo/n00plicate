/* eslint-env node */
module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
  // Nx is removed; old Nx cache patterns were removed
    '**/tmp/**',
    '**/storybook-static/**',
    '**/*.min.css',
    '**/*.min.scss',
    // Generated design token files - exclude from linting
    '**/libs/tokens/**/*.{css,scss,sass}',
    '**/tokens.{css,scss,sass}',
    'packages/design-tokens/libs/**/*.{css,scss,sass}',
  ],
  rules: {
    'no-invalid-double-slash-comments': null, // Allow // comments in SCSS
    'scss/at-rule-no-unknown': null,
    'order/properties-order': null,
    'declaration-block-trailing-semicolon': null,
  },
};
