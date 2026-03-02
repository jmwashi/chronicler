export interface ElectronAPI {
  getAll: (key: string) => Promise<unknown>
  set:    (key: string, value: unknown) => Promise<void>
  clear:  (key: string) => Promise<void>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
