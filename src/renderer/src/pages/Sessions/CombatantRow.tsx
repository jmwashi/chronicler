import { useState } from 'react'
import { Minus, Plus, Skull, Swords, Zap, Shield, X } from 'lucide-react'
import { ConditionPicker, ConditionBadges } from './ConditionPicker'
import { useDiceStore } from '@/store/diceStore'
import type { Combatant, Condition } from '@/types'

interface Props {
  combatant: Combatant
  isCurrent: boolean
  onUpdate: (combatant: Combatant) => void
  onRemove: (id: string) => void
}

export function CombatantRow({ combatant, isCurrent, onUpdate, onRemove }: Props) {
  const [hpDelta, setHpDelta] = useState('')

  const hpPercent = combatant.maxHp > 0 ? Math.max(0, combatant.hp / combatant.maxHp) * 100 : 0
  const hpColor =
    hpPercent > 50 ? '#10b981' : hpPercent > 25 ? '#f59e0b' : '#ef4444'

  const applyDamage = () => {
    const val = Number(hpDelta)
    if (!val) return
    onUpdate({ ...combatant, hp: Math.max(0, Math.min(combatant.maxHp, combatant.hp - val)) })
    setHpDelta('')
  }

  const applyHeal = () => {
    const val = Number(hpDelta)
    if (!val) return
    onUpdate({ ...combatant, hp: Math.min(combatant.maxHp, combatant.hp + val) })
    setHpDelta('')
  }

  const { executeRoll, diceDrawerOpen, openDiceDrawer } = useDiceStore()

  const updateConditions = (
    conditions: Condition[],
    conditionDurations: Partial<Record<Condition, number>>
  ): void => {
    onUpdate({ ...combatant, conditions, conditionDurations })
  }

  const handleAttackRoll = () => {
    const mod = (combatant.attackMod ?? 0)
    const modStr = mod >= 0 ? (mod > 0 ? `+${mod}` : '') : `${mod}`
    executeRoll(`1d20${modStr}`, `${combatant.name} attack`)
    if (!diceDrawerOpen) openDiceDrawer()
  }

  const handleDamageRoll = () => {
    const dmg = combatant.damageDice ?? ''
    if (!dmg) return
    executeRoll(dmg, `${combatant.name} damage`)
    if (!diceDrawerOpen) openDiceDrawer()
  }

  const handleSaveRoll = () => {
    const mod = (combatant.saveMod ?? 0)
    const modStr = mod >= 0 ? (mod > 0 ? `+${mod}` : '') : `${mod}`
    executeRoll(`1d20${modStr}`, `${combatant.name} save`)
    if (!diceDrawerOpen) openDiceDrawer()
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-md"
      style={{
        backgroundColor: isCurrent ? 'hsl(var(--primary) / 0.1)' : 'transparent',
        borderLeft: isCurrent ? '3px solid hsl(var(--primary))' : '3px solid transparent'
      }}
    >
      {/* Initiative */}
      <span
        className="w-8 text-center text-sm font-bold flex-shrink-0"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        {combatant.initiative}
      </span>

      {/* Name + conditions */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-medium truncate"
            style={{
              color: combatant.isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              textDecoration: combatant.isActive ? 'none' : 'line-through'
            }}
          >
            {combatant.name}
          </span>
          {combatant.characterId && (
            <span
              className="text-[9px] px-1 py-px rounded"
              style={{ backgroundColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}
            >
              PC/NPC
            </span>
          )}
        </div>
        <ConditionBadges
          conditions={combatant.conditions}
          conditionDurations={combatant.conditionDurations ?? {}}
        />
      </div>

      {/* HP bar + controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* HP bar */}
        <div className="w-20">
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span style={{ color: hpColor }}>
              {combatant.hp}/{combatant.maxHp}
            </span>
            <span className="text-[9px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              AC {combatant.armorClass}
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--muted))' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${hpPercent}%`, backgroundColor: hpColor }}
            />
          </div>
        </div>

        {/* HP delta input */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={applyHeal}
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: '#10b981' }}
            title="Heal"
          >
            <Plus size={11} />
          </button>
          <input
            type="number"
            value={hpDelta}
            onChange={(e) => setHpDelta(e.target.value)}
            className="w-10 text-center text-xs rounded border bg-transparent outline-none py-0.5"
            style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            placeholder="0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyDamage()
            }}
          />
          <button
            onClick={applyDamage}
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: '#ef4444' }}
            title="Damage"
          >
            <Minus size={11} />
          </button>
        </div>

        {/* Concentration */}
        <input
          type="text"
          value={combatant.concentration ?? ''}
          onChange={(e) => onUpdate({ ...combatant, concentration: e.target.value })}
          className="w-20 text-[10px] rounded border bg-transparent outline-none px-1.5 py-0.5"
          style={{
            borderColor: combatant.concentration
              ? 'rgba(139,92,246,0.5)'
              : 'hsl(var(--border))',
            color: combatant.concentration
              ? '#8b5cf6'
              : 'hsl(var(--foreground))'
          }}
          placeholder="Conc. spell"
          title="Concentration spell"
        />

        {/* Dice roll buttons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleAttackRoll}
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: 'hsl(var(--primary))' }}
            title={`Attack: 1d20${(combatant.attackMod ?? 0) >= 0 ? '+' : ''}${combatant.attackMod ?? 0}`}
          >
            <Swords size={11} />
          </button>
          {(combatant.damageDice ?? '') && (
            <button
              onClick={handleDamageRoll}
              className="p-0.5 rounded hover:opacity-70"
              style={{ color: '#f59e0b' }}
              title={`Damage: ${combatant.damageDice}`}
            >
              <Zap size={11} />
            </button>
          )}
          <button
            onClick={handleSaveRoll}
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: '#6366f1' }}
            title={`Save: 1d20${(combatant.saveMod ?? 0) >= 0 ? '+' : ''}${combatant.saveMod ?? 0}`}
          >
            <Shield size={11} />
          </button>
        </div>

        {/* Conditions */}
        <ConditionPicker
          conditions={combatant.conditions}
          conditionDurations={combatant.conditionDurations ?? {}}
          onChange={updateConditions}
        />

        {/* KO / Remove */}
        <button
          onClick={() => onUpdate({ ...combatant, isActive: !combatant.isActive })}
          className="p-1 rounded hover:opacity-70"
          style={{ color: combatant.isActive ? 'hsl(var(--muted-foreground))' : '#ef4444' }}
          title={combatant.isActive ? 'Mark as down' : 'Revive'}
        >
          <Skull size={12} />
        </button>
        <button
          onClick={() => onRemove(combatant.id)}
          className="p-1 rounded hover:opacity-70"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          title="Remove"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
