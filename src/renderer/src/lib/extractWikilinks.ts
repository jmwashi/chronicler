import { useCharacterStore } from '@/store/characterStore'
import { useNoteStore } from '@/store/noteStore'
import { useLoreStore } from '@/store/loreStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useSessionStore } from '@/store/sessionStore'
import { useDocumentStore } from '@/store/documentStore'

export interface ResolvedLinks {
  characterIds: string[]
  loreIds: string[]
  locationIds: string[]
  factionIds: string[]
  itemIds: string[]
  sessionIds: string[]
  documentIds: string[]
}

const empty: ResolvedLinks = {
  characterIds: [],
  loreIds: [],
  locationIds: [],
  factionIds: [],
  itemIds: [],
  sessionIds: [],
  documentIds: []
}

/**
 * Extract [[wikilink]] names from markdown content, resolve them against all
 * entity stores, and return grouped IDs by entity type.
 */
export function extractWikilinks(content: string): ResolvedLinks {
  const matches = content.match(/\[\[([^\]]+)\]\]/g)
  if (!matches) return empty

  const names = [...new Set(matches.map((m) => m.slice(2, -2).trim().toLowerCase()))]

  const characters = useCharacterStore.getState().characters
  const notes = useNoteStore.getState().notes
  const lore = useLoreStore.getState().lore
  const locations = useLocationStore.getState().locations
  const factions = useFactionStore.getState().factions
  const items = useItemStore.getState().items
  const sessions = useSessionStore.getState().sessions
  const documents = useDocumentStore.getState().documents

  const result: ResolvedLinks = {
    characterIds: [],
    loreIds: [],
    locationIds: [],
    factionIds: [],
    itemIds: [],
    sessionIds: [],
    documentIds: []
  }

  for (const name of names) {
    const char = characters.find((c) => c.name.toLowerCase() === name)
    if (char) { result.characterIds.push(char.id); continue }

    const note = notes.find((n) => n.title.toLowerCase() === name)
    if (note) continue // notes linking to other notes — no explicit relationship field

    const loreEntry = lore.find((l) => l.title.toLowerCase() === name)
    if (loreEntry) { result.loreIds.push(loreEntry.id); continue }

    const location = locations.find((l) => l.name.toLowerCase() === name)
    if (location) { result.locationIds.push(location.id); continue }

    const faction = factions.find((f) => f.name.toLowerCase() === name)
    if (faction) { result.factionIds.push(faction.id); continue }

    const item = items.find((i) => i.name.toLowerCase() === name)
    if (item) { result.itemIds.push(item.id); continue }

    const session = sessions.find((s) => s.title.toLowerCase() === name)
    if (session) { result.sessionIds.push(session.id); continue }

    const doc = documents.find((d) => d.title.toLowerCase() === name)
    if (doc) { result.documentIds.push(doc.id); continue }
  }

  return result
}

/**
 * Merge auto-detected wikilink IDs with manually selected IDs (union, deduped).
 */
export function mergeIds(manual: string[], detected: string[]): string[] {
  return [...new Set([...manual, ...detected])]
}
