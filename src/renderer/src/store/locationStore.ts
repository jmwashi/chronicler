import { create } from 'zustand'
import type { Location } from '@/types'

interface LocationState {
  locations: Location[]
  load: () => Promise<void>
  add: (location: Location) => Promise<void>
  update: (location: Location) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],

  load: async () => {
    const data = (await window.api.getAll('locations')) as Location[]
    set({ locations: data })
  },

  add: async (location) => {
    const updated = [...get().locations, location]
    await window.api.set('locations', updated)
    set({ locations: updated })
  },

  update: async (location) => {
    const updated = get().locations.map((l) => (l.id === location.id ? location : l))
    await window.api.set('locations', updated)
    set({ locations: updated })
  },

  remove: async (id) => {
    const updated = get().locations.filter((l) => l.id !== id)
    await window.api.set('locations', updated)
    set({ locations: updated })
  }
}))
