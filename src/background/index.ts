import { MessageType } from '../constant'

// chrome.action.onClicked.addListener(tab => {
// chrome.scripting.executeScript({
//   target: { tabId: tab.id },
//   files: [scriptPath],
// })
// })

const registerMatchMedia = async () => {
  return await chrome.scripting
    .getRegisteredContentScripts({
      ids: ['matchMedia'],
    })
    .then(async res => {
      if (res.length === 0) {
        await chrome.scripting.registerContentScripts([
          {
            id: 'matchMedia',
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
