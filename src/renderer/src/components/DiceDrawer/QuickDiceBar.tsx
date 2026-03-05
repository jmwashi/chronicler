const DICE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'] as const

interface Props {
  onRoll: (formula: string) => void
}

export function QuickDiceBar({ onRoll }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {DICE.map((die) => (
        <button
          key={die}
          onClick={() => onRoll(`1${die}`)}
          className="px-2.5 py-1.5 rounded-md text-xs font-bold hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: 'hsl(var(--muted))',
            color: 'hsl(var(--foreground))'
          }}
        >
          {die}
        </button>
      ))}
    </div>
  )
}
