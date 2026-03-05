import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Pencil, Play, Plus, Search, Square, Trash2 } from 'lucide-react'
import { useSessionStore } from '@/store/sessionStore'
import { useSceneStore } from '@/store/sceneStore'
import { useUIStore } from '@/store/uiStore'
import { Modal } from '@/components/Modal'
import { NoCampaign, EmptyList, Badge } from '@/components/ListPage'
import { SessionForm } from './SessionForm'
import type { Session } from '@/types'

type SortKey = 'newest' | 'oldest' | 'number-asc' | 'number-desc'

export default function Sessions() {
  const navigate = useNavigate()
  const { activeCampaignId, activeSessionId, setActiveSession, incrementNavDepth } = useUIStore()
  const { sessions, add, update, remove } = useSessionStore()
  const scenes = useSceneStore((s) => s.scenes)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Session | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  useEffect(() => {
    useSessionStore.getState().load()
    useSceneStore.getState().load()
  }, [])

  const filtered = sessions.filter((s) => s.campaignId === activeCampaignId)

  const displayed = useMemo(() => {
    const q = search.toLowerCase()
    return filtered
      .filter((s) => s.title.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt)
        if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt)
        if (sort === 'number-asc') return a.sessionNumber - b.sessionNumber
        return b.sessionNumber - a.sessionNumber
      })
  }, [filtered, search, sort])

  if (!activeCampaignId) return <NoCampaign />

  const handleSave = async (s: Session) => {
    if (editing) await update(s)
    else await add(s)
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleDelete = async (id: string) => {
    // Also remove scenes belonging to this session
    const sessionScenes = scenes.filter((sc) => sc.sessionId === id)
    for (const sc of sessionScenes) {
      await useSceneStore.getState().remove(sc.id)
    }
    await remove(id)
    setConfirmDeleteId(null)
  }

  const openEdit = (s: Session) => {
    setEditing(s)
    setModalOpen(true)
  }
  const openCreate = () => {
    setEditing(undefined)
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
    setEditing(undefined)
  }

  const statusColor = (status: Session['status']) => {
    if (status === 'planning') return 'hsl(var(--primary))'
    if (status === 'ready') return '#10b981'
    return 'hsl(var(--muted-foreground))'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Sessions
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Plan and manage your game sessions
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))'
          }}
        >
          <Plus size={14} /> New Session
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyList message="No sessions yet — create one to start planning." />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <input
                className="w-full pl-8 pr-3 py-1.5 rounded-md text-sm border bg-transparent outline-none"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-sm border rounded-md px-2 py-1.5 bg-transparent outline-none flex-shrink-0"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="number-desc">Session # (high → low)</option>
              <option value="number-asc">Session # (low → high)</option>
            </select>
          </div>

          {displayed.length === 0 ? (
            <EmptyList message={`No sessions match "${search}"`} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {displayed.map((s) => {
                const sceneCount = scenes.filter((sc) => sc.sessionId === s.id).length
                const isActive = activeSessionId === s.id
                return (
                  <div
                    key={s.id}
                    className="group relative rounded-lg border p-4 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: isActive ? '#10b981' : 'hsl(var(--border))',
                      borderWidth: isActive ? 2 : 1
                    }}
                    onClick={() => {
                      incrementNavDepth()
                      navigate(`/sessions/${s.id}`)
                    }}
                  >
                    <div
                      className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setActiveSession(isActive ? null : s.id)}
                        className="p-1.5 rounded hover:opacity-70"
                        style={{ color: isActive ? '#10b981' : 'hsl(var(--muted-foreground))' }}
                        title={isActive ? 'Deactivate session' : 'Set as active session'}
                      >
                        {isActive ? <Square size={13} /> : <Play size={13} />}
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded hover:opacity-70"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(s.id)}
                        className="p-1.5 rounded hover:opacity-70"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="pr-16">
                      <div className="flex items-center gap-1.5 mb-1">
                        {s.sessionNumber > 0 && (
                          <span
                            className="text-xs font-medium"
                            style={{ color: 'hsl(var(--muted-foreground))' }}
                          >
                            #{s.sessionNumber}
                          </span>
                        )}
                        <h3
                          className="font-semibold text-sm truncate"
                          style={{ color: 'hsl(var(--foreground))' }}
                        >
                          {s.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {isActive && (
                          <Badge>
                            <span style={{ color: '#10b981' }}>active</span>
                          </Badge>
                        )}
                        <Badge>
                          <span style={{ color: statusColor(s.status) }}>{s.status}</span>
                        </Badge>
                        {sceneCount > 0 && (
                          <Badge>{sceneCount} scene{sceneCount !== 1 ? 's' : ''}</Badge>
                        )}
                      </div>
                      {s.scheduledDate && (
                        <div
                          className="flex items-center gap-1 text-xs"
                          style={{ color: 'hsl(var(--muted-foreground))' }}
                        >
                          <Calendar size={11} />
                          {s.scheduledDate}
                        </div>
                      )}
                    </div>

                    {confirmDeleteId === s.id && (
                      <div
                        className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg"
                        style={{ backgroundColor: 'hsl(var(--card) / 0.95)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Delete?
                        </span>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-80"
                          style={{
                            backgroundColor: 'hsl(var(--destructive))',
                            color: 'hsl(var(--destructive-foreground))'
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 rounded text-xs hover:opacity-80"
                          style={{ color: 'hsl(var(--muted-foreground))' }}
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Session' : 'New Session'}>
        <SessionForm
          key={editing?.id ?? 'new'}
          session={editing}
          campaignId={activeCampaignId}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
