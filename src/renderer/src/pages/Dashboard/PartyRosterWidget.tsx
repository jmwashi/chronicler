import type { Character, Location } from '@/types'
import { Users } from 'lucide-react'

interface Props {
  party: Character[]
  locations: Location[]
  onNavigate: (path: string) => void
}

const avatarColors = [
  { bg: 'hsl(221 83% 53% / 0.2)', text: 'hsl(221 83% 53%)' },
  { bg: 'hsl(142 71% 45% / 0.2)', text: 'hsl(142 71% 45%)' },
  { bg: 'hsl(25 95% 53% / 0.2)', text: 'hsl(25 95% 53%)' },
  { bg: 'hsl(262 83% 58% / 0.2)', text: 'hsl(262 83% 58%)' },
  { bg: 'hsl(346 77% 49% / 0.2)', text: 'hsl(346 77% 49%)' }
]

const colorFor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length]

const statusColor = (status: Character['status']) => {
  if (status === 'alive') return '#10b981'
  if (status === 'dead') return 'hsl(var(--destructive))'
  if (status === 'missing') return '#f59e0b'
  return 'hsl(var(--muted-foreground))'
}

export default function PartyRosterWidget({ party, locations, onNavigate }: Props) {
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
          <Users size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <span className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            Party Roster
          </span>
        </div>
        <button
          onClick={() => onNavigate('/characters')}
          className="text-xs hover:opacity-70 transition-opacity"
          style={{ color: 'hsl(var(--primary))' }}
        >
          All characters →
        </button>
      </div>

      {party.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No player characters yet.
          </p>
          <button
            onClick={() => onNavigate('/characters')}
            className="text-xs mt-2 hover:underline"
            style={{ color: 'hsl(var(--primary))' }}
          >
            Add one in Characters →
          </button>
        </div>
      ) : (
        <div>
          {party.map((char) => {
            const loc = char.locationId
              ? locations.find((l) => l.id === char.locationId)
              : undefined
            const color = colorFor(char.name)
            const meta = [
              char.race,
              char.class
                ? `${char.class}${char.level > 0 ? ` Lv.${char.level}` : ''}`
                : ''
            ]
              .filter(Boolean)
              .join(' · ')

            return (
              <div
                key={char.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:opacity-80 transition-opacity border-b last:border-b-0"
                style={{ borderColor: 'hsl(var(--border))' }}
                onClick={() => onNavigate(`/characters/${char.id}`)}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {char.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {char.name}
                  </p>
                  {meta && (
                    <p
                      className="text-xs truncate"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      {meta}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span
                    className="text-xs font-medium capitalize px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'hsl(var(--muted))',
                      color: statusColor(char.status)
                    }}
                  >
                    {char.status}
                  </span>
                  {loc && (
                    <span
                      className="text-[10px] truncate max-w-[80px]"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      {loc.name}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
