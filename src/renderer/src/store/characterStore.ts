import { create } from 'zustand'
import type { Character } from '@/types'

interface CharacterState {
  characters: Character[]
  load: () => Promise<void>
  add: (character: Character) => Promise<void>
  update: (character: Character) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],

  load: async () => {
    const data = (await window.api.getAll('characters')) as Character[]
    set({ characters: data })
  },

  add: async (character) => {
    const updated = [...get().characters, character]
    await window.api.set('characters', updated)
    set({ characters: updated })
  },

  update: async (character) => {
    const updated = get().characters.map((c) => (c.id === character.id ? character : c))
    await window.api.set('characters', updated)
    set({ characters: updated })
  },

  remove: async (id) => {
    const updated = get().characters.filter((c) => c.id !== id)
    await window.api.set('characters', updated)
    set({ characters: updated })
  }
}))
