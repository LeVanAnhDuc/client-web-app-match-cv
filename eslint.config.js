//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      '.worktrees',
      // Playwright E2E + config live outside the typed tsconfig project
      // (excluded so vitest/build ignore them); they are validated by running
      // the suite, not by the typed lint.
      'e2e/**',
      'playwright.config.ts',
    ],
  },
]
