import { useState } from 'react'
import { Field, Input, Select, FormActions } from '@/components/ui/Field'
import { Combobox } from '@/components/ui/Combobox'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import { TagInput } from '@/components/ui/TagInput'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import type { Character, CharacterType, CharacterStatus } from '@/types'

/** Sync character ↔ faction/location references on save */
async function syncReferences(
  charId: string,
  oldChar: Character | undefined,
  newFactionId: string,
  newLocationId: string
) {
  const factionStore = useFactionStore.getState()
  const locationStore = useLocationStore.getState()

  // Faction sync: remove from old, add to new
  const oldFactionId = oldChar?.factionId ?? ''
  if (oldFactionId !== newFactionId) {
    if (oldFactionId) {
      const oldFaction = factionStore.factions.find((f) => f.id === oldFactionId)
      if (oldFaction && oldFaction.memberIds.includes(charId)) {
        await factionStore.update({ ...oldFaction, memberIds: oldFaction.memberIds.filter((mid) => mid !== charId) })
      }
    }
    if (newFactionId) {
      const newFaction = factionStore.factions.find((f) => f.id === newFactionId)
      if (newFaction && !newFaction.memberIds.includes(charId)) {
        await factionStore.update({ ...newFaction, memberIds: [...newFaction.memberIds, charId] })
      }
    }
  }

  // Location sync: remove from old, add to new
  const oldLocationId = oldChar?.locationId ?? ''
  if (oldLocationId !== newLocationId) {
    if (oldLocationId) {
      const oldLocation = locationStore.locations.find((l) => l.id === oldLocationId)
      if (oldLocation && oldLocation.notableCharacterIds.includes(charId)) {
        await locationStore.update({ ...oldLocation, notableCharacterIds: oldLocation.notableCharacterIds.filter((cid) => cid !== charId) })
      }
    }
    if (newLocationId) {
      const newLocation = locationStore.locations.find((l) => l.id === newLocationId)
      if (newLocation && !newLocation.notableCharacterIds.includes(charId)) {
        await locationStore.update({ ...newLocation, notableCharacterIds: [...newLocation.notableCharacterIds, charId] })
      }
    }
  }
}

interface Props {
  character?: Character
  campaignId: string
  onSave: (c: Character) => void
  onCancel: () => void
}

interface FormState {
  name: string
  type: CharacterType
  status: CharacterStatus
  race: string
  class: string
  level: string
  hp: string
  armorClass: string
  locationId: string
  factionId: string
  description: string
  backstory: string
  dmNotes: string
  tags: string[]
  isPublic: boolean
}

function fromCharacter(c: Character): FormState {
  return {
    name: c.name,
    type: c.type,
    status: c.status,
    race: c.race,
    class: c.class,
    level: String(c.level),
    hp: c.hp ? String(c.hp) : '',
    armorClass: c.armorClass ? String(c.armorClass) : '',
    locationId: c.locationId ?? '',
    factionId: c.factionId ?? '',
    description: c.description,
    backstory: c.backstory,
    dmNotes: c.dmNotes,
    tags: c.tags ?? [],
    isPublic: c.isPublic ?? false
  }
}

const empty: FormState = {
  name: '', type: 'npc', status: 'alive', race: '', class: '',
  level: '1', hp: '', armorClass: '', locationId: '', factionId: '', description: '', backstory: '', dmNotes: '',
  tags: [], isPublic: false
}

