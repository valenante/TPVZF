import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginUnusedImports from 'eslint-plugin-unused-imports';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      prettier: pluginPrettier,
      'unused-imports': pluginUnusedImports,
    },
    rules: {
      ...pluginJs.configs.recommended.rules, // <<✅ ESTA ES LA FORMA CORRECTA
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^', args: 'after-used', argsIgnorePattern: '^' },
      ],
    },
  },
];