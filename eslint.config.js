import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  typescript: true,
  vue: true,
  jsonc: false,
  yaml: false,
  ignores: [],
  rules: {
    'no-console': 'off',
  },
})
