import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { buildImprovContext, getDefaultImprovEntityRefs } from '@/lib/improv/context'
import { generateImprovDetails } from '@/lib/improv/generate'
import type { ImprovDetailRequest, ImprovEntityKind, ImprovEntityRef } from '@/lib/improv/types'
import { useCharacterStore } from '@/store/characterStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useLocationStore } from '@/store/locationStore'
import { useLoreStore } from '@/store/loreStore'
import { useNoteStore } from '@/store/noteStore'
import { useSceneStore } from '@/store/sceneStore'
import type { Scene, Session } from '@/types'

interface Props {
  session: Session
  activeScene: Scene | null
}

const KIND_LABEL: Record<ImprovEntityKind, string> = {
  character: 'Characters',
  location: 'Locations',
  faction: 'Factions',
  item: 'Items',
  lore: 'Lore',
  note: 'Notes',
  scene: 'Scenes'
}

function refKey(ref: ImprovEntityRef): string {
  return `${ref.kind}:${ref.id}`
}

export function ImprovToolTab({ session, activeScene }: Props): ReactElement {
  const [request, setRequest] = useState<ImprovDetailRequest>({
    subject: 'a random bar the party just entered',
    playerIntent: 'find someone who knows about a missing caravan',
    tone: 'gritty but lively',
    scale: 'quick drop-in details for 3-5 minutes of interaction',
    constraints: 'keep it grounded and avoid combat unless pushed'
  })
  const [selectedRefKeys, setSelectedRefKeys] = useState<string[]>([])
  const [result, setResult] = useState<Awaited<ReturnType<typeof generateImprovDetails>> | null>(
    null
  )
  const [isGenerating, setIsGenerating] = useState(false)

  const characters = useCharacterStore((s) => s.characters)
  const locations = useLocationStore((s) => s.locations)
  const factions = useFactionStore((s) => s.factions)
  const items = useItemStore((s) => s.items)
  const lore = useLoreStore((s) => s.lore)
  const notes = useNoteStore((s) => s.notes)
  const scenes = useSceneStore((s) => s.scenes)

  useEffect(() => {
    useCharacterStore.getState().load()
    useLocationStore.getState().load()
    useFactionStore.getState().load()
    useItemStore.getState().load()
    useLoreStore.getState().load()
    useNoteStore.getState().load()
    useSceneStore.getState().load()
  }, [])

  const world = useMemo(
    () => ({
      session,
      activeScene,
      characters,
      locations,
      factions,
      items,
      lore,
      notes,
      scenes: scenes.filter((entry) => entry.sessionId === session.id)
    }),
    [activeScene, characters, factions, items, locations, lore, notes, scenes, session]
  )

  const defaultRefKeys = useMemo(() => getDefaultImprovEntityRefs(world).map(refKey), [world])

  useEffect(() => {
    if (selectedRefKeys.length) return
    setSelectedRefKeys(defaultRefKeys)
  }, [defaultRefKeys, selectedRefKeys.length])

  const contextOptions = useMemo(() => {
    return [
      ...characters
        .filter((entry) => entry.campaignId === session.campaignId)
        .map((entry) => ({ kind: 'character' as const, id: entry.id, name: entry.name })),
      ...locations
        .filter((entry) => entry.campaignId === session.campaignId)
        .map((entry) => ({ kind: 'location' as const, id: entry.id, name: entry.name })),
      ...factions
        .filter((entry) => entry.campaignId === session.campaignId)
        .map((entry) => ({ kind: 'faction' as const, id: entry.id, name: entry.name })),
      ...items
        .filter((entry) => entry.campaignId === session.campaignId)
        .map((entry) => ({ kind: 'item' as const, id: entry.id, name: entry.name })),
      ...lore
        .filter((entry) => entry.campaignId === session.campaignId)
        .map((entry) => ({ kind: 'lore' as const, id: entry.id, name: entry.title })),
      ...notes
        .filter((entry) => entry.campaignId === session.campaignId)
        .map((entry) => ({ kind: 'note' as const, id: entry.id, name: entry.title })),
      ...world.scenes
        .filter((entry) => entry.campaignId === session.campaignId)
        .map((entry) => ({ kind: 'scene' as const, id: entry.id, name: entry.title }))
    ].sort((a, b) => a.name.localeCompare(b.name))
  }, [characters, factions, items, locations, lore, notes, session.campaignId, world.scenes])

  const contextRefs: ImprovEntityRef[] = selectedRefKeys.map((value) => {
    const [kind, id] = value.split(':')
    return { kind: kind as ImprovEntityKind, id }
  })

  const contextEntities = useMemo(
    () => buildImprovContext(world, contextRefs),
    [contextRefs, world]
  )

  const groupedOptions = useMemo(() => {
    return contextOptions.reduce<Record<ImprovEntityKind, typeof contextOptions>>(
      (acc, option) => {
        acc[option.kind].push(option)
        return acc
      },
      { character: [], location: [], faction: [], item: [], lore: [], note: [], scene: [] }
    )
  }, [contextOptions])

  const toggleRef = (ref: ImprovEntityRef): void => {
    const key = refKey(ref)
    setSelectedRefKeys((current) =>
      current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]
    )
  }

  const handleGenerate = async (): Promise<void> => {
    setIsGenerating(true)
    setResult(await generateImprovDetails(request, contextEntities))
    setIsGenerating(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-3" style={{ borderColor: 'hsl(var(--border))' }}>
        <h3 className="text-sm font-semibold">On-the-fly detail generator</h3>
        <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Use this when players do something unplanned. It generates descriptive details you can
          narrate immediately (not a scripted scene).
        </p>

        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {[
            { key: 'subject', label: 'What are they interacting with?' },
            { key: 'playerIntent', label: 'What do players want from it?' },
            { key: 'tone', label: 'Tone / vibe' },
            { key: 'scale', label: 'How big should this be?' },
            { key: 'constraints', label: 'Constraints (optional)', wide: true }
          ].map((field) => (
            <label key={field.key} className={field.wide ? 'md:col-span-2' : ''}>
              <div className="text-xs font-medium mb-1">{field.label}</div>
              <input
                value={request[field.key as keyof ImprovDetailRequest]}
                onChange={(e) =>
                  setRequest((current) => ({
                    ...current,
                    [field.key]: e.target.value
                  }))
                }
                className="w-full px-2.5 py-2 rounded-md text-sm border"
                style={{
                  borderColor: 'hsl(var(--border))',
                  backgroundColor: 'hsl(var(--background))'
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-3" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Optional world context</h3>
          <button
            onClick={() => setSelectedRefKeys(defaultRefKeys)}
            className="text-xs underline"
            style={{ color: 'hsl(var(--primary))' }}
          >
            Reset to session defaults
          </button>
        </div>
        <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Pull in only what you need for grounding. Defaults come from session references + active
          scene.
        </p>

        <div className="grid md:grid-cols-2 gap-x-4 gap-y-3 mt-3">
          {(Object.keys(KIND_LABEL) as ImprovEntityKind[]).map((kind) => (
            <div key={kind}>
              <h4 className="text-xs font-semibold mb-1">{KIND_LABEL[kind]}</h4>
              <div className="max-h-28 overflow-auto pr-1 space-y-1">
                {groupedOptions[kind].length === 0 ? (
                  <p className="text-xs italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    None
                  </p>
                ) : (
                  groupedOptions[kind].map((option) => {
                    const key = refKey(option)
                    return (
                      <label key={key} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedRefKeys.includes(key)}
                          onChange={() => toggleRef(option)}
                        />
                        <span>{option.name}</span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-3" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Generated details for narration</h3>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-60"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))'
            }}
          >
            {isGenerating ? 'Generating…' : 'Generate details'}
          </button>
        </div>

        {result ? (
          <div className="space-y-3 mt-3 text-sm">
            <div>
              <h4 className="text-xs font-semibold mb-1">Read-aloud opener</h4>
              <p>{result.openingDescription}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-1">Sensory details</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.sensoryDetails.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-1">Notable features</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.notableFeatures.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-1">Immediate opportunities</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.immediateOpportunities.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-1">Hidden twist (hold back or reveal)</h4>
              <p>{result.hiddenTwist}</p>
            </div>

            <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {result.usedFallback ? 'Fallback mode' : 'LLM mode'} · {result.diagnostics}
            </div>
          </div>
        ) : (
          <p className="text-xs mt-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Generate to get descriptive details you can narrate immediately when players go
            off-script.
          </p>
        )}
      </div>
    </div>
  )
}
