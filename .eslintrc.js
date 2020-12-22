module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      extends: '@sveltejs',
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['typescript'],
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
};
