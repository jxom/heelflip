module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'prettier/prettier': [
      'error',
      {
        bracketSpacing: true,
        jsxBracketSameLine: false,
        printWidth: 120,
        singleQuote: true,
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      extends: '@sveltejs',
    },
  ],
};
