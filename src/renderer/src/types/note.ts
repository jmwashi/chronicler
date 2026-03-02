export type NoteTag =
  | 'lore'
  | 'quest'
  | 'item'
  | 'location'
  | 'rumor'
  | 'secret'
  | 'session-recap'
  | 'misc'

export interface Note {
  id: string
  campaignId: string
  title: string
  content: string            // Markdown text
  tags: NoteTag[]
  relatedCharacterIds: string[]
  relatedEventIds: string[]
  isPublic: boolean          // false = DM only
  isPinned: boolean
  createdAt: string
  updatedAt: string
}
