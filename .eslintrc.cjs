module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    "prettier",
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'react-refresh'],
  rules: {
    // Eslint
    "import/no-unresolved": "error",
    'import/order': ["error", {
      groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
      'newlines-between': 'always'
    }],

    // React
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Typescript
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/camelcase": [0],
    "@typescript-eslint/unbound-method": ["off"],
    "@typescript-eslint/no-floating-promises": ["off"],
    "@typescript-eslint/explicit-function-return-type": ["off", { "allowExpressions": true }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-cal": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-unsafe-enum-comparison": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': [".ts", ".tsx"]
    },
    'import/resolver': {
      'typescript': {
        'alwaysTryTypes': true
      }
    }
  }
}
