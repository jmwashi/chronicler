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

export interface TavernScenarioInput {
  tavern: string
  bartender: string
  suspiciousPatron: string
  rumor: string
  complication: string
}

export interface ImprovGenerationResult {
  dialogueOpener: string
  motive: string
  secret: string
  escalationBeat: string
  fallbackBeat: string
  usedFallback: boolean
  diagnostics: string
}
