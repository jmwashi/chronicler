import { create } from 'zustand'
import type { Campaign } from '@/types'

interface CampaignState {
  campaigns: Campaign[]
  load: () => Promise<void>
  add: (campaign: Campaign) => Promise<void>
  update: (campaign: Campaign) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],

  load: async () => {
    const data = (await window.api.getAll('campaigns')) as Campaign[]
    set({ campaigns: data })
  },

  add: async (campaign) => {
    const updated = [...get().campaigns, campaign]
    await window.api.set('campaigns', updated)
    set({ campaigns: updated })
  },

  update: async (campaign) => {
    const updated = get().campaigns.map((c) => (c.id === campaign.id ? campaign : c))
    await window.api.set('campaigns', updated)
    set({ campaigns: updated })
  },

  remove: async (id) => {
    const updated = get().campaigns.filter((c) => c.id !== id)
    await window.api.set('campaigns', updated)
    set({ campaigns: updated })
  }
}))
