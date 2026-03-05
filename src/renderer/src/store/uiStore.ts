import { create } from 'zustand'

export type Theme = 'dark' | 'parchment'

export interface CustomTool {
  id: string
  name: string
  url: string
}

interface UIState {
  theme: Theme
  activeCampaignId: string | null
  activeSessionId: string | null
  scratchPadOpen: boolean
  navigationDepth: number
  customTools: CustomTool[]
  loadPreferences: () => Promise<void>
  setTheme: (theme: Theme) => Promise<void>
  setActiveCampaign: (id: string | null) => void
  setActiveSession: (id: string | null) => Promise<void>
  toggleScratchPad: () => void
  incrementNavDepth: () => void
  decrementNavDepth: () => void
  addCustomTool: (tool: CustomTool) => Promise<void>
  removeCustomTool: (id: string) => Promise<void>
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
}

// Apply default immediately so the page never renders without a theme
applyTheme('dark')

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'dark',
  activeCampaignId: null,
  activeSessionId: null,
  scratchPadOpen: false,
  navigationDepth: 0,
  customTools: [],

  loadPreferences: async () => {
    const prefs = (await window.api.getAll('preferences')) as {
      theme: Theme
      activeSessionId?: string | null
    }
    const theme = prefs?.theme ?? 'dark'
    applyTheme(theme)
    set({
      theme,
      activeSessionId: prefs?.activeSessionId ?? null,
      customTools: (prefs as Record<string, unknown>)?.customTools as CustomTool[] ?? []
    })
  },

  setTheme: async (theme) => {
    const prefs = (await window.api.getAll('preferences')) as Record<string, unknown> | null
    await window.api.set('preferences', { ...prefs, theme })
    applyTheme(theme)
    set({ theme })
  },

  setActiveSession: async (id) => {
    const prefs = (await window.api.getAll('preferences')) as Record<string, unknown> | null
    await window.api.set('preferences', { ...prefs, activeSessionId: id })
    set({ activeSessionId: id })
  },

  setActiveCampaign: (id) => set({ activeCampaignId: id }),
  toggleScratchPad: () => set({ scratchPadOpen: !get().scratchPadOpen }),
  incrementNavDepth: () => set({ navigationDepth: get().navigationDepth + 1 }),
  decrementNavDepth: () => set({ navigationDepth: Math.max(0, get().navigationDepth - 1) }),

  addCustomTool: async (tool) => {
    const updated = [...get().customTools, tool]
    const prefs = (await window.api.getAll('preferences')) as Record<string, unknown> | null
    await window.api.set('preferences', { ...prefs, customTools: updated })
    set({ customTools: updated })
  },

  removeCustomTool: async (id) => {
    const updated = get().customTools.filter((t) => t.id !== id)
    const prefs = (await window.api.getAll('preferences')) as Record<string, unknown> | null
    await window.api.set('preferences', { ...prefs, customTools: updated })
    set({ customTools: updated })
  }
}))
