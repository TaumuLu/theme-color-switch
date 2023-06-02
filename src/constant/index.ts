export const appName = 'theme-color-switch'

export enum ThemeValue {
  Dark = 'dark',
  Light = 'light',
}

export const localThemeKey = `${appName}__local-storage`

export const styleAttrTag = `${appName}__style-tag`

export const styleAttrReverse = `${appName}__style-reverse`

export const CSSMediaName = 'prefers-color-scheme'

export enum MessageType {
  RegisterContentScripts = 'registerContentScripts',
  GetContentThemeValue = 'getContentThemeValue',
  SetContentThemeValue = 'setContentThemeValue',
  GetContentHost = 'getContentHost',
  ContentLoad = 'contentLoad',
  EmitContentLoad = 'emitContentLoad',
  EmitPreLoad = 'emitPreLoad',
}

export interface SendMessage<P = any> {
  type: MessageType
  payload?: P
}

export interface ResponseMessage<P = any> {
  payload?: P
}

export const darkStyleId = `${appName}__dark-id`
export const lightStyleId = `${appName}__light-id`

export const dispatchEventType = `${appName}__content-dispatch`

export enum DispatchType {
  Preload = 'preload',
  SaveSchemeValue = 'saveSchemeValue',
  UpdateStorage = 'updateStorage',
}

export enum StorageKey {
  GlobalThemeKey = 'theme-color',
  EnhancedMode = 'enhanced-mode',
  Enable = 'enable',
}

export const defaultStorage = {
  [StorageKey.GlobalThemeKey]: ThemeValue.Dark,
  [StorageKey.EnhancedMode]: true,
  [StorageKey.Enable]: true,
}

export type DefaultStorage = typeof defaultStorage

export enum EmitType {
  True,
  False,
  None,
}
