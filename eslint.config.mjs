import loguxConfig from '@logux/eslint-config'

export default [
  ...loguxConfig,
  {
    rules: {
      'perfectionist/sort-switch-case': 'off'
    }
  }
]
