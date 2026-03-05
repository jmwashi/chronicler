import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useCharacterStore } from '@/store/characterStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useItemStore } from '@/store/itemStore'
import { useUIStore } from '@/store/uiStore'
import { EntityHoverLink } from '@/components/EntityPreview'
import { LinkedNotesSection } from './LinkedNotesSection'
import type { Session } from '@/types'

interface Props {
  session: Session
  onUpdateSession: (session: Session) => void
}

type EntityKind = 'character' | 'location' | 'faction' | 'item'

interface RefGroupProps {
  label: string
  kind: EntityKind
  ids: string[]
  options: { id: string; name: string }[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

function RefGroup({ label, kind, ids, options, onAdd, onRemove }: RefGroupProps) {
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const [collapsed, setCollapsed] = useState(false)
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')

  const items = ids
    .map((id) => options.find((o) => o.id === id))
    .filter(Boolean) as { id: string; name: string }[]

  const available = options.filter((o) => !ids.includes(o.id))
  const filtered = available.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))

  const pathPrefix = kind === 'character' ? '/characters' : kind === 'location' ? '/locations' : kind === 'faction' ? '/factions' : '/items'

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
          {label}
          <span className="font-normal">({items.length})</span>
        </button>
        <button
          onClick={() => setAdding((a) => !a)}
          className="p-0.5 rounded hover:opacity-70"
          style={{ color: 'hsl(var(--primary))' }}
          title={`Add ${label.toLowerCase()}`}
        >
          <Plus size={11} />
        </button>
      </div>

      {!collapsed && (
        <div className="mt-1 space-y-0.5">
          {items.length === 0 && !adding && (
            <p className="text-xs italic pl-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
              None added
            </p>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between group pl-3">
              <EntityHoverLink
                kind={kind}
                id={item.id}
                onClick={() => {
                  incrementNavDepth()
                  navigate(`${pathPrefix}/${item.id}`)
                }}
              >
                <span className="text-xs">{item.name}</span>
              </EntityHoverLink>
              <button
                onClick={() => onRemove(item.id)}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:opacity-70 transition-opacity"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <X size={10} />
              </button>
            </div>
          ))}

          {adding && (
            <div className="relative mt-1 pl-3">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => setTimeout(() => { setAdding(false); setQuery('') }, 150)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full px-2 py-1 rounded text-xs border bg-transparent outline-none"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              />
              {filtered.length > 0 && (
                <div
                  className="absolute z-20 w-full mt-0.5 rounded border shadow-md max-h-32 overflow-y-auto"
                  style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                >
                  {filtered.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onMouseDown={() => {
                        onAdd(o.id)
                        setQuery('')
                        setAdding(false)
                      }}
                      className="w-full text-left px-2 py-1 text-xs hover:opacity-70"
                      style={{ color: 'hsl(var(--foreground))', backgroundColor: 'hsl(var(--card))' }}
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ReferencePanel({ session, onUpdateSession }: Props) {
  const characters = useCharacterStore((s) => s.characters).filter((c) => c.campaignId === session.campaignId)
  const locations = useLocationStore((s) => s.locations).filter((l) => l.campaignId === session.campaignId)
  const factions = useFactionStore((s) => s.factions).filter((f) => f.campaignId === session.campaignId)
  const items = useItemStore((s) => s.items).filter((i) => i.campaignId === session.campaignId)

  const save = (patch: Partial<Session>) =>
    onUpdateSession({ ...session, ...patch, updatedAt: new Date().toISOString() })

  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        References
      </h3>

      <RefGroup
        label="Characters"
        kind="character"
        ids={session.referencedCharacterIds}
        options={characters.map((c) => ({ id: c.id, name: c.name }))}
        onAdd={(id) => save({ referencedCharacterIds: [...session.referencedCharacterIds, id] })}
        onRemove={(id) => save({ referencedCharacterIds: session.referencedCharacterIds.filter((x) => x !== id) })}
      />

      <RefGroup
        label="Locations"
        kind="location"
        ids={session.referencedLocationIds}
        options={locations.map((l) => ({ id: l.id, name: l.name }))}
        onAdd={(id) => save({ referencedLocationIds: [...session.referencedLocationIds, id] })}
        onRemove={(id) => save({ referencedLocationIds: session.referencedLocationIds.filter((x) => x !== id) })}
      />

      <RefGroup
        label="Factions"
        kind="faction"
        ids={session.referencedFactionIds}
        options={factions.map((f) => ({ id: f.id, name: f.name }))}
        onAdd={(id) => save({ referencedFactionIds: [...session.referencedFactionIds, id] })}
        onRemove={(id) => save({ referencedFactionIds: session.referencedFactionIds.filter((x) => x !== id) })}
      />

      <RefGroup
        label="Items"
        kind="item"
        ids={session.referencedItemIds}
        options={items.map((i) => ({ id: i.id, name: i.name }))}
        onAdd={(id) => save({ referencedItemIds: [...session.referencedItemIds, id] })}
        onRemove={(id) => save({ referencedItemIds: session.referencedItemIds.filter((x) => x !== id) })}
      />

      <div className="border-t pt-3 mt-3" style={{ borderColor: 'hsl(var(--border))' }}>
        <LinkedNotesSection session={session} onUpdateSession={onUpdateSession} />
      </div>
    </div>
  )
}
