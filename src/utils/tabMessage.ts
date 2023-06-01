import { type ResponseMessage, type SendMessage } from '../constant'

export const sendMessage = <R = any>(
  message: SendMessage,
  responseCallback: (response: ResponseMessage<R>) => void = () => {},
) => {
  chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    const id = tabs.at(0)?.id

    if (id) {
      // eslint-disable-next-line no-undef
      chrome.tabs.sendMessage(id, message, responseCallback)
    }
  })
}
