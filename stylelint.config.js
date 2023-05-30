module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-sass-guidelines'],
  rules: {
    'selector-max-id': 1,
    'max-nesting-depth': [
      6,
      {
        ignoreAtRules: ['each', 'media', 'supports', 'include'],
      },
    ],
    'selector-max-compound-selectors': 6,
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'value-keyword-case': null,
  },
}
