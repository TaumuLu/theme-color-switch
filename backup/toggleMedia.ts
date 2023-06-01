interface Options {
  quiet?: boolean
  onError?: (e: Error, styleSheet: CSSStyleSheet) => void
}

function deleteRules(styleRule: CSSMediaRule) {
  const cssText = Array.from(styleRule.cssRules).map(rule => {
    styleRule.deleteRule(0)
    return rule.cssText
  })

  return cssText
}

class MediaRule {
  cssMediaRules = new Set<CSSMediaRule>()

  cssTexts: string[][] = []

  addRule(rule: CSSMediaRule) {
    if (!this.cssMediaRules.has(rule)) {
      this.cssMediaRules.add(rule)

      if (this.disabled) {
        this.toggle(this.disabled)
      }
    }
  }

  get() {
    return this.cssMediaRules
  }

  get disabled() {
    return !(this.cssTexts.length === 0)
  }

  toggle = (flag = !this.disabled) => {
    if (flag) {
      this.cssTexts = [...this.cssMediaRules].reduce<string[][]>((p, c) => {
        p.push(deleteRules(c))
        return p
      }, [])
    } else {
      if (this.cssTexts.length > 0) {
        this.cssMediaRules.forEach(rule => {
          const cssText = this.cssTexts.shift()
          if (cssText != null) {
            cssText.forEach(text => rule.insertRule(text, rule.cssRules.length))
          }
        })
      }
    }
  }
}

export class MediaRules {
  constructor(options: Options = {}) {
    this.options = options

    this.init()
  }

  options: Options = {}

  mediaRuleMap = new Map<string, MediaRule>()

  mediaRules: CSSMediaRule[] = []

  getMediaRules() {
    const mediaRules: CSSMediaRule[] = []
    Array.from(document.styleSheets).forEach(styleSheet => {
      try {
        const { disabled } = styleSheet
        if (!disabled) {
          const { cssRules } = styleSheet
          Array.from(cssRules).forEach(rule => {
            if (rule instanceof CSSMediaRule) {
              mediaRules.push(rule)
            }
          })
        }
      } catch (e) {
        const { quiet, onError } = this.options
        if (onError != null) {
          onError(e as any, styleSheet)
        } else if (quiet === false) {
          console.error(e)
        }
      }
    })

    this.mediaRules = mediaRules
    return mediaRules
  }

  init() {
    this.getMediaRules()

    this.mediaRules.forEach(mediaRule => {
      const { conditionText } = mediaRule
      let value = this.mediaRuleMap.get(conditionText)
      if (value == null) {
        value = new MediaRule()
      }
      value.addRule(mediaRule)
      if (!this.mediaRuleMap.has(conditionText)) {
        this.mediaRuleMap.set(conditionText, value)
      }
    })
  }
}

export const onStyleObserver = (onWatch: () => void) => {
  if (typeof MutationObserver !== 'undefined') {
    const onNodeEmit = (node: Node, isAdd: boolean) => {
      const name = node.nodeName.toLowerCase()
      if (name === 'style') {
        return true
      } else if (name === 'link') {
        const link = node as HTMLLinkElement
        if (link.getAttribute('rel') === 'stylesheet') {
          return true
        }
      }
      return false
    }

    const observer = new MutationObserver(mutations => {
      const isWatch = Array.from(mutations).some(item => {
        return (
          Array.from(item.addedNodes).some(node => onNodeEmit(node, true)) ||
          Array.from(item.removedNodes).some(node => onNodeEmit(node, false))
        )
      })
      if (isWatch) {
        onWatch()
      }
    })
    observer.observe(document, { childList: true, subtree: true })
  }
  onWatch()
}

const getMediaToggle = (options?: Options) => {
  const subscribers: Array<() => void> = []
  const mediaRules = new MediaRules(options)

  onStyleObserver(() => {
    mediaRules.init()
    subscribers.forEach(fn => {
      fn()
    })
  })

  return {
    get() {
      return mediaRules.mediaRuleMap
    },
    toggle() {
      mediaRules.mediaRuleMap.forEach(value => {
        value.toggle()
      })
    },
    subscribe(fn: any) {
      subscribers.push(fn)

      return () => {
        const index = subscribers.indexOf(fn)
        if (index !== -1) {
          subscribers.splice(index, 1)
        }
      }
    },
  }
}

export default getMediaToggle
