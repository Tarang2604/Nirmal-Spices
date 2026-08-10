const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Express type augmentation requires `declare global { namespace Express {} }`.
    files: ['src/middleware/auth.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    // Standalone CommonJS admin scripts, not part of the TS build.
    files: ['src/scripts/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
