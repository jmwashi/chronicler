import { useState } from 'react'
import { Field, Input, FormActions } from '@/components/ui/Field'
import { EntityChipSelect, isNewSentinel, sentinelName } from '@/components/ui/EntityChipSelect'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import { TagInput } from '@/components/ui/TagInput'
import { useCharacterStore } from '@/store/characterStore'
import type { Faction, Character } from '@/types'

interface Props {
  faction?: Faction
  campaignId: string
  characters: Character[]
  onSave: (f: Faction) => void
  onCancel: () => void
}

interface FormState {
  name: string
  alignment: string
  goals: string
  description: string
  memberIds: string[]
  tags: string[]
  isPublic: boolean
}

const empty: FormState = {
  name: '', alignment: '', goals: '', description: '', memberIds: [], tags: [], isPublic: false
}

function fromFaction(f: Faction): FormState {
  return {
    name: f.name, alignment: f.alignment, goals: f.goals,
    description: f.description, memberIds: f.memberIds, tags: f.tags ?? [], isPublic: f.isPublic
  }
}

export function FactionForm({ faction, campaignId, characters, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(faction ? fromFaction(faction) : empty)
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))
  const addCharacter = useCharacterStore((s) => s.add)
  const updateCharacter = useCharacterStore((s) => s.update)

  const handleSave = async () => {
    if (!form.name.trim()) return
    const now = new Date().toISOString()
    const factionId = faction?.id ?? crypto.randomUUID()

    // Resolve any new character sentinels
    const memberIds: string[] = []
    for (const id of form.memberIds) {
      if (isNewSentinel(id)) {
        const newChar = {
          id: crypto.randomUUID(), campaignId, name: sentinelName(id),
          type: 'npc' as const, status: 'alive' as const, race: '', class: '', level: 1,
          hp: 0, armorClass: 0,
          locationId: '', factionId, description: '', backstory: '', dmNotes: '',
          tags: [], isPublic: false, createdAt: now, updatedAt: now
        }
        await addCharacter(newChar)
        memberIds.push(newChar.id)
      } else {
        memberIds.push(id)
      }
    }

    // Sync character.factionId for added/removed members
    const oldMemberIds = faction?.memberIds ?? []
    const added = memberIds.filter((id) => !oldMemberIds.includes(id))
    const removed = oldMemberIds.filter((id) => !memberIds.includes(id))
    const allChars = useCharacterStore.getState().characters
    for (const cid of added) {
      const c = allChars.find((ch) => ch.id === cid)
      if (c && c.factionId !== factionId) {
        await updateCharacter({ ...c, factionId, updatedAt: now })
      }
    }
    for (const cid of removed) {
      const c = allChars.find((ch) => ch.id === cid)
      if (c && c.factionId === (faction?.id ?? '')) {
        await updateCharacter({ ...c, factionId: '', updatedAt: now })
      }
    }

    onSave({
      id: factionId,
      campaignId,
      name: form.name.trim(),
      alignment: form.alignment.trim(),
      goals: form.goals.trim(),
      description: form.description.trim(),
      memberIds,
      tags: form.tags,
      isPublic: form.isPublic,
      createdAt: faction?.createdAt ?? now,
      updatedAt: now
    })
  }

  return (
    <div className="space-y-4">
      <Field label="Name *">
        <Input autoFocus value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Faction name" />
      </Field>

      <Field label="Alignment">
        <Input value={form.alignment} onChange={(e) => set({ alignment: e.target.value })} placeholder="e.g. Lawful Good, Chaotic Neutral" />
      </Field>

      <Field label="Goals">
        <WikiTextarea
          campaignId={campaignId}
          rows={2}
          value={form.goals}
          onChange={(e) => set({ goals: e.target.value })}
          placeholder="What does this faction want to achieve?"
        />
      </Field>

      <Field label="Description">
        <WikiTextarea
          campaignId={campaignId}
          rows={4}
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="History, structure, reputation..."
        />
      </Field>

      <Field label="Members">
        <EntityChipSelect
          selected={form.memberIds}
          options={characters.map((c) => ({ id: c.id, name: c.name }))}
          onChange={(ids) => set({ memberIds: ids })}
          placeholder="Add or create member..."
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

      <FormActions onCancel={onCancel} onSave={handleSave} disabled={!form.name.trim()} saveLabel={faction ? 'Update' : 'Create'} />
    </div>
  )
}
