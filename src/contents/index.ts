import {
  localThemeKey,
  ThemeValue,
  CSSMediaName,
  MessageType,
  darkStyleId,
  lightStyleId,
  dispatchEventType,
  DispatchType,
  styleAttrTag,
  EmitType,
  styleAttrReverse,
  StorageKey,
} from '@/constant'
import {
  getCssText,
  getIsDark,
  getIsLocalDark,
  getThemeValue,
  insertCrossOrigin,
  onStyleObserver,
  replaceCssText,
} from './help'
import { getStorageValue } from '../utils/storage'

let lightRules: CSSMediaRule[] = []
let darkRules: CSSMediaRule[] = []

const onInitStyle = async () => {
  // 避免 CORS 问题
  await insertCrossOrigin()

  const newLightRules: CSSMediaRule[] = []
  const newDarkRules: CSSMediaRule[] = []
  Array.from(document.styleSheets).forEach(styleSheet => {
    try {
      const { disabled } = styleSheet
      if (!disabled) {
        const { cssRules, ownerNode } = styleSheet
        let isReverse = false

        if (ownerNode instanceof HTMLStyleElement) {
          const id = ownerNode.getAttribute('id')
          isReverse = ownerNode.getAttribute(styleAttrReverse) === 'true'

          // 清空重复的样式
          if (id === darkStyleId) {
            darkRules = []
          } else if (id === lightStyleId) {
            lightRules = []
          }
        }

        const filterCssRules = Array.from(cssRules).filter(rule => {
          if (rule instanceof CSSMediaRule) {
            const { conditionText } = rule
            if (conditionText.includes(CSSMediaName)) {
              if (conditionText.includes(ThemeValue.Dark)) {
                // 处理翻转后的样式
                if (isReverse) {
                  rule.cssText = replaceCssText(rule.cssText, ThemeValue.Dark)
                  newLightRules.push(rule)
                } else {
                  newDarkRules.push(rule)
                }
              } else {
                if (isReverse) {
                  rule.cssText = replaceCssText(rule.cssText, ThemeValue.Light)
                  newDarkRules.push(rule)
                } else {
                  newLightRules.push(rule)
                }
              }
              return false
            }
          }
          return true
        })

        if (filterCssRules.length !== cssRules.length) {
          // 存在规则再创建
          if (filterCssRules.length) {
            const style = document.createElement('style')
            style.setAttribute(styleAttrTag, 'true')
            style.innerText = getCssText(filterCssRules)
            ownerNode?.parentNode?.insertBefore(style, ownerNode)
          }
          // 只要发生变化了都删除节点
          ownerNode?.parentNode?.removeChild(ownerNode)
        }
      }
    } catch (e) {
      // console.error(e)
    }
  })

  darkRules = darkRules.concat(newDarkRules)
  lightRules = lightRules.concat(newLightRules)

  // console.log(
  //   22222,
  //   document.styleSheets.length,
  //   lightRules.length,
  //   darkRules.length,
  // )
}

const applyStyleRules = (themValue: ThemeValue, isReverse = false) => {
  const isDark = themValue === ThemeValue.Dark
  const id = isDark ? darkStyleId : lightStyleId
  const rules = isDark ? darkRules : lightRules

  let themeStyle = document.getElementById(id) as HTMLStyleElement

  let cssText = getCssText(rules)
  if (isReverse) {
    cssText = replaceCssText(cssText, themValue)
  }
  if (cssText) {
    if (!themeStyle) {
      themeStyle = document.createElement('style')
      document.head.appendChild(themeStyle)
    }
    themeStyle.setAttribute('id', id)
    themeStyle.setAttribute(styleAttrTag, 'true')
    if (isReverse) {
      // 设置样式反转标识
      themeStyle.setAttribute(styleAttrReverse, 'true')
    }
    themeStyle.innerText = cssText
  }
  const removeThemeStyle = document.getElementById(
    isDark ? lightStyleId : darkStyleId,
  )
  if (removeThemeStyle) {
    document.head.removeChild(removeThemeStyle)
  }
}

let isInitStyle = false
let isObserver = false

const onSwitch = async () => {
  // 是否启用
  const isEnable = await getStorageValue(StorageKey.Enable)
  if (!isEnable) return

  const curThemeValue = getThemeValue()
  const isDark = getIsDark()
  const isLocalDark = curThemeValue === ThemeValue.Dark

  // 初始化 style 标签，只执行一次
  if (!isInitStyle) {
    await onInitStyle()
    const enhancedMode = await getStorageValue(StorageKey.EnhancedMode)

    if (enhancedMode && !isObserver) {
      onStyleObserver(
        () => {
          // console.info('onInitStyle')
          isInitStyle = false
          onSwitch()
        },
        node => {
          if (node instanceof HTMLElement) {
            const tag = node.getAttribute(styleAttrTag)
            // 标记过的修改除外
            if (tag) {
              return EmitType.False
            }
          }
          return EmitType.None
        },
      )
      isObserver = true
    }
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

// 初始化检查执行
const onInit = () => {
  const isDark = getIsDark()
  const isLocalDark = getIsLocalDark()
  const isSame = isDark ? isLocalDark : !isLocalDark

  // 仅第一次判断下是否需要切换
  if (!isSame) {
    onSwitch()
  }
}

onInit()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { payload } = request

  switch (request.type) {
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
