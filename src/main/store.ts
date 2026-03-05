import Store from 'electron-store'
import { ipcMain } from 'electron'

const schema = {
  campaigns:   { type: 'array',  default: [] },
  characters:  { type: 'array',  default: [] },
  lore:        { type: 'array',  default: [] },
  notes:       { type: 'array',  default: [] },
  documents:   { type: 'array',  default: [] },
  items:       { type: 'array',  default: [] },
  locations:   { type: 'array',  default: [] },
  factions:    { type: 'array',  default: [] },
  tags:        { type: 'array',  default: [] },
  sessions:    { type: 'array',  default: [] },
  scenes:      { type: 'array',  default: [] },
  gameRules:   { type: 'array',  default: [] },
  preferences: { type: 'object', default: { theme: 'dark' } }
} as const

export type StoreKey = keyof typeof schema

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Store<Record<StoreKey, any>>({ schema })

export function registerStoreHandlers(): void {
  ipcMain.handle('store:getAll', (_e, key: StoreKey) => store.get(key))

  ipcMain.handle('store:set', (_e, key: StoreKey, value: unknown) => {
    store.set(key, value)
  })

  ipcMain.handle('store:clear', (_e, key: StoreKey) => {
    store.set(key, key === 'preferences' ? { theme: 'dark' } : [])
  })
}
