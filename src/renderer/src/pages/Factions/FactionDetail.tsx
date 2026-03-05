import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useFactionStore } from '@/store/factionStore'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import { MarkdownView } from '@/components/MarkdownView'
import { EntityHoverLink } from '@/components/EntityPreview'
import { Modal } from '@/components/Modal'
import { TagBadge } from '@/components/ui/TagBadge'
import { FactionForm } from './FactionForm'
import type { Faction } from '@/types'

function NotFound() {
  return (
    <div className="py-12 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
      Faction not found.
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

export default function FactionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    useFactionStore.getState().load()
    useCharacterStore.getState().load()
  }, [])

  const faction = useFactionStore((s) => s.factions.find((f) => f.id === id))
  const update = useFactionStore((s) => s.update)
  const characters = useCharacterStore((s) => s.characters)

  if (!faction) return <NotFound />

  // Union of manually-pinned members + chars that have this faction set on their own page
  const membersMap = new Map(
    characters
      .filter((c) => c.factionId === faction.id)
      .map((c) => [c.id, c])
  )
  faction.memberIds.forEach((mid) => {
    const c = characters.find((ch) => ch.id === mid)
    if (c) membersMap.set(c.id, c)
  })
  const members = Array.from(membersMap.values())
  const campaignChars = characters.filter((c) => c.campaignId === faction.campaignId)

  const handleSave = async (updated: Faction) => {
    await update(updated)
    setModalOpen(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {faction.name}
          </h1>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
            <Pencil size={13} /> Edit
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {faction.alignment && <Badge>{faction.alignment}</Badge>}
          {!faction.isPublic && <Badge>DM Only</Badge>}
          {(faction.tags ?? []).map((tagId) => (
            <TagBadge key={tagId} tagId={tagId} />
          ))}
        </div>
      </div>

      <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />

      {faction.goals && (
        <Section title="Goals">
          <MarkdownView content={faction.goals} />
        </Section>
      )}

      <Section title="Description">
        {faction.description ? (
          <MarkdownView content={faction.description} />
        ) : (
          <span className="italic" style={{ color: 'hsl(var(--muted-foreground))' }}>No description recorded.</span>
        )}
      </Section>

      {members.length > 0 && (
        <Section title="Members">
          <div className="flex flex-wrap gap-2">
            {members.map((char) =>
              char ? (
                <EntityHoverLink key={char.id} kind="character" id={char.id} onClick={() => { incrementNavDepth(); navigate(`/characters/${char.id}`) }}>
                  {char.name}
                </EntityHoverLink>
              ) : null
            )}
          </div>
        </Section>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Faction">
        <FactionForm key={faction.id} faction={faction} campaignId={faction.campaignId} characters={campaignChars} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
