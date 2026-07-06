// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'storybook-static/**',
      '.storybook/**',
      'espanolenka_design_system/**',
      '.design-sync/**',
      '.ds-sync/**',
      'ds-bundle/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      // Raw hex colors in class strings bypass the design tokens; add a
      // token to tokens.css + tailwind-preset.js instead.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]',
          message:
            'Arbitrary hex color in a Tailwind class. Use a design token (tokens.css + tailwind-preset.js) instead.',
        },
        {
          selector: 'TemplateElement[value.raw=/\\[#[0-9a-fA-F]{3,8}\\]/]',
          message:
            'Arbitrary hex color in a Tailwind class. Use a design token (tokens.css + tailwind-preset.js) instead.',
        },
      ],
    },
    settings: { react: { version: 'detect' } },
  },
  storybook.configs['flat/recommended'],
)
