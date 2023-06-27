import { MessageType } from '../constant'
import { getThemeValue } from './help'

const onPreLoad = () => {
  chrome.runtime.sendMessage({
    type: MessageType.ContentLoad,
    payload: {
      themeValue: getThemeValue(),
      host: window.location.host,
    },
  })
}

// const onDispatchPreload = () => {
//   getStorage(defaultStorage).then(value => {
//     document.dispatchEvent(
//       new CustomEvent(dispatchEventType, {
//         detail: {
//           type: DispatchType.Preload,
//           payload: value,
//         },
//       }),
//     )
//   })
// }

const onInit = () => {
  // onDispatchPreload()
  onPreLoad()
}

onInit()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case MessageType.EmitPreLoad:
      onPreLoad()
      break
    case MessageType.GetContentThemeValue:
      sendResponse({
        payload: getThemeValue(),
      })
      break
    case MessageType.GetContentHost:
      sendResponse({
        payload: window.location.host,
      })
      break
  }
})

// chrome.storage.onChanged.addListener((changes, namespace) => {
//   const newObj = Object.keys(changes).reduce<any>((p, k) => {
//     p[k] = changes[k].newValue
//     return p
//   }, {})

//   document.dispatchEvent(
//     new CustomEvent(dispatchEventType, {
//       detail: {
//         type: DispatchType.UpdateStorage,
//         payload: newObj,
//       },
//     }),
//   )
// })

export default {}
