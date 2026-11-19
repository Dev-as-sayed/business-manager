const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: ['node_modules', '.expo', 'dist', 'coverage', 'android', 'ios'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['app.config.ts', 'tailwind.config.js', 'babel.config.js', 'metro.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
