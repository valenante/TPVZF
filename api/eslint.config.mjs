import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Configuración para todos los archivos
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
  },
  // Configuración específica para Prettier
  {
    plugins: ['prettier'],
    extends: ['plugin:prettier/recommended'],
    rules: {
      'prettier/prettier': 'error', // Muestra errores de formato como errores de ESLint
    },
  },
  pluginJs.configs.recommended,
];
