/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@tanstack/query', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'turbo',
    '@unocss',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    'no-undef': 'off',
    'import/no-unresolved': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/prefer-switch': 'off',
    'import/no-named-as-default-member': 'off',
    'unicorn/no-null': 'off',
  },
}
