// Pure dice parsing + rolling engine for D&D notation

export interface DieResult {
  value: number
  kept: boolean
  isCritical: boolean // rolled max on that die
  isFumble: boolean // rolled 1
}

export interface RollResult {
  formula: string
  dice: DieResult[]
  modifier: number
  total: number
  dieSize: number
  dieCount: number
  keepDrop?: { type: 'kh' | 'kl' | 'dh' | 'dl'; count: number }
  isNat20: boolean
  isNat1: boolean
  timestamp: string
  label?: string
}

export interface GroupRollResult {
  formula: string
  count: number
  targetAC: number
  rolls: RollResult[]
  hits: number
  misses: number
  timestamp: string
  label?: string
}

export interface SavedRoll {
  id: string
  campaignId: string
  name: string
  formula: string
}

interface ParsedFormula {
  count: number
  sides: number
  keepDrop?: { type: 'kh' | 'kl' | 'dh' | 'dl'; count: number }
  modifier: number
}

const FORMULA_RE = /^(\d+)?d(\d+)(?:(kh|kl|dh|dl)(\d+))?([+-]\d+)?$/i

export function parseDiceFormula(formula: string): ParsedFormula {
  const trimmed = formula.trim().toLowerCase().replace(/\s+/g, '')

  // Handle d% as d100
  const normalized = trimmed.replace(/d%/g, 'd100')

  const match = normalized.match(FORMULA_RE)
  if (!match) throw new Error(`Invalid dice formula: "${formula}"`)

  const count = match[1] ? parseInt(match[1], 10) : 1
  const sides = parseInt(match[2], 10)
  const kdType = match[3] as 'kh' | 'kl' | 'dh' | 'dl' | undefined
  const kdCount = match[4] ? parseInt(match[4], 10) : undefined
  const modifier = match[5] ? parseInt(match[5], 10) : 0

  if (count < 1 || count > 100) throw new Error('Dice count must be 1–100')
  if (sides < 2 || sides > 1000) throw new Error('Die sides must be 2–1000')

  const keepDrop =
    kdType && kdCount != null ? { type: kdType, count: kdCount } : undefined

  if (keepDrop && keepDrop.count >= count) {
    throw new Error(`Cannot ${kdType} ${kdCount} from ${count} dice`)
  }

  return { count, sides, keepDrop, modifier }
}

function rollSingleDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

function applyKeepDrop(
  values: number[],
  keepDrop: { type: 'kh' | 'kl' | 'dh' | 'dl'; count: number }
): boolean[] {
  const indexed = values.map((v, i) => ({ v, i }))
  const sorted = [...indexed].sort((a, b) => a.v - b.v) // ascending

  const kept = new Array(values.length).fill(true)
  const { type, count } = keepDrop

  if (type === 'kh') {
    // Keep highest N → drop everything except top N
    const toDrop = sorted.slice(0, values.length - count)
    toDrop.forEach((d) => (kept[d.i] = false))
  } else if (type === 'kl') {
    // Keep lowest N → drop everything except bottom N
    const toDrop = sorted.slice(count)
    toDrop.forEach((d) => (kept[d.i] = false))
  } else if (type === 'dh') {
    // Drop highest N
    const toDrop = sorted.slice(values.length - count)
    toDrop.forEach((d) => (kept[d.i] = false))
  } else if (type === 'dl') {
    // Drop lowest N
    const toDrop = sorted.slice(0, count)
    toDrop.forEach((d) => (kept[d.i] = false))
  }

  return kept
}

export function rollDice(formula: string, label?: string): RollResult {
  const parsed = parseDiceFormula(formula)
  const { count, sides, keepDrop, modifier } = parsed

  const rawValues = Array.from({ length: count }, () => rollSingleDie(sides))

  const keptFlags = keepDrop
    ? applyKeepDrop(rawValues, keepDrop)
    : rawValues.map(() => true)

  const dice: DieResult[] = rawValues.map((value, i) => ({
    value,
    kept: keptFlags[i],
    isCritical: value === sides,
    isFumble: value === 1
  }))

  const keptSum = dice.filter((d) => d.kept).reduce((s, d) => s + d.value, 0)
  const total = keptSum + modifier

  // Nat 20/1 detection: only on single d20 rolls (the kept die)
  const keptDice = dice.filter((d) => d.kept)
  const isSingleD20 = sides === 20 && keptDice.length === 1
  const isNat20 = isSingleD20 && keptDice[0].value === 20
  const isNat1 = isSingleD20 && keptDice[0].value === 1

  return {
    formula,
    dice,
    modifier,
    total,
    dieSize: sides,
    dieCount: count,
    keepDrop,
    isNat20,
    isNat1,
    timestamp: new Date().toISOString(),
    label
  }
}

export function rollAdvantage(modifier = 0, label?: string): RollResult {
  const modStr = modifier >= 0 ? (modifier > 0 ? `+${modifier}` : '') : `${modifier}`
  return rollDice(`2d20kh1${modStr}`, label ?? 'Advantage')
}

export function rollDisadvantage(modifier = 0, label?: string): RollResult {
  const modStr = modifier >= 0 ? (modifier > 0 ? `+${modifier}` : '') : `${modifier}`
  return rollDice(`2d20kl1${modStr}`, label ?? 'Disadvantage')
}

export function rollGroup(
  formula: string,
  count: number,
  targetAC: number,
  label?: string
): GroupRollResult {
  const rolls = Array.from({ length: count }, (_, i) =>
    rollDice(formula, label ? `${label} #${i + 1}` : `Roll #${i + 1}`)
  )

  const hits = rolls.filter((r) => r.total >= targetAC).length
  const misses = count - hits

  return {
    formula,
    count,
    targetAC,
    rolls,
    hits,
    misses,
    timestamp: new Date().toISOString(),
    label
  }
}
