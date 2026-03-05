import { create } from 'zustand'
import type { Faction } from '@/types'

interface FactionState {
  factions: Faction[]
  load: () => Promise<void>
  add: (faction: Faction) => Promise<void>
  update: (faction: Faction) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useFactionStore = create<FactionState>((set, get) => ({
  factions: [],

  load: async () => {
    const data = (await window.api.getAll('factions')) as Faction[]
    set({ factions: data })
  },

  add: async (faction) => {
    const updated = [...get().factions, faction]
    await window.api.set('factions', updated)
    set({ factions: updated })
  },

  update: async (faction) => {
    const updated = get().factions.map((f) => (f.id === faction.id ? faction : f))
    await window.api.set('factions', updated)
    set({ factions: updated })
  },

  remove: async (id) => {
    const updated = get().factions.filter((f) => f.id !== id)
    await window.api.set('factions', updated)
    set({ factions: updated })
  }
}))
