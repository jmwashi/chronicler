import { useState, useMemo } from 'react'
import { ArrowDown, Dices, Plus, RotateCcw, SkipForward } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { CombatantRow } from './CombatantRow'
import { AddCombatantForm } from './AddCombatantForm'
import { useDiceStore } from '@/store/diceStore'
import type { Session, Combatant, Condition } from '@/types'

interface Props {
  session: Session
  onUpdateSession: (session: Session) => void
}

export function InitiativeTracker({ session, onUpdateSession }: Props) {
  const [addOpen, setAddOpen] = useState(false)

  const sorted = useMemo(
    () => [...session.combatants].sort((a, b) => b.initiative - a.initiative),
    [session.combatants]
  )

  const save = (patch: Partial<Session>) =>
    onUpdateSession({ ...session, ...patch, updatedAt: new Date().toISOString() })

  const addCombatant = (combatant: Combatant) => {
    save({ combatants: [...session.combatants, combatant] })
    setAddOpen(false)
  }

  const updateCombatant = (updated: Combatant) => {
    save({
      combatants: session.combatants.map((c) => (c.id === updated.id ? updated : c))
    })
  }

  const removeCombatant = (id: string) => {
    const newCombatants = session.combatants.filter((c) => c.id !== id)
    const newIndex = Math.min(session.currentTurnIndex, Math.max(0, newCombatants.length - 1))
    save({ combatants: newCombatants, currentTurnIndex: newIndex })
  }

  const nextTurn = () => {
    if (sorted.length === 0) return
    let next = (session.currentTurnIndex + 1) % sorted.length
    let newRound = session.roundNumber

    // Skip inactive combatants
    let tries = 0
    while (!sorted[next]?.isActive && tries < sorted.length) {
      next = (next + 1) % sorted.length
      tries++
    }

    if (next <= session.currentTurnIndex || session.currentTurnIndex === -1) {
      newRound = session.roundNumber + 1
    }

    // Decrement condition timers for the combatant whose turn is starting
    const current = sorted[next]
    let updatedCombatants: Combatant[] | undefined
    if (current) {
      const durations = { ...(current.conditionDurations ?? {}) }
      const expiredConditions: Condition[] = []
      for (const cond of Object.keys(durations) as Condition[]) {
        durations[cond] = (durations[cond] ?? 1) - 1
        if (durations[cond]! <= 0) {
          delete durations[cond]
          expiredConditions.push(cond)
        }
      }
      if (Object.keys(current.conditionDurations ?? {}).length > 0) {
        const updated: Combatant = {
          ...current,
          conditions: current.conditions.filter((c) => !expiredConditions.includes(c)),
          conditionDurations: durations
        }
        updatedCombatants = session.combatants.map((c) => (c.id === updated.id ? updated : c))
      }
    }

    save({
      currentTurnIndex: next,
      roundNumber: newRound,
      ...(updatedCombatants ? { combatants: updatedCombatants } : {})
    })
  }

  const resetCombat = () => {
    save({ currentTurnIndex: 0, roundNumber: 1 })
  }

  const rollAllInitiative = () => {
    const { executeRoll } = useDiceStore.getState()
    const updatedCombatants = session.combatants.map((c) => {
      if (!c.isActive) return c
      const result = executeRoll('1d20', `${c.name} initiative`)
      return { ...c, initiative: result.total }
    })
    save({ combatants: updatedCombatants })
  }

  const clearAll = () => {
    save({ combatants: [], currentTurnIndex: 0, roundNumber: 0 })
  }

  const currentCombatantId = sorted[session.currentTurnIndex]?.id ?? null

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Initiative Tracker
          </h2>
          {session.roundNumber > 0 && (
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Round {session.roundNumber}
              {currentCombatantId &&
                ` · ${sorted[session.currentTurnIndex]?.name}'s turn`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium hover:opacity-80"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))'
            }}
          >
            <Plus size={12} /> Add
          </button>
          {sorted.length > 0 && (
            <>
              <button
                onClick={rollAllInitiative}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium hover:opacity-80 border"
                style={{
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
                title="Roll 1d20 for each active combatant"
              >
                <Dices size={12} /> Roll Init
              </button>
              <button
                onClick={nextTurn}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium hover:opacity-80 border"
                style={{
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
              >
                <SkipForward size={12} /> Next
              </button>
              <button
                onClick={resetCombat}
                className="p-1.5 rounded-md hover:opacity-70 border"
                style={{
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--muted-foreground))'
                }}
                title="Reset to round 1"
              >
                <RotateCcw size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Combatant list */}
      {sorted.length === 0 ? (
        <div
          className="text-center py-8 rounded-lg border border-dashed"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <ArrowDown size={20} className="mx-auto mb-2" style={{ color: 'hsl(var(--muted-foreground))' }} />
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No combatants yet. Click <strong>Add</strong> to start tracking initiative.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Column headers */}
          <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'hsl(var(--muted-foreground))' }}>
            <span className="w-8 text-center">Init</span>
            <span className="flex-1">Name</span>
            <span className="w-20">HP / AC</span>
            <span className="w-36" />
          </div>
          {sorted.map((combatant) => (
            <CombatantRow
              key={combatant.id}
              combatant={combatant}
              isCurrent={combatant.id === currentCombatantId}
              onUpdate={updateCombatant}
              onRemove={removeCombatant}
            />
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={clearAll}
            className="text-xs hover:opacity-70"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Clear all combatants
          </button>
        </div>
      )}

      {/* Add combatant modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Combatant">
        <AddCombatantForm
          campaignId={session.campaignId}
          onAdd={addCombatant}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </div>
  )
}
