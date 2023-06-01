;(function () {
  const CSSMediaName = 'prefers-color-scheme'
  const localThemeKey = 'theme-color-switch__local-storage'
  const listenerType = 'theme-color-switch__content-dispatch'
  const dispatchType = {
    SaveSchemeValue: 'saveSchemeValue',
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

  const mediaList = []

  window.matchMedia = (mediaText, ...other) => {
    const result = matchMedia(mediaText, ...other)

    if (mediaText.includes(CSSMediaName)) {
      const listener = getAddListener(result)
      mediaList.push(listener)

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

          const value = Reflect.get(target, property, receiver)
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

  document.addEventListener(listenerType, function (e) {
    const { type, payload } = e.detail || {}
    switch (type) {
      case dispatchType.SaveSchemeValue:
        localStorage.setItem(localThemeKey, payload)

        // 主动执行监听函数
        mediaList.forEach(item => {
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
        break
    }
  })

  // document.dispatchEvent(
  //   new CustomEvent('matchMedia-script', {
  //     detail: 'test',
  //   }),
  // )
})()
