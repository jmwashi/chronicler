import type { Note } from '@/types'
import { Pin } from 'lucide-react'

interface Props {
  notes: Note[]
  onNavigate: (path: string) => void
}

const excerptLine = (content: string): string => {
  const first = content.split('\n').find((l) => l.trim().length > 0) ?? ''
  return first.replace(/^[#*\->~`\s]+/, '').trim()
}

export default function PinnedNotesWidget({ notes, onNavigate }: Props) {
  return (
    <div
      className="rounded-lg border"
      style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <div className="flex items-center gap-2">
          <Pin size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <span className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            Pinned Notes
          </span>
        </div>
        <button
          onClick={() => onNavigate('/notes')}
          className="text-xs hover:opacity-70 transition-opacity"
          style={{ color: 'hsl(var(--primary))' }}
        >
          All notes →
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No pinned notes — pin a note to see it here.
          </p>
        </div>
      ) : (
        <div>
          {notes.slice(0, 5).map((note) => (
            <div
              key={note.id}
              className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:opacity-80 transition-opacity border-b last:border-b-0"
              style={{ borderColor: 'hsl(var(--border))' }}
              onClick={() => onNavigate(`/notes/${note.id}`)}
            >
              <Pin
                size={12}
                className="flex-shrink-0 mt-0.5"
                style={{ color: 'hsl(var(--primary))' }}
              />
              <div className="min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {note.title}
                </p>
                {note.content && (
                  <p
                    className="text-xs line-clamp-1"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {excerptLine(note.content)}
                  </p>
                )}
              </div>
            </div>
          ))}
          {notes.length > 5 && (
            <div className="px-4 py-2.5 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
              <button
                onClick={() => onNavigate('/notes')}
                className="text-xs hover:opacity-70 transition-opacity"
                style={{ color: 'hsl(var(--primary))' }}
              >
                View all {notes.length} pinned notes →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
