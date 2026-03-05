import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useLocationStore } from '@/store/locationStore'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import { MarkdownView } from '@/components/MarkdownView'
import { EntityHoverLink } from '@/components/EntityPreview'
import { Modal } from '@/components/Modal'
import { TagBadge } from '@/components/ui/TagBadge'
import { LocationForm } from './LocationForm'
import type { Location } from '@/types'

function NotFound() {
  return (
    <div className="py-12 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
      Location not found.
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {title}
      </h2>
      <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'hsl(var(--foreground))' }}>
        {children}
      </div>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
      style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
      {children}
    </span>
  )
}

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    useLocationStore.getState().load()
    useCharacterStore.getState().load()
  }, [])

  const location = useLocationStore((s) => s.locations.find((l) => l.id === id))
  const update = useLocationStore((s) => s.update)
  const characters = useCharacterStore((s) => s.characters)

  if (!location) return <NotFound />

  // Union of manually-pinned chars + chars that have this location set on their own page
  const notableCharsMap = new Map(
    characters
      .filter((c) => c.locationId === location.id)
      .map((c) => [c.id, c])
  )
  location.notableCharacterIds.forEach((cid) => {
    const c = characters.find((ch) => ch.id === cid)
    if (c) notableCharsMap.set(c.id, c)
  })
  const notableChars = Array.from(notableCharsMap.values())
  const campaignChars = characters.filter((c) => c.campaignId === location.campaignId)

  const handleSave = async (updated: Location) => {
    await update(updated)
    setModalOpen(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {location.name}
          </h1>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
            <Pencil size={13} /> Edit
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge>{location.type}</Badge>
          {!location.isPublic && <Badge>DM Only</Badge>}
          {(location.tags ?? []).map((tagId) => (
            <TagBadge key={tagId} tagId={tagId} />
          ))}
        </div>
      </div>

      <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />

      <Section title="Description">
        {location.description ? (
          <MarkdownView content={location.description} />
        ) : (
          <span className="italic" style={{ color: 'hsl(var(--muted-foreground))' }}>No description recorded.</span>
        )}
      </Section>

      {notableChars.length > 0 && (
        <Section title="Notable Characters">
          <div className="flex flex-wrap gap-2">
            {notableChars.map((char) =>
              char ? (
                <EntityHoverLink key={char.id} kind="character" id={char.id} onClick={() => { incrementNavDepth(); navigate(`/characters/${char.id}`) }}>
                  {char.name}
                </EntityHoverLink>
              ) : null
            )}
          </div>
        </Section>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Location">
        <LocationForm key={location.id} location={location} campaignId={location.campaignId} characters={campaignChars} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
