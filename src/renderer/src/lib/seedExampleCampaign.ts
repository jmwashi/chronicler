import { generateExampleCampaign } from './exampleCampaign'
import { useCampaignStore } from '@/store/campaignStore'
import { useCharacterStore } from '@/store/characterStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useLoreStore } from '@/store/loreStore'
import { useNoteStore } from '@/store/noteStore'
import { useDocumentStore } from '@/store/documentStore'
import { useSessionStore } from '@/store/sessionStore'
import { useSceneStore } from '@/store/sceneStore'
import { useTagStore } from '@/store/tagStore'
import { useGameRuleStore } from '@/store/gameRuleStore'
import { useUIStore } from '@/store/uiStore'

const STORE_KEYS = [
  { key: 'campaigns', store: useCampaignStore },
  { key: 'characters', store: useCharacterStore },
  { key: 'locations', store: useLocationStore },
  { key: 'factions', store: useFactionStore },
  { key: 'items', store: useItemStore },
  { key: 'lore', store: useLoreStore },
  { key: 'notes', store: useNoteStore },
  { key: 'documents', store: useDocumentStore },
  { key: 'sessions', store: useSessionStore },
  { key: 'scenes', store: useSceneStore },
  { key: 'tags', store: useTagStore },
  { key: 'gameRules', store: useGameRuleStore }
] as const

export async function seedExampleCampaign(): Promise<string> {
  const data = generateExampleCampaign()

  // Merge new entities with existing data and persist
  for (const { key } of STORE_KEYS) {
    const existing = (await window.api.getAll(key)) as unknown[]
    const newItems = data[key as keyof typeof data] as unknown[]
    await window.api.set(key, [...existing, ...newItems])
  }

  // Reload all stores so Zustand state reflects the persisted data
  await Promise.all(STORE_KEYS.map(({ store }) => store.getState().load()))

  // Set the new campaign as active
  const campaignId = data.campaigns[0].id
  useUIStore.getState().setActiveCampaign(campaignId)

  return campaignId
}
