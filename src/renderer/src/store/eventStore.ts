import { create } from 'zustand'
import type { ChroniclerEvent } from '@/types'

interface EventState {
  events: ChroniclerEvent[]
  load: () => Promise<void>
  add: (event: ChroniclerEvent) => Promise<void>
  update: (event: ChroniclerEvent) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],

  load: async () => {
    const data = (await window.api.getAll('events')) as ChroniclerEvent[]
    set({ events: data })
  },

  add: async (event) => {
    const updated = [...get().events, event]
    await window.api.set('events', updated)
    set({ events: updated })
  },

  update: async (event) => {
    const updated = get().events.map((e) => (e.id === event.id ? event : e))
    await window.api.set('events', updated)
    set({ events: updated })
  },

  remove: async (id) => {
    const updated = get().events.filter((e) => e.id !== id)
    await window.api.set('events', updated)
    set({ events: updated })
  }
}))
