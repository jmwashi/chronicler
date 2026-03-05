import { create } from 'zustand'
import type { Item } from '@/types'

interface ItemState {
  items: Item[]
  load: () => Promise<void>
  add: (item: Item) => Promise<void>
  update: (item: Item) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],

  load: async () => {
    const data = (await window.api.getAll('items')) as Item[]
    set({ items: data })
  },

  add: async (item) => {
    const updated = [...get().items, item]
    await window.api.set('items', updated)
    set({ items: updated })
  },

  update: async (item) => {
    const updated = get().items.map((i) => (i.id === item.id ? item : i))
    await window.api.set('items', updated)
    set({ items: updated })
  },

  remove: async (id) => {
    const updated = get().items.filter((i) => i.id !== id)
    await window.api.set('items', updated)
    set({ items: updated })
  }
}))
