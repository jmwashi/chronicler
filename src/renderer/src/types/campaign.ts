export interface Campaign {
  id: string
  name: string
  description: string
  system: string        // e.g. "D&D 5e", "Pathfinder 2e"
  setting: string       // World or region name
  status: 'active' | 'on-hold' | 'completed' | 'archived'
  createdAt: string     // ISO 8601
  updatedAt: string
}
