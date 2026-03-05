import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useNoteStore } from '@/store/noteStore'
import { useSessionStore } from '@/store/sessionStore'
import { useUIStore } from '@/store/uiStore'
import type { Note } from '@/types'

export function QuickAddNote() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const activeCampaignId = useUIStore((s) => s.activeCampaignId)

  // Detect if on a session page
  const sessionMatch = location.pathname.match(/^\/sessions\/([^/]+)$/)
  const sessionId = sessionMatch?.[1]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])

  const handleCreate = async () => {
    if (!title.trim() || !activeCampaignId) return
    const now = new Date().toISOString()

    const note: Note = {
      id: crypto.randomUUID(),
      campaignId: activeCampaignId,
      title: title.trim(),
      content: content.trim(),
      tags: [],
      relatedCharacterIds: [],
      relatedLoreIds: [],
      relatedLocationIds: [],
      relatedFactionIds: [],
      relatedItemIds: [],
      relatedSessionIds: sessionId ? [sessionId] : [],
      isPublic: false,
      isPinned: false,
      createdAt: now,
      updatedAt: now
    }

    await useNoteStore.getState().add(note)

    // If on a session page, also link the note to the session
    if (sessionId) {
      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId)
      if (session) {
        await useSessionStore.getState().update({
          ...session,
          linkedNoteIds: [...session.linkedNoteIds, note.id],
          updatedAt: now
        })
      }
    }

    setTitle('')
    setContent('')
    setOpen(false)
  }

  if (!activeCampaignId) return null

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 p-3 rounded-full shadow-lg hover:opacity-80 transition-opacity"
        style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
        title="Quick Note (Ctrl+Shift+N)"
      >
        <Plus size={20} />
      </button>

      {/* Popup overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6" onClick={() => setOpen(false)}>
          <div
            className="w-80 rounded-lg border shadow-xl p-4 space-y-3"
            style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Quick Note
              {sessionId && (
                <span className="ml-1 text-xs font-normal" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  (linked to session)
                </span>
              )}
            </h3>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setOpen(false)
              }}
              placeholder="Note title..."
              className="w-full px-3 py-1.5 rounded-md text-sm border bg-transparent outline-none"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false)
              }}
              rows={3}
              placeholder="Content (optional)..."
              className="w-full px-3 py-1.5 rounded-md text-sm border bg-transparent outline-none resize-none"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-md text-sm hover:opacity-80"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
