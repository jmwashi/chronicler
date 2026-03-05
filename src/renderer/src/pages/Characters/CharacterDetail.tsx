import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useLoreStore } from '@/store/loreStore'
import { useNoteStore } from '@/store/noteStore'
import { useDocumentStore } from '@/store/documentStore'
import { useUIStore } from '@/store/uiStore'
import { MarkdownView } from '@/components/MarkdownView'
import { EntityHoverLink } from '@/components/EntityPreview'
import { Modal } from '@/components/Modal'
import { TagBadge } from '@/components/ui/TagBadge'
import { CharacterForm } from './CharacterForm'
import type { Character } from '@/types'

function NotFound() {
  return (
    <div className="py-12 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
      Character not found.
    </div>
  )
}

function Section({
  title,
  children,
  dmOnly
}: {
  title: string
  children: React.ReactNode
  dmOnly?: boolean
}) {
  return (
    <div className="space-y-1">
      <h2
        className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        {title}
        {dmOnly && (
          <span
            className="text-xs px-1.5 py-0.5 rounded font-normal normal-case tracking-normal"
            style={{
              backgroundColor: 'hsl(var(--primary) / 0.15)',
              color: 'hsl(var(--primary))'
            }}
          >
            DM Only
          </span>
        )}
      </h2>
      <div
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        {children}
      </div>
    </div>
  )
}

function EmptyField({ label }: { label: string }) {
  return (
    <span className="italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
      No {label} recorded.
    </span>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
      style={{
        backgroundColor: 'hsl(var(--muted))',
        color: 'hsl(var(--muted-foreground))'
      }}
    >
      {children}
    </span>
  )
}

export default function CharacterDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    useCharacterStore.getState().load()
    useLocationStore.getState().load()
    useFactionStore.getState().load()
    useItemStore.getState().load()
    useLoreStore.getState().load()
    useNoteStore.getState().load()
    useDocumentStore.getState().load()
  }, [])

  const character = useCharacterStore((s) => s.characters.find((c) => c.id === id))
  const update = useCharacterStore((s) => s.update)
  const location = useLocationStore((s) => s.locations.find((l) => l.id === character?.locationId))
  const faction = useFactionStore((s) => s.factions.find((f) => f.id === character?.factionId))
  const allItems = useItemStore((s) => s.items)
  const allLore = useLoreStore((s) => s.lore)
  const allNotes = useNoteStore((s) => s.notes)
  const allDocuments = useDocumentStore((s) => s.documents)
  const heldItems = useMemo(() => allItems.filter((i) => i.holderId === id), [allItems, id])
  const relatedLore = useMemo(() => allLore.filter((l) => l.relatedCharacterIds.includes(id!)), [allLore, id])
  const relatedNotes = useMemo(() => allNotes.filter((n) => n.relatedCharacterIds.includes(id!)), [allNotes, id])
  const relatedDocuments = useMemo(() => allDocuments.filter((d) => d.authorId === id || d.recipientId === id || d.relatedCharacterIds.includes(id!)), [allDocuments, id])

  if (!character) return <NotFound />

  const handleSave = async (updated: Character) => {
    await update(updated)
    setModalOpen(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {character.name}
          </h1>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
            <Pencil size={13} /> Edit
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge>{character.type}</Badge>
          <Badge>{character.status}</Badge>
          {character.race && <Badge>{character.race}</Badge>}
          {character.class && (
            <Badge>
              {character.class}
              {character.level > 0 ? ` ${character.level}` : ''}
            </Badge>
          )}
          {character.hp > 0 && <Badge>HP {character.hp}</Badge>}
          {character.armorClass > 0 && <Badge>AC {character.armorClass}</Badge>}
          {(character.tags ?? []).map((tagId) => (
            <TagBadge key={tagId} tagId={tagId} />
          ))}
        </div>
        {(location || faction) && (
          <p className="text-sm flex items-center gap-2 flex-wrap" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {location && (
              <span>
                <span className="font-medium">Location:</span>{' '}
                <EntityHoverLink kind="location" id={location.id} onClick={() => { incrementNavDepth(); navigate(`/locations/${location.id}`) }}>
                  {location.name}
                </EntityHoverLink>
              </span>
            )}
            {location && faction && <span>·</span>}
            {faction && (
              <span>
                <span className="font-medium">Faction:</span>{' '}
                <EntityHoverLink kind="faction" id={faction.id} onClick={() => { incrementNavDepth(); navigate(`/factions/${faction.id}`) }}>
                  {faction.name}
                </EntityHoverLink>
              </span>
            )}
          </p>
        )}
      </div>

      <div
        className="border-t"
        style={{ borderColor: 'hsl(var(--border))' }}
      />

      <Section title="Description">
        {character.description ? (
          <MarkdownView content={character.description} />
        ) : (
          <EmptyField label="description" />
        )}
      </Section>

      <Section title="Backstory">
        {character.backstory ? (
          <MarkdownView content={character.backstory} />
        ) : (
          <EmptyField label="backstory" />
        )}
      </Section>

      {character.dmNotes && (
        <Section title="Notes" dmOnly>
          <MarkdownView content={character.dmNotes} />
        </Section>
      )}

      {heldItems.length > 0 && (
        <Section title="Held Items">
          <div className="flex flex-wrap gap-2">
            {heldItems.map((item) => (
              <EntityHoverLink key={item.id} kind="item" id={item.id} onClick={() => { incrementNavDepth(); navigate(`/items/${item.id}`) }}>
                {item.name}
              </EntityHoverLink>
            ))}
          </div>
        </Section>
      )}

      {relatedLore.length > 0 && (
        <Section title="Related Lore">
          <div className="flex flex-wrap gap-2">
            {relatedLore.map((lore) => (
              <EntityHoverLink key={lore.id} kind="lore" id={lore.id} onClick={() => { incrementNavDepth(); navigate(`/lore/${lore.id}`) }}>
                {lore.title}
              </EntityHoverLink>
            ))}
          </div>
        </Section>
      )}

      {relatedNotes.length > 0 && (
        <Section title="Related Notes">
          <div className="flex flex-wrap gap-2">
            {relatedNotes.map((note) => (
              <EntityHoverLink key={note.id} kind="note" id={note.id} onClick={() => { incrementNavDepth(); navigate(`/notes/${note.id}`) }}>
                {note.title}
              </EntityHoverLink>
            ))}
          </div>
        </Section>
      )}

      {relatedDocuments.length > 0 && (
        <Section title="Related Documents">
          <div className="flex flex-wrap gap-2">
            {relatedDocuments.map((doc) => (
              <EntityHoverLink key={doc.id} kind="document" id={doc.id} onClick={() => { incrementNavDepth(); navigate(`/documents/${doc.id}`) }}>
                {doc.title}
              </EntityHoverLink>
            ))}
          </div>
        </Section>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Character">
        <CharacterForm key={character.id} character={character} campaignId={character.campaignId} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
