import { useEffect, useRef, useState } from 'react'

interface Option {
  value: string
  label: string
}

interface Props {
  value: string
  options: Option[]
  onChange: (v: string) => void
  placeholder?: string
  allowCustom?: boolean
}

export function Combobox({ value, options, onChange, placeholder = '', allowCustom = false }: Props) {
  const currentLabel = options.find((o) => o.value === value)?.label ?? (value ?? '')
  const [inputText, setInputText] = useState(currentLabel)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync display text when value changes externally
  useEffect(() => {
    setInputText(options.find((o) => o.value === value)?.label ?? (value ?? ''))
  }, [value, options])

  const filtered = options.filter((o) => o.label.toLowerCase().includes(inputText.toLowerCase()))

  const isKnownValue = !value || options.some((o) => o.value === value)
  const trimmed = inputText.trim()
  const exactMatch = options.find((o) => o.label.toLowerCase() === trimmed.toLowerCase())
  const showCreateRow = allowCustom && trimmed.length > 0 && !exactMatch

  const select = (opt: Option) => {
    onChange(opt.value)
    setInputText(opt.label)
    setOpen(false)
  }

  const selectNew = () => {
    onChange(trimmed)
    setOpen(false)
  }

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false)
      if (allowCustom) {
        const match = options.find((o) => o.label.toLowerCase() === inputText.trim().toLowerCase())
        onChange(match ? match.value : inputText.trim())
      } else {
        const match = options.find((o) => o.value === value)
        setInputText(match?.label ?? '')
        if (!match) onChange('')
      }
    }, 150)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={(e) => { setInputText(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() } }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md text-sm border bg-transparent outline-none focus:ring-1 focus:ring-offset-0"
        style={{
          borderColor: allowCustom && !isKnownValue && trimmed ? 'hsl(var(--primary))' : 'hsl(var(--border))',
          color: 'hsl(var(--foreground))'
        }}
      />
      {allowCustom && !isKnownValue && trimmed && (
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-1 rounded"
          style={{ color: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary) / 0.1)' }}
        >
          new
        </span>
      )}
      {open && (filtered.length > 0 || showCreateRow) && (
        <div
          className="absolute z-20 w-full mt-1 rounded-md border shadow-md max-h-48 overflow-y-auto"
          style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        >
          {filtered.map((o) => (
            <button
              key={o.value}
              type="button"
              onMouseDown={() => select(o)}
              className="w-full text-left px-3 py-1.5 text-sm"
              style={{
                color: 'hsl(var(--foreground))',
                backgroundColor: o.value === value ? 'hsl(var(--muted))' : 'hsl(var(--card))'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'hsl(var(--muted))' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = o.value === value ? 'hsl(var(--muted))' : 'hsl(var(--card))' }}
            >
              {o.label}
            </button>
          ))}
          {showCreateRow && (
            <button
              type="button"
              onMouseDown={selectNew}
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
  )
}
