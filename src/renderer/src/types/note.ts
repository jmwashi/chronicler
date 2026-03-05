export interface Note {
  id: string
  campaignId: string
  title: string
  content: string            // Markdown text
  tags: string[]             // Tag IDs
  relatedCharacterIds: string[]
  relatedLoreIds: string[]
  relatedLocationIds: string[]
  relatedFactionIds: string[]
  relatedItemIds: string[]
  relatedSessionIds: string[]
  isPublic: boolean          // false = DM only
  isPinned: boolean
  createdAt: string
  updatedAt: string
}
