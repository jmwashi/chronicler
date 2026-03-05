import { create } from 'zustand'
import {
  rollDice,
  rollAdvantage,
  rollDisadvantage,
  rollGroup,
  type RollResult,
  type GroupRollResult,
  type SavedRoll
} from '@/lib/diceRoller'

export type HistoryEntry =
  | (RollResult & { type: 'single' })
  | (GroupRollResult & { type: 'group' })

const MAX_HISTORY = 50

interface DiceState {
  diceDrawerOpen: boolean
  history: HistoryEntry[]
  savedRolls: SavedRoll[]

  toggleDiceDrawer: () => void
  openDiceDrawer: () => void
  clearHistory: () => void
  loadSavedRolls: () => Promise<void>
  addSavedRoll: (roll: SavedRoll) => Promise<void>
  removeSavedRoll: (id: string) => Promise<void>

  executeRoll: (formula: string, label?: string) => RollResult
  executeAdvantage: (modifier: number, label?: string) => RollResult
  executeDisadvantage: (modifier: number, label?: string) => RollResult
  executeGroupRoll: (
    formula: string,
    count: number,
    targetAC: number,
    label?: string
  ) => GroupRollResult
}

export const useDiceStore = create<DiceState>((set, get) => ({
  diceDrawerOpen: false,
  history: [],
  savedRolls: [],

  toggleDiceDrawer: () => set({ diceDrawerOpen: !get().diceDrawerOpen }),
  openDiceDrawer: () => set({ diceDrawerOpen: true }),

  clearHistory: () => set({ history: [] }),

  loadSavedRolls: async () => {
    const prefs = (await window.api.getAll('preferences')) as Record<string, unknown> | null
    set({ savedRolls: (prefs?.savedRolls as SavedRoll[]) ?? [] })
  },

  addSavedRoll: async (roll) => {
    const updated = [...get().savedRolls, roll]
    const prefs = (await window.api.getAll('preferences')) as Record<string, unknown> | null
    await window.api.set('preferences', { ...prefs, savedRolls: updated })
    set({ savedRolls: updated })
  },

  removeSavedRoll: async (id) => {
    const updated = get().savedRolls.filter((r) => r.id !== id)
    const prefs = (await window.api.getAll('preferences')) as Record<string, unknown> | null
    await window.api.set('preferences', { ...prefs, savedRolls: updated })
    set({ savedRolls: updated })
  },

  executeRoll: (formula, label) => {
    const result = rollDice(formula, label)
    const entry: HistoryEntry = { ...result, type: 'single' }
    set({ history: [entry, ...get().history].slice(0, MAX_HISTORY) })
    return result
  },

  executeAdvantage: (modifier, label) => {
    const result = rollAdvantage(modifier, label)
    const entry: HistoryEntry = { ...result, type: 'single' }
    set({ history: [entry, ...get().history].slice(0, MAX_HISTORY) })
    return result
  },

  executeDisadvantage: (modifier, label) => {
    const result = rollDisadvantage(modifier, label)
    const entry: HistoryEntry = { ...result, type: 'single' }
    set({ history: [entry, ...get().history].slice(0, MAX_HISTORY) })
    return result
  },

  executeGroupRoll: (formula, count, targetAC, label) => {
    const result = rollGroup(formula, count, targetAC, label)
    const entry: HistoryEntry = { ...result, type: 'group' }
    set({ history: [entry, ...get().history].slice(0, MAX_HISTORY) })
    return result
  }
}))
