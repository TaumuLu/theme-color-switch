import { type DomainValue, StorageKey, defaultDomain } from '../constant'
import { type Dict } from '../types'
import { getStorageValue, setStorageValue } from './storage'

export const getDomains = async () => {
  return await getStorageValue(StorageKey.Domain)
}

export const setDomains = async (value: Dict<DomainValue>) => {
  return await setStorageValue(StorageKey.Domain, value)
}

export const getDomain = async (host: string) => {
  return await getDomains().then(value => value[host] || { ...defaultDomain })
}

export const removeDomain = async (host: string) => {
  const domains = await getDomains()
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete domains[host]
  return await setDomains(domains)
}

export const setDomain = async (host: string, value: Partial<DomainValue>) => {
  const domains = await getDomains()
  const curValue = domains[host] || defaultDomain

  return await setDomains({
    ...domains,
    [host]: {
      ...curValue,
      ...value,
    },
  })
}
