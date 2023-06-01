export enum ThemeValue {
  Dark = 'dark',
  Light = 'light',
}

export const localThemeKey = 'theme-color-switch__local-storage'

export const CSSMediaName = 'prefers-color-scheme'

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

export const darkStyleId = 'theme-color-switch__dark-id'
export const lightStyleId = 'theme-color-switch__light-id'

export const dispatchEventType = 'theme-color-switch__content-dispatch'

export enum DispatchType {
  SaveSchemeValue = 'saveSchemeValue',
}

export enum StorageKey {
  GlobalThemeKey = 'theme-color',
  EnhancedMode = 'enhanced-mode',
}
