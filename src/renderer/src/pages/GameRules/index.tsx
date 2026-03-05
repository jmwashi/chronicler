import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useGameRuleStore } from '@/store/gameRuleStore'
import { useUIStore } from '@/store/uiStore'
import { NoCampaign, EmptyList } from '@/components/ListPage'
import type { GameRule } from '@/types'

export default function GameRules() {
  const { activeCampaignId } = useUIStore()
  const { gameRules, add, update, remove } = useGameRuleStore()
  const [editing, setEditing] = useState<GameRule | null>(null)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    useGameRuleStore.getState().load()
  }, [])

  const filtered = gameRules.filter((r) => r.campaignId === activeCampaignId)

  if (!activeCampaignId) return <NoCampaign />

  const startAdd = () => {
    setEditing(null)
    setTitle('')
    setDescription('')
    setAdding(true)
  }

  const startEdit = (rule: GameRule) => {
    setAdding(false)
    setEditing(rule)
    setTitle(rule.title)
    setDescription(rule.description)
  }

  const cancel = () => {
    setAdding(false)
    setEditing(null)
    setTitle('')
    setDescription('')
  }

  const save = async () => {
    if (!title.trim()) return
    const now = new Date().toISOString()
    if (editing) {
      await update({ ...editing, title: title.trim(), description: description.trim(), updatedAt: now })
    } else {
      await add({
        id: crypto.randomUUID(),
        campaignId: activeCampaignId,
        title: title.trim(),
        description: description.trim(),
        createdAt: now,
        updatedAt: now
      })
    }
    cancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      save()
    }
    if (e.key === 'Escape') cancel()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Game Rules</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>Homebrew rulings and house rules</p>
        </div>
        {!adding && !editing && (
          <button onClick={startAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
            <Plus size={14} /> Add Rule
          </button>
        )}
      </div>

      {/* Inline add/edit form */}
      {(adding || editing) && (
        <div className="rounded-lg border p-4 mb-4"
          style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--primary) / 0.5)' }}>
          <input
            autoFocus
            className="w-full bg-transparent text-sm font-semibold outline-none mb-2"
            style={{ color: 'hsl(var(--foreground))' }}
            placeholder="Rule title, e.g. Critical failures on nat 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <input
            className="w-full bg-transparent text-sm outline-none mb-3"
            style={{ color: 'hsl(var(--muted-foreground))' }}
            placeholder="Optional description or clarification"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-2">
            <button onClick={save} disabled={!title.trim()}
              className="px-3 py-1.5 rounded-md text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
              style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
              {editing ? 'Save' : 'Add'}
            </button>
            <button onClick={cancel}
              className="px-3 py-1.5 rounded-md text-xs hover:opacity-80 transition-opacity"
              style={{ color: 'hsl(var(--muted-foreground))' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 && !adding ? (
        <EmptyList message="No house rules yet — add one to get started." />
      ) : (
        <div className="space-y-2">
          {filtered.map((rule) => (
            <div key={rule.id}
              className="group relative rounded-lg border px-4 py-3 transition-colors"
              style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>

              <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(rule)} className="p-1.5 rounded hover:opacity-70"
                  style={{ color: 'hsl(var(--muted-foreground))' }}><Pencil size={13} /></button>
                <button onClick={() => setConfirmDeleteId(rule.id)} className="p-1.5 rounded hover:opacity-70"
                  style={{ color: 'hsl(var(--muted-foreground))' }}><Trash2 size={13} /></button>
              </div>

              <h3 className="font-semibold text-sm pr-16" style={{ color: 'hsl(var(--foreground))' }}>{rule.title}</h3>
              {rule.description && (
                <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{rule.description}</p>
              )}

              {confirmDeleteId === rule.id && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg"
                  style={{ backgroundColor: 'hsl(var(--card) / 0.95)' }}>
                  <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Delete?</span>
                  <button onClick={() => { remove(rule.id); setConfirmDeleteId(null) }}
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
    </div>
  )
}
