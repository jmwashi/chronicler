import { type ReactElement } from 'react'
import { Calendar, Pencil, Play, Plus, Square } from 'lucide-react'
import { Badge } from '@/components/ListPage'
import { useUIStore } from '@/store/uiStore'
import type { Session } from '@/types'
import type { Scene } from '@/types'

interface Props {
  session: Session
  scenes: Scene[]
  activeSceneId: string | null
  onSelectScene: (sceneId: string | null) => void
  onAddScene: () => void
  onEditSession: () => void
  activeTab: string
  onSelectTab: (tab: string) => void
}

const tabs = [
  { id: 'plan', label: 'Plan' },
  { id: 'improv', label: 'Improv' },
  { id: 'initiative', label: 'Initiative' }
]

const statusColor = (status: Session['status']): string => {
  if (status === 'planning') return 'hsl(var(--primary))'
  if (status === 'ready') return '#10b981'
  return 'hsl(var(--muted-foreground))'
}

export function SessionSidebar({
  session,
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onEditSession,
  activeTab,
  onSelectTab
}: Props): ReactElement {
  const { activeSessionId, setActiveSession } = useUIStore()
  const isActive = activeSessionId === session.id
  const sortedScenes = [...scenes].sort((a, b) => a.order - b.order)

  return (
    <div
      className="w-52 flex-shrink-0 border-r flex flex-col overflow-hidden"
      style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      {/* Session header */}
      <div className="p-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            {session.sessionNumber > 0 && (
              <span
                className="text-xs font-medium"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Session #{session.sessionNumber}
              </span>
            )}
            <h2
              className="text-sm font-bold truncate leading-tight"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {session.title}
            </h2>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => setActiveSession(isActive ? null : session.id)}
              className="p-1 rounded hover:opacity-70"
              style={{ color: isActive ? '#10b981' : 'hsl(var(--muted-foreground))' }}
              title={isActive ? 'Deactivate session' : 'Set as active session'}
            >
              {isActive ? <Square size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={onEditSession}
              className="p-1 rounded hover:opacity-70"
              style={{ color: 'hsl(var(--muted-foreground))' }}
              title="Edit session"
            >
              <Pencil size={12} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {isActive && (
            <Badge>
              <span style={{ color: '#10b981' }}>active</span>
            </Badge>
          )}
          <Badge>
            <span style={{ color: statusColor(session.status) }}>{session.status}</span>
          </Badge>
        </div>
        {session.scheduledDate && (
          <div
            className="flex items-center gap-1 mt-1.5 text-xs"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <Calendar size={10} />
            {session.scheduledDate}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-2 pt-2 pb-1 space-y-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onSelectScene(null)
              onSelectTab(tab.id)
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              backgroundColor:
                activeTab === tab.id && !activeSceneId ? 'hsl(var(--primary))' : 'transparent',
              color:
                activeTab === tab.id && !activeSceneId
                  ? 'hsl(var(--primary-foreground))'
                  : 'hsl(var(--foreground))'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scenes */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="flex items-center justify-between px-2.5 pt-3 pb-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Scenes
          </span>
          <button
            onClick={onAddScene}
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: 'hsl(var(--primary))' }}
            title="Add scene"
          >
            <Plus size={12} />
          </button>
        </div>
        {sortedScenes.length === 0 ? (
          <p className="px-2.5 text-xs italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No scenes yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {sortedScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => onSelectScene(scene.id)}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors truncate"
                style={{
                  backgroundColor:
                    activeSceneId === scene.id ? 'hsl(var(--primary))' : 'transparent',
                  color:
                    activeSceneId === scene.id
                      ? 'hsl(var(--primary-foreground))'
                      : 'hsl(var(--foreground))'
                }}
              >
                {scene.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
