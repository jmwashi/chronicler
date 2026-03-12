import { type ReactElement, useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useSessionStore } from '@/store/sessionStore'
import { useSceneStore } from '@/store/sceneStore'
import { Modal } from '@/components/Modal'
import { SessionForm } from './SessionForm'
import { SessionSidebar } from './SessionSidebar'
import { PlanningTab } from './PlanningTab'
import { ReferencePanel } from './ReferencePanel'
import { SceneDetail } from './SceneDetail'
import { InitiativeTracker } from './InitiativeTracker'
import { ImprovToolTab } from './ImprovToolTab'
import type { Session, Scene } from '@/types'

export default function SessionDetail(): ReactElement {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { sessions, update } = useSessionStore()
  const scenes = useSceneStore((s) => s.scenes)
  const session = sessions.find((s) => s.id === id)

  const [activeTab, setActiveTab] = useState('plan')
  const [refPanelOpen, setRefPanelOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const activeSceneId = searchParams.get('scene')

  useEffect(() => {
    useSessionStore.getState().load()
    useSceneStore.getState().load()
  }, [])

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Session not found.{' '}
          <button
            onClick={() => navigate('/sessions')}
            className="underline hover:opacity-70"
            style={{ color: 'hsl(var(--primary))' }}
          >
            Back to sessions
          </button>
        </p>
      </div>
    )
  }

  const sessionScenes = scenes.filter((sc) => sc.sessionId === session.id)
  const nextSceneOrder = sessionScenes.reduce((max, sc) => Math.max(max, sc.order), -1) + 1

  const handleSelectScene = (sceneId: string | null): void => {
    if (sceneId) {
      setSearchParams({ scene: sceneId })
    } else {
      setSearchParams({})
    }
  }

  const handleUpdateSession = async (updated: Session): Promise<void> => {
    await update(updated)
  }

  const handleEditSave = async (updated: Session): Promise<void> => {
    await update(updated)
    setEditModalOpen(false)
  }

  const handleAddScene = async (): Promise<void> => {
    const now = new Date().toISOString()
    const newScene: Scene = {
      id: crypto.randomUUID(),
      campaignId: session.campaignId,
      sessionId: session.id,
      title: 'New Scene',
      order: nextSceneOrder,
      description: '',
      locationId: '',
      presentCharacterIds: [],
      status: 'planned',
      dmNotes: '',
      createdAt: now,
      updatedAt: now
    }
    await useSceneStore.getState().add(newScene)
    setSearchParams({ scene: newScene.id })
  }

  const handleUpdateScene = async (scene: Scene): Promise<void> => {
    await useSceneStore.getState().update(scene)
  }

  const handleRemoveScene = async (sceneId: string): Promise<void> => {
    await useSceneStore.getState().remove(sceneId)
    setSearchParams({})
  }

  const renderMainContent = (): ReactElement | null => {
    if (activeSceneId) {
      const scene = sessionScenes.find((sc) => sc.id === activeSceneId)
      if (!scene) {
        return (
          <p className="text-sm p-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Scene not found.
          </p>
        )
      }
      return (
        <SceneDetail
          key={scene.id}
          scene={scene}
          onUpdate={handleUpdateScene}
          onRemove={handleRemoveScene}
        />
      )
    }

    switch (activeTab) {
      case 'plan':
        return (
          <div className="p-4">
            <PlanningTab session={session} onUpdateSession={handleUpdateSession} />
          </div>
        )
      case 'improv':
        return <ImprovToolTab session={session} />
      case 'initiative':
        return (
          <div className="p-4">
            <InitiativeTracker session={session} onUpdateSession={handleUpdateSession} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    // Full-bleed: cancel the p-6 padding from AppShell's <main>
    <div className="-m-6 flex h-[calc(100vh-3rem)] overflow-hidden relative">
      {/* Left: Session sidebar */}
      <SessionSidebar
        session={session}
        scenes={sessionScenes}
        activeSceneId={activeSceneId}
        onSelectScene={handleSelectScene}
        onAddScene={handleAddScene}
        onEditSession={() => setEditModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Center: Main content */}
      <div className="flex-1 overflow-y-auto">{renderMainContent()}</div>

      {/* Right: Reference panel toggle + panel */}
      <button
        onClick={() => setRefPanelOpen((o) => !o)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md hover:opacity-70"
        style={{
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--muted-foreground))',
          border: '1px solid hsl(var(--border))'
        }}
        title={refPanelOpen ? 'Close reference panel' : 'Open reference panel'}
      >
        {refPanelOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
      </button>

      {refPanelOpen && (
        <div
          className="w-72 flex-shrink-0 border-l overflow-y-auto p-3"
          style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        >
          <ReferencePanel session={session} onUpdateSession={handleUpdateSession} />
        </div>
      )}

      {/* Edit session metadata modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Session">
        <SessionForm
          key={session.id}
          session={session}
          campaignId={session.campaignId}
          onSave={handleEditSave}
          onCancel={() => setEditModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
