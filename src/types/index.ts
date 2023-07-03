export type Dict<T = any> = Record<string, T>

export interface StyleStatus {
  listenerCount: number
  listenerTotal: number
  lightRules: number
  darkRules: number
  isDark: boolean
}
