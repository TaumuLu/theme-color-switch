import { localThemeKey, ThemeValue, CSSMediaKey, MessageType } from '@/constant'
import getMediaToggle from './toggleMedia'

const getThemeValue = () => {
  const localThemeValue = window.localStorage.getItem(localThemeKey)
  const { matches: isDark } = window.matchMedia(`(${CSSMediaKey}: dark)`)
  const curThemeValue =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/strict-boolean-expressions
    localThemeValue || (isDark ? ThemeValue.Dark : ThemeValue.Light)
  return curThemeValue
}

// 替换 link 标签
const insertCrossOrigin = async () => {
  const head = document.head

  return await Promise.all(
    Array.from(document.querySelectorAll('link[rel=stylesheet]')).map(
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      linkEl => {
        if (linkEl.getAttribute('crossorigin') !== 'anonymous') {
          const newLink = linkEl.cloneNode() as HTMLLinkElement
          newLink.setAttribute('crossorigin', 'anonymous')
          head.appendChild(newLink)

          return new Promise<void>((resolve, reject) => {
            newLink.onload = () => {
              if (linkEl.parentNode != null) {
                head.removeChild(linkEl)
              }
              resolve()
            }
            newLink.onerror = error => {
              reject(error)
            }
          })
        }
        return Promise.resolve()
      },
    ),
  )
}

const mediaToggle = getMediaToggle({
  onError(e: any, styleSheet: any) {
    console.log('onError')
  },
})

const onSwitch = async () => {
  const curThemeValue = getThemeValue()
  // const { matches: isDark } = window.matchMedia(`(${CSSMediaKey}: dark)`)
  // const isSame = isDark && curThemeValue === ThemeValue.Dark
  // const isSwitch = !isSame

  await insertCrossOrigin()

  const onToggle = () => {
    const mediaMap = mediaToggle.get()
    const keys = Array.from(mediaMap.keys()).filter(key =>
      key.includes(CSSMediaKey),
    )

    keys.forEach(key => {
      const media = mediaMap.get(key)

      if (media != null) {
        media.toggle(!key.includes(curThemeValue))
      }
    })
  }

  mediaToggle.subscribe(() => {
    onToggle()
  })
  onToggle()
}

// 检查是否提前注入 web 内容脚本
chrome.runtime.sendMessage(
  {
    type: MessageType.RegisterContentScripts,
  },
  res => {
    const { payload } = res
    // 注入后再执行初始化逻辑
    if (payload) {
      onSwitch()
    }
  },
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { payload } = request

  switch (request.type) {
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
    case MessageType.SetContentThemeValue:
      document.dispatchEvent(
        new CustomEvent('theme-color-switch__content-message', {
          detail: {
            type: 'setItem',
            payload,
          },
        }),
      )
      onSwitch()
      break
  }
})

// document.addEventListener('matchMedia-script', function (e) {
//   console.log(e.detail)
// })
