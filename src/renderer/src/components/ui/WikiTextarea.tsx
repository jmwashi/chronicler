import { useRef, useState, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useCharacterStore } from '@/store/characterStore'
import { useNoteStore } from '@/store/noteStore'
import { useLoreStore } from '@/store/loreStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useSessionStore } from '@/store/sessionStore'
import { MarkdownToolbar } from './MarkdownToolbar'

function useAllEntityNames(campaignId: string): string[] {
  const characters = useCharacterStore((s) => s.characters)
  const notes = useNoteStore((s) => s.notes)
  const lore = useLoreStore((s) => s.lore)
  const locations = useLocationStore((s) => s.locations)
  const factions = useFactionStore((s) => s.factions)
  const items = useItemStore((s) => s.items)
  const sessions = useSessionStore((s) => s.sessions)

  const names: string[] = []
  for (const c of characters) if (c.campaignId === campaignId) names.push(c.name)
  for (const n of notes) if (n.campaignId === campaignId) names.push(n.title)
  for (const l of lore) if (l.campaignId === campaignId) names.push(l.title)
  for (const l of locations) if (l.campaignId === campaignId) names.push(l.name)
  for (const f of factions) if (f.campaignId === campaignId) names.push(f.name)
  for (const i of items) if (i.campaignId === campaignId) names.push(i.name)
  for (const s of sessions) if (s.campaignId === campaignId) names.push(s.title)
  return names
}

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  campaignId: string
}

export function WikiTextarea({ campaignId, value, onChange, ...rest }: Props) {
  const allNames = useAllEntityNames(campaignId)
  const [query, setQuery] = useState<string | null>(null)
  const [cursorPos, setCursorPos] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const textValue = typeof value === 'string' ? value : ''
  const filtered = query !== null
    ? allNames.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : []

  const updateDropdownPos = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      // Position below the toolbar (~34px), not below the full textarea
      setDropdownPos({ top: rect.top + 34, left: rect.left, width: rect.width })
    }
  }, [])

  useLayoutEffect(() => {
    if (query !== null && filtered.length > 0) {
      updateDropdownPos()
    }
  }, [query, filtered.length, updateDropdownPos])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e)
    const cursor = e.target.selectionStart ?? 0
    setCursorPos(cursor)
    const before = e.target.value.slice(0, cursor)
    const match = before.match(/\[\[([^\]]*)$/)
    setQuery(match ? match[1] : null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape' && query !== null) {
      setQuery(null)
      e.preventDefault()
    }
    rest.onKeyDown?.(e)
  }

  const insertLink = (name: string) => {
    const before = textValue.slice(0, cursorPos)
    const after = textValue.slice(cursorPos)
    const openIdx = before.lastIndexOf('[[')
    const newText = before.slice(0, openIdx) + `[[${name}]]` + after
    onChange?.({ target: { value: newText } } as React.ChangeEvent<HTMLTextAreaElement>)
    setQuery(null)
    const newCursorPos = openIdx + name.length + 4 // "[[" + name + "]]"
    setTimeout(() => {
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos)
      textareaRef.current?.focus()
    }, 0)
  }

  const handleToolbarChange = (newText: string) => {
    onChange?.({ target: { value: newText } } as React.ChangeEvent<HTMLTextAreaElement>)
  }

  return (
    <div ref={wrapperRef}>
      <div
        className="rounded-md border overflow-hidden"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <MarkdownToolbar
          textareaRef={textareaRef}
          value={textValue}
          onChange={handleToolbarChange}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...rest}
          className={`w-full px-3 py-2 text-sm bg-transparent outline-none focus:ring-0 resize-none${rest.className ? ` ${rest.className}` : ''}`}
          style={{ color: 'hsl(var(--foreground))', border: 'none', ...rest.style }}
        />
      </div>
      {query !== null && filtered.length > 0 && dropdownPos && createPortal(
        <div
          className="fixed z-[60] rounded-md border shadow-md max-h-40 overflow-y-auto"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))'
          }}
        >
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onMouseDown={() => insertLink(name)}
              className="w-full text-left px-3 py-1.5 text-sm hover:opacity-70"
              style={{ color: 'hsl(var(--foreground))', backgroundColor: 'hsl(var(--card))' }}
            >
              {name}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
