import { useState } from 'react'
import { Play, Trash2, Plus } from 'lucide-react'
import type { SavedRoll } from '@/lib/diceRoller'

interface Props {
  savedRolls: SavedRoll[]
  activeCampaignId: string | null
  currentFormula: string
  onUse: (formula: string, label: string) => void
  onSave: (roll: SavedRoll) => void
  onRemove: (id: string) => void
}

export function SavedRollsList({
  savedRolls,
  activeCampaignId,
  currentFormula,
  onUse,
  onSave,
  onRemove
}: Props) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')

  const campaignRolls = savedRolls.filter((r) => r.campaignId === activeCampaignId)

  const handleSave = () => {
    if (!name.trim() || !currentFormula.trim() || !activeCampaignId) return
    onSave({
      id: crypto.randomUUID(),
      campaignId: activeCampaignId,
      name: name.trim(),
      formula: currentFormula.trim()
    })
    setName('')
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h4
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Saved Rolls
        </h4>
        {activeCampaignId && currentFormula && !saving && (
          <button
            onClick={() => setSaving(true)}
            className="flex items-center gap-0.5 text-xs hover:opacity-70"
            style={{ color: 'hsl(var(--primary))' }}
            title="Save current formula"
          >
            <Plus size={11} /> Save
          </button>
        )}
      </div>

      {saving && (
        <div className="flex gap-1 mb-2">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') setSaving(false)
            }}
            placeholder="Roll name..."
            className="flex-1 text-xs rounded border bg-transparent outline-none px-2 py-1"
            style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
          />
          <button
            onClick={handleSave}
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            Save
          </button>
          <button
            onClick={() => setSaving(false)}
            className="px-2 py-1 rounded text-xs"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Cancel
          </button>
        </div>
      )}

      {campaignRolls.length === 0 ? (
        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {activeCampaignId ? 'No saved rolls yet.' : 'Select a campaign to save rolls.'}
        </p>
      ) : (
        <div className="space-y-0.5">
          {campaignRolls.map((roll) => (
            <div
              key={roll.id}
              className="flex items-center justify-between px-2 py-1 rounded text-xs"
              style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
            >
              <div className="min-w-0">
                <span className="font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>
                  {roll.name}
                </span>
                <span className="ml-1.5 font-mono" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {roll.formula}
                </span>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => onUse(roll.formula, roll.name)}
                  className="p-1 rounded hover:opacity-70"
                  style={{ color: '#22c55e' }}
                  title="Roll"
                >
                  <Play size={11} />
                </button>
                <button
                  onClick={() => onRemove(roll.id)}
                  className="p-1 rounded hover:opacity-70"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                  title="Remove"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
