export type LoreCategory =
  | 'history'
  | 'legend'
  | 'cosmology'
  | 'culture'
  | 'religion'
  | 'magic'
  | 'prophecy'
  | 'other'

export interface Lore {
  id: string
  campaignId: string
  title: string
  description: string // markdown + [[wikilinks]]
  category: LoreCategory
  era: string // free text: "Age of Dragons", "Before the Cataclysm", etc.
  relatedCharacterIds: string[]
  relatedLocationIds: string[]
  relatedFactionIds: string[]
  relatedItemIds: string[]
  tags: string[] // Tag IDs
  isPublic: boolean
  createdAt: string
  updatedAt: string
}
