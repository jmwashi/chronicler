export type LocationType =
  | 'city'
  | 'town'
  | 'village'
  | 'dungeon'
  | 'tavern'
  | 'region'
  | 'landmark'
  | 'other'

export interface Location {
  id: string
  campaignId: string
  name: string
  type: LocationType
  description: string
  notableCharacterIds: string[]
  tags: string[]         // Tag IDs
  isPublic: boolean
  createdAt: string      // ISO 8601
  updatedAt: string
}
