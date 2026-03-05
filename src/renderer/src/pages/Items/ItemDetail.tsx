import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useItemStore } from '@/store/itemStore'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import { MarkdownView } from '@/components/MarkdownView'
import { EntityHoverLink } from '@/components/EntityPreview'
import { Modal } from '@/components/Modal'
import { TagBadge } from '@/components/ui/TagBadge'
import { ItemForm } from './ItemForm'
import type { Item } from '@/types'

function NotFound() {
  return (
    <div className="py-12 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
      Item not found.
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

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    useItemStore.getState().load()
    useCharacterStore.getState().load()
  }, [])

  const item = useItemStore((s) => s.items.find((i) => i.id === id))
  const update = useItemStore((s) => s.update)
  const characters = useCharacterStore((s) => s.characters)

  if (!item) return <NotFound />

  const holder = item.holderId ? characters.find((c) => c.id === item.holderId) : undefined
  const campaignChars = characters.filter((c) => c.campaignId === item.campaignId)

  const handleSave = async (updated: Item) => {
    await update(updated)
    setModalOpen(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {item.name}
          </h1>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
            <Pencil size={13} /> Edit
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge>{item.type}</Badge>
          {item.value && <Badge>{item.value}</Badge>}
          {!item.isPublic && <Badge>DM Only</Badge>}
          {(item.tags ?? []).map((tagId) => (
            <TagBadge key={tagId} tagId={tagId} />
          ))}
        </div>
        {holder && (
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <span className="font-medium">Held by:</span>{' '}
            <EntityHoverLink kind="character" id={holder.id} onClick={() => { incrementNavDepth(); navigate(`/characters/${holder.id}`) }}>
              {holder.name}
            </EntityHoverLink>
          </p>
        )}
      </div>

      <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />

      {item.properties && (
        <Section title="Properties">
          <MarkdownView content={item.properties} />
        </Section>
      )}

      <Section title="Description">
        {item.description ? (
          <MarkdownView content={item.description} />
        ) : (
          <span className="italic" style={{ color: 'hsl(var(--muted-foreground))' }}>No description recorded.</span>
        )}
      </Section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Item">
        <ItemForm key={item.id} item={item} campaignId={item.campaignId} characters={campaignChars} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
