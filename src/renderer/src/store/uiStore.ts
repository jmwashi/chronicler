import { create } from 'zustand'

export type Theme = 'dark' | 'parchment'

interface UIState {
  theme: Theme
  activeCampaignId: string | null
  loadPreferences: () => Promise<void>
  setTheme: (theme: Theme) => Promise<void>
  setActiveCampaign: (id: string | null) => void
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  activeCampaignId: null,

  loadPreferences: async () => {
    const prefs = (await window.api.getAll('preferences')) as { theme: Theme }
    const theme = prefs?.theme ?? 'dark'
    applyTheme(theme)
    set({ theme })
  },

  setTheme: async (theme) => {
    await window.api.set('preferences', { theme })
    applyTheme(theme)
    set({ theme })
  },

  setActiveCampaign: (id) => set({ activeCampaignId: id })
}))
