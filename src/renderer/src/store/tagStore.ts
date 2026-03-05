import { create } from 'zustand'
import type { Tag } from '@/types/tag'

interface TagState {
  tags: Tag[]
  load: () => Promise<void>
  add: (tag: Tag) => Promise<void>
  update: (tag: Tag) => Promise<void>
  remove: (id: string) => Promise<void>
  removeTagFromAllEntities: (tagId: string) => Promise<void>
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],

  load: async () => {
    const data = (await window.api.getAll('tags')) as Tag[]
    set({ tags: data })
  },

  add: async (tag) => {
    const updated = [...get().tags, tag]
    await window.api.set('tags', updated)
    set({ tags: updated })
  },

  update: async (tag) => {
    const updated = get().tags.map((t) => (t.id === tag.id ? tag : t))
    await window.api.set('tags', updated)
    set({ tags: updated })
  },

  remove: async (id) => {
    const updated = get().tags.filter((t) => t.id !== id)
    await window.api.set('tags', updated)
    set({ tags: updated })
  },

  removeTagFromAllEntities: async (tagId: string) => {
    const keys = ['characters', 'lore', 'notes', 'items', 'locations', 'factions'] as const
    for (const key of keys) {
      const entities = (await window.api.getAll(key)) as Array<{ tags?: string[] }>
      const updated = entities.map((e) =>
        e.tags?.includes(tagId) ? { ...e, tags: e.tags.filter((t: string) => t !== tagId) } : e
      )
      if (updated.some((e, i) => e !== entities[i])) {
        await window.api.set(key, updated)
      }
    }
  }
}))
