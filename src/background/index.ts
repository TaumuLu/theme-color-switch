import { type DomainValue, MessageType, defaultDomain } from '../constant'
import { getMatch } from '../constant/config'
import { type Dict } from '../types'
import { getDomain, getDomains, setDomain, setDomains } from '../utils/domain'
import { getCurrentTabId } from '../utils/tabMessage'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// import preload from '../contents/preload?script'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// import switchTheme from '../contents?script'

const matchMediaId = 'content-MAIN-matchMedia'
const preloadId = 'content-ISOLATED-preload'
const switchId = 'content-ISOLATED-switch'

// 获取正确的路径
const [preloadPath, switchThemePath] =
  chrome.runtime.getManifest().content_scripts?.[0].js ?? []

const contentScripts: chrome.scripting.RegisteredContentScript[] = [
  {
    id: matchMediaId,
    js: ['matchMedia.js'],
    runAt: 'document_start',
    world: 'MAIN',
  },
  {
    id: preloadId,
    js: [preloadPath],
    runAt: 'document_start',
    world: 'ISOLATED',
  },
  {
    id: switchId,
    js: [switchThemePath],
    runAt: 'document_start',
    world: 'ISOLATED',
  },
]

type RegisteredContentScript = chrome.scripting.RegisteredContentScript

const registerScripts = async () => {
  return await chrome.scripting
    .getRegisteredContentScripts({
      ids: contentScripts.map(item => item.id),
    })
    .then(async res => {
      const domainValue = await getDomains()
      const matches: string[] = []
      Object.keys(domainValue).forEach(key => {
        const value = domainValue[key]
        if (value.enable) {
          const host = getMatch(key)
          matches.push(host)
        }
      })

      const ids = res.map(item => item.id)
      const registerList: RegisteredContentScript[] = []
      const updateList: RegisteredContentScript[] = []
      const unregisterList: string[] = []

      contentScripts.forEach(item => {
        if (!ids.includes(item.id)) {
          if (matches.length > 0) {
            // 新注册
            registerList.push({
              ...item,
              matches,
            })
          }
        } else {
          if (matches.length > 0) {
            // 更新
            updateList.push({
              ...item,
              matches,
            })
          } else {
            // 注销
            unregisterList.push(item.id)
          }
        }
      })
      const allPromise: Array<Promise<void>> = []
      if (registerList.length > 0) {
        await chrome.scripting.registerContentScripts(registerList)
      }
      if (updateList.length > 0) {
        await chrome.scripting.updateContentScripts(updateList)
      }
      if (unregisterList.length > 0) {
        await chrome.scripting.unregisterContentScripts({
          ids: unregisterList,
        })
      }

      return await Promise.all(allPromise).then(() => {
        return true
      })
    })
    .catch(() => {
      return false
    })
}

chrome.runtime.onInstalled.addListener(() => {
  registerScripts()

  // chrome.action.disable()

  // chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
  //   const rules = domain.map(item => {
  //     const hostSuffix = item.replace(/[^A-Za-z]*(.*\..*)\/.*/, (m, $1) => $1)
  //     return {
  //       conditions: [
  //         new chrome.declarativeContent.PageStateMatcher({
  //           pageUrl: { hostSuffix },
  //         }),
  //       ],
  //       actions: [new chrome.declarativeContent.ShowAction()],
  //     }
  //   })
  //   chrome.declarativeContent.onPageChanged.addRules(rules)
  // })
})

const onUpdateDomain = async (key: string, value: Partial<DomainValue>) => {
  const domain = await getDomain(key)
  return await setDomain(key, { ...domain, ...value }).then(async () => {
    return await registerScripts()
  })
}

const onUpdateDomains = async (values: Dict<DomainValue>) => {
  const domains = await getDomains()
  return await setDomains({ ...domains, ...values }).then(async () => {
    return await registerScripts()
  })
}

chrome.permissions.onAdded.addListener(permissions => {
  const { origins } = permissions
  const values: Dict<DomainValue> = {}
  origins?.forEach(origin => {
    const host = origin.replace(/.*\/(.*)\/.*/, '$1')
    values[host] = {
      ...defaultDomain,
      enable: true,
    }
  })
  onUpdateDomains(values).then(() => {
    getCurrentTabId().then(tabId => {
      if (tabId) {
        chrome.tabs.reload(tabId)
      }
    })
  })
})

// chrome.runtime.onConnect.addListener(function (port) {
//   if (port.name === 'popup') {
//     port.onDisconnect.addListener(function () {
//       console.log('popup has been closed')
//     })
//   }
// })

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // const tab = sender.tab
  // const senderId = sender.tab?.id
  const payload = request.payload

  switch (request.type) {
    case MessageType.RegisterContentScripts:
      registerScripts().then(res => {
        sendResponse({ payload: res })
      })
      return true
    case MessageType.UpdateDomain:
      onUpdateDomain(payload.key, payload.value).then(res => {
        sendResponse({ payload: res })
      })
      return true
    // case MessageType.UnRegisterContentScripts:
    //   unRegisterMatchMedia().then(res => {
    //     sendResponse({ payload: res })
    //   })
    //   return true
  }
  sendResponse()
})
