import { useEffect, useState } from 'react'
import { Dices, X } from 'lucide-react'
import { useDiceStore } from '@/store/diceStore'
import { useUIStore } from '@/store/uiStore'
import { QuickDiceBar } from './QuickDiceBar'
import { DiceResultDisplay } from './DiceResultDisplay'
import { RollHistory } from './RollHistory'
import { SavedRollsList } from './SavedRollsList'

type AdvMode = 'normal' | 'advantage' | 'disadvantage'

export function DiceDrawer() {
  const {
    diceDrawerOpen,
    toggleDiceDrawer,
    history,
    clearHistory,
    savedRolls,
    loadSavedRolls,
    addSavedRoll,
    removeSavedRoll,
    executeRoll,
    executeAdvantage,
    executeDisadvantage,
    executeGroupRoll
  } = useDiceStore()

  const activeCampaignId = useUIStore((s) => s.activeCampaignId)

  const [formula, setFormula] = useState('')
  const [advMode, setAdvMode] = useState<AdvMode>('normal')
  const [error, setError] = useState('')

  // Group roll state
  const [groupOpen, setGroupOpen] = useState(false)
  const [groupCount, setGroupCount] = useState('10')
  const [groupFormula, setGroupFormula] = useState('1d20')
  const [groupAC, setGroupAC] = useState('15')

  // Load saved rolls on first open
  useEffect(() => {
    if (diceDrawerOpen) loadSavedRolls()
  }, [diceDrawerOpen])

  // Ctrl+D shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && e.key === 'd') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable)
          return
        e.preventDefault()
        toggleDiceDrawer()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [toggleDiceDrawer])

  const handleRoll = (f: string, label?: string) => {
    setError('')
    try {
      if (advMode === 'advantage' && f.match(/^\d*d20$/i)) {
        const modMatch = f.match(/[+-]\d+$/)
        const mod = modMatch ? parseInt(modMatch[0], 10) : 0
        executeAdvantage(mod, label)
      } else if (advMode === 'disadvantage' && f.match(/^\d*d20$/i)) {
        const modMatch = f.match(/[+-]\d+$/)
        const mod = modMatch ? parseInt(modMatch[0], 10) : 0
        executeDisadvantage(mod, label)
      } else {
        executeRoll(f, label)
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleFormulaSubmit = () => {
    if (!formula.trim()) return
    handleRoll(formula.trim())
  }

  const handleGroupRoll = () => {
    setError('')
    const count = parseInt(groupCount, 10)
    const ac = parseInt(groupAC, 10)
    if (!count || count < 1 || !ac) return
    try {
      executeGroupRoll(groupFormula.trim() || '1d20', count, ac)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const latestEntry = history[0] ?? null

  return (
    <>
      {/* FAB */}
      <button
        onClick={toggleDiceDrawer}
        className="fixed bottom-20 right-5 z-30 p-3 rounded-full shadow-lg hover:opacity-80 transition-opacity"
        style={{
          backgroundColor: 'hsl(var(--muted))',
          color: 'hsl(var(--foreground))'
        }}
        title="Dice Roller (Ctrl+D)"
      >
        <Dices size={20} />
      </button>

      {!diceDrawerOpen && null}

      {diceDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'hsl(var(--background) / 0.4)' }}
            onClick={toggleDiceDrawer}
          />

          {/* Drawer */}
          <div
            className="fixed top-0 right-0 z-50 h-full w-96 flex flex-col border-l shadow-xl"
            style={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))'
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <div className="flex items-center gap-2">
                <Dices size={16} style={{ color: 'hsl(var(--foreground))' }} />
                <h3 className="text-sm font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  Dice Roller
                </h3>
              </div>
              <button
                onClick={toggleDiceDrawer}
                className="p-1.5 rounded hover:opacity-70"
                style={{ color: 'hsl(var(--muted-foreground))' }}
                title="Close (Ctrl+D)"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Quick Dice */}
              <QuickDiceBar onRoll={(f) => handleRoll(f)} />

              {/* Formula Input */}
              <div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={formula}
                    onChange={(e) => {
                      setFormula(e.target.value)
                      setError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFormulaSubmit()
                    }}
                    placeholder="4d6kh3, 2d8+5, etc."
                    className="flex-1 text-sm rounded-md border bg-transparent outline-none px-3 py-1.5"
                    style={{
                      borderColor: error ? '#ef4444' : 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <button
                    onClick={handleFormulaSubmit}
                    className="px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80"
                    style={{
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))'
                    }}
                  >
                    Roll
                  </button>
                </div>
                {error && (
                  <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                    {error}
                  </p>
                )}
              </div>

              {/* Advantage/Disadvantage Toggle */}
              <div className="flex gap-0.5">
                {(['normal', 'advantage', 'disadvantage'] as AdvMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAdvMode(mode)}
                    className="flex-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                    style={{
                      backgroundColor:
                        advMode === mode
                          ? mode === 'advantage'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : mode === 'disadvantage'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'hsl(var(--primary))'
                          : 'transparent',
                      color:
                        advMode === mode
                          ? mode === 'advantage'
                            ? '#22c55e'
                            : mode === 'disadvantage'
                              ? '#ef4444'
                              : 'hsl(var(--primary-foreground))'
                          : 'hsl(var(--muted-foreground))',
                      border:
                        advMode === mode
                          ? 'none'
                          : '1px solid hsl(var(--border))'
                    }}
                  >
                    {mode === 'normal' ? 'Normal' : mode === 'advantage' ? 'Advantage' : 'Disadvantage'}
                  </button>
                ))}
              </div>

              {/* Group Roll */}
              <div>
                <button
                  onClick={() => setGroupOpen(!groupOpen)}
                  className="text-xs font-medium hover:opacity-70"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {groupOpen ? '▾' : '▸'} Group Roll
                </button>
                {groupOpen && (
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Count
                        </label>
                        <input
                          type="number"
                          value={groupCount}
                          onChange={(e) => setGroupCount(e.target.value)}
                          className="w-full text-xs rounded border bg-transparent outline-none px-2 py-1 mt-0.5"
                          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                          min={1}
                          max={100}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Formula
                        </label>
                        <input
                          type="text"
                          value={groupFormula}
                          onChange={(e) => setGroupFormula(e.target.value)}
                          className="w-full text-xs rounded border bg-transparent outline-none px-2 py-1 mt-0.5"
                          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                          placeholder="1d20+4"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Target AC
                        </label>
                        <input
                          type="number"
                          value={groupAC}
                          onChange={(e) => setGroupAC(e.target.value)}
                          className="w-full text-xs rounded border bg-transparent outline-none px-2 py-1 mt-0.5"
                          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleGroupRoll}
                      className="w-full px-3 py-1.5 rounded-md text-xs font-medium hover:opacity-80"
                      style={{
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))'
                      }}
                    >
                      Roll Group
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />

              {/* Latest Result */}
              {latestEntry && <DiceResultDisplay entry={latestEntry} />}

              {/* History */}
              {history.length > 1 && (
                <RollHistory history={history.slice(1)} onClear={clearHistory} />
              )}

              {/* Divider */}
              <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />

              {/* Saved Rolls */}
              <SavedRollsList
                savedRolls={savedRolls}
                activeCampaignId={activeCampaignId}
                currentFormula={formula}
                onUse={(f, label) => handleRoll(f, label)}
                onSave={addSavedRoll}
                onRemove={removeSavedRoll}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
