import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Pin, Plus, Search, Trash2 } from 'lucide-react'
import { useNoteStore } from '@/store/noteStore'
import { useCharacterStore } from '@/store/characterStore'
import { useTagStore } from '@/store/tagStore'
import { useUIStore } from '@/store/uiStore'
import { Modal } from '@/components/Modal'
import { NoCampaign, EmptyList } from '@/components/ListPage'
import { TagBadge } from '@/components/ui/TagBadge'
import { TagFilter } from '@/components/ui/TagFilter'
import { NoteForm } from './NoteForm'
import type { Note } from '@/types'

type SortKey = 'az' | 'za' | 'newest' | 'oldest'

export default function Notes() {
  const navigate = useNavigate()
  const { activeCampaignId, incrementNavDepth } = useUIStore()
  const { notes, add, update, remove } = useNoteStore()
  const characters = useCharacterStore((s) => s.characters)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Note | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  useEffect(() => {
    useNoteStore.getState().load()
    useCharacterStore.getState().load()
    useTagStore.getState().load()
  }, [])

  const filtered = notes.filter((n) => n.campaignId === activeCampaignId)
  const campaignChars = characters.filter((c) => c.campaignId === activeCampaignId)

  const availableTagIds = useMemo(() => {
    const ids = new Set<string>()
    filtered.forEach((n) => n.tags?.forEach((t) => ids.add(t)))
    return Array.from(ids)
  }, [filtered])

  const displayed = useMemo(() => {
    const q = search.toLowerCase()
    return filtered
      .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .filter((n) => selectedTagIds.length === 0 || selectedTagIds.some((tid) => n.tags?.includes(tid)))
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
        if (sort === 'az') return a.title.localeCompare(b.title)
        if (sort === 'za') return b.title.localeCompare(a.title)
        if (sort === 'newest') return b.updatedAt.localeCompare(a.updatedAt)
        return a.updatedAt.localeCompare(b.updatedAt)
      })
  }, [filtered, search, sort, selectedTagIds])

  if (!activeCampaignId) return <NoCampaign />

  const handleSave = async (n: Note) => {
    if (editing) await update(n)
    else await add(n)
    setModalOpen(false)
    setEditing(undefined)
  }

  const togglePin = async (n: Note) => {
    await update({ ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() })
  }

  const openEdit = (n: Note) => { setEditing(n); setModalOpen(true) }
  const openCreate = () => { setEditing(undefined); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(undefined) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Notes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>Quick DM notes, reminders, and session scratchpad</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
          <Plus size={14} /> New Note
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyList message="No notes yet — add one to get started." />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'hsl(var(--muted-foreground))' }} />
              <input className="w-full pl-8 pr-3 py-1.5 rounded-md text-sm border bg-transparent outline-none"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                placeholder="Search notes by title or content..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-sm border rounded-md px-2 py-1.5 bg-transparent outline-none flex-shrink-0"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <TagFilter availableTagIds={availableTagIds} selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />

          {displayed.length === 0 ? (
            <EmptyList message={`No notes match "${search}"`} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {displayed.map((n) => (
                <div key={n.id}
                  className="group relative rounded-lg border p-4 cursor-pointer transition-colors"
                  style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  onClick={() => { incrementNavDepth(); navigate(`/notes/${n.id}`) }}>

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => togglePin(n)} className="p-1.5 rounded hover:opacity-70"
                      title={n.isPinned ? 'Unpin' : 'Pin'}
                      style={{ color: n.isPinned ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
                      <Pin size={13} />
                    </button>
                    <button onClick={() => openEdit(n)} className="p-1.5 rounded hover:opacity-70"
                      style={{ color: 'hsl(var(--muted-foreground))' }}><Pencil size={13} /></button>
                    <button onClick={() => setConfirmDeleteId(n.id)} className="p-1.5 rounded hover:opacity-70"
                      style={{ color: 'hsl(var(--muted-foreground))' }}><Trash2 size={13} /></button>
                  </div>

                  <div className="pr-16">
                    <div className="flex items-center gap-1.5 mb-2">
                      {n.isPinned && <Pin size={11} className="flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />}
                      <h3 className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>{n.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(n.tags ?? []).slice(0, 3).map((t) => <TagBadge key={t} tagId={t} />)}
                      {(n.tags ?? []).length > 3 && (
                        <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>+{n.tags.length - 3}</span>
                      )}
                    </div>
                    {n.content && (
                      <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {n.content}
                      </p>
                    )}
                  </div>

                  {confirmDeleteId === n.id && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg"
                      style={{ backgroundColor: 'hsl(var(--card) / 0.95)' }}
                      onClick={(e) => e.stopPropagation()}>
                      <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Delete?</span>
                      <button onClick={() => { remove(n.id); setConfirmDeleteId(null) }}
                        className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-80"
                        style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-0.5 rounded text-xs hover:opacity-80"
                        style={{ color: 'hsl(var(--muted-foreground))' }}>No</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Note' : 'New Note'}>
        <NoteForm key={editing?.id ?? 'new'} note={editing} campaignId={activeCampaignId} characters={campaignChars} onSave={handleSave} onCancel={closeModal} />
      </Modal>
    </div>
  )
}
