module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: ['plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: false,
        bracketSpacing: true,
        singleQuote: true,
        arrowParens: 'always',
        printWidth: 120,
      },
    ],
  },
}
