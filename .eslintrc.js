module.exports = {
  env: {
    browser: true,
    es2021: true,
    // chrome: true
  },
  // webextensions: true,
  parser: 'vue-eslint-parser',
  extends: [
    // 'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'standard-with-typescript',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ['*.ts', '*.d.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
    },
    // {
    //   files: '*.json',
    //   options: {
    //     printWidth: 200,
    //   },
    // },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['vue'],
  rules: {
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
  },
}
