export const isNoAccessUrl = (url = '') =>
  ['chrome://', 'chrome-extension://'].some(protocol => url.includes(protocol))

export const getMessage = (key: string) => chrome.i18n.getMessage(key)
