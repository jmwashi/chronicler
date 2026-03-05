import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTagStore } from '@/store/tagStore'
import { useCharacterStore } from '@/store/characterStore'
import { useNoteStore } from '@/store/noteStore'
import { useLoreStore } from '@/store/loreStore'
import { useItemStore } from '@/store/itemStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useUIStore } from '@/store/uiStore'

function NotFound() {
  return (
    <div className="py-12 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
      Tag not found.
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}

function EntityLink({ name, to }: { name: string; to: string }) {
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  return (
    <button
      onClick={() => { incrementNavDepth(); navigate(to) }}
      className="text-sm underline underline-offset-2 hover:opacity-70 cursor-pointer"
      style={{ color: 'hsl(var(--primary))' }}
    >
      {name}
    </button>
  )
}

export default function TagDetail() {
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    useTagStore.getState().load()
    useCharacterStore.getState().load()
    useNoteStore.getState().load()
    useLoreStore.getState().load()
    useItemStore.getState().load()
    useLocationStore.getState().load()
    useFactionStore.getState().load()
  }, [])

  const tag = useTagStore((s) => s.tags.find((t) => t.id === id))
  const characters = useCharacterStore((s) => s.characters)
  const notes = useNoteStore((s) => s.notes)
  const lore = useLoreStore((s) => s.lore)
  const items = useItemStore((s) => s.items)
  const locations = useLocationStore((s) => s.locations)
  const factions = useFactionStore((s) => s.factions)

  const groups = useMemo(() => {
    if (!tag) return null
    return {
      characters: characters.filter((c) => (c as unknown as { tags?: string[] }).tags?.includes(tag.id)),
      notes: notes.filter((n) => n.tags?.includes(tag.id)),
      lore: lore.filter((l) => (l as unknown as { tags?: string[] }).tags?.includes(tag.id)),
      items: items.filter((i) => (i as unknown as { tags?: string[] }).tags?.includes(tag.id)),
      locations: locations.filter((l) => (l as unknown as { tags?: string[] }).tags?.includes(tag.id)),
      factions: factions.filter((f) => (f as unknown as { tags?: string[] }).tags?.includes(tag.id)),
    }
  }, [tag, characters, notes, lore, items, locations, factions])

  if (!tag || !groups) return <NotFound />

  const totalCount =
    groups.characters.length + groups.notes.length + groups.lore.length +
    groups.items.length + groups.locations.length + groups.factions.length

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {tag.name}
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Used by {totalCount} {totalCount === 1 ? 'entity' : 'entities'}
        </p>
      </div>

      <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />

      {groups.characters.length > 0 && (
        <Section title={`Characters (${groups.characters.length})`}>
          {groups.characters.map((c) => <EntityLink key={c.id} name={c.name} to={`/characters/${c.id}`} />)}
        </Section>
      )}
      {groups.notes.length > 0 && (
        <Section title={`Notes (${groups.notes.length})`}>
          {groups.notes.map((n) => <EntityLink key={n.id} name={n.title} to={`/notes/${n.id}`} />)}
        </Section>
      )}
      {groups.lore.length > 0 && (
        <Section title={`Lore (${groups.lore.length})`}>
          {groups.lore.map((l) => <EntityLink key={l.id} name={l.title} to={`/lore/${l.id}`} />)}
        </Section>
      )}
      {groups.items.length > 0 && (
        <Section title={`Items (${groups.items.length})`}>
          {groups.items.map((i) => <EntityLink key={i.id} name={i.name} to={`/items/${i.id}`} />)}
        </Section>
      )}
      {groups.locations.length > 0 && (
        <Section title={`Locations (${groups.locations.length})`}>
          {groups.locations.map((l) => <EntityLink key={l.id} name={l.name} to={`/locations/${l.id}`} />)}
        </Section>
      )}
      {groups.factions.length > 0 && (
        <Section title={`Factions (${groups.factions.length})`}>
          {groups.factions.map((f) => <EntityLink key={f.id} name={f.name} to={`/factions/${f.id}`} />)}
        </Section>
      )}

      {totalCount === 0 && (
        <p className="text-sm italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
          This tag is not used by any entities yet.
        </p>
      )}
    </div>
  )
}
