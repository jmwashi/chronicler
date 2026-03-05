import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useLoreStore } from '@/store/loreStore'
import { useCharacterStore } from '@/store/characterStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useUIStore } from '@/store/uiStore'
import { MarkdownView } from '@/components/MarkdownView'
import { EntityHoverLink } from '@/components/EntityPreview'
import { Modal } from '@/components/Modal'
import { TagBadge } from '@/components/ui/TagBadge'
import { LoreForm } from './LoreForm'
import type { Lore } from '@/types'

function NotFound() {
  return (
    <div className="py-12 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
      Lore entry not found.
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h2
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        {title}
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

export default function LoreDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    useLoreStore.getState().load()
    useCharacterStore.getState().load()
    useLocationStore.getState().load()
    useFactionStore.getState().load()
    useItemStore.getState().load()
  }, [])

  const lore = useLoreStore((s) => s.lore.find((l) => l.id === id))
  const update = useLoreStore((s) => s.update)
  const characters = useCharacterStore((s) => s.characters)
  const locations = useLocationStore((s) => s.locations)
  const factions = useFactionStore((s) => s.factions)
  const items = useItemStore((s) => s.items)

  if (!lore) return <NotFound />

  const campaignChars = characters.filter((c) => c.campaignId === lore.campaignId)

  const relatedCharacters = (lore.relatedCharacterIds ?? [])
    .map((cid) => characters.find((c) => c.id === cid))
    .filter(Boolean)
  const relatedLocations = (lore.relatedLocationIds ?? [])
    .map((lid) => locations.find((l) => l.id === lid))
    .filter(Boolean)
  const relatedFactions = (lore.relatedFactionIds ?? [])
    .map((fid) => factions.find((f) => f.id === fid))
    .filter(Boolean)
  const relatedItems = (lore.relatedItemIds ?? [])
    .map((iid) => items.find((i) => i.id === iid))
    .filter(Boolean)

  const handleSave = async (updated: Lore) => {
    await update(updated)
    setModalOpen(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {lore.title}
          </h1>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
            <Pencil size={13} /> Edit
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge>{lore.category}</Badge>
          {lore.era && <Badge>{lore.era}</Badge>}
          {!lore.isPublic && <Badge>DM Only</Badge>}
          {(lore.tags ?? []).map((tagId) => (
            <TagBadge key={tagId} tagId={tagId} />
          ))}
        </div>
      </div>

      <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />

      <Section title="Description">
        {lore.description ? (
          <MarkdownView content={lore.description} />
        ) : (
          <span className="italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No description recorded.
          </span>
        )}
      </Section>

      {relatedCharacters.length > 0 && (
        <Section title="Related Characters">
          <div className="flex flex-wrap gap-2">
            {relatedCharacters.map((char) =>
              char ? (
                <EntityHoverLink key={char.id} kind="character" id={char.id} onClick={() => { incrementNavDepth(); navigate(`/characters/${char.id}`) }}>
                  {char.name}
                </EntityHoverLink>
              ) : null
            )}
          </div>
        </Section>
      )}

      {relatedLocations.length > 0 && (
        <Section title="Related Locations">
          <div className="flex flex-wrap gap-2">
            {relatedLocations.map((loc) =>
              loc ? (
                <EntityHoverLink key={loc.id} kind="location" id={loc.id} onClick={() => { incrementNavDepth(); navigate(`/locations/${loc.id}`) }}>
                  {loc.name}
                </EntityHoverLink>
              ) : null
            )}
          </div>
        </Section>
      )}

      {relatedFactions.length > 0 && (
        <Section title="Related Factions">
          <div className="flex flex-wrap gap-2">
            {relatedFactions.map((fac) =>
              fac ? (
                <EntityHoverLink key={fac.id} kind="faction" id={fac.id} onClick={() => { incrementNavDepth(); navigate(`/factions/${fac.id}`) }}>
                  {fac.name}
                </EntityHoverLink>
              ) : null
            )}
          </div>
        </Section>
      )}

      {relatedItems.length > 0 && (
        <Section title="Related Items">
          <div className="flex flex-wrap gap-2">
            {relatedItems.map((item) =>
              item ? (
                <EntityHoverLink key={item.id} kind="item" id={item.id} onClick={() => { incrementNavDepth(); navigate(`/items/${item.id}`) }}>
                  {item.name}
                </EntityHoverLink>
              ) : null
            )}
          </div>
        </Section>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Lore">
        <LoreForm key={lore.id} lore={lore} campaignId={lore.campaignId} characters={campaignChars} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
