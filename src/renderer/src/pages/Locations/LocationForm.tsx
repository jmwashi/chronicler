import { useState } from 'react'
import { Field, Input, Select, FormActions } from '@/components/ui/Field'
import { EntityChipSelect, isNewSentinel, sentinelName } from '@/components/ui/EntityChipSelect'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import { TagInput } from '@/components/ui/TagInput'
import { useCharacterStore } from '@/store/characterStore'
import type { Location, LocationType, Character } from '@/types'

interface Props {
  location?: Location
  campaignId: string
  characters: Character[]
  onSave: (l: Location) => void
  onCancel: () => void
}

interface FormState {
  name: string
  type: LocationType
  description: string
  notableCharacterIds: string[]
  tags: string[]
  isPublic: boolean
}

const empty: FormState = {
  name: '', type: 'other', description: '', notableCharacterIds: [], tags: [], isPublic: false
}

function fromLocation(l: Location): FormState {
  return {
    name: l.name, type: l.type, description: l.description,
    notableCharacterIds: l.notableCharacterIds, tags: l.tags ?? [], isPublic: l.isPublic
  }
}

export function LocationForm({ location, campaignId, characters, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(location ? fromLocation(location) : empty)
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))
  const addCharacter = useCharacterStore((s) => s.add)
  const updateCharacter = useCharacterStore((s) => s.update)

  const handleSave = async () => {
    if (!form.name.trim()) return
    const now = new Date().toISOString()
    const locationId = location?.id ?? crypto.randomUUID()

    // Resolve any new character sentinels
    const notableCharacterIds: string[] = []
    for (const id of form.notableCharacterIds) {
      if (isNewSentinel(id)) {
        const newChar = {
          id: crypto.randomUUID(), campaignId, name: sentinelName(id),
          type: 'npc' as const, status: 'alive' as const, race: '', class: '', level: 1,
          hp: 0, armorClass: 0,
          locationId, factionId: '', description: '', backstory: '', dmNotes: '',
          tags: [], isPublic: false, createdAt: now, updatedAt: now
        }
        await addCharacter(newChar)
        notableCharacterIds.push(newChar.id)
      } else {
        notableCharacterIds.push(id)
      }
    }

    // Sync character.locationId for added/removed members
    const oldIds = location?.notableCharacterIds ?? []
    const added = notableCharacterIds.filter((id) => !oldIds.includes(id))
    const removed = oldIds.filter((id) => !notableCharacterIds.includes(id))
    const allChars = useCharacterStore.getState().characters
    for (const cid of added) {
      const c = allChars.find((ch) => ch.id === cid)
      if (c && c.locationId !== locationId) {
        await updateCharacter({ ...c, locationId, updatedAt: now })
      }
    }
    for (const cid of removed) {
      const c = allChars.find((ch) => ch.id === cid)
      if (c && c.locationId === (location?.id ?? '')) {
        await updateCharacter({ ...c, locationId: '', updatedAt: now })
      }
    }

    onSave({
      id: locationId,
      campaignId,
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      notableCharacterIds,
      tags: form.tags,
      isPublic: form.isPublic,
      createdAt: location?.createdAt ?? now,
      updatedAt: now
    })
  }

  return (
    <div className="space-y-4">
      <Field label="Name *">
        <Input autoFocus value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Location name" />
      </Field>

      <Field label="Type">
        <Select value={form.type} onChange={(e) => set({ type: e.target.value as LocationType })}>
          <option value="city">City</option>
          <option value="town">Town</option>
          <option value="village">Village</option>
          <option value="dungeon">Dungeon</option>
          <option value="tavern">Tavern</option>
          <option value="region">Region</option>
          <option value="landmark">Landmark</option>
          <option value="other">Other</option>
        </Select>
      </Field>

      <Field label="Description">
        <WikiTextarea
          campaignId={campaignId}
          rows={5}
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Describe the location — use [[Entity Name]] to create wiki links..."
        />
      </Field>

      <Field label="Notable Characters">
        <EntityChipSelect
          selected={form.notableCharacterIds}
          options={characters.map((c) => ({ id: c.id, name: c.name }))}
          onChange={(ids) => set({ notableCharacterIds: ids })}
          placeholder="Add or create character..."
          allowCreate
        />
      </Field>

      <Field label="Tags">
        <TagInput campaignId={campaignId} value={form.tags} onChange={(tags) => set({ tags })} />
      </Field>

      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'hsl(var(--foreground))' }}>
        <input type="checkbox" checked={form.isPublic} onChange={(e) => set({ isPublic: e.target.checked })} className="rounded" />
        Visible to players
      </label>

      <FormActions onCancel={onCancel} onSave={handleSave} disabled={!form.name.trim()} saveLabel={location ? 'Update' : 'Create'} />
    </div>
  )
}
