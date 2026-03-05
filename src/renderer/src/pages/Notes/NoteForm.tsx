import { useState } from 'react'
import { Field, Input, FormActions } from '@/components/ui/Field'
import { EntityChipSelect, isNewSentinel, sentinelName } from '@/components/ui/EntityChipSelect'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import { TagInput } from '@/components/ui/TagInput'
import { useCharacterStore } from '@/store/characterStore'
import { useLoreStore } from '@/store/loreStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useSessionStore } from '@/store/sessionStore'
import { extractWikilinks, mergeIds } from '@/lib/extractWikilinks'
import type { Note, Character } from '@/types'

interface Props {
  note?: Note
  campaignId: string
  characters: Character[]
  onSave: (n: Note) => void
  onCancel: () => void
}

interface FormState {
  title: string
  content: string
  tags: string[]
  relatedCharacterIds: string[]
  relatedLoreIds: string[]
  relatedLocationIds: string[]
  relatedFactionIds: string[]
  relatedItemIds: string[]
  relatedSessionIds: string[]
  isPublic: boolean
  isPinned: boolean
}

function fromNote(n: Note): FormState {
  return {
    title: n.title, content: n.content, tags: n.tags ?? [],
    relatedCharacterIds: n.relatedCharacterIds,
    relatedLoreIds: n.relatedLoreIds ?? [],
    relatedLocationIds: n.relatedLocationIds ?? [],
    relatedFactionIds: n.relatedFactionIds ?? [],
    relatedItemIds: n.relatedItemIds ?? [],
    relatedSessionIds: n.relatedSessionIds ?? [],
    isPublic: n.isPublic, isPinned: n.isPinned
  }
}

const empty: FormState = {
  title: '', content: '', tags: [],
  relatedCharacterIds: [], relatedLoreIds: [],
  relatedLocationIds: [], relatedFactionIds: [],
  relatedItemIds: [], relatedSessionIds: [],
  isPublic: false, isPinned: false
}

export function NoteForm({ note, campaignId, characters, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(note ? fromNote(note) : empty)
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))
  const addCharacter = useCharacterStore((s) => s.add)

  const lore = useLoreStore((s) => s.lore).filter((l) => l.campaignId === campaignId)
  const locations = useLocationStore((s) => s.locations).filter((l) => l.campaignId === campaignId)
  const factions = useFactionStore((s) => s.factions).filter((f) => f.campaignId === campaignId)
  const items = useItemStore((s) => s.items).filter((i) => i.campaignId === campaignId)
  const sessions = useSessionStore((s) => s.sessions).filter((s2) => s2.campaignId === campaignId)

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
    const detected = extractWikilinks(form.content)

    onSave({
      id: note?.id ?? crypto.randomUUID(),
      campaignId,
      title: form.title.trim(),
      content: form.content.trim(),
      tags: form.tags,
      relatedCharacterIds: mergeIds(relatedCharacterIds, detected.characterIds),
      relatedLoreIds: mergeIds(form.relatedLoreIds, detected.loreIds),
      relatedLocationIds: mergeIds(form.relatedLocationIds, detected.locationIds),
      relatedFactionIds: mergeIds(form.relatedFactionIds, detected.factionIds),
      relatedItemIds: mergeIds(form.relatedItemIds, detected.itemIds),
      relatedSessionIds: mergeIds(form.relatedSessionIds, detected.sessionIds),
      isPublic: form.isPublic,
      isPinned: form.isPinned,
      createdAt: note?.createdAt ?? now,
      updatedAt: now
    })
  }

  return (
    <div className="space-y-4">
      <Field label="Title *">
        <Input autoFocus value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Note title" />
      </Field>

      <Field label="Tags">
        <TagInput campaignId={campaignId} value={form.tags} onChange={(tags) => set({ tags })} />
      </Field>

      <Field label="Content">
        <WikiTextarea
          campaignId={campaignId}
          rows={8}
          value={form.content}
          onChange={(e) => set({ content: e.target.value })}
          placeholder="Note content — use [[Entity Name]] to create wiki links..."
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
        <Field label="Related Lore">
          <EntityChipSelect selected={form.relatedLoreIds}
            options={lore.map((l) => ({ id: l.id, name: l.title }))}
            onChange={(ids) => set({ relatedLoreIds: ids })} placeholder="Add lore..." />
        </Field>
        <Field label="Related Locations">
          <EntityChipSelect selected={form.relatedLocationIds}
            options={locations.map((l) => ({ id: l.id, name: l.name }))}
            onChange={(ids) => set({ relatedLocationIds: ids })} placeholder="Add locations..." />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Related Factions">
          <EntityChipSelect selected={form.relatedFactionIds}
            options={factions.map((f) => ({ id: f.id, name: f.name }))}
            onChange={(ids) => set({ relatedFactionIds: ids })} placeholder="Add factions..." />
        </Field>
        <Field label="Related Items">
          <EntityChipSelect selected={form.relatedItemIds}
            options={items.map((i) => ({ id: i.id, name: i.name }))}
            onChange={(ids) => set({ relatedItemIds: ids })} placeholder="Add items..." />
        </Field>
      </div>

      <Field label="Related Sessions">
        <EntityChipSelect selected={form.relatedSessionIds}
          options={sessions.map((s2) => ({ id: s2.id, name: s2.title }))}
          onChange={(ids) => set({ relatedSessionIds: ids })} placeholder="Add sessions..." />
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'hsl(var(--foreground))' }}>
          <input type="checkbox" checked={form.isPublic} onChange={(e) => set({ isPublic: e.target.checked })} className="rounded" />
          Visible to players
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'hsl(var(--foreground))' }}>
          <input type="checkbox" checked={form.isPinned} onChange={(e) => set({ isPinned: e.target.checked })} className="rounded" />
          Pinned
        </label>
      </div>

      <FormActions onCancel={onCancel} onSave={handleSave} disabled={!form.title.trim()} saveLabel={note ? 'Update' : 'Create'} />
    </div>
  )
}
