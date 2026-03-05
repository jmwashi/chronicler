import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { HistoryEntry } from '@/store/diceStore'

interface Props {
  entry: HistoryEntry
}

export function DiceResultDisplay({ entry }: Props) {
  if (entry.type === 'group') return <GroupResult entry={entry} />
  return <SingleResult entry={entry} />
}

function SingleResult({ entry }: { entry: HistoryEntry & { type: 'single' } }) {
  const glowStyle = entry.isNat20
    ? { boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)', color: '#22c55e' }
    : entry.isNat1
      ? { boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)', color: '#ef4444' }
      : { color: 'hsl(var(--foreground))' }

  return (
    <div
      className="rounded-lg p-4 text-center"
      style={{
        backgroundColor: 'hsl(var(--muted) / 0.5)',
        ...glowStyle
      }}
    >
      {entry.label && (
        <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {entry.label}
        </p>
      )}
      <p className="text-3xl font-black" style={{ color: glowStyle.color }}>
        {entry.total}
      </p>
      <div className="flex items-center justify-center gap-1 mt-2 flex-wrap">
        {entry.dice.map((d, i) => (
          <span
            key={i}
            className="inline-flex items-center justify-center w-7 h-7 rounded text-xs font-mono font-bold"
            style={{
              backgroundColor: d.kept ? 'hsl(var(--card))' : 'transparent',
              color: d.kept
                ? d.isCritical
                  ? '#22c55e'
                  : d.isFumble
                    ? '#ef4444'
                    : 'hsl(var(--foreground))'
                : 'hsl(var(--muted-foreground))',
              textDecoration: d.kept ? 'none' : 'line-through',
              border: d.kept ? '1px solid hsl(var(--border))' : 'none'
            }}
          >
            {d.value}
          </span>
        ))}
        {entry.modifier !== 0 && (
          <span className="text-xs font-mono" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {entry.modifier > 0 ? `+${entry.modifier}` : entry.modifier}
          </span>
        )}
      </div>
      <p className="text-xs mt-1.5 font-mono" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {entry.formula}
      </p>
    </div>
  )
}

function GroupResult({ entry }: { entry: HistoryEntry & { type: 'group' } }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
    >
      {entry.label && (
        <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {entry.label}
        </p>
      )}
      <div className="flex items-center justify-center gap-3 mb-1">
        <span className="text-lg font-bold" style={{ color: '#22c55e' }}>
          {entry.hits} hits
        </span>
        <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>|</span>
        <span className="text-lg font-bold" style={{ color: '#ef4444' }}>
          {entry.misses} misses
        </span>
      </div>
      <p className="text-xs text-center font-mono" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {entry.count}x {entry.formula} vs AC {entry.targetAC}
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 mt-2 text-xs hover:opacity-70 mx-auto"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {expanded ? 'Collapse' : 'Show individual rolls'}
      </button>

      {expanded && (
        <div className="mt-2 space-y-0.5 max-h-40 overflow-y-auto">
          {entry.rolls.map((roll, i) => {
            const hit = roll.total >= entry.targetAC
            return (
              <div
                key={i}
                className="flex items-center justify-between text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: 'hsl(var(--card))' }}
              >
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>#{i + 1}</span>
                <span className="font-mono" style={{ color: 'hsl(var(--foreground))' }}>
                  [{roll.dice.map((d) => d.value).join(', ')}]
                  {roll.modifier !== 0 && (roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier)}
                  {' = '}
                  {roll.total}
                </span>
                <span
                  className="font-bold text-[10px]"
                  style={{ color: hit ? '#22c55e' : '#ef4444' }}
                >
                  {hit ? 'HIT' : 'MISS'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
