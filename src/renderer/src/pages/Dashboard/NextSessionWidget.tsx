import type { Session } from '@/types'
import { Scroll, Calendar, CheckSquare, Square } from 'lucide-react'

interface Props {
  session: Session | null
  onNavigate: (path: string) => void
}

const statusColor = (status: Session['status']) => {
  if (status === 'planning') return 'hsl(var(--primary))'
  if (status === 'ready') return '#10b981'
  return 'hsl(var(--muted-foreground))'
}

export default function NextSessionWidget({ session, onNavigate }: Props) {
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
          <Scroll size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <span className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            Next Session
          </span>
        </div>
        <button
          onClick={() => onNavigate('/sessions')}
          className="text-xs hover:opacity-70 transition-opacity"
          style={{ color: 'hsl(var(--primary))' }}
        >
          All sessions →
        </button>
      </div>

      {!session ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No sessions planned.
          </p>
          <button
            onClick={() => onNavigate('/sessions')}
            className="text-xs mt-2 hover:underline"
            style={{ color: 'hsl(var(--primary))' }}
          >
            Create a session →
          </button>
        </div>
      ) : (
        <div
          className="cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onNavigate(`/sessions/${session.id}`)}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              {session.sessionNumber > 0 && (
                <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Session #{session.sessionNumber} ·{' '}
                </span>
              )}
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                {session.title}
              </span>
            </div>
            <span
              className="text-xs font-medium capitalize flex-shrink-0 ml-2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'hsl(var(--muted))', color: statusColor(session.status) }}
            >
              {session.status}
            </span>
          </div>

          {session.scheduledDate && (
            <div
              className="flex items-center gap-1.5 px-4 pb-2 text-xs"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <Calendar size={11} />
              {session.scheduledDate}
            </div>
          )}

          {session.planningSections.length > 0 && (
            <>
              <div className="mx-4 border-t" style={{ borderColor: 'hsl(var(--border))' }} />
              <div className="px-4 py-3 space-y-1.5">
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide mb-2"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Prep Checklist
                </p>
                {[...session.planningSections]
                  .sort((a, b) => a.order - b.order)
                  .slice(0, 4)
                  .map((sec) => {
                    const done = sec.content.trim().length > 0
                    return (
                      <div key={sec.id} className="flex items-center gap-2">
                        {done ? (
                          <CheckSquare size={12} style={{ color: 'hsl(var(--primary))' }} />
                        ) : (
                          <Square size={12} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        )}
                        <span
                          className="text-xs"
                          style={{
                            color: done
                              ? 'hsl(var(--foreground))'
                              : 'hsl(var(--muted-foreground))'
                          }}
                        >
                          {sec.title}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
