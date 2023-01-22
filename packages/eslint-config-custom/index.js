module.exports = {
  extends: ['turbo', '@antfu'],
  rules: {
    'curly': 'off',
    'no-console': 'off',
    '@typescript-eslint/prefer-ts-expect-error': 'off',
    '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'turbo/no-undeclared-env-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
  },
}
