import { formatDistanceToNow } from 'date-fns'
import { Trash2 } from 'lucide-react'
import type { HistoryEntry } from '@/store/diceStore'

interface Props {
  history: HistoryEntry[]
  onClear: () => void
}

export function RollHistory({ history, onClear }: Props) {
  if (history.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
          History
        </h4>
        <button
          onClick={onClear}
          className="p-1 rounded hover:opacity-70"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          title="Clear history"
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {history.map((entry, i) => (
          <HistoryRow key={`${entry.timestamp}-${i}`} entry={entry} />
        ))}
      </div>
    </div>
  )
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const time = formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })

  if (entry.type === 'group') {
    return (
      <div
        className="flex items-center justify-between px-2 py-1 rounded text-xs"
        style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {entry.label && (
            <span className="truncate font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {entry.label}
            </span>
          )}
          <span className="font-mono flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {entry.count}x {entry.formula}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span>
            <span style={{ color: '#22c55e' }}>{entry.hits}H</span>
            {' / '}
            <span style={{ color: '#ef4444' }}>{entry.misses}M</span>
          </span>
          <span className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{time}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-between px-2 py-1 rounded text-xs"
      style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {entry.label && (
          <span className="truncate font-medium" style={{ color: 'hsl(var(--foreground))' }}>
            {entry.label}
          </span>
        )}
        <span className="font-mono flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {entry.formula}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="font-bold font-mono"
          style={{
            color: entry.isNat20
              ? '#22c55e'
              : entry.isNat1
                ? '#ef4444'
                : 'hsl(var(--foreground))'
          }}
        >
          {entry.total}
        </span>
        <span className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{time}</span>
      </div>
    </div>
  )
}
