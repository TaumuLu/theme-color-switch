import { type Dict } from '../types'
import { defaultHosts } from './config'

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
  UnRegisterContentScripts = 'unRegisterContentScripts',
  GetContentThemeValue = 'getContentThemeValue',
  SetContentThemeValue = 'setContentThemeValue',
  GetContentHost = 'getContentHost',
  ContentLoad = 'contentLoad',
  EmitContentLoad = 'emitContentLoad',
  EmitPreLoad = 'emitPreLoad',
  GetStyleStatus = 'GetStyleStatus',
  PutStyleStatus = 'PutStyleStatus',
  UpdateDomain = 'UpdateDomain',
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

export const enum DispatchEventType {
  Switch = `${appName}__dispatch-switch`,
  MatchMedia = `${appName}__dispatch-matchMedia`,
}

export enum DispatchType {
  Preload = 'preload',
  SaveSchemeValue = 'saveSchemeValue',
  UpdateStorage = 'updateStorage',
  GetListeners = 'getListeners',
}

export enum StorageKey {
  Domain = 'domain',
}

export interface DomainValue {
  enable: boolean
  // excludePath: string[]
}

export const defaultDomain: DomainValue = {
  enable: true,
  // excludePath: [],
}

export const defaultStorage = {
  [StorageKey.Domain]: defaultHosts.reduce<Dict<DomainValue>>((p, c, i) => {
    return {
      ...p,
      [c]: { ...defaultDomain },
    }
  }, {}),
}

export type DefaultStorage = typeof defaultStorage

export enum EmitType {
  True,
  False,
  None,
}
