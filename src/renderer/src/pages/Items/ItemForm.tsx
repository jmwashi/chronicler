import { useState } from 'react'
import { Field, Input, Select, Textarea, FormActions } from '@/components/ui/Field'
import { Combobox } from '@/components/ui/Combobox'
import { TagInput } from '@/components/ui/TagInput'
import { useCharacterStore } from '@/store/characterStore'
import type { Item, ItemType, Character } from '@/types'

interface Props {
  item?: Item
  campaignId: string
  characters: Character[]
  onSave: (i: Item) => void
  onCancel: () => void
}

interface FormState {
  name: string
  type: ItemType
  description: string
  properties: string
  value: string
  holderId: string
  tags: string[]
  isPublic: boolean
}

const empty: FormState = {
  name: '', type: 'misc', description: '', properties: '', value: '', holderId: '', tags: [], isPublic: false
}

function fromItem(i: Item): FormState {
  return {
    name: i.name, type: i.type, description: i.description,
    properties: i.properties, value: i.value, holderId: i.holderId, tags: i.tags ?? [], isPublic: i.isPublic
  }
}

export function ItemForm({ item, campaignId, characters, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(item ? fromItem(item) : empty)
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const addCharacter = useCharacterStore((s) => s.add)
  const holderOptions = [
    { value: '', label: '— Nobody —' },
    ...characters.map((c) => ({ value: c.id, label: c.name }))
  ]

  const handleSave = async () => {
    if (!form.name.trim()) return
    const now = new Date().toISOString()

    // Resolve holderId: if the value isn't a known character ID, create a new character
    let holderId = form.holderId
    if (holderId && !characters.some((c) => c.id === holderId)) {
      const newChar = {
        id: crypto.randomUUID(),
        campaignId,
        name: holderId.trim(),
        type: 'npc' as const,
        status: 'alive' as const,
        race: '',
        class: '',
        level: 1,
        locationId: '',
        factionId: '',
        description: '',
        backstory: '',
        dmNotes: '',
        hp: 0,
        armorClass: 0,
        tags: [],
        isPublic: false,
        createdAt: now,
        updatedAt: now
      }
      await addCharacter(newChar)
      holderId = newChar.id
    }

    onSave({
      id: item?.id ?? crypto.randomUUID(),
      campaignId,
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      properties: form.properties.trim(),
      value: form.value.trim(),
      holderId,
      tags: form.tags,
      isPublic: form.isPublic,
      createdAt: item?.createdAt ?? now,
      updatedAt: now
    })
  }

  return (
    <div className="space-y-4">
      <Field label="Name *">
        <Input autoFocus value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Item name" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Select value={form.type} onChange={(e) => set({ type: e.target.value as ItemType })}>
            <option value="weapon">Weapon</option>
            <option value="armor">Armor</option>
            <option value="consumable">Consumable</option>
            <option value="artifact">Artifact</option>
            <option value="tool">Tool</option>
            <option value="misc">Misc</option>
          </Select>
        </Field>
        <Field label="Value">
          <Input value={form.value} onChange={(e) => set({ value: e.target.value })} placeholder="e.g. 250gp" />
        </Field>
      </div>

      <Field label="Properties">
        <Textarea rows={2} value={form.properties} onChange={(e) => set({ properties: e.target.value })} placeholder="e.g. +1 to attack, deals 1d8 piercing damage" />
      </Field>

      <Field label="Description">
        <Textarea rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="History, appearance, lore..." />
      </Field>

      <Field label="Held By">
        <Combobox
          value={form.holderId}
          options={holderOptions}
          onChange={(v) => set({ holderId: v })}
          placeholder="Select or create character…"
          allowCustom
        />
      </Field>

      <Field label="Tags">
        <TagInput campaignId={campaignId} value={form.tags} onChange={(tags) => set({ tags })} />
      </Field>

      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'hsl(var(--foreground))' }}>
        <input type="checkbox" checked={form.isPublic} onChange={(e) => set({ isPublic: e.target.checked })} className="rounded" />
        Visible to players
      </label>

      <FormActions onCancel={onCancel} onSave={handleSave} disabled={!form.name.trim()} saveLabel={item ? 'Update' : 'Create'} />
    </div>
  )
}
