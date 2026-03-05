import { create } from 'zustand'
import type { Campaign } from '@/types'
import { useCharacterStore } from './characterStore'
import { useNoteStore } from './noteStore'
import { useLoreStore } from './loreStore'
import { useDocumentStore } from './documentStore'
import { useItemStore } from './itemStore'
import { useLocationStore } from './locationStore'
import { useFactionStore } from './factionStore'
import { useSessionStore } from './sessionStore'
import { useSceneStore } from './sceneStore'
import { useTagStore } from './tagStore'
import { useGameRuleStore } from './gameRuleStore'
import { useUIStore } from './uiStore'

const entityStores = () => [
  { store: useCharacterStore, key: 'characters' as const, field: 'characters' as const },
  { store: useNoteStore, key: 'notes' as const, field: 'notes' as const },
  { store: useLoreStore, key: 'lore' as const, field: 'lore' as const },
  { store: useDocumentStore, key: 'documents' as const, field: 'documents' as const },
  { store: useItemStore, key: 'items' as const, field: 'items' as const },
  { store: useLocationStore, key: 'locations' as const, field: 'locations' as const },
  { store: useFactionStore, key: 'factions' as const, field: 'factions' as const },
  { store: useSessionStore, key: 'sessions' as const, field: 'sessions' as const },
  { store: useSceneStore, key: 'scenes' as const, field: 'scenes' as const },
  { store: useTagStore, key: 'tags' as const, field: 'tags' as const },
  { store: useGameRuleStore, key: 'gameRules' as const, field: 'gameRules' as const }
]

interface CampaignState {
  campaigns: Campaign[]
  load: () => Promise<void>
  add: (campaign: Campaign) => Promise<void>
  update: (campaign: Campaign) => Promise<void>
  remove: (id: string) => Promise<void>
  removeCascade: (id: string) => Promise<void>
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
  },

  removeCascade: async (id) => {
    // Remove campaign
    const updated = get().campaigns.filter((c) => c.id !== id)
    await window.api.set('campaigns', updated)
    set({ campaigns: updated })

    // Remove all entities belonging to this campaign
    for (const { store, key, field } of entityStores()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = store.getState() as any
      const items = state[field] as { campaignId: string }[]
      const filtered = items.filter((e) => e.campaignId !== id)
      if (filtered.length !== items.length) {
        await window.api.set(key, filtered)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(store.setState as any)({ [field]: filtered })
      }
    }

    // Clear active campaign if it was the deleted one
    const ui = useUIStore.getState()
    if (ui.activeCampaignId === id) {
      ui.setActiveCampaign(updated.length > 0 ? updated[0].id : null)
    }
  }
}))
