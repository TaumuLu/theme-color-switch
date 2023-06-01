export enum ThemeValue {
  Dark = 'dark',
  Light = 'light',
}

export const globalThemeKey = 'theme-color-global'

export const localThemeKey = 'theme-color-switch__local'

export const CSSMediaKey = 'prefers-color-scheme'

export enum MessageType {
  RegisterContentScripts = 'registerContentScripts',
  GetContentThemeValue = 'getContentThemeValue',
  SetContentThemeValue = 'setContentThemeValue',
  GetContentHost = 'getContentHost',
}

export interface SendMessage<P = any> {
  type: MessageType
  payload?: P
}

export interface ResponseMessage<P = any> {
  payload?: P
}
