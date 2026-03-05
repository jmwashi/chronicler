import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useItemStore } from '@/store/itemStore'
import { useCharacterStore } from '@/store/characterStore'
import { useTagStore } from '@/store/tagStore'
import { useUIStore } from '@/store/uiStore'
import { Modal } from '@/components/Modal'
import { NoCampaign, EmptyList, Badge } from '@/components/ListPage'
import { TagFilter } from '@/components/ui/TagFilter'
import { ItemForm } from './ItemForm'
import type { Item } from '@/types'

type SortKey = 'az' | 'za' | 'newest' | 'oldest'

export default function Items() {
  const navigate = useNavigate()
  const { activeCampaignId, incrementNavDepth } = useUIStore()
  const { items, add, update, remove } = useItemStore()
  const characters = useCharacterStore((s) => s.characters)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Item | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('az')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  useEffect(() => {
    useItemStore.getState().load()
    useCharacterStore.getState().load()
    useTagStore.getState().load()
  }, [])

  const filtered = items.filter((i) => i.campaignId === activeCampaignId)
  const campaignChars = characters.filter((c) => c.campaignId === activeCampaignId)

  const availableTagIds = useMemo(() => {
    const ids = new Set<string>()
    filtered.forEach((i) => (i.tags ?? []).forEach((t) => ids.add(t)))
    return Array.from(ids)
  }, [filtered])

  const displayed = useMemo(() => {
    const q = search.toLowerCase()
    return filtered
      .filter((i) => i.name.toLowerCase().includes(q))
      .filter((i) => selectedTagIds.length === 0 || selectedTagIds.some((tid) => (i.tags ?? []).includes(tid)))
      .sort((a, b) => {
        if (sort === 'az') return a.name.localeCompare(b.name)
        if (sort === 'za') return b.name.localeCompare(a.name)
        if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt)
        return a.createdAt.localeCompare(b.createdAt)
      })
  }, [filtered, search, sort, selectedTagIds])

  if (!activeCampaignId) return <NoCampaign />

  const handleSave = async (i: Item) => {
    if (editing) await update(i)
    else await add(i)
    setModalOpen(false)
    setEditing(undefined)
  }

  const openEdit = (i: Item) => { setEditing(i); setModalOpen(true) }
  const openCreate = () => { setEditing(undefined); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(undefined) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Items</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>Weapons, artifacts, and equipment</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
          <Plus size={14} /> New Item
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyList message="No items yet — add one to get started." />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'hsl(var(--muted-foreground))' }} />
              <input className="w-full pl-8 pr-3 py-1.5 rounded-md text-sm border bg-transparent outline-none"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <EmptyList message={`No items match "${search}"`} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {displayed.map((i) => {
                const holder = i.holderId ? campaignChars.find((c) => c.id === i.holderId) : undefined
                return (
                  <div key={i.id}
                    className="group relative rounded-lg border p-4 cursor-pointer transition-colors"
                    style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    onClick={() => { incrementNavDepth(); navigate(`/items/${i.id}`) }}>

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(i)} className="p-1.5 rounded hover:opacity-70"
                        style={{ color: 'hsl(var(--muted-foreground))' }}><Pencil size={13} /></button>
                      <button onClick={() => setConfirmDeleteId(i.id)} className="p-1.5 rounded hover:opacity-70"
                        style={{ color: 'hsl(var(--muted-foreground))' }}><Trash2 size={13} /></button>
                    </div>

                    <div className="pr-10">
                      <h3 className="font-semibold text-sm truncate mb-2" style={{ color: 'hsl(var(--foreground))' }}>{i.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        <Badge>{i.type}</Badge>
                      </div>
                      {(i.value || holder) && (
                        <p className="text-xs mt-1.5 truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {[i.value, holder ? `held by ${holder.name}` : ''].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {i.description && (
                        <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {i.description}
                        </p>
                      )}
                    </div>

                    {confirmDeleteId === i.id && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg"
                        style={{ backgroundColor: 'hsl(var(--card) / 0.95)' }}
                        onClick={(e) => e.stopPropagation()}>
                        <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Delete?</span>
                        <button onClick={() => { remove(i.id); setConfirmDeleteId(null) }}
                          className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-80"
                          style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>Yes</button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 rounded text-xs hover:opacity-80"
                          style={{ color: 'hsl(var(--muted-foreground))' }}>No</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Item' : 'New Item'}>
        <ItemForm key={editing?.id ?? 'new'} item={editing} campaignId={activeCampaignId} characters={campaignChars} onSave={handleSave} onCancel={closeModal} />
      </Modal>
    </div>
  )
}
