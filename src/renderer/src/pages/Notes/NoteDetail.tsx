import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Pin } from 'lucide-react'
import { useNoteStore } from '@/store/noteStore'
import { useCharacterStore } from '@/store/characterStore'
import { useLoreStore } from '@/store/loreStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useSessionStore } from '@/store/sessionStore'
import { useUIStore } from '@/store/uiStore'
import { MarkdownView } from '@/components/MarkdownView'
import { Modal } from '@/components/Modal'
import { TagBadge } from '@/components/ui/TagBadge'
import { NoteForm } from './NoteForm'
import type { Note } from '@/types'

function NotFound() {
  return (
    <div className="py-12 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
      Note not found.
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
      style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
    >
      {children}
    </span>
  )
}

function EntityLink({ label, path }: { label: string; path: string }) {
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  return (
    <button
      onClick={() => { incrementNavDepth(); navigate(path) }}
      className="text-sm hover:underline"
      style={{ color: 'hsl(var(--primary))' }}
    >
      {label}
    </button>
  )
}

function RelatedSection({ title, items }: { title: string; items: { label: string; path: string }[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => <EntityLink key={item.path} label={item.label} path={item.path} />)}
      </div>
    </div>
  )
}

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    useNoteStore.getState().load()
    useCharacterStore.getState().load()
    useLoreStore.getState().load()
    useLocationStore.getState().load()
    useFactionStore.getState().load()
    useItemStore.getState().load()
    useSessionStore.getState().load()
  }, [])

  const note = useNoteStore((s) => s.notes.find((n) => n.id === id))
  const update = useNoteStore((s) => s.update)
  const characters = useCharacterStore((s) => s.characters)
  const lore = useLoreStore((s) => s.lore)
  const locations = useLocationStore((s) => s.locations)
  const factions = useFactionStore((s) => s.factions)
  const items = useItemStore((s) => s.items)
  const sessions = useSessionStore((s) => s.sessions)

  if (!note) return <NotFound />

  const campaignChars = characters.filter((c) => c.campaignId === note.campaignId)

  const relatedChars = (note.relatedCharacterIds ?? []).map((cid) => characters.find((c) => c.id === cid)).filter(Boolean)
  const relatedLore = (note.relatedLoreIds ?? []).map((lid) => lore.find((l) => l.id === lid)).filter(Boolean)
  const relatedLocations = (note.relatedLocationIds ?? []).map((lid) => locations.find((l) => l.id === lid)).filter(Boolean)
  const relatedFactions = (note.relatedFactionIds ?? []).map((fid) => factions.find((f) => f.id === fid)).filter(Boolean)
  const relatedItems = (note.relatedItemIds ?? []).map((iid) => items.find((i) => i.id === iid)).filter(Boolean)
  const relatedSessions = (note.relatedSessionIds ?? []).map((sid) => sessions.find((s) => s.id === sid)).filter(Boolean)

  const handleSave = async (updated: Note) => {
    await update(updated)
    setModalOpen(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              {note.title}
            </h1>
            {note.isPinned && (
              <Pin size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
            )}
          </div>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
            <Pencil size={13} /> Edit
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(note.tags ?? []).map((tagId) => (
            <TagBadge key={tagId} tagId={tagId} />
          ))}
          {!note.isPublic && <Badge>DM Only</Badge>}
        </div>
      </div>

      <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />

      <div
        className="text-sm leading-relaxed"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        {note.content ? (
          <MarkdownView content={note.content} />
        ) : (
          <span className="italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No content recorded.
          </span>
        )}
      </div>

      <div className="space-y-4">
        <RelatedSection title="Related Characters" items={relatedChars.map((c) => ({ label: c!.name, path: `/characters/${c!.id}` }))} />
        <RelatedSection title="Related Lore" items={relatedLore.map((l) => ({ label: l!.title, path: `/lore/${l!.id}` }))} />
        <RelatedSection title="Related Locations" items={relatedLocations.map((l) => ({ label: l!.name, path: `/locations/${l!.id}` }))} />
        <RelatedSection title="Related Factions" items={relatedFactions.map((f) => ({ label: f!.name, path: `/factions/${f!.id}` }))} />
        <RelatedSection title="Related Items" items={relatedItems.map((i) => ({ label: i!.name, path: `/items/${i!.id}` }))} />
        <RelatedSection title="Related Sessions" items={relatedSessions.map((s) => ({ label: s!.title, path: `/sessions/${s!.id}` }))} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Note">
        <NoteForm key={note.id} note={note} campaignId={note.campaignId} characters={campaignChars} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
