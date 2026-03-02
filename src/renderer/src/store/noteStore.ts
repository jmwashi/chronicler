import { create } from 'zustand'
import type { Note } from '@/types'

interface NoteState {
  notes: Note[]
  load: () => Promise<void>
  add: (note: Note) => Promise<void>
  update: (note: Note) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],

  load: async () => {
    const data = (await window.api.getAll('notes')) as Note[]
    set({ notes: data })
  },

  add: async (note) => {
    const updated = [...get().notes, note]
    await window.api.set('notes', updated)
    set({ notes: updated })
  },

  update: async (note) => {
    const updated = get().notes.map((n) => (n.id === note.id ? note : n))
    await window.api.set('notes', updated)
    set({ notes: updated })
  },

  remove: async (id) => {
    const updated = get().notes.filter((n) => n.id !== id)
    await window.api.set('notes', updated)
    set({ notes: updated })
  }
}))
