;(function () {
  const appName = 'theme-color-switch'
  const CSSMediaName = 'prefers-color-scheme'
  const localThemeKey = `${appName}__local-storage`
  const listenerType = `${appName}__content-dispatch`
  const dispatchType = {
    Preload: 'preload',
    SaveSchemeValue: 'saveSchemeValue',
    UpdateStorage: 'updateStorage',
  }
  let storageValue = {
    enable: false,
  }

  const matchMedia = window.matchMedia

  const themeMap = {
    dark: 'dark',
    light: 'light',
  }

  const getThemeValue = () => {
    const localThemeValue = localStorage.getItem(localThemeKey)
    const { matches: isDark } = matchMedia(`(${CSSMediaName}: dark)`)

    const curThemeValue =
      localThemeValue || (isDark ? themeMap.dark : themeMap.light)

    return curThemeValue
  }

  const getAddListener = mediaQueryList => {
    const list = new Set()
    const watch = e => {
      list.forEach(fn => fn(e))
    }
    mediaQueryList.addListener(watch)

    return {
      mediaQueryList,
      proxyMediaQueryList: null,
      addListener(fn) {
        list.add(fn)
      },
      removeListener(fn) {
        list.delete(fn)
      },
      watch,
    }
  }

  const listeners = []

  window.matchMedia = (mediaText, ...other) => {
    const result = matchMedia(mediaText, ...other)

    if (mediaText.includes(CSSMediaName)) {
      const listener = getAddListener(result)
      listeners.push(listener)

      const proxyMediaQueryList = new Proxy(result, {
        get: function (target, property, receiver) {
          const curThemeValue = getThemeValue()
          switch (property) {
            case 'matches':
              if (curThemeValue) {
                return mediaText.includes('dark')
                  ? curThemeValue === 'dark'
                  : curThemeValue === 'light'
              }
              break
            case 'addListener':
              return listener.addListener
            case 'removeListener':
              return listener.removeListener
          }

          const value = target[property]
          // const value = Reflect.get(target, property, receiver)
          if (typeof value === 'function') {
            return value.bind(target)
          }
          return value
        },
      })

      listener.proxyMediaQueryList = proxyMediaQueryList

      return proxyMediaQueryList
    }
    return result
  }

  const emitListeners = () => {
    if (!storageValue.enable) return

    // 主动执行监听函数
    listeners.forEach(item => {
      const { media } = item.mediaQueryList
      const { matches } = item.proxyMediaQueryList

      try {
        item.watch({
          matches,
          media,
        })
      } catch (error) {
        console.error('theme-color-switch: Trigger listening failed')
      }
    })
  }

  document.addEventListener(listenerType, function (e) {
    const { type, payload } = e.detail || {}
    switch (type) {
      case dispatchType.Preload:
        storageValue = payload

        if (listeners.length) {
          // 说明已经触发过媒体查询了，因此要执行监听返回当前的主题
          emitListeners()
        }
        break
      case dispatchType.UpdateStorage:
        storageValue = Object.assign(storageValue, payload)
        break
      case dispatchType.SaveSchemeValue:
        localStorage.setItem(localThemeKey, payload)

        emitListeners()
        break
    }
  })
})()
