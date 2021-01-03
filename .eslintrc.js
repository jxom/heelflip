module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'react-app'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'comma-dangle': 'off',
    'import/no-anonymous-default-export': 'off',
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      extends: '@sveltejs',
      rules: {
        'comma-dangle': 'off',
        'import/first': 'off',
      },
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
