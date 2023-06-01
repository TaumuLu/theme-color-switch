import {
  localThemeKey,
  ThemeValue,
  CSSMediaName,
  MessageType,
  darkStyleId,
  lightStyleId,
  dispatchEventType,
  DispatchType,
} from '@/constant'
import { insertCrossOrigin } from './help'

const getIsDark = () => {
  const { matches: isDark } = window.matchMedia(`(${CSSMediaName}: dark)`)
  return isDark
}

const getIsLocalDark = () => {
  return getThemeValue() === ThemeValue.Dark
}

const getThemeValue = () => {
  const localThemeValue = window.localStorage.getItem(localThemeKey)
  const isDark = getIsDark()
  const curThemeValue =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/strict-boolean-expressions
    localThemeValue || (isDark ? ThemeValue.Dark : ThemeValue.Light)
  return curThemeValue
}

const getCssText = (cssRules: CSSRule[]) => {
  return Array.from(cssRules).reduce((p, c) => {
    return p + c.cssText
  }, '')
}

let isInitStyle = false

const lightRules: CSSMediaRule[] = []
const darkRules: CSSMediaRule[] = []

const onInitStyle = async () => {
  // 避免 CORS 问题
  await insertCrossOrigin()

  Array.from(document.styleSheets).forEach(styleSheet => {
    try {
      const { disabled } = styleSheet
      if (!disabled) {
        const { cssRules, ownerNode } = styleSheet

        const filterCssRules = Array.from(cssRules).filter(rule => {
          if (rule instanceof CSSMediaRule) {
            const { conditionText } = rule
            if (conditionText.includes(CSSMediaName)) {
              if (conditionText.includes(ThemeValue.Dark)) {
                darkRules.push(rule)
              } else {
                lightRules.push(rule)
              }
              return false
            }
          }
          return true
        })

        if (filterCssRules.length !== cssRules.length) {
          const style = document.createElement('style')
          const text = getCssText(filterCssRules)
          style.innerText = text

          ownerNode?.parentNode?.insertBefore(style, ownerNode)
          ownerNode?.parentNode?.removeChild(ownerNode)
        }
      }
    } catch (e) {
      // console.error(e)
    }
  })
}

const applyStyleRules = (themValue: ThemeValue, isReverse = false) => {
  const isDark = themValue === ThemeValue.Dark
  const id = isDark ? darkStyleId : lightStyleId
  const rules = isDark ? darkRules : lightRules

  let themeStyle = document.getElementById(id) as HTMLStyleElement

  let cssText = getCssText(rules)
  if (isReverse) {
    cssText = cssText.replace(/\((.*prefers-color-scheme.*)\)/g, match => {
      return match.replace(
        themValue,
        isDark ? ThemeValue.Light : ThemeValue.Dark,
      )
    })
  }
  if (cssText) {
    if (!themeStyle) {
      themeStyle = document.createElement('style')
      document.head.appendChild(themeStyle)
    }
    themeStyle.setAttribute('id', id)
    themeStyle.innerText = cssText
  }
  const removeThemeStyle = document.getElementById(
    isDark ? lightStyleId : darkStyleId,
  )
  if (removeThemeStyle) {
    document.head.removeChild(removeThemeStyle)
  }
}

const onSwitch = async () => {
  const curThemeValue = getThemeValue()
  const isDark = getIsDark()
  const isLocalDark = curThemeValue === ThemeValue.Dark

  // 初始化 style 标签，只执行一次
  if (!isInitStyle) {
    await onInitStyle()
  }
  isInitStyle = true

  if (isDark) {
    if (isLocalDark) {
      applyStyleRules(ThemeValue.Dark)
    } else {
      // 暗黑模式下本地非暗黑要替换应用下 css 样式，下面的处理也一样
      applyStyleRules(ThemeValue.Light, true)
    }
  } else {
    if (isLocalDark) {
      applyStyleRules(ThemeValue.Dark, true)
    } else {
      applyStyleRules(ThemeValue.Light)
    }
  }
}

const onInit = () => {
  const isDark = getIsDark()
  const isLocalDark = getIsLocalDark()
  const isSame = isDark ? isLocalDark : !isLocalDark

  // 仅第一次判断下是否需要切换
  if (!isSame) {
    onSwitch()
  }
}

// 检查是否提前注入 web 内容脚本
chrome.runtime.sendMessage(
  {
    type: MessageType.RegisterContentScripts,
  },
  res => {
    // const { payload } = res
    // // 注入后再执行初始化逻辑
    // if (payload) {
    onInit()
    // }
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
      // 通知内容脚本修改 localStorage，同时触发 js 端监听函数
      document.dispatchEvent(
        new CustomEvent(dispatchEventType, {
          detail: {
            type: DispatchType.SaveSchemeValue,
            payload,
          },
        }),
      )
      // 无论什么情况都再执行设置一次
      window.localStorage.setItem(localThemeKey, payload)

      // 执行切换逻辑
      onSwitch()
      break
  }
})

// document.addEventListener('matchMedia-script', function (e) {
//   console.log(e.detail)
// })
