import { type Dict } from '@/types'
import { ThemeValue, StorageKey } from '../constant'

export const setStorage = async (items: Dict) => {
  await new Promise<void>(resolve => {
    chrome.storage.local.set(items, () => {
      resolve()
    })
  })
}

export const getStorage = async <T = Dict>(
  key: Parameters<typeof chrome.storage.local.get>[0],
) => {
  return await new Promise<T>(resolve => {
    chrome.storage.local.get(key, result => {
      resolve(result as any)
    })
  })
}

const defaultStorageValue = {
  [StorageKey.GlobalThemeKey]: ThemeValue.Dark,
  [StorageKey.EnhancedMode]: false,
}

export const getStorageValue = async <T = Dict>(key: StorageKey) => {
  return await new Promise<T>(resolve => {
    chrome.storage.local.get({ [key]: defaultStorageValue[key] }, result => {
      resolve(result[key])
    })
  })
}

export const removeStorage = async (key: string | string[]) => {
  await new Promise<void>(resolve => {
    chrome.storage.local.remove(key, () => {
      resolve()
    })
  })
}

export const clearStore = async () => {
  await chrome.storage.local.clear()
}
