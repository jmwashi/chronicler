import type { ImprovContextEntity, ImprovEntityRef, ImprovWorldData } from './types'

const clip = (value: string, max = 180): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

export function getDefaultImprovEntityRefs(world: ImprovWorldData): ImprovEntityRef[] {
  const refs: ImprovEntityRef[] = [
    ...world.session.referencedCharacterIds.map((id) => ({ kind: 'character' as const, id })),
    ...world.session.referencedLocationIds.map((id) => ({ kind: 'location' as const, id })),
    ...world.session.referencedFactionIds.map((id) => ({ kind: 'faction' as const, id })),
    ...world.session.referencedItemIds.map((id) => ({ kind: 'item' as const, id })),
    ...world.session.linkedNoteIds.map((id) => ({ kind: 'note' as const, id }))
  ]

  if (world.activeScene) {
    refs.push({ kind: 'scene', id: world.activeScene.id })
    if (world.activeScene.locationId)
      refs.push({ kind: 'location', id: world.activeScene.locationId })
    refs.push(
      ...world.activeScene.presentCharacterIds.map((id) => ({ kind: 'character' as const, id }))
    )
  }

  const uniq = new Map<string, ImprovEntityRef>()
  refs.forEach((ref) => uniq.set(`${ref.kind}:${ref.id}`, ref))
  return [...uniq.values()]
}

function refToContextEntity(
  world: ImprovWorldData,
  ref: ImprovEntityRef
): ImprovContextEntity | null {
  switch (ref.kind) {
    case 'character': {
      const character = world.characters.find((entry) => entry.id === ref.id)
      if (!character) return null
      return {
        kind: 'character',
        id: character.id,
        name: character.name,
        summary: clip(
          `${character.type}; ${character.race} ${character.class}; ${character.backstory || character.description || character.dmNotes}`
        )
      }
    }
    case 'location': {
      const location = world.locations.find((entry) => entry.id === ref.id)
      if (!location) return null
      return {
        kind: 'location',
        id: location.id,
        name: location.name,
        summary: clip(`${location.type}; ${location.description}`)
      }
    }
    case 'faction': {
      const faction = world.factions.find((entry) => entry.id === ref.id)
      if (!faction) return null
      return {
        kind: 'faction',
        id: faction.id,
        name: faction.name,
        summary: clip(`${faction.alignment}; goals: ${faction.goals || faction.description}`)
      }
    }
    case 'item': {
      const item = world.items.find((entry) => entry.id === ref.id)
      if (!item) return null
      return {
        kind: 'item',
        id: item.id,
        name: item.name,
        summary: clip(`${item.type}; ${item.properties || item.description}`)
      }
    }
    case 'lore': {
      const lore = world.lore.find((entry) => entry.id === ref.id)
      if (!lore) return null
      return {
        kind: 'lore',
        id: lore.id,
        name: lore.title,
        summary: clip(`${lore.category}; era: ${lore.era || 'unknown'}; ${lore.description}`)
      }
    }
    case 'note': {
      const note = world.notes.find((entry) => entry.id === ref.id)
      if (!note) return null
      return {
        kind: 'note',
        id: note.id,
        name: note.title,
        summary: clip(note.content)
      }
    }
    case 'scene': {
      const scene = world.scenes.find((entry) => entry.id === ref.id)
      if (!scene) return null
      return {
        kind: 'scene',
        id: scene.id,
        name: scene.title,
        summary: clip(`${scene.status}; ${scene.description || scene.dmNotes}`)
      }
    }
  }
}

export function buildImprovContext(
  world: ImprovWorldData,
  selectedRefs: ImprovEntityRef[]
): ImprovContextEntity[] {
  return selectedRefs
    .map((ref) => refToContextEntity(world, ref))
    .filter((entry): entry is ImprovContextEntity => Boolean(entry))
}

export function formatImprovFacts(contextEntities: ImprovContextEntity[]): string {
  if (!contextEntities.length) {
    return 'No selected world facts. Keep outputs setting-agnostic and broadly reusable.'
  }

  return contextEntities
    .map(
      (entry, idx) =>
        `${idx + 1}. [${entry.kind}] ${entry.name}: ${entry.summary || 'No extra details.'}`
    )
    .join('\n')
}
