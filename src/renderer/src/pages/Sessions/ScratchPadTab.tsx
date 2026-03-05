import { useState } from 'react'
import { Eye, Pencil } from 'lucide-react'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import { MarkdownView } from '@/components/MarkdownView'
import type { Session } from '@/types'

interface Props {
  session: Session
  onUpdateSession: (session: Session) => void
}

export function ScratchPadTab({ session, onUpdateSession }: Props) {
  const [editing, setEditing] = useState(!session.scratchPad)
  const [draft, setDraft] = useState(session.scratchPad)

  const save = () => {
    onUpdateSession({ ...session, scratchPad: draft, updatedAt: new Date().toISOString() })
    setEditing(false)
  }

  const cancel = () => {
    setDraft(session.scratchPad)
    setEditing(false)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          Scratch Pad
        </h2>
        <button
          onClick={() => {
            if (editing) save()
            else setEditing(true)
          }}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:opacity-70"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {editing ? <><Eye size={12} /> Preview</> : <><Pencil size={12} /> Edit</>}
        </button>
      </div>

      {editing ? (
        <div className="space-y-2">
          <WikiTextarea
            campaignId={session.campaignId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={20}
            placeholder="Freeform session notes — jot anything down here. Supports markdown and [[wikilinks]]."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={cancel}
              className="px-2 py-1 rounded text-xs hover:opacity-70"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="px-3 py-1 rounded text-xs font-medium hover:opacity-80"
              style={{
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))'
              }}
            >
              Save
            </button>
          </div>
        </div>
      ) : session.scratchPad ? (
        <div
          className="text-sm cursor-pointer rounded-lg border p-4"
          style={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--foreground))'
          }}
          onClick={() => setEditing(true)}
        >
          <MarkdownView content={session.scratchPad} />
        </div>
      ) : (
        <div
          className="text-center py-12 rounded-lg border border-dashed cursor-pointer"
          style={{ borderColor: 'hsl(var(--border))' }}
          onClick={() => setEditing(true)}
        >
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Click to start writing scratch notes...
          </p>
        </div>
      )}
    </div>
  )
}
