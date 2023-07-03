# [主题色切换](https://github.com/TaumuLu/theme-color-switch)

- 可以主动切换任一网页主题色的扩展，而无需跟随系统遵循浏览器统一的主题色风格
- [Chrome 应用商店地址](https://chrome.google.com/webstore/detail/theme-color-switch/mgmpaknickmjdkgacgnkdgakngohhfje)
- [Edge 应用商店地址](https://microsoftedge.microsoft.com/addons/detail/bmpdefkcildkmjdlcbbpjjinaijpledn)

## js 获取主题色方式

```javascript
window.matchMedia('(prefers-color-scheme: dark)')
```

## 依赖项目

- element-plus
  - https://element-plus.org/zh-CN/component/button.html
- crxjs
  - https://github.com/crxjs/chrome-extension-tools

## 相关地址

### 文档

- https://developer.chrome.com/docs/extensions/mv3/
- https://crxjs.dev/vite-plugin

### 测试网站

- https://sspai.com/
- https://theme-next.org/index.html
- https://developer.mozilla.org/docs/Web
- https://learn.microsoft.com/zh-cn/microsoft-edge/extensions-chromium/publish/publish-extension
- 微信公众号文章
  - https://mp.weixin.qq.com/s/PyHJGz7SkKoWHlrmS7KZfA
  - https://mp.weixin.qq.com/s/zb-lkYlgp3iJFm9AMO0RsQ

## ChangeLog

### 0.2.0

- 移除增强模式，自动开启或关闭
- 添加状态展示，显示当前开启状态和样式信息
- 修复样式监听 bug
- 修复授权网站启用后未自动刷新 bug
- ~~增加子路由控制是否开启~~
- ~~国际化支持~~

### 0.1.0

- 除默认启用站点外，其他站点改为按需启用，点击用户授权后启用
- 增加增强模式，开启后 js 改写全局 window.matchMedia 函数

### 0.0.4

- 改为仅指定网站启用

### 0.0.1

- 实现最小可用版本
- 所有网站上运行
