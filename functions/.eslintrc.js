module.exports = {
  parserOptions: {
    ecmaVersion: 2020
  },
  env: {
    node: true,
    es6: true
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    "no-var": "off",
    "prefer-const": "off",
    "object-curly-spacing": "off"
  },
  ignorePatterns: [
    "lib/**/*",   // ⛔ IGNORE compiled TS → JS
    "node_modules",
    ".eslintrc.js"
  ]
};
