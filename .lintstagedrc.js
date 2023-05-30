module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],
  '*.{json,md}': ['prettier --write'],
  '*.{css,less,scss}': ['stylelint --fix --allow-empty-input'],
}
