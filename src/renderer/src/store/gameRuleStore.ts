import { create } from 'zustand'
import type { GameRule } from '@/types'

interface GameRuleState {
  gameRules: GameRule[]
  load: () => Promise<void>
  add: (rule: GameRule) => Promise<void>
  update: (rule: GameRule) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useGameRuleStore = create<GameRuleState>((set, get) => ({
  gameRules: [],

  load: async () => {
    const data = ((await window.api.getAll('gameRules')) ?? []) as GameRule[]
    set({ gameRules: data })
  },

  add: async (rule) => {
    const updated = [...get().gameRules, rule]
    await window.api.set('gameRules', updated)
    set({ gameRules: updated })
  },

  update: async (rule) => {
    const updated = get().gameRules.map((r) => (r.id === rule.id ? rule : r))
    await window.api.set('gameRules', updated)
    set({ gameRules: updated })
  },

  remove: async (id) => {
    const updated = get().gameRules.filter((r) => r.id !== id)
    await window.api.set('gameRules', updated)
    set({ gameRules: updated })
  }
}))
