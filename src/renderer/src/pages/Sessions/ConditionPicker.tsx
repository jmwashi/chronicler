import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { CONDITIONS } from '@/types'
import type { Condition } from '@/types'

interface Props {
  conditions: Condition[]
  conditionDurations: Partial<Record<Condition, number>>
  onChange: (conditions: Condition[], durations: Partial<Record<Condition, number>>) => void
}

export function ConditionPicker({ conditions, conditionDurations, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const toggle = (c: Condition) => {
    if (conditions.includes(c)) {
      const newDurations = { ...conditionDurations }
      delete newDurations[c]
      onChange(
        conditions.filter((x) => x !== c),
        newDurations
      )
    } else {
      onChange([...conditions, c], conditionDurations)
    }
  }

  const setDuration = (c: Condition, rounds: number) => {
    const newDurations = { ...conditionDurations }
    if (rounds <= 0) {
      delete newDurations[c]
    } else {
      newDurations[c] = rounds
    }
    onChange(conditions, newDurations)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] hover:opacity-70"
        style={{
          border: '1px solid hsl(var(--border))',
          color: conditions.length > 0 ? '#f59e0b' : 'hsl(var(--muted-foreground))'
        }}
      >
        {conditions.length > 0 ? `${conditions.length} cond.` : 'Cond.'}
        <ChevronDown size={9} />
      </button>

      {open && (
        <div
          className="absolute z-30 mt-1 right-0 w-56 rounded-md border shadow-lg p-1.5 max-h-52 overflow-y-auto"
          style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        >
          {CONDITIONS.map((c) => {
            const checked = conditions.includes(c)
            return (
              <div key={c} className="flex items-center gap-2 px-2 py-1 rounded">
                <label
                  className="flex items-center gap-2 flex-1 text-xs cursor-pointer hover:opacity-70"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(c)}
                    className="accent-amber-500"
                  />
                  <span className="capitalize">{c}</span>
                </label>
                {checked && (
                  <input
                    type="number"
                    min="0"
                    value={conditionDurations[c] ?? ''}
                    onChange={(e) => setDuration(c, Number(e.target.value))}
                    className="w-10 text-center text-[10px] rounded border bg-transparent outline-none py-0.5"
                    style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    placeholder="∞"
                    title="Rounds remaining (empty = no timer)"
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ConditionBadges({
  conditions,
  conditionDurations
}: {
  conditions: Condition[]
  conditionDurations: Partial<Record<Condition, number>>
}) {
  if (conditions.length === 0) return null
  return (
    <div className="flex flex-wrap gap-0.5">
      {conditions.map((c) => {
        const rounds = conditionDurations[c]
        return (
          <span
            key={c}
            className="text-[9px] px-1 py-px rounded capitalize"
            style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
          >
            {c}
            {rounds != null && rounds > 0 && (
              <span className="ml-0.5 font-semibold">({rounds}r)</span>
            )}
          </span>
        )
      })}
    </div>
  )
}
