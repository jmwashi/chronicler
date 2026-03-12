import { type ReactElement, useMemo, useState } from 'react'
import { Copy, RefreshCw, Sparkles } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useLocationStore } from '@/store/locationStore'
import { useLoreStore } from '@/store/loreStore'
import { useNoteStore } from '@/store/noteStore'
import { Field, Select, Textarea } from '@/components/ui/Field'
import { EntityChipSelect } from '@/components/ui/EntityChipSelect'
import type { Session } from '@/types'

type ImprovType = 'character' | 'location' | 'venue'
type Tone = 'grounded' | 'tense' | 'mysterious' | 'chaotic'

interface Props {
  session: Session
}

function pickOne<T>(items: T[]): T | null {
  if (items.length === 0) return null
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

function summarize(text: string, maxLength = 110): string {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (!compact) return ''
  if (compact.length <= maxLength) return compact
  return `${compact.slice(0, maxLength - 1)}…`
}

export function ImprovToolTab({ session }: Props): ReactElement {
  const campaignCharacters = useCharacterStore((s) => s.characters).filter(
    (c) => c.campaignId === session.campaignId
  )
  const campaignLocations = useLocationStore((s) => s.locations).filter(
    (l) => l.campaignId === session.campaignId
  )
  const campaignFactions = useFactionStore((s) => s.factions).filter(
    (f) => f.campaignId === session.campaignId
  )
  const campaignItems = useItemStore((s) => s.items).filter(
    (i) => i.campaignId === session.campaignId
  )
  const campaignLore = useLoreStore((s) => s.lore).filter(
    (l) => l.campaignId === session.campaignId
  )
  const campaignNotes = useNoteStore((s) => s.notes).filter(
    (n) => n.campaignId === session.campaignId
  )

  const [improvType, setImprovType] = useState<ImprovType>('character')
  const [tone, setTone] = useState<Tone>('grounded')
  const [includeDmNotes, setIncludeDmNotes] = useState(true)
  const [focusItemIds, setFocusItemIds] = useState<string[]>([])
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const referencedCharacters = useMemo(
    () => campaignCharacters.filter((c) => session.referencedCharacterIds.includes(c.id)),
    [campaignCharacters, session.referencedCharacterIds]
  )
  const referencedLocations = useMemo(
    () => campaignLocations.filter((l) => session.referencedLocationIds.includes(l.id)),
    [campaignLocations, session.referencedLocationIds]
  )
  const referencedFactions = useMemo(
    () => campaignFactions.filter((f) => session.referencedFactionIds.includes(f.id)),
    [campaignFactions, session.referencedFactionIds]
  )
  const referencedItems = useMemo(
    () => campaignItems.filter((i) => session.referencedItemIds.includes(i.id)),
    [campaignItems, session.referencedItemIds]
  )
  const linkedNotes = useMemo(
    () => campaignNotes.filter((n) => session.linkedNoteIds.includes(n.id)),
    [campaignNotes, session.linkedNoteIds]
  )

  const toneDirection: Record<Tone, string> = {
    grounded: 'Keep details practical and believable with consequences.',
    tense: 'Escalate pressure quickly and introduce immediate stakes.',
    mysterious: 'Leave unanswered questions and breadcrumb clues.',
    chaotic: 'Add unexpected complications and volatile behavior.'
  }

  const entityPool = {
    characters: referencedCharacters.length > 0 ? referencedCharacters : campaignCharacters,
    locations: referencedLocations.length > 0 ? referencedLocations : campaignLocations,
    factions: referencedFactions.length > 0 ? referencedFactions : campaignFactions,
    items: referencedItems.length > 0 ? referencedItems : campaignItems
  }

  const focusItems = useMemo(
    () => campaignItems.filter((item) => focusItemIds.includes(item.id)),
    [campaignItems, focusItemIds]
  )

  const selectLoreSnippet = (): string => {
    const relevantLore = campaignLore.filter((lore) => {
      const hasLocationLink = lore.relatedLocationIds.some((id) =>
        referencedLocations.some((location) => location.id === id)
      )
      const hasFactionLink = lore.relatedFactionIds.some((id) =>
        referencedFactions.some((faction) => faction.id === id)
      )
      const hasCharacterLink = lore.relatedCharacterIds.some((id) =>
        referencedCharacters.some((character) => character.id === id)
      )
      const hasItemLink = lore.relatedItemIds.some((id) =>
        [...referencedItems, ...focusItems].some((item) => item.id === id)
      )
      return hasLocationLink || hasFactionLink || hasCharacterLink || hasItemLink
    })

    const lore = pickOne(relevantLore.length > 0 ? relevantLore : campaignLore)
    if (!lore) return ''
    return `${lore.title}: ${summarize(lore.description, 140)}`
  }

  const selectNoteSnippet = (): string => {
    const note = pickOne(linkedNotes)
    return note ? summarize(note.content, 140) : ''
  }

  const selectRace = (): string | null => {
    const knownRaces = entityPool.characters
      .map((character) => character.race.trim())
      .filter(Boolean)
    return pickOne(knownRaces)
  }

  const selectAppearance = (): string | null => {
    const appearances = entityPool.characters
      .map((character) => summarize(character.description, 120))
      .filter(Boolean)
    return pickOne(appearances)
  }

  const buildCharacterSeed = (): string => {
    const location = pickOne(entityPool.locations)
    const faction = pickOne(entityPool.factions)
    const existingNpc =
      pickOne(entityPool.characters.filter((character) => character.type === 'npc')) ??
      pickOne(entityPool.characters)
    const race = selectRace()
    const appearance = selectAppearance()
    const loreSnippet = selectLoreSnippet()
    const noteSnippet = selectNoteSnippet()

    return [
      '# Character Improv Seed',
      `**Tone:** ${tone}`,
      '',
      `**Anchor location:** ${location ? location.name : 'Current party location'}`,
      `**Quick concept:** ${existingNpc ? `A contact connected to ${existingNpc.name}` : 'A local with unknown connections'} enters the scene.`,
      `**Name style cue:** ${loreSnippet || noteSnippet || 'Use naming patterns from nearby regions and recent notes.'}`,
      `**Suggested race/background:** ${race ? `${race} with ties to ${location?.name ?? 'this area'}.` : 'Use a culturally local ancestry and trade background.'}`,
      `**Appearance cue:** ${appearance || 'Distinctive clothing, one memorable accessory, and a visible stress tell.'}`,
      `**Faction pressure:** ${faction ? `${faction.name} expects this character to report quickly.` : 'Their loyalty is uncertain and situation-dependent.'}`,
      focusItems.length > 0
        ? `**Items to consider:** ${focusItems.map((item) => item.name).join(', ')}`
        : '**Items to consider:** Add one item that immediately communicates role or status.',
      '',
      `**DM beat:** ${toneDirection[tone]}`,
      includeDmNotes && existingNpc?.dmNotes
        ? `**Private reminder:** ${summarize(existingNpc.dmNotes, 180)}`
        : ''
    ]
      .filter(Boolean)
      .join('\n')
  }

  const buildLocationSeed = (): string => {
    const location = pickOne(entityPool.locations)
    const nearbyFaction = pickOne(entityPool.factions)
    const hostNpc = pickOne(entityPool.characters)
    const loreSnippet = selectLoreSnippet()

    return [
      '# Location Improv Seed',
      `**Tone:** ${tone}`,
      '',
      `**Where the party lands:** ${location ? `${location.name} (${location.type})` : 'An unplanned stop near their current route'}`,
      `**Immediate vibe:** ${location?.description ? summarize(location.description, 140) : 'Crowded, active, and one step away from trouble.'}`,
      `**Who seems in control:** ${nearbyFaction ? nearbyFaction.name : 'No clear authority; influence shifts by the hour.'}`,
      `**Face of the place:** ${hostNpc ? hostNpc.name : 'A proprietor trying to keep order.'}`,
      `**Lore thread to weave in:** ${loreSnippet || 'Tie to recent rumors, local history, or a prophetic detail.'}`,
      focusItems.length > 0
        ? `**Items present here:** ${focusItems.map((item) => item.name).join(', ')}`
        : '**Items present here:** Pick one mundane and one suspicious object for investigation hooks.',
      '',
      `**DM beat:** ${toneDirection[tone]}`
    ].join('\n')
  }

  const buildVenueSeed = (): string => {
    const location = pickOne(entityPool.locations)
    const bartender =
      pickOne(entityPool.characters.filter((character) => character.type === 'npc')) ??
      pickOne(entityPool.characters)
    const patrons = entityPool.characters
      .filter((character) => character.id !== bartender?.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const loreSnippet = selectLoreSnippet()
    const noteSnippet = selectNoteSnippet()

    return [
      '# Tavern / Venue Improv Seed',
      `**Tone:** ${tone}`,
      '',
      `**Venue name cue:** ${loreSnippet || noteSnippet || 'Use local myth + trade symbol (e.g., "Crown & Lantern").'}`,
      `**Where it is:** ${location ? `${location.name}` : 'Near the current player objective'}`,
      `**Person running the room:** ${bartender ? `${bartender.name}${bartender.race ? ` (${bartender.race})` : ''}` : 'A sharp-eyed owner who misses nothing.'}`,
      patrons.length > 0
        ? `**Notable patrons:** ${patrons
            .map((patron) => `${patron.name}${patron.race ? ` (${patron.race})` : ''}`)
            .join('; ')}`
        : '**Notable patrons:** A loud mercenary, a silent priest, and a traveler with a coded letter.',
      `**Appearance details:** ${selectAppearance() || 'Smoke-stained beams, mismatched glasses, and a stage no one uses after dusk.'}`,
      focusItems.length > 0
        ? `**Items to place in the venue:** ${focusItems.map((item) => item.name).join(', ')}`
        : '**Items to place in the venue:** A ledger, a locked case, and one item linked to a faction.',
      '',
      `**DM beat:** ${toneDirection[tone]}`
    ].join('\n')
  }

  const generate = (): void => {
    setCopied(false)
    if (improvType === 'character') {
      setOutput(buildCharacterSeed())
      return
    }
    if (improvType === 'venue') {
      setOutput(buildVenueSeed())
      return
    }
    setOutput(buildLocationSeed())
  }

  const copy = async (): Promise<void> => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
          DM Improv Assistant
        </h3>
        <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Generate quick characters, locations, and venue casts from your session references, lore,
          linked notes, factions, and item context.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Generate">
          <Select value={improvType} onChange={(e) => setImprovType(e.target.value as ImprovType)}>
            <option value="character">Character seed</option>
            <option value="location">Location seed</option>
            <option value="venue">Tavern / venue seed</option>
          </Select>
        </Field>

        <Field label="Tone">
          <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
            <option value="grounded">Grounded</option>
            <option value="tense">Tense</option>
            <option value="mysterious">Mysterious</option>
            <option value="chaotic">Chaotic</option>
          </Select>
        </Field>

        <Field label="Source">
          <label
            className="h-[38px] rounded-md border px-3 flex items-center gap-2 text-sm"
            style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
          >
            <input
              type="checkbox"
              checked={includeDmNotes}
              onChange={(e) => setIncludeDmNotes(e.target.checked)}
            />
            Include DM notes
          </label>
        </Field>
      </div>

      <Field label="Items to consider">
        <EntityChipSelect
          selected={focusItemIds}
          options={campaignItems.map((item) => ({ id: item.id, name: item.name }))}
          onChange={setFocusItemIds}
          placeholder="Add item context (optional)..."
        />
      </Field>

      <div className="flex items-center gap-2">
        <button
          onClick={generate}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:opacity-85"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))'
          }}
        >
          <Sparkles size={14} /> Generate improv seed
        </button>

        <button
          onClick={generate}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm hover:opacity-80 border"
          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
          title="Reroll with the same settings"
        >
          <RefreshCw size={14} /> Reroll
        </button>

        <button
          onClick={copy}
          disabled={!output}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm hover:opacity-80 border disabled:opacity-40"
          style={{
            borderColor: 'hsl(var(--border))',
            color: copied ? '#10b981' : 'hsl(var(--muted-foreground))'
          }}
        >
          <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <Field label="Generated improv prompt">
        <Textarea
          value={output}
          readOnly
          rows={15}
          placeholder="Generate a seed to get a ready-to-run improv prompt based on this session's references."
        />
      </Field>

      <p className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Uses referenced entities first (Characters, Locations, Factions, Items), then falls back to
        campaign data so you can improvise even when references are sparse.
      </p>
    </div>
  )
}
