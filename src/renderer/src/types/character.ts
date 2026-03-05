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
  locationId: string     // Last known location (ref to Location.id)
  factionId: string      // (ref to Faction.id)
  hp: number             // Max hit points (0 = not set)
  armorClass: number     // Armor class (0 = not set)
  description: string    // Physical appearance
  backstory: string
  dmNotes: string        // Private — never shown to players
  tags: string[]         // Tag IDs
  isPublic: boolean
  createdAt: string
  updatedAt: string
}
