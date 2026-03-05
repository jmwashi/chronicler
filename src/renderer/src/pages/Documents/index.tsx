import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'
import { useCharacterStore } from '@/store/characterStore'
import { useLocationStore } from '@/store/locationStore'
import { useLoreStore } from '@/store/loreStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useSessionStore } from '@/store/sessionStore'
import { useTagStore } from '@/store/tagStore'
import { useUIStore } from '@/store/uiStore'
import { Modal } from '@/components/Modal'
import { NoCampaign, EmptyList } from '@/components/ListPage'
import { TagBadge } from '@/components/ui/TagBadge'
import { TagFilter } from '@/components/ui/TagFilter'
import { DocumentForm } from './DocumentForm'
import type { Document, DocumentType } from '@/types'

type SortKey = 'az' | 'za' | 'newest' | 'oldest'

const TYPE_LABELS: Record<DocumentType, string> = {
  letter: 'Letter', journal: 'Journal', book: 'Book', scroll: 'Scroll', other: 'Other'
}

export default function Documents() {
  const navigate = useNavigate()
  const { activeCampaignId, incrementNavDepth } = useUIStore()
  const { documents, add, update, remove } = useDocumentStore()
  const characters = useCharacterStore((s) => s.characters)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Document | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  useEffect(() => {
    useDocumentStore.getState().load()
    useCharacterStore.getState().load()
    useLocationStore.getState().load()
    useLoreStore.getState().load()
    useFactionStore.getState().load()
    useItemStore.getState().load()
    useSessionStore.getState().load()
    useTagStore.getState().load()
  }, [])

  const filtered = documents.filter((d) => d.campaignId === activeCampaignId)

  const availableTagIds = useMemo(() => {
    const ids = new Set<string>()
    filtered.forEach((d) => d.tags?.forEach((t) => ids.add(t)))
    return Array.from(ids)
  }, [filtered])

  const displayed = useMemo(() => {
    const q = search.toLowerCase()
    return filtered
      .filter((d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q))
      .filter((d) => !typeFilter || d.type === typeFilter)
      .filter((d) => selectedTagIds.length === 0 || selectedTagIds.some((tid) => d.tags?.includes(tid)))
      .sort((a, b) => {
        if (sort === 'az') return a.title.localeCompare(b.title)
        if (sort === 'za') return b.title.localeCompare(a.title)
        if (sort === 'newest') return b.updatedAt.localeCompare(a.updatedAt)
        return a.updatedAt.localeCompare(b.updatedAt)
      })
  }, [filtered, search, sort, typeFilter, selectedTagIds])

  if (!activeCampaignId) return <NoCampaign />

  const handleSave = async (d: Document) => {
    if (editing) await update(d)
    else await add(d)
    setModalOpen(false)
    setEditing(undefined)
  }

  const openEdit = (d: Document) => { setEditing(d); setModalOpen(true) }
  const openCreate = () => { setEditing(undefined); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(undefined) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Documents</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>Letters, journals, books, and in-universe artifacts</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
          <Plus size={14} /> New Document
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyList message="No documents yet — add one to get started." />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'hsl(var(--muted-foreground))' }} />
              <input className="w-full pl-8 pr-3 py-1.5 rounded-md text-sm border bg-transparent outline-none"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                placeholder="Search documents by title or content..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as DocumentType | '')}
              className="text-sm border rounded-md px-2 py-1.5 bg-transparent outline-none flex-shrink-0"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
              <option value="">All types</option>
              <option value="letter">Letter</option>
              <option value="journal">Journal</option>
              <option value="book">Book</option>
              <option value="scroll">Scroll</option>
              <option value="other">Other</option>
            </select>
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
            <EmptyList message={`No documents match "${search}"`} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {displayed.map((d) => {
                const author = characters.find((c) => c.id === d.authorId)
                return (
                  <div key={d.id}
                    className="group relative rounded-lg border p-4 cursor-pointer transition-colors"
                    style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    onClick={() => { incrementNavDepth(); navigate(`/documents/${d.id}`) }}>

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(d)} className="p-1.5 rounded hover:opacity-70"
                        style={{ color: 'hsl(var(--muted-foreground))' }}><Pencil size={13} /></button>
                      <button onClick={() => setConfirmDeleteId(d.id)} className="p-1.5 rounded hover:opacity-70"
                        style={{ color: 'hsl(var(--muted-foreground))' }}><Trash2 size={13} /></button>
                    </div>

                    <div className="pr-16">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText size={12} className="flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
                        <h3 className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>{d.title}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                          style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                          {TYPE_LABELS[d.type]}
                        </span>
                        {author && (
                          <span className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            by {author.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(d.tags ?? []).slice(0, 3).map((t) => <TagBadge key={t} tagId={t} />)}
                        {(d.tags ?? []).length > 3 && (
                          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>+{d.tags.length - 3}</span>
                        )}
                      </div>
                      {d.content && (
                        <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {d.content}
                        </p>
                      )}
                    </div>

                    {confirmDeleteId === d.id && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg"
                        style={{ backgroundColor: 'hsl(var(--card) / 0.95)' }}
                        onClick={(e) => e.stopPropagation()}>
                        <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Delete?</span>
                        <button onClick={() => { remove(d.id); setConfirmDeleteId(null) }}
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Document' : 'New Document'}>
        <DocumentForm key={editing?.id ?? 'new'} document={editing} campaignId={activeCampaignId} onSave={handleSave} onCancel={closeModal} />
      </Modal>
    </div>
  )
}
