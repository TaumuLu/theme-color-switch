import {
  DispatchType,
  MessageType,
  defaultStorage,
  dispatchEventType,
} from '../constant'
import { getStorage } from '../utils/storage'
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

const onInit = () => {
  getStorage(defaultStorage).then(value => {
    document.dispatchEvent(
      new CustomEvent(dispatchEventType, {
        detail: {
          type: DispatchType.Preload,
          payload: value,
        },
      }),
    )
  })

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

chrome.storage.onChanged.addListener((changes, namespace) => {
  const newObj = Object.keys(changes).reduce<any>((p, k) => {
    p[k] = changes[k].newValue
    return p
  }, {})

  document.dispatchEvent(
    new CustomEvent(dispatchEventType, {
      detail: {
        type: DispatchType.UpdateStorage,
        payload: newObj,
      },
    }),
  )
})
