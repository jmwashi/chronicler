export type CharacterType = 'player' | 'npc' | 'monster'
export type CharacterStatus = 'alive' | 'dead' | 'missing' | 'unknown'

export interface Character {
  id: string
  campaignId: string
  name: string
  type: CharacterType
  race: string
  class: string
  level: number
  status: CharacterStatus
  location: string       // Last known location
  faction: string
  description: string    // Physical appearance
  backstory: string
  dmNotes: string        // Private — never shown to players
  createdAt: string
  updatedAt: string
}
