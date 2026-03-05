import { useState } from 'react'
import { Field, Input, Select, FormActions } from '@/components/ui/Field'
import { EntityChipSelect, isNewSentinel, sentinelName } from '@/components/ui/EntityChipSelect'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import { TagInput } from '@/components/ui/TagInput'
import { useCharacterStore } from '@/store/characterStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { extractWikilinks, mergeIds } from '@/lib/extractWikilinks'
import type { Lore, LoreCategory, Character } from '@/types'

interface Props {
  lore?: Lore
  campaignId: string
  characters: Character[]
  onSave: (l: Lore) => void
  onCancel: () => void
}

interface FormState {
  title: string
  category: LoreCategory
  era: string
  description: string
  relatedCharacterIds: string[]
  relatedLocationIds: string[]
  relatedFactionIds: string[]
  relatedItemIds: string[]
  tags: string[]
  isPublic: boolean
}

function fromLore(l: Lore): FormState {
  return {
    title: l.title, category: l.category, era: l.era,
    description: l.description,
    relatedCharacterIds: l.relatedCharacterIds,
    relatedLocationIds: l.relatedLocationIds ?? [],
    relatedFactionIds: l.relatedFactionIds ?? [],
    relatedItemIds: l.relatedItemIds ?? [],
    tags: l.tags ?? [], isPublic: l.isPublic
  }
}

const empty: FormState = {
  title: '', category: 'history', era: '', description: '',
  relatedCharacterIds: [], relatedLocationIds: [],
  relatedFactionIds: [], relatedItemIds: [],
  tags: [], isPublic: false
}

export function LoreForm({ lore, campaignId, characters, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(lore ? fromLore(lore) : empty)
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))
  const addCharacter = useCharacterStore((s) => s.add)

  const locations = useLocationStore((s) => s.locations).filter((l) => l.campaignId === campaignId)
  const factions = useFactionStore((s) => s.factions).filter((f) => f.campaignId === campaignId)
  const items = useItemStore((s) => s.items).filter((i) => i.campaignId === campaignId)

  const handleSave = async () => {
    if (!form.title.trim()) return
    const now = new Date().toISOString()

    // Resolve any new character sentinels
    const relatedCharacterIds: string[] = []
    for (const id of form.relatedCharacterIds) {
      if (isNewSentinel(id)) {
        const newChar = {
          id: crypto.randomUUID(), campaignId, name: sentinelName(id),
          type: 'npc' as const, status: 'alive' as const, race: '', class: '', level: 1,
          hp: 0, armorClass: 0,
          locationId: '', factionId: '', description: '', backstory: '', dmNotes: '',
          tags: [], isPublic: false, createdAt: now, updatedAt: now
        }
        await addCharacter(newChar)
        relatedCharacterIds.push(newChar.id)
      } else {
        relatedCharacterIds.push(id)
      }
    }

    // Auto-detect wikilinks and merge
    const detected = extractWikilinks(form.description)

    onSave({
      id: lore?.id ?? crypto.randomUUID(),
      campaignId,
      title: form.title.trim(),
      category: form.category,
      era: form.era.trim(),
      description: form.description.trim(),
      relatedCharacterIds: mergeIds(relatedCharacterIds, detected.characterIds),
      relatedLocationIds: mergeIds(form.relatedLocationIds, detected.locationIds),
      relatedFactionIds: mergeIds(form.relatedFactionIds, detected.factionIds),
      relatedItemIds: mergeIds(form.relatedItemIds, detected.itemIds),
      tags: form.tags,
      isPublic: form.isPublic,
      createdAt: lore?.createdAt ?? now,
      updatedAt: now
    })
  }

  return (
    <div className="space-y-4">
      <Field label="Title *">
        <Input autoFocus value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Lore title" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <Select value={form.category} onChange={(e) => set({ category: e.target.value as LoreCategory })}>
            <option value="history">History</option>
            <option value="legend">Legend</option>
            <option value="cosmology">Cosmology</option>
            <option value="culture">Culture</option>
            <option value="religion">Religion</option>
            <option value="magic">Magic</option>
            <option value="prophecy">Prophecy</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Era / Time Period">
          <Input value={form.era} onChange={(e) => set({ era: e.target.value })} placeholder="e.g. Age of Dragons" />
        </Field>
      </div>

      <Field label="Description">
        <WikiTextarea
          campaignId={campaignId}
          rows={6}
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Lore content — use [[Entity Name]] to create wiki links..."
        />
      </Field>

      <Field label="Related Characters">
        <EntityChipSelect
          selected={form.relatedCharacterIds}
          options={characters.map((c) => ({ id: c.id, name: c.name }))}
          onChange={(ids) => set({ relatedCharacterIds: ids })}
          placeholder="Add or create character..."
          allowCreate
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Related Locations">
          <EntityChipSelect selected={form.relatedLocationIds}
            options={locations.map((l) => ({ id: l.id, name: l.name }))}
            onChange={(ids) => set({ relatedLocationIds: ids })} placeholder="Add locations..." />
        </Field>
        <Field label="Related Factions">
          <EntityChipSelect selected={form.relatedFactionIds}
            options={factions.map((f) => ({ id: f.id, name: f.name }))}
            onChange={(ids) => set({ relatedFactionIds: ids })} placeholder="Add factions..." />
        </Field>
      </div>

      <Field label="Related Items">
        <EntityChipSelect selected={form.relatedItemIds}
          options={items.map((i) => ({ id: i.id, name: i.name }))}
          onChange={(ids) => set({ relatedItemIds: ids })} placeholder="Add items..." />
      </Field>

      <Field label="Tags">
        <TagInput campaignId={campaignId} value={form.tags} onChange={(tags) => set({ tags })} />
      </Field>

      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'hsl(var(--foreground))' }}>
        <input type="checkbox" checked={form.isPublic} onChange={(e) => set({ isPublic: e.target.checked })} className="rounded" />
        Visible to players
      </label>

      <FormActions onCancel={onCancel} onSave={handleSave} disabled={!form.title.trim()} saveLabel={lore ? 'Update' : 'Create'} />
    </div>
  )
}
