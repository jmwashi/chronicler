export type ItemType = 'weapon' | 'armor' | 'consumable' | 'artifact' | 'tool' | 'misc'

export interface Item {
  id: string
  campaignId: string
  name: string
  type: ItemType
  description: string
  properties: string     // Free text — e.g. "+1 to attack, deals 1d8 piercing"
  value: string          // Free text — e.g. "250gp"
  holderId: string       // Character id, empty string = no holder
  tags: string[]         // Tag IDs
  isPublic: boolean
  createdAt: string      // ISO 8601
  updatedAt: string
}
