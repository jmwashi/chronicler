export type SceneStatus = 'planned' | 'active' | 'completed' | 'skipped'

export interface Scene {
  id: string
  campaignId: string
  sessionId: string // ref Session.id
  title: string
  order: number
  description: string // Markdown + [[wikilinks]]
  locationId: string // ref Location.id
  presentCharacterIds: string[]
  status: SceneStatus
  dmNotes: string
  createdAt: string
  updatedAt: string
}
