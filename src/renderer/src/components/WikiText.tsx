import { useNavigate } from 'react-router-dom'
import { useCharacterStore } from '@/store/characterStore'
import { useNoteStore } from '@/store/noteStore'
import { useLoreStore } from '@/store/loreStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useSessionStore } from '@/store/sessionStore'
import { useDocumentStore } from '@/store/documentStore'
import { useUIStore } from '@/store/uiStore'
import { EntityHoverLink } from './EntityPreview'

type ParsedPart =
  | { type: 'text'; content: string }
  | { type: 'link'; label: string }

function parseWikiText(text: string): ParsedPart[] {
  const parts = text.split(/(\[\[[^\]]+\]\])/)
  return parts.map((part) => {
    const match = part.match(/^\[\[([^\]]+)\]\]$/)
    if (match) return { type: 'link', label: match[1].trim() }
    return { type: 'text', content: part }
  })
}

type ResolvedEntity =
  | { kind: 'character'; id: string }
  | { kind: 'note'; id: string }
  | { kind: 'lore'; id: string }
  | { kind: 'location'; id: string }
  | { kind: 'faction'; id: string }
  | { kind: 'item'; id: string }
  | { kind: 'session'; id: string }
  | { kind: 'document'; id: string }
  | null

// Resolution order: characters → notes → lore → locations → factions → items → sessions.
// First match wins, case-insensitive.
function useEntityResolver() {
  const characters = useCharacterStore((s) => s.characters)
  const notes = useNoteStore((s) => s.notes)
  const lore = useLoreStore((s) => s.lore)
  const locations = useLocationStore((s) => s.locations)
  const factions = useFactionStore((s) => s.factions)
  const items = useItemStore((s) => s.items)
  const sessions = useSessionStore((s) => s.sessions)
  const documents = useDocumentStore((s) => s.documents)

  return (label: string): ResolvedEntity => {
    const q = label.toLowerCase()
    const char = characters.find((c) => c.name.toLowerCase() === q)
    if (char) return { kind: 'character', id: char.id }
    const note = notes.find((n) => n.title.toLowerCase() === q)
    if (note) return { kind: 'note', id: note.id }
    const loreEntry = lore.find((l) => l.title.toLowerCase() === q)
    if (loreEntry) return { kind: 'lore', id: loreEntry.id }
    const location = locations.find((l) => l.name.toLowerCase() === q)
    if (location) return { kind: 'location', id: location.id }
    const faction = factions.find((f) => f.name.toLowerCase() === q)
    if (faction) return { kind: 'faction', id: faction.id }
    const item = items.find((i) => i.name.toLowerCase() === q)
    if (item) return { kind: 'item', id: item.id }
    const session = sessions.find((s) => s.title.toLowerCase() === q)
    if (session) return { kind: 'session', id: session.id }
    const doc = documents.find((d) => d.title.toLowerCase() === q)
    if (doc) return { kind: 'document', id: doc.id }
    return null
  }
}

function entityPath(entity: NonNullable<ResolvedEntity>): string {
  if (entity.kind === 'character') return `/characters/${entity.id}`
  if (entity.kind === 'note') return `/notes/${entity.id}`
  if (entity.kind === 'lore') return `/lore/${entity.id}`
  if (entity.kind === 'location') return `/locations/${entity.id}`
  if (entity.kind === 'faction') return `/factions/${entity.id}`
  if (entity.kind === 'session') return `/sessions/${entity.id}`
  if (entity.kind === 'document') return `/documents/${entity.id}`
  return `/items/${entity.id}`
}

export function WikiText({ text }: { text: string }) {
  const navigate = useNavigate()
  const resolve = useEntityResolver()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const parts = parseWikiText(text)

  const handleLinkClick = (path: string) => {
    incrementNavDepth()
    navigate(path)
  }

  return (
    <span>
      {parts.map((part, i) => {
        if (part.type === 'text') return <span key={i}>{part.content}</span>
        const entity = resolve(part.label)
        if (entity) {
          return (
            <EntityHoverLink
              key={i}
              kind={entity.kind}
              id={entity.id}
              onClick={() => handleLinkClick(entityPath(entity))}
            >
              {part.label}
            </EntityHoverLink>
          )
        }
        return (
          <span
            key={i}
            className="italic"
            style={{ color: 'hsl(var(--muted-foreground))' }}
            title={`"${part.label}" not found`}
          >
            [[{part.label}]]
          </span>
        )
      })}
    </span>
  )
}
