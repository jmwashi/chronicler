import { Plus } from 'lucide-react'
import { PlanningSection } from './PlanningSection'
import type { Session, PlanningSection as PlanningSectionType } from '@/types'

interface Props {
  session: Session
  onUpdateSession: (session: Session) => void
}

export function PlanningTab({ session, onUpdateSession }: Props) {
  const sections = [...session.planningSections].sort((a, b) => a.order - b.order)

  const updateSection = (updated: PlanningSectionType) => {
    const newSections = session.planningSections.map((s) =>
      s.id === updated.id ? updated : s
    )
    onUpdateSession({ ...session, planningSections: newSections, updatedAt: new Date().toISOString() })
  }

  const removeSection = (id: string) => {
    const newSections = session.planningSections.filter((s) => s.id !== id)
    onUpdateSession({ ...session, planningSections: newSections, updatedAt: new Date().toISOString() })
  }

  const addSection = () => {
    const maxOrder = session.planningSections.reduce((max, s) => Math.max(max, s.order), -1)
    const newSection: PlanningSectionType = {
      id: crypto.randomUUID(),
      title: 'New Section',
      content: '',
      order: maxOrder + 1
    }
    onUpdateSession({
      ...session,
      planningSections: [...session.planningSections, newSection],
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <PlanningSection
          key={section.id}
          section={section}
          campaignId={session.campaignId}
          onUpdate={updateSection}
          onRemove={removeSection}
        />
      ))}
      <button
        onClick={addSection}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm hover:opacity-80 transition-opacity w-full justify-center border border-dashed"
        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
      >
        <Plus size={14} /> Add Section
      </button>
    </div>
  )
}
