import { useState } from 'react'
import { Field, Input, Select, FormActions } from '@/components/ui/Field'
import { EntityChipSelect, isNewSentinel, sentinelName } from '@/components/ui/EntityChipSelect'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import { TagInput } from '@/components/ui/TagInput'
import { useCharacterStore } from '@/store/characterStore'
import { useLocationStore } from '@/store/locationStore'
import { useLoreStore } from '@/store/loreStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useSessionStore } from '@/store/sessionStore'
import { extractWikilinks, mergeIds } from '@/lib/extractWikilinks'
import type { Document, DocumentType, Character, Location } from '@/types'

interface Props {
  document?: Document
  campaignId: string
  onSave: (d: Document) => void
  onCancel: () => void
}

interface FormState {
  title: string
  type: DocumentType
  content: string
  authorId: string
  recipientId: string
  locationFoundId: string
  tags: string[]
  relatedCharacterIds: string[]
  relatedLoreIds: string[]
  relatedLocationIds: string[]
  relatedFactionIds: string[]
  relatedItemIds: string[]
  relatedSessionIds: string[]
  isPublic: boolean
}

function fromDocument(d: Document): FormState {
  return {
    title: d.title, type: d.type, content: d.content,
    authorId: d.authorId, recipientId: d.recipientId, locationFoundId: d.locationFoundId,
    tags: d.tags ?? [],
    relatedCharacterIds: d.relatedCharacterIds, relatedLoreIds: d.relatedLoreIds,
    relatedLocationIds: d.relatedLocationIds, relatedFactionIds: d.relatedFactionIds,
    relatedItemIds: d.relatedItemIds, relatedSessionIds: d.relatedSessionIds,
    isPublic: d.isPublic
  }
}

const empty: FormState = {
  title: '', type: 'other', content: '',
  authorId: '', recipientId: '', locationFoundId: '',
  tags: [],
  relatedCharacterIds: [], relatedLoreIds: [],
  relatedLocationIds: [], relatedFactionIds: [],
  relatedItemIds: [], relatedSessionIds: [],
  isPublic: false
}

