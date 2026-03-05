import { create } from 'zustand'
import type { Session } from '@/types'

interface SessionState {
  sessions: Session[]
  load: () => Promise<void>
  add: (session: Session) => Promise<void>
  update: (session: Session) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],

  load: async () => {
    const data = (await window.api.getAll('sessions')) as Session[]
    set({ sessions: data })
  },

  add: async (session) => {
    const updated = [...get().sessions, session]
    await window.api.set('sessions', updated)
    set({ sessions: updated })
  },

  update: async (session) => {
    const updated = get().sessions.map((s) => (s.id === session.id ? session : s))
    await window.api.set('sessions', updated)
    set({ sessions: updated })
  },

  remove: async (id) => {
    const updated = get().sessions.filter((s) => s.id !== id)
    await window.api.set('sessions', updated)
    set({ sessions: updated })
  }
}))
