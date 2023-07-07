import { type ResponseMessage, type SendMessage } from '../constant'

export const getCurrentTabs = async (queryInfo?: chrome.tabs.QueryInfo) => {
  return await chrome.tabs.query({
    active: true,
    currentWindow: true,
    ...queryInfo,
  })
}

export const getCurrentTab = async (queryInfo?: chrome.tabs.QueryInfo) => {
  return await getCurrentTabs(queryInfo).then(([tab]) => tab)
}

export const getCurrentTabId = async (queryInfo?: chrome.tabs.QueryInfo) => {
  return await getCurrentTab(queryInfo).then(tab => tab?.id)
}

export const tabSendMessage = <R = any>(
  message: SendMessage,
  responseCallback: (response: ResponseMessage<R>) => void = () => {},
) => {
  getCurrentTabId().then(tabId => {
    if (tabId) {
      chrome.tabs.sendMessage(tabId, message, responseCallback)
    }
  })
}
