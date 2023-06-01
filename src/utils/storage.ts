import { type Dict } from '@/types'

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
