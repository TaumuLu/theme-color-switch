export const icons = {
  16: 'icons/icon16.png',
  32: 'icons/icon32.png',
  48: 'icons/icon48.png',
  128: 'icons/icon128.png',
}

export const defaultHosts = [
  'mp.weixin.qq.com',
  'sspai.com',
  'developer.mozilla.org',
  'learn.microsoft.com',
  'theme-next.org',
]

export const getMatch = (domain: string) => {
  return `*://${domain}${domain.endsWith('/') ? '' : '/'}*`
}

export const getMatches = (domains: string[]) => {
  return domains.map(domain => getMatch(domain))
}
