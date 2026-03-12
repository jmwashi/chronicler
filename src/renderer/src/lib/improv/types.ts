import type { Character, Faction, Item, Location, Lore, Note, Scene, Session } from '@/types'

export type ImprovEntityKind =
  | 'character'
  | 'location'
  | 'faction'
  | 'item'
  | 'lore'
  | 'note'
  | 'scene'

export interface ImprovEntityRef {
  kind: ImprovEntityKind
  id: string
}

export interface ImprovWorldData {
  session: Session
  activeScene?: Scene | null
  characters: Character[]
  locations: Location[]
  factions: Faction[]
  items: Item[]
  lore: Lore[]
  notes: Note[]
  scenes: Scene[]
}

export interface ImprovContextEntity {
  kind: ImprovEntityKind
  id: string
  name: string
  summary: string
}

export interface ImprovDetailRequest {
  subject: string
  playerIntent: string
  tone: string
  scale: string
  constraints: string
}

export interface ImprovDetailResult {
  openingDescription: string
  sensoryDetails: string[]
  notableFeatures: string[]
  immediateOpportunities: string[]
  hiddenTwist: string
  usedFallback: boolean
  diagnostics: string
}