export function CharacterForm({ character, campaignId, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(character ? fromCharacter(character) : empty)
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const locations = useLocationStore((s) => s.locations)
  const addLocation = useLocationStore((s) => s.add)
  const campaignLocations = locations.filter((l) => l.campaignId === campaignId)
  const locationOptions = campaignLocations.map((l) => ({ value: l.id, label: l.name }))

  const factions = useFactionStore((s) => s.factions)
  const addFaction = useFactionStore((s) => s.add)
  const campaignFactions = factions.filter((f) => f.campaignId === campaignId)
  const factionOptions = campaignFactions.map((f) => ({ value: f.id, label: f.name }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    const now = new Date().toISOString()

    // Resolve locationId: if the value isn't a known ID, create a new location
    let locationId = form.locationId
    if (locationId && !campaignLocations.some((l) => l.id === locationId)) {
      const newLocation = {
        id: crypto.randomUUID(),
        campaignId,
        name: locationId.trim(),
        type: 'other' as const,
        description: '',
        notableCharacterIds: [],
        tags: [],
        isPublic: false,
        createdAt: now,
        updatedAt: now
      }
      await addLocation(newLocation)
      locationId = newLocation.id
    }

    // Resolve factionId: if the value isn't a known ID, create a new faction
    let factionId = form.factionId
    if (factionId && !campaignFactions.some((f) => f.id === factionId)) {
      const newFaction = {
        id: crypto.randomUUID(),
        campaignId,
        name: factionId.trim(),
        description: '',
        alignment: '',
        goals: '',
        memberIds: [],
        tags: [],
        isPublic: false,
        createdAt: now,
        updatedAt: now
      }
      await addFaction(newFaction)
      factionId = newFaction.id
    }

    const charId = character?.id ?? crypto.randomUUID()

    // Sync bidirectional references before saving
    await syncReferences(charId, character, factionId, locationId)

    onSave({
      id: charId,
      campaignId,
      name: form.name.trim(),
      type: form.type,
      status: form.status,
      race: form.race.trim(),
      class: form.class.trim(),
      level: parseInt(form.level) || 1,
      hp: parseInt(form.hp) || 0,
      armorClass: parseInt(form.armorClass) || 0,
      locationId,
      factionId,
      description: form.description.trim(),
      backstory: form.backstory.trim(),
      dmNotes: form.dmNotes.trim(),
      tags: form.tags,
      isPublic: form.isPublic,
      createdAt: character?.createdAt ?? now,
      updatedAt: now
    })
  }

  return (
    <div className="space-y-4">
      <Field label="Name *">
        <Input autoFocus value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Character name" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Select value={form.type} onChange={(e) => set({ type: e.target.value as CharacterType })}>
            <option value="player">Player</option>
            <option value="npc">NPC</option>
            <option value="monster">Monster</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set({ status: e.target.value as CharacterStatus })}>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="missing">Missing</option>
            <option value="unknown">Unknown</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <Field label="Race">
          <Input value={form.race} onChange={(e) => set({ race: e.target.value })} placeholder="Elf" />
        </Field>
        <Field label="Class">
          <Input value={form.class} onChange={(e) => set({ class: e.target.value })} placeholder="Wizard" />
        </Field>
        <Field label="Level">
          <Input type="number" min={1} max={20} value={form.level} onChange={(e) => set({ level: e.target.value })} />
        </Field>
        <Field label="HP">
          <Input type="number" min={0} value={form.hp} onChange={(e) => set({ hp: e.target.value })} placeholder="0" />
        </Field>
        <Field label="AC">
          <Input type="number" min={0} value={form.armorClass} onChange={(e) => set({ armorClass: e.target.value })} placeholder="10" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Last Location">
          <Combobox
            value={form.locationId}
            options={locationOptions}
            onChange={(v) => set({ locationId: v })}
            placeholder="Select or create location…"
            allowCustom
          />
        </Field>
        <Field label="Faction">
          <Combobox
            value={form.factionId}
            options={factionOptions}
            onChange={(v) => set({ factionId: v })}
            placeholder="Select or create faction…"
            allowCustom
          />
        </Field>
      </div>

      <Field label="Physical Description">
        <WikiTextarea
          campaignId={campaignId}
          rows={2}
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Appearance, distinguishing features..."
        />
      </Field>

      <Field label="Backstory">
        <WikiTextarea
          campaignId={campaignId}
          rows={4}
          value={form.backstory}
          onChange={(e) => set({ backstory: e.target.value })}
          placeholder="Background and history — use [[Entity Name]] to create wiki links..."
        />
      </Field>

      <Field label="DM Notes (Private)">
        <WikiTextarea
          campaignId={campaignId}
          rows={3}
          value={form.dmNotes}
          onChange={(e) => set({ dmNotes: e.target.value })}
          placeholder="Private notes — never shown to players..."
        />
      </Field>

      <Field label="Tags">
        <TagInput campaignId={campaignId} value={form.tags} onChange={(tags) => set({ tags })} />
      </Field>

      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'hsl(var(--foreground))' }}>
        <input type="checkbox" checked={form.isPublic} onChange={(e) => set({ isPublic: e.target.checked })} className="rounded" />
        Visible to players
      </label>

      <FormActions onCancel={onCancel} onSave={handleSave} disabled={!form.name.trim()} saveLabel={character ? 'Update' : 'Create'} />
    </div>
  )
}
