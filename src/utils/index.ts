export const isNoAccessUrl = (url = '') =>
  ['chrome://', 'chrome-extension://'].some(protocol => url.includes(protocol))