export function DocumentForm({ document: doc, campaignId, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(doc ? fromDocument(doc) : empty)
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const addCharacter = useCharacterStore((s) => s.add)
  const addLocation = useLocationStore((s) => s.add)
  const characters = useCharacterStore((s) => s.characters).filter((c) => c.campaignId === campaignId)
  const locations = useLocationStore((s) => s.locations).filter((l) => l.campaignId === campaignId)
  const lore = useLoreStore((s) => s.lore).filter((l) => l.campaignId === campaignId)
  const factions = useFactionStore((s) => s.factions).filter((f) => f.campaignId === campaignId)
  const items = useItemStore((s) => s.items).filter((i) => i.campaignId === campaignId)
  const sessions = useSessionStore((s) => s.sessions).filter((s2) => s2.campaignId === campaignId)

  const charOptions = characters.map((c) => ({ id: c.id, name: c.name }))
  const locationOptions = locations.map((l) => ({ id: l.id, name: l.name }))
  const loreOptions = lore.map((l) => ({ id: l.id, name: l.title }))
  const factionOptions = factions.map((f) => ({ id: f.id, name: f.name }))
  const itemOptions = items.map((i) => ({ id: i.id, name: i.name }))
  const sessionOptions = sessions.map((s2) => ({ id: s2.id, name: s2.title }))

  const resolveNewCharacter = async (id: string): Promise<string> => {
    if (!isNewSentinel(id)) return id
    const now = new Date().toISOString()
    const newChar: Character = {
      id: crypto.randomUUID(), campaignId, name: sentinelName(id),
      type: 'npc', status: 'alive', race: '', class: '', level: 1,
      hp: 0, armorClass: 0,
      locationId: '', factionId: '', description: '', backstory: '', dmNotes: '',
      tags: [], isPublic: false, createdAt: now, updatedAt: now
    }
    await addCharacter(newChar)
    return newChar.id
  }

  const resolveNewLocation = async (id: string): Promise<string> => {
    if (!isNewSentinel(id)) return id
    const now = new Date().toISOString()
    const newLoc: Location = {
      id: crypto.randomUUID(), campaignId, name: sentinelName(id),
      type: 'other', description: '', notableCharacterIds: [],
      tags: [], isPublic: false, createdAt: now, updatedAt: now
    }
    await addLocation(newLoc)
    return newLoc.id
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    const now = new Date().toISOString()

    // Resolve new character sentinels
    const relatedCharacterIds: string[] = []
    for (const id of form.relatedCharacterIds) {
      relatedCharacterIds.push(await resolveNewCharacter(id))
    }

    const authorId = form.authorId ? await resolveNewCharacter(form.authorId) : ''
    const recipientId = form.recipientId ? await resolveNewCharacter(form.recipientId) : ''
    const locationFoundId = form.locationFoundId ? await resolveNewLocation(form.locationFoundId) : ''

    // Resolve new location sentinels in related locations
    const relatedLocationIds: string[] = []
    for (const id of form.relatedLocationIds) {
      relatedLocationIds.push(await resolveNewLocation(id))
    }

    // Auto-detect wikilinks and merge
    const detected = extractWikilinks(form.content)

    onSave({
      id: doc?.id ?? crypto.randomUUID(),
      campaignId,
      title: form.title.trim(),
      type: form.type,
      content: form.content.trim(),
      authorId,
      recipientId,
      locationFoundId,
      tags: form.tags,
      relatedCharacterIds: mergeIds(relatedCharacterIds, detected.characterIds),
      relatedLoreIds: mergeIds(form.relatedLoreIds, detected.loreIds),
      relatedLocationIds: mergeIds(relatedLocationIds, detected.locationIds),
      relatedFactionIds: mergeIds(form.relatedFactionIds, detected.factionIds),
      relatedItemIds: mergeIds(form.relatedItemIds, detected.itemIds),
      relatedSessionIds: mergeIds(form.relatedSessionIds, detected.sessionIds),
      isPublic: form.isPublic,
      createdAt: doc?.createdAt ?? now,
      updatedAt: now
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title *">
          <Input autoFocus value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Document title" />
        </Field>
        <Field label="Type">
          <Select value={form.type} onChange={(e) => set({ type: e.target.value as DocumentType })}>
            <option value="letter">Letter</option>
            <option value="journal">Journal</option>
            <option value="book">Book</option>
            <option value="scroll">Scroll</option>
            <option value="other">Other</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Author">
          <EntityChipSelect
            selected={form.authorId ? [form.authorId] : []}
            options={charOptions}
            onChange={(ids) => set({ authorId: ids[ids.length - 1] ?? '' })}
            placeholder="Select author..."
            allowCreate
          />
        </Field>
        <Field label="Recipient">
          <EntityChipSelect
            selected={form.recipientId ? [form.recipientId] : []}
            options={charOptions}
            onChange={(ids) => set({ recipientId: ids[ids.length - 1] ?? '' })}
            placeholder="Select recipient..."
            allowCreate
          />
        </Field>
        <Field label="Location Found">
          <EntityChipSelect
            selected={form.locationFoundId ? [form.locationFoundId] : []}
            options={locationOptions}
            onChange={(ids) => set({ locationFoundId: ids[ids.length - 1] ?? '' })}
            placeholder="Select location..."
            allowCreate
          />
        </Field>
      </div>

      <Field label="Tags">
        <TagInput campaignId={campaignId} value={form.tags} onChange={(tags) => set({ tags })} />
      </Field>

      <Field label="Content">
        <WikiTextarea
          campaignId={campaignId}
          rows={10}
          value={form.content}
          onChange={(e) => set({ content: e.target.value })}
          placeholder="Document content — use [[Entity Name]] to create wiki links..."
        />
      </Field>

      <Field label="Related Characters">
        <EntityChipSelect selected={form.relatedCharacterIds} options={charOptions}
          onChange={(ids) => set({ relatedCharacterIds: ids })} placeholder="Add characters..." allowCreate />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Related Lore">
          <EntityChipSelect selected={form.relatedLoreIds} options={loreOptions}
            onChange={(ids) => set({ relatedLoreIds: ids })} placeholder="Add lore..." />
        </Field>
        <Field label="Related Locations">
          <EntityChipSelect selected={form.relatedLocationIds} options={locationOptions}
            onChange={(ids) => set({ relatedLocationIds: ids })} placeholder="Add locations..." allowCreate />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Related Factions">
          <EntityChipSelect selected={form.relatedFactionIds} options={factionOptions}
            onChange={(ids) => set({ relatedFactionIds: ids })} placeholder="Add factions..." />
        </Field>
        <Field label="Related Items">
          <EntityChipSelect selected={form.relatedItemIds} options={itemOptions}
            onChange={(ids) => set({ relatedItemIds: ids })} placeholder="Add items..." />
        </Field>
      </div>

      <Field label="Related Sessions">
        <EntityChipSelect selected={form.relatedSessionIds} options={sessionOptions}
          onChange={(ids) => set({ relatedSessionIds: ids })} placeholder="Add sessions..." />
      </Field>

      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'hsl(var(--foreground))' }}>
        <input type="checkbox" checked={form.isPublic} onChange={(e) => set({ isPublic: e.target.checked })} className="rounded" />
        Player Handout
      </label>

      <FormActions onCancel={onCancel} onSave={handleSave} disabled={!form.title.trim()} saveLabel={doc ? 'Update' : 'Create'} />
    </div>
  )
}
