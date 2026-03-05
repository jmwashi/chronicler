import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, StickyNote, X } from 'lucide-react'
import { useNoteStore } from '@/store/noteStore'
import { useUIStore } from '@/store/uiStore'
import { EntityHoverLink } from '@/components/EntityPreview'
import { Modal } from '@/components/Modal'
import { Field, Input, FormActions } from '@/components/ui/Field'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import type { Session, Note } from '@/types'

interface Props {
  session: Session
  onUpdateSession: (session: Session) => void
}

export function LinkedNotesSection({ session, onUpdateSession }: Props) {
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const { notes, add: addNote } = useNoteStore()
  const [linking, setLinking] = useState(false)
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')
  const [quickTitle, setQuickTitle] = useState('')

  const campaignNotes = notes.filter((n) => n.campaignId === session.campaignId)
  const linkedNotes = session.linkedNoteIds
    .map((id) => campaignNotes.find((n) => n.id === id))
    .filter(Boolean) as Note[]

  const available = campaignNotes.filter((n) => !session.linkedNoteIds.includes(n.id))
  const filtered = available.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()))

  const save = (patch: Partial<Session>) =>
    onUpdateSession({ ...session, ...patch, updatedAt: new Date().toISOString() })

  const linkNote = (noteId: string) => {
    save({ linkedNoteIds: [...session.linkedNoteIds, noteId] })
    setLinking(false)
    setQuery('')
  }

  const unlinkNote = (noteId: string) => {
    save({ linkedNoteIds: session.linkedNoteIds.filter((id) => id !== noteId) })
  }

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) return
    const now = new Date().toISOString()
    const note: Note = {
      id: crypto.randomUUID(),
      campaignId: session.campaignId,
      title: quickTitle.trim(),
      content: '',
      tags: [],
      relatedCharacterIds: [],
      relatedLoreIds: [],
      relatedLocationIds: [],
      relatedFactionIds: [],
      relatedItemIds: [],
      relatedSessionIds: [session.id],
      isPublic: false,
      isPinned: false,
      createdAt: now,
      updatedAt: now
    }
    await addNote(note)
    save({ linkedNoteIds: [...session.linkedNoteIds, note.id] })
    setQuickTitle('')
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Linked Notes ({linkedNotes.length})
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() => setLinking((l) => !l)}
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: 'hsl(var(--primary))' }}
            title="Link existing note"
          >
            <Plus size={11} />
          </button>
          <button
            onClick={() => setCreating(true)}
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: 'hsl(var(--primary))' }}
            title="Create new note"
          >
            <StickyNote size={11} />
          </button>
        </div>
      </div>

      <div className="mt-1 space-y-0.5">
        {linkedNotes.length === 0 && !linking && (
          <p className="text-xs italic pl-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
            None linked
          </p>
        )}
        {linkedNotes.map((note) => (
          <div key={note.id} className="flex items-center justify-between group pl-3">
            <EntityHoverLink
              kind="note"
              id={note.id}
              onClick={() => {
                incrementNavDepth()
                navigate(`/notes/${note.id}`)
              }}
            >
              <span className="text-xs">{note.title}</span>
            </EntityHoverLink>
            <button
              onClick={() => unlinkNote(note.id)}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:opacity-70 transition-opacity"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {linking && (
          <div className="relative mt-1 pl-3">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => setTimeout(() => { setLinking(false); setQuery('') }, 150)}
              placeholder="Search notes..."
              className="w-full px-2 py-1 rounded text-xs border bg-transparent outline-none"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
            {filtered.length > 0 && (
              <div
                className="absolute z-20 w-full mt-0.5 rounded border shadow-md max-h-32 overflow-y-auto"
                style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              >
                {filtered.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onMouseDown={() => linkNote(n.id)}
                    className="w-full text-left px-2 py-1 text-xs hover:opacity-70"
                    style={{ color: 'hsl(var(--foreground))', backgroundColor: 'hsl(var(--card))' }}
                  >
                    {n.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inline quick-add */}
        <div className="pl-3 mt-1">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            placeholder="Quick note — type title, press Enter"
            className="w-full px-2 py-1 rounded text-xs border bg-transparent outline-none"
            style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
          />
        </div>
      </div>

      {/* Quick-create note modal */}
      <CreateNoteModal
        open={creating}
        campaignId={session.campaignId}
        sessionId={session.id}
        onClose={() => setCreating(false)}
        onCreate={async (note) => {
          await addNote(note)
          save({ linkedNoteIds: [...session.linkedNoteIds, note.id] })
          setCreating(false)
        }}
      />
    </div>
  )
}

function CreateNoteModal({
  open,
  campaignId,
  sessionId,
  onClose,
  onCreate
}: {
  open: boolean
  campaignId: string
  sessionId: string
  onClose: () => void
  onCreate: (note: Note) => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSave = () => {
    if (!title.trim()) return
    const now = new Date().toISOString()
    onCreate({
      id: crypto.randomUUID(),
      campaignId,
      title: title.trim(),
      content,
      tags: [],
      relatedCharacterIds: [],
      relatedLoreIds: [],
      relatedLocationIds: [],
      relatedFactionIds: [],
      relatedItemIds: [],
      relatedSessionIds: [sessionId],
      isPublic: false,
      isPinned: false,
      createdAt: now,
      updatedAt: now
    })
    setTitle('')
    setContent('')
  }

  const handleClose = () => {
    setTitle('')
    setContent('')
    onClose()
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="Quick Note">
      <div className="space-y-4">
        <Field label="Title *">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Note title..."
          />
        </Field>
        <Field label="Content">
          <WikiTextarea
            campaignId={campaignId}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Note content... Supports [[wikilinks]]."
          />
        </Field>
        <FormActions onCancel={handleClose} onSave={handleSave} disabled={!title.trim()} />
      </div>
    </Modal>
  )
}
