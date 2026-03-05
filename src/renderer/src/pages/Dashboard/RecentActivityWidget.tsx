import {
  Activity,
  Users,
  StickyNote,
  ScrollText,
  Package,
  MapPin,
  Shield,
  Scroll,
  FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { LucideIcon } from 'lucide-react'

export type EntityType =
  | 'character'
  | 'note'
  | 'lore'
  | 'item'
  | 'location'
  | 'faction'
  | 'session'
  | 'document'

export interface ActivityItem {
  id: string
  entityType: EntityType
  label: string
  path: string
  updatedAt: string
}

interface Props {
  items: ActivityItem[]
  onNavigate: (path: string) => void
}

const entityIcons: Record<EntityType, LucideIcon> = {
  character: Users,
  note: StickyNote,
  lore: ScrollText,
  item: Package,
  location: MapPin,
  faction: Shield,
  session: Scroll,
  document: FileText
}

const entityLabels: Record<EntityType, string> = {
  character: 'Character',
  note: 'Note',
  lore: 'Lore',
  item: 'Item',
  location: 'Location',
  faction: 'Faction',
  session: 'Session',
  document: 'Document'
}

const relativeTime = (iso: string) => {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ''
  }
}

export default function RecentActivityWidget({ items, onNavigate }: Props) {
  return (
    <div
      className="rounded-lg border"
      style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <span className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            Recent Activity
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No recent activity — start adding content.
          </p>
        </div>
      ) : (
        <div>
          {items.map((item) => {
            const Icon = entityIcons[item.entityType]
            return (
              <div
                key={`${item.entityType}-${item.id}`}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:opacity-80 transition-opacity border-b last:border-b-0"
                style={{ borderColor: 'hsl(var(--border))' }}
                onClick={() => onNavigate(item.path)}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'hsl(var(--muted))' }}
                >
                  <Icon size={13} style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {entityLabels[item.entityType]}
                  </p>
                </div>
                <span
                  className="text-xs flex-shrink-0"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {relativeTime(item.updatedAt)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
