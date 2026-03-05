import { useRef, useState } from 'react'

interface Option {
  id: string
  name: string
}

interface Props {
  selected: string[]
  options: Option[]
  onChange: (ids: string[]) => void
  placeholder?: string
  allowCreate?: boolean
}

/** Sentinel prefix for not-yet-persisted entries. Value format: "__new__:Name" */
export const NEW_PREFIX = '__new__:'

export function isNewSentinel(id: string) {
  return id.startsWith(NEW_PREFIX)
}

export function sentinelName(id: string) {
  return id.slice(NEW_PREFIX.length)
}

export function EntityChipSelect({ selected, options, onChange, placeholder = 'Add...', allowCreate = false }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOptions = selected.map((id) => {
    if (isNewSentinel(id)) return { id, name: sentinelName(id), isNew: true }
    const opt = options.find((o) => o.id === id)
    return opt ? { ...opt, isNew: false } : null
  }).filter(Boolean) as Array<Option & { isNew: boolean }>

  const available = options.filter((o) => !selected.includes(o.id))
  const filtered = available.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))

  const trimmed = query.trim()
  const exactMatch = options.find((o) => o.name.toLowerCase() === trimmed.toLowerCase())
  const showCreateRow = allowCreate && trimmed.length > 0 && !exactMatch && !selected.includes(NEW_PREFIX + trimmed)

  const add = (id: string) => {
    onChange([...selected, id])
    setQuery('')
    inputRef.current?.focus()
  }

  const remove = (id: string) => {
    onChange(selected.filter((x) => x !== id))
  }

  const dropdownVisible = open && (filtered.length > 0 || showCreateRow)

  return (
    <div className="space-y-2">
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={
                o.isNew
                  ? { border: '1px dashed hsl(var(--primary))', color: 'hsl(var(--primary))' }
                  : { backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }
              }
            >
              {o.isNew && <span className="opacity-70">+</span>}
              {o.name}
              <button
                type="button"
                onClick={() => remove(o.id)}
                className="hover:opacity-70 leading-none"
                style={{ color: 'hsl(var(--primary))' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full px-3 py-1.5 rounded-md text-sm border bg-transparent outline-none"
          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
        />
        {dropdownVisible && (
          <div
            className="absolute z-20 w-full mt-1 rounded-md border shadow-md max-h-40 overflow-y-auto"
            style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
          >
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onMouseDown={() => add(o.id)}
                className="w-full text-left px-3 py-1.5 text-sm hover:opacity-70"
                style={{ color: 'hsl(var(--foreground))', backgroundColor: 'hsl(var(--card))' }}
              >
                {o.name}
              </button>
            ))}
            {showCreateRow && (
              <button
                type="button"
                onMouseDown={() => add(NEW_PREFIX + trimmed)}
                className="w-full text-left px-3 py-1.5 text-sm border-t"
                style={{
                  color: 'hsl(var(--primary))',
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))'
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'hsl(var(--muted))' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'hsl(var(--card))' }}
              >
                + Create "{trimmed}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
