import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**'],
  },
  {
    rules: {
      // House rule: no invented placeholders inline — content comes from
      // content/client via lib/client-content.ts (enforced by review + /qa).
      'no-restricted-syntax': 'off',
    },
  },
]

export default eslintConfig
