import { type Dict } from '@/types'
import { type DefaultStorage, defaultStorage } from '../constant'

export const setStorage = async (items: Dict) => {
  return await chrome.storage.local
    .set(items)
    .then(() => {
      return true
    })
    .catch(() => {
      return false
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

export const getStorageValue = async <K extends keyof DefaultStorage>(
  key: K,
) => {
  return await getStorage<DefaultStorage>({ [key]: defaultStorage[key] }).then(
    result => {
      return result[key]
    },
  )
}

export const setStorageValue = async <K extends keyof DefaultStorage>(
  key: K,
  value: DefaultStorage[K],
) => {
  return await setStorage({ [key]: value })
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
