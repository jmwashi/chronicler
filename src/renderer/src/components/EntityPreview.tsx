import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCharacterStore } from '@/store/characterStore'
import { useNoteStore } from '@/store/noteStore'
import { useLoreStore } from '@/store/loreStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useSessionStore } from '@/store/sessionStore'
import { useDocumentStore } from '@/store/documentStore'

type EntityKind = 'character' | 'note' | 'lore' | 'location' | 'faction' | 'item' | 'session' | 'document'

interface EntityInfo {
  name: string
  type: string
  description: string
}

function useEntityInfo(kind: EntityKind, id: string): EntityInfo | null {
  const char = useCharacterStore((s) => kind === 'character' ? s.characters.find((c) => c.id === id) : undefined)
  const note = useNoteStore((s) => kind === 'note' ? s.notes.find((n) => n.id === id) : undefined)
  const loreEntry = useLoreStore((s) => kind === 'lore' ? s.lore.find((l) => l.id === id) : undefined)
  const location = useLocationStore((s) => kind === 'location' ? s.locations.find((l) => l.id === id) : undefined)
  const faction = useFactionStore((s) => kind === 'faction' ? s.factions.find((f) => f.id === id) : undefined)
  const item = useItemStore((s) => kind === 'item' ? s.items.find((i) => i.id === id) : undefined)
  const session = useSessionStore((s) => kind === 'session' ? s.sessions.find((ss) => ss.id === id) : undefined)
  const doc = useDocumentStore((s) => kind === 'document' ? s.documents.find((d) => d.id === id) : undefined)

  if (char) return { name: char.name, type: `${char.race ? char.race + ' ' : ''}${char.type}`, description: char.description }
  if (note) return { name: note.title, type: 'Note', description: note.content }
  if (loreEntry) return { name: loreEntry.title, type: loreEntry.category, description: loreEntry.description }
  if (location) return { name: location.name, type: location.type, description: location.description }
  if (faction) return { name: faction.name, type: 'Faction', description: faction.description }
  if (item) return { name: item.name, type: item.type, description: item.description }
  if (session) return { name: session.title, type: `Session #${session.sessionNumber}`, description: `Status: ${session.status}` }
  if (doc) return { name: doc.title, type: doc.type, description: doc.content }
  return null
}

interface PreviewPopoverProps {
  kind: EntityKind
  id: string
  anchorRect: DOMRect
}

function PreviewPopover({ kind, id, anchorRect }: PreviewPopoverProps) {
  const info = useEntityInfo(kind, id)
  if (!info) return null

  const popoverWidth = 256
  const gap = 6

  // Position above the anchor by default, fall back to below if near top of viewport
  let top = anchorRect.top - gap
  let transformY = '-100%'
  if (anchorRect.top < 160) {
    top = anchorRect.bottom + gap
    transformY = '0%'
  }

  // Center horizontally on the anchor, clamp to viewport
  let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2
  left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8))

  return createPortal(
    <div
      className="fixed z-50 rounded-lg border p-3 shadow-xl"
      style={{
        top,
        left,
        width: popoverWidth,
        transform: `translateY(${transformY})`,
        backgroundColor: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
        color: 'hsl(var(--card-foreground, var(--foreground)))',
        pointerEvents: 'none',
        boxShadow: '0 4px 24px hsl(var(--background) / 0.5)'
      }}
    >
      <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>
        {info.name}
      </p>
      <p className="text-xs capitalize mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {info.type}
      </p>
      {info.description && (
        <p className="text-xs mt-1.5 line-clamp-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {info.description}
        </p>
      )}
    </div>,
    document.body
  )
}

interface EntityHoverLinkProps {
  kind: EntityKind
  id: string
  children: React.ReactNode
  onClick: () => void
}

export function EntityHoverLink({ kind, id, children, onClick }: EntityHoverLinkProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const ref = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleEnter = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (ref.current) {
        setAnchorRect(ref.current.getBoundingClientRect())
        setShowPreview(true)
      }
    }, 300)
  }, [])

  const handleLeave = useCallback(() => {
    clearTimeout(timerRef.current)
    setShowPreview(false)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <>
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="underline underline-offset-2 hover:opacity-70 cursor-pointer"
        style={{ color: 'hsl(var(--primary))' }}
      >
        {children}
      </button>
      {showPreview && anchorRect && (
        <PreviewPopover kind={kind} id={id} anchorRect={anchorRect} />
      )}
    </>
  )
}
