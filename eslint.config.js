const js = require('@eslint/js');
const cypress = require('eslint-plugin-cypress');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'mochawesome-report/**',
      'cypress/screenshots/**',
      'cypress/videos/**',
      'eslint.config.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['cypress/e2e/**/*.js', 'cypress/support/**/*.js'],
    plugins: { cypress },
    languageOptions: {
      globals: cypress.configs.globals.languageOptions.globals,
    },
    rules: {
      ...cypress.configs.recommended.rules,
    },
  },
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['cypress.config.js'],
    languageOptions: {
      globals: { require: 'readonly', module: 'writable', process: 'readonly' },
    },
  },
  prettierConfig,
];
