import { useState } from 'react'
import { Field, Input, Select, FormActions } from '@/components/ui/Field'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import { EntityChipSelect } from '@/components/ui/EntityChipSelect'
import { Combobox } from '@/components/ui/Combobox'
import { useCharacterStore } from '@/store/characterStore'
import { useLocationStore } from '@/store/locationStore'
import type { Scene, SceneStatus } from '@/types'

interface Props {
  scene?: Scene
  campaignId: string
  sessionId: string
  nextOrder: number
  onSave: (scene: Scene) => void
  onCancel: () => void
}

interface FormState {
  title: string
  description: string
  locationId: string
  presentCharacterIds: string[]
  status: SceneStatus
  dmNotes: string
}

function toForm(s?: Scene): FormState {
  return s
    ? {
        title: s.title,
        description: s.description,
        locationId: s.locationId,
        presentCharacterIds: [...s.presentCharacterIds],
        status: s.status,
        dmNotes: s.dmNotes
      }
    : {
        title: '',
        description: '',
        locationId: '',
        presentCharacterIds: [],
        status: 'planned',
        dmNotes: ''
      }
}

export function SceneForm({ scene, campaignId, sessionId, nextOrder, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(toForm(scene))
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const characters = useCharacterStore((s) => s.characters).filter((c) => c.campaignId === campaignId)
  const locations = useLocationStore((s) => s.locations).filter((l) => l.campaignId === campaignId)

  const handleSave = () => {
    if (!form.title.trim()) return
    const now = new Date().toISOString()

    onSave({
      id: scene?.id ?? crypto.randomUUID(),
      campaignId,
      sessionId,
      title: form.title.trim(),
      order: scene?.order ?? nextOrder,
      description: form.description,
      locationId: form.locationId,
      presentCharacterIds: form.presentCharacterIds,
      status: form.status,
      dmNotes: form.dmNotes,
      createdAt: scene?.createdAt ?? now,
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
          placeholder="e.g. Ambush at the Bridge"
        />
      </Field>
      <Field label="Status">
        <Select value={form.status} onChange={(e) => set({ status: e.target.value as SceneStatus })}>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
        </Select>
      </Field>
      <Field label="Location">
        <Combobox
          value={form.locationId}
          onChange={(val) => set({ locationId: val })}
          options={locations.map((l) => ({ value: l.id, label: l.name }))}
          placeholder="Select location..."
        />
      </Field>
      <Field label="Present Characters">
        <EntityChipSelect
          selected={form.presentCharacterIds}
          options={characters.map((c) => ({ id: c.id, name: c.name }))}
          onChange={(ids) => set({ presentCharacterIds: ids })}
          placeholder="Add characters..."
        />
      </Field>
      <Field label="Description">
        <WikiTextarea
          campaignId={campaignId}
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={4}
          placeholder="What happens in this scene? Supports [[wikilinks]]."
        />
      </Field>
      <Field label="DM Notes">
        <WikiTextarea
          campaignId={campaignId}
          value={form.dmNotes}
          onChange={(e) => set({ dmNotes: e.target.value })}
          rows={3}
          placeholder="Private notes for this scene..."
        />
      </Field>
      <FormActions onCancel={onCancel} onSave={handleSave} disabled={!form.title.trim()} />
    </div>
  )
}
