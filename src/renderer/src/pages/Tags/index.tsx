import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { useTagStore } from '@/store/tagStore'
import { useCharacterStore } from '@/store/characterStore'
import { useNoteStore } from '@/store/noteStore'
import { useLoreStore } from '@/store/loreStore'
import { useItemStore } from '@/store/itemStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useDocumentStore } from '@/store/documentStore'
import { useUIStore } from '@/store/uiStore'
import { NoCampaign, EmptyList } from '@/components/ListPage'
import type { Tag } from '@/types/tag'

function useTagUsageCount(tagId: string): number {
  const characters = useCharacterStore((s) => s.characters)
  const notes = useNoteStore((s) => s.notes)
  const lore = useLoreStore((s) => s.lore)
  const items = useItemStore((s) => s.items)
  const locations = useLocationStore((s) => s.locations)
  const factions = useFactionStore((s) => s.factions)
  const documents = useDocumentStore((s) => s.documents)

  return useMemo(() => {
    let count = 0
    const all = [...characters, ...notes, ...lore, ...items, ...locations, ...factions, ...documents] as Array<{ tags?: string[] }>
    for (const e of all) {
      if (e.tags?.includes(tagId)) count++
    }
    return count
  }, [tagId, characters, notes, lore, items, locations, factions, documents])
}

function TagRow({ tag }: { tag: Tag }) {
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const updateTag = useTagStore((s) => s.update)
  const removeTag = useTagStore((s) => s.remove)
  const removeFromEntities = useTagStore((s) => s.removeTagFromAllEntities)
  const count = useTagUsageCount(tag.id)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(tag.name)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleRename = async () => {
    if (name.trim() && name.trim() !== tag.name) {
      await updateTag({ ...tag, name: name.trim(), updatedAt: new Date().toISOString() })
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    await removeFromEntities(tag.id)
    await removeTag(tag.id)
    setConfirmDelete(false)
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b cursor-pointer hover:opacity-80 transition-opacity"
      style={{ borderColor: 'hsl(var(--border))' }}
      onClick={() => { incrementNavDepth(); navigate(`/tags/${tag.id}`) }}
    >
      <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />

      {editing ? (
        <input
          autoFocus
          className="flex-1 bg-transparent outline-none text-sm border-b"
          style={{ color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--primary))' }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
            if (e.key === 'Escape') { setName(tag.name); setEditing(false) }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
          {tag.name}
        </span>
      )}

      <span className="text-xs tabular-nums" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {count} {count === 1 ? 'use' : 'uses'}
      </span>

      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => { setEditing(true); setName(tag.name) }}
          className="p-1.5 rounded hover:opacity-70"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <Pencil size={13} />
        </button>

        {confirmDelete ? (
          <span className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-80"
              style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-0.5 rounded text-xs hover:opacity-80"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              No
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded hover:opacity-70"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Tags() {
  const { activeCampaignId } = useUIStore()
  const tags = useTagStore((s) => s.tags)

  useEffect(() => {
    useTagStore.getState().load()
    useCharacterStore.getState().load()
    useNoteStore.getState().load()
    useLoreStore.getState().load()
    useItemStore.getState().load()
    useLocationStore.getState().load()
    useFactionStore.getState().load()
    useDocumentStore.getState().load()
  }, [])

  const campaignTags = useMemo(
    () => tags.filter((t) => t.campaignId === activeCampaignId).sort((a, b) => a.name.localeCompare(b.name)),
    [tags, activeCampaignId]
  )

  if (!activeCampaignId) return <NoCampaign />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Tags</h1>
        <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Manage tags across all entity types
        </p>
      </div>

      {campaignTags.length === 0 ? (
        <EmptyList message="No tags yet — tags are created when you add them to entities." />
      ) : (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        >
          {campaignTags.map((tag) => (
            <TagRow key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </div>
  )
}
