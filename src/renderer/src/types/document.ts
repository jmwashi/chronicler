export type DocumentType = 'letter' | 'journal' | 'book' | 'scroll' | 'other'

export interface Document {
  id: string
  campaignId: string
  title: string
  type: DocumentType
  content: string              // Markdown + [[wikilinks]]
  authorId: string             // ref Character.id, '' = unknown
  recipientId: string          // ref Character.id, '' = none
  locationFoundId: string      // ref Location.id, '' = unknown
  tags: string[]
  relatedCharacterIds: string[]
  relatedLoreIds: string[]
  relatedLocationIds: string[]
  relatedFactionIds: string[]
  relatedItemIds: string[]
  relatedSessionIds: string[]
  isPublic: boolean            // handout — visible to players
  createdAt: string
  updatedAt: string
}
