import { create } from 'zustand'
import type { Lore } from '@/types'

interface LoreState {
  lore: Lore[]
  load: () => Promise<void>
  add: (entry: Lore) => Promise<void>
  update: (entry: Lore) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useLoreStore = create<LoreState>((set, get) => ({
  lore: [],

  load: async () => {
    const data = (await window.api.getAll('lore')) as Lore[]
    set({ lore: data })
  },

  add: async (entry) => {
    const updated = [...get().lore, entry]
    await window.api.set('lore', updated)
    set({ lore: updated })
  },

  update: async (entry) => {
    const updated = get().lore.map((l) => (l.id === entry.id ? entry : l))
    await window.api.set('lore', updated)
    set({ lore: updated })
  },

  remove: async (id) => {
    const updated = get().lore.filter((l) => l.id !== id)
    await window.api.set('lore', updated)
    set({ lore: updated })
  }
}))
