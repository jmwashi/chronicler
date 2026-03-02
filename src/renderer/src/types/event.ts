// Named ChroniclerEvent to avoid collision with the DOM's built-in Event type
export type EventCategory =
  | 'combat'
  | 'social'
  | 'exploration'
  | 'plot'
  | 'milestone'
  | 'death'
  | 'revelation'
  | 'other'

export interface ChroniclerEvent {
  id: string
  campaignId: string
  title: string
  description: string
  category: EventCategory
  sessionNumber: number
  inWorldDate: string        // Free text — campaign calendar varies per setting
  realDate: string           // ISO 8601 — actual date played
  relatedCharacterIds: string[]
  isPublic: boolean          // false = DM only, true = visible to players later
  createdAt: string
  updatedAt: string
}
