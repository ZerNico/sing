require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  extends: ['plugin:vue/vue3-recommended', 'custom'],
  rules: {
    'unicorn/filename-case': 'off',
    'vue/multi-word-component-names': 'off',
  },
}
