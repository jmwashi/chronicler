export interface Faction {
  id: string
  campaignId: string
  name: string
  description: string
  alignment: string      // Free text — e.g. "Lawful Good", "Chaotic Neutral"
  goals: string
  memberIds: string[]    // Character ids
  tags: string[]         // Tag IDs
  isPublic: boolean
  createdAt: string      // ISO 8601
  updatedAt: string
}
