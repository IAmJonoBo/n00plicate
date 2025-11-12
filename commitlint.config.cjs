/* eslint-env node */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Nx-specific rules
    'scope-enum': [
      2,
      'always',
      [
        // Nx project scopes (automatically detected)
        'design-system',
        'design-tokens',
        'shared-utils',
        'mimic',
        // Infrastructure/tooling scopes
        'ci',
        'deps',
        'docs',
        'dx',
        'lint',
        'format',
        'test',
        'build',
        'release',
        'workspace',
        // General scopes
        'repo',
        'config',
        'scripts',
        'tools',
      ],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
  // Nx-specific types removed (legacy)
        // Additional conventional types
        'deps',
        'release',
        'security',
      ],
    ],
    'subject-case': [0, 'never'], // Disable case checking to prevent commit blocking
    'subject-min-length': [2, 'always', 3],
    'subject-max-length': [2, 'always', 72],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100],
  },
};
