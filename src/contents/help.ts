import { CSSMediaName, EmitType, ThemeValue, localThemeKey } from '../constant'

export const getIsDark = () => {
  const { matches: isDark } = window.matchMedia(`(${CSSMediaName}: dark)`)
  return isDark
}

export const getIsLocalDark = () => {
  return getThemeValue() === ThemeValue.Dark
}

export const getThemeValue = () => {
  const localThemeValue = window.localStorage.getItem(localThemeKey)
  const isDark = getIsDark()
  const curThemeValue =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/strict-boolean-expressions
    localThemeValue || (isDark ? ThemeValue.Dark : ThemeValue.Light)
  return curThemeValue
}

export const getCssText = (cssRules: CSSRule[]) => {
  return Array.from(cssRules).reduce((p, c) => {
    return p + c.cssText
  }, '')
}

export const replaceCssText = (cssText: string, themValue: ThemeValue) => {
  return cssText.replace(/\((.*prefers-color-scheme.*)\)/g, match => {
    return match.replace(
      themValue,
      themValue === ThemeValue.Dark ? ThemeValue.Light : ThemeValue.Dark,
    )
  })
}

export const onStyleObserver = (
  onWatch: (mutations: MutationRecord[]) => void,
  isEmit?: (node: Node, isAdd: boolean) => EmitType,
) => {
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(mutations => {
      // 记录新增的 link 标签，在加载完整后再触发回调
      const linkNodes: HTMLLinkElement[] = []
      const onNodeEmit = (node: Node, isAdd: boolean) => {
        const name = node.nodeName.toLowerCase()
        if (isEmit) {
          const value = isEmit(node, isAdd)
          switch (value) {
            case EmitType.True:
              return true
            case EmitType.False:
              return false
          }
        }
        if (name === 'style') {
          return true
        } else if (name === 'link') {
          const link = node as HTMLLinkElement
          if (link.getAttribute('rel') === 'stylesheet') {
            if (isAdd) {
              linkNodes.push(link)
            }
            return true
          }
        }
        return false
      }
      const isWatch = Array.from(mutations).some(item => {
        return (
          Array.from(item.addedNodes).some(node => onNodeEmit(node, true)) ||
          Array.from(item.removedNodes).some(node => onNodeEmit(node, false))
        )
      })
      if (isWatch) {
        if (linkNodes.length) {
          // 等待 link 标签加载完再通知回调
          Promise.all(
            linkNodes.map(async link => {
              await new Promise<void>((resolve, reject) => {
                link.addEventListener('load', () => {
                  resolve()
                })
                link.addEventListener('load', e => {
                  reject(e)
                })
              })
            }),
          ).finally(() => {
            onWatch(mutations)
          })
        } else {
          onWatch(mutations)
        }
      }
    })
    observer.observe(document.head, { childList: true, subtree: false })
  }
}

// 替换 link 标签
export const insertCrossOrigin = async () => {
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
          }).catch((e: any) => {
            console.error(`link add crossorigin error:`, e)
          })
        }
        return Promise.resolve()
      },
    ),
  )
}
