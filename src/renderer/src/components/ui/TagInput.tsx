import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useTagStore } from '@/store/tagStore'
import { TAG_COLORS } from '@/types/tag'

interface Props {
  campaignId: string
  value: string[]
  onChange: (tagIds: string[]) => void
}

export function TagInput({ campaignId, value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const tags = useTagStore((s) => s.tags)
  const addTag = useTagStore((s) => s.add)

  const campaignTags = tags.filter((t) => t.campaignId === campaignId)
  const selectedTags = value.map((id) => campaignTags.find((t) => t.id === id)).filter(Boolean)
  const unselected = campaignTags.filter((t) => !value.includes(t.id))
  const filtered = query
    ? unselected.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : unselected

  const exactMatch = campaignTags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase())
  const showCreate = query.trim().length > 0 && !exactMatch

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const selectTag = (id: string) => {
    onChange([...value, id])
    setQuery('')
    inputRef.current?.focus()
  }

  const removeTag = (id: string) => {
    onChange(value.filter((v) => v !== id))
  }

  const createAndSelect = async () => {
    const name = query.trim()
    if (!name) return
    const now = new Date().toISOString()
    const colorIndex = campaignTags.length % TAG_COLORS.length
    const tag = {
      id: crypto.randomUUID(),
      campaignId,
      name,
      color: TAG_COLORS[colorIndex],
      createdAt: now,
      updatedAt: now
    }
    await addTag(tag)
    onChange([...value, tag.id])
    setQuery('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && query === '' && value.length > 0) {
      removeTag(value[value.length - 1])
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length > 0) {
        selectTag(filtered[0].id)
      } else if (showCreate) {
        createAndSelect()
      }
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="flex flex-wrap gap-1.5 items-center min-h-[36px] px-2 py-1.5 rounded-md border text-sm cursor-text"
        style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'transparent' }}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map((tag) => (
          <span
            key={tag!.id}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: tag!.color + '22', color: tag!.color }}
          >
            {tag!.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag!.id) }}
              className="hover:opacity-70"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
          style={{ color: 'hsl(var(--foreground))' }}
          placeholder={value.length === 0 ? 'Add tags...' : ''}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && (filtered.length > 0 || showCreate) && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border shadow-lg overflow-hidden max-h-48 overflow-y-auto"
          style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        >
          {filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => selectTag(tag.id)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:opacity-80 transition-opacity"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
          ))}
          {showCreate && (
            <>
              {filtered.length > 0 && (
                <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />
              )}
              <button
                type="button"
                onClick={createAndSelect}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:opacity-80 transition-opacity"
                style={{ color: 'hsl(var(--primary))' }}
              >
                + Create "{query.trim()}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
