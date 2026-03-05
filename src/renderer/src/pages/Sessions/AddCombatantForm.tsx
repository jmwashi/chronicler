import { useState } from 'react'
import { Field, Input, FormActions } from '@/components/ui/Field'
import { Combobox } from '@/components/ui/Combobox'
import { useCharacterStore } from '@/store/characterStore'
import type { Combatant } from '@/types'

interface Props {
  campaignId: string
  onAdd: (combatant: Combatant) => void
  onCancel: () => void
}

export function AddCombatantForm({ campaignId, onAdd, onCancel }: Props) {
  const characters = useCharacterStore((s) => s.characters).filter(
    (c) => c.campaignId === campaignId
  )

  const [mode, setMode] = useState<'character' | 'adhoc'>('character')
  const [characterId, setCharacterId] = useState('')
  const [name, setName] = useState('')
  const [initiative, setInitiative] = useState('')
  const [hp, setHp] = useState('')
  const [ac, setAc] = useState('')
  const [attackMod, setAttackMod] = useState('')
  const [damageDice, setDamageDice] = useState('')
  const [saveMod, setSaveMod] = useState('')

  const selectedChar = characters.find((c) => c.id === characterId)

  const handleCharacterChange = (id: string) => {
    setCharacterId(id)
    const char = characters.find((c) => c.id === id)
    if (char) {
      if (char.hp) setHp(String(char.hp))
      if (char.armorClass) setAc(String(char.armorClass))
    }
  }

  const handleSave = () => {
    const cName = mode === 'character' ? (selectedChar?.name ?? '') : name.trim()
    if (!cName) return

    onAdd({
      id: crypto.randomUUID(),
      name: cName,
      characterId: mode === 'character' ? characterId : '',
      initiative: Number(initiative) || 0,
      hp: Number(hp) || 0,
      maxHp: Number(hp) || 0,
      armorClass: Number(ac) || 10,
      attackMod: Number(attackMod) || 0,
      damageDice: damageDice.trim(),
      saveMod: Number(saveMod) || 0,
      conditions: [],
      conditionDurations: {},
      concentration: '',
      isActive: true
    })
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => setMode('character')}
          className="px-2.5 py-1 rounded text-xs font-medium"
          style={{
            backgroundColor: mode === 'character' ? 'hsl(var(--primary))' : 'transparent',
            color:
              mode === 'character' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
            border: mode === 'character' ? 'none' : '1px solid hsl(var(--border))'
          }}
        >
          From Characters
        </button>
        <button
          onClick={() => setMode('adhoc')}
          className="px-2.5 py-1 rounded text-xs font-medium"
          style={{
            backgroundColor: mode === 'adhoc' ? 'hsl(var(--primary))' : 'transparent',
            color: mode === 'adhoc' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
            border: mode === 'adhoc' ? 'none' : '1px solid hsl(var(--border))'
          }}
        >
          Ad-hoc Mob
        </button>
      </div>

      {mode === 'character' ? (
        <Field label="Character">
          <Combobox
            value={characterId}
            onChange={handleCharacterChange}
            options={characters.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select character..."
          />
        </Field>
      ) : (
        <Field label="Name *">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Goblin Archer"
          />
        </Field>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Field label="Initiative">
          <Input
            type="number"
            value={initiative}
            onChange={(e) => setInitiative(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="HP">
          <Input
            type="number"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="AC">
          <Input
            type="number"
            value={ac}
            onChange={(e) => setAc(e.target.value)}
            placeholder="10"
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="Atk Mod">
          <Input
            type="number"
            value={attackMod}
            onChange={(e) => setAttackMod(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Dmg Dice">
          <Input
            value={damageDice}
            onChange={(e) => setDamageDice(e.target.value)}
            placeholder="1d8+3"
          />
        </Field>
        <Field label="Save Mod">
          <Input
            type="number"
            value={saveMod}
            onChange={(e) => setSaveMod(e.target.value)}
            placeholder="0"
          />
        </Field>
      </div>

      <FormActions
        onCancel={onCancel}
        onSave={handleSave}
        saveLabel="Add"
        disabled={mode === 'character' ? !characterId : !name.trim()}
      />
    </div>
  )
}
