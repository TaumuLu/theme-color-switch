type SendMessage = <M = any, R = any>(message: M) => Promise<R>

export const runtimeSendMessage: SendMessage = async message => {
  if (!chrome.runtime.id) {
    return await Promise.reject(new Error('Already'))
  }
  return await chrome.runtime.sendMessage(message)
}
