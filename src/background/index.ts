import { MessageType } from '../constant'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// import preload from '../contents/preload?script'

// chrome.action.onClicked.addListener(tab => {
// })

const matchMediaId = 'content-MAIN-matchMedia'
const preLoadId = 'content-ISOLATED-preload'

const registerMatchMedia = async () => {
  return await chrome.scripting
    .getRegisteredContentScripts({
      ids: [preLoadId, matchMediaId],
    })
    .then(async res => {
      if (res.length === 0) {
        // await chrome.scripting.registerContentScripts([
        //   {
        //     id: preLoadId,
        //     js: [preload],
        //     matches: ['<all_urls>'],
        //     runAt: 'document_start',
        //   },
        // ])
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

chrome.runtime.onInstalled.addListener(() => {
  // getStorageValue(StorageKey.EnhancedMode).then(value => {
  //   if (value) {
  //     // 增强模式再启用脚本
  //   }
  // })
  registerMatchMedia()
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
  }
})
