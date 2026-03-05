export type SessionStatus = 'planning' | 'ready' | 'completed'

export interface PlanningSection {
  id: string
  title: string
  content: string // Markdown + [[wikilinks]]
  order: number
}

export const CONDITIONS = [
  'blinded',
  'charmed',
  'deafened',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious'
] as const
export type Condition = (typeof CONDITIONS)[number]

export interface Combatant {
  id: string
  name: string
  characterId: string // ref Character.id, '' = ad-hoc mob
  initiative: number
  hp: number
  maxHp: number
  armorClass: number
  conditions: Condition[]
  conditionDurations: Partial<Record<Condition, number>> // rounds remaining, absent = no timer
  attackMod: number // attack roll modifier, default 0
  damageDice: string // e.g. "1d8+3", default ''
  saveMod: number // save modifier, default 0
  concentration: string // free-text spell name, '' = none
  isActive: boolean
}

export interface Session {
  id: string
  campaignId: string
  title: string
  sessionNumber: number
  status: SessionStatus
  scheduledDate: string
  planningSections: PlanningSection[]
  referencedCharacterIds: string[]
  referencedLocationIds: string[]
  referencedFactionIds: string[]
  referencedItemIds: string[]
  combatants: Combatant[]
  currentTurnIndex: number
  roundNumber: number
  scratchPad: string
  linkedNoteIds: string[]
  createdAt: string
  updatedAt: string
}

export const DEFAULT_PLANNING_SECTIONS: Pick<PlanningSection, 'title' | 'content'>[] = [
  { title: 'Session Goals', content: '' },
  { title: 'Key NPCs', content: '' },
  { title: 'Plot Hooks', content: '' },
  { title: 'Prepared Encounters', content: '' }
]
