import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

contextBridge.exposeInMainWorld('electron', electronAPI)

contextBridge.exposeInMainWorld('api', {
  getAll: (key: string): Promise<unknown> => ipcRenderer.invoke('store:getAll', key),
  set:    (key: string, value: unknown): Promise<void> => ipcRenderer.invoke('store:set', key, value),
  clear:  (key: string): Promise<void> => ipcRenderer.invoke('store:clear', key)
})
