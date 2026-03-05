import { create } from 'zustand'
import type { Document } from '@/types'

interface DocumentState {
  documents: Document[]
  load: () => Promise<void>
  add: (doc: Document) => Promise<void>
  update: (doc: Document) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],

  load: async () => {
    const data = (await window.api.getAll('documents')) as Document[]
    set({ documents: data })
  },

  add: async (doc) => {
    const updated = [...get().documents, doc]
    await window.api.set('documents', updated)
    set({ documents: updated })
  },

  update: async (doc) => {
    const updated = get().documents.map((d) => (d.id === doc.id ? doc : d))
    await window.api.set('documents', updated)
    set({ documents: updated })
  },

  remove: async (id) => {
    const updated = get().documents.filter((d) => d.id !== id)
    await window.api.set('documents', updated)
    set({ documents: updated })
  }
}))
