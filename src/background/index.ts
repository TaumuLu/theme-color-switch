import { MessageType, StorageKey } from '../constant'
import { getStorageValue } from '../utils/storage'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// import preload from '../contents/preload?script'

// chrome.action.onClicked.addListener(tab => {
// })

const matchMediaId = 'content-MAIN-matchMedia'

const registerMatchMedia = async () => {
  return await chrome.scripting
    .getRegisteredContentScripts({
      ids: [matchMediaId],
    })
    .then(async res => {
      if (res.length === 0) {
        await chrome.scripting.registerContentScripts([
          {
            id: matchMediaId,
            js: ['matchMedia.js'],
            matches: ['<all_urls>'],
            runAt: 'document_start',
            world: 'MAIN',
          },
        ])
      }
      return true
    })
    .catch(() => {
      return false
    })
}

const unRegisterMatchMedia = async () => {
  return await chrome.scripting
    .getRegisteredContentScripts({
      ids: [matchMediaId],
    })
    .then(async res => {
      if (res.length !== 0) {
        await chrome.scripting.unregisterContentScripts({
          ids: [matchMediaId],
        })
      }
      return true
    })
    .catch(() => {
      return false
    })
}

chrome.runtime.onInstalled.addListener(() => {
  getStorageValue(StorageKey.Enable).then(value => {
    if (value) {
      registerMatchMedia()
    } else {
      unRegisterMatchMedia()
    }
  })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // const tab = sender.tab
  // const senderId = sender.tab?.id
  // const payload = request.payload

  switch (request.type) {
    case MessageType.RegisterContentScripts:
      registerMatchMedia().then(res => {
        sendResponse({ payload: res })
      })
      return true
    case MessageType.UnRegisterContentScripts:
      unRegisterMatchMedia().then(res => {
        sendResponse({ payload: res })
      })
      return true
  }
})
