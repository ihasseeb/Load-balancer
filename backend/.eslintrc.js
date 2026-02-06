// eslint.config.js
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    rules: {
      semi: 'error',
      'prefer-const': 'error'
    }
  }
]);

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {}
};
