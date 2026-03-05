import { useState } from 'react'
import { Field, Input, Select, FormActions } from '@/components/ui/Field'
import type { Session, SessionStatus } from '@/types'
import { DEFAULT_PLANNING_SECTIONS } from '@/types'

interface Props {
  session?: Session
  campaignId: string
  onSave: (session: Session) => void
  onCancel: () => void
}

interface FormState {
  title: string
  sessionNumber: string
  status: SessionStatus
  scheduledDate: string
}

function toForm(s?: Session): FormState {
  return s
    ? { title: s.title, sessionNumber: String(s.sessionNumber), status: s.status, scheduledDate: s.scheduledDate }
    : { title: '', sessionNumber: '', status: 'planning', scheduledDate: '' }
}

export function SessionForm({ session, campaignId, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(toForm(session))
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const handleSave = () => {
    if (!form.title.trim()) return
    const now = new Date().toISOString()

    const planningSections = session
      ? session.planningSections
      : DEFAULT_PLANNING_SECTIONS.map((s, i) => ({
          id: crypto.randomUUID(),
          title: s.title,
          content: s.content,
          order: i
        }))

    onSave({
      id: session?.id ?? crypto.randomUUID(),
      campaignId,
      title: form.title.trim(),
      sessionNumber: Number(form.sessionNumber) || 0,
      status: form.status,
      scheduledDate: form.scheduledDate,
      planningSections,
      referencedCharacterIds: session?.referencedCharacterIds ?? [],
      referencedLocationIds: session?.referencedLocationIds ?? [],
      referencedFactionIds: session?.referencedFactionIds ?? [],
      referencedItemIds: session?.referencedItemIds ?? [],
      combatants: session?.combatants ?? [],
      currentTurnIndex: session?.currentTurnIndex ?? 0,
      roundNumber: session?.roundNumber ?? 0,
      scratchPad: session?.scratchPad ?? '',
      linkedNoteIds: session?.linkedNoteIds ?? [],
      createdAt: session?.createdAt ?? now,
      updatedAt: now
    })
  }

  return (
    <div className="space-y-4">
      <Field label="Title *">
        <Input
          autoFocus
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="e.g. The Dragon's Lair"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Session Number">
          <Input
            type="number"
            min={0}
            value={form.sessionNumber}
            onChange={(e) => set({ sessionNumber: e.target.value })}
            placeholder="1"
          />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set({ status: e.target.value as SessionStatus })}>
            <option value="planning">Planning</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </Select>
        </Field>
      </div>
      <Field label="Scheduled Date">
        <Input
          type="date"
          value={form.scheduledDate}
          onChange={(e) => set({ scheduledDate: e.target.value })}
        />
      </Field>
      <FormActions onCancel={onCancel} onSave={handleSave} disabled={!form.title.trim()} />
    </div>
  )
}
