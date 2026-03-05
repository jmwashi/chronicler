import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCampaignStore } from '@/store/campaignStore'
import { useCharacterStore } from '@/store/characterStore'
import { useLoreStore } from '@/store/loreStore'
import { useNoteStore } from '@/store/noteStore'
import { useItemStore } from '@/store/itemStore'
import { useLocationStore } from '@/store/locationStore'
import { useFactionStore } from '@/store/factionStore'
import { useSessionStore } from '@/store/sessionStore'
import { useDocumentStore } from '@/store/documentStore'
import { useUIStore } from '@/store/uiStore'
import { Badge } from '@/components/ListPage'
import CampaignPicker from './CampaignPicker'
import NextSessionWidget from './NextSessionWidget'
import PartyRosterWidget from './PartyRosterWidget'
import PinnedNotesWidget from './PinnedNotesWidget'
import RecentActivityWidget from './RecentActivityWidget'
import type { ActivityItem } from './RecentActivityWidget'

export default function Dashboard() {
  const navigate = useNavigate()
  const campaigns = useCampaignStore((s) => s.campaigns)
  const characters = useCharacterStore((s) => s.characters)
  const lore = useLoreStore((s) => s.lore)
  const notes = useNoteStore((s) => s.notes)
  const items = useItemStore((s) => s.items)
  const locations = useLocationStore((s) => s.locations)
  const factions = useFactionStore((s) => s.factions)
  const sessions = useSessionStore((s) => s.sessions)
  const documents = useDocumentStore((s) => s.documents)
  const activeCampaignId = useUIStore((s) => s.activeCampaignId)
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)

  useEffect(() => {
    useCampaignStore.getState().load()
    useCharacterStore.getState().load()
    useLoreStore.getState().load()
    useNoteStore.getState().load()
    useItemStore.getState().load()
    useLocationStore.getState().load()
    useFactionStore.getState().load()
    useSessionStore.getState().load()
    useDocumentStore.getState().load()
  }, [])

  const go = (path: string) => {
    incrementNavDepth()
    navigate(path)
  }

  // ── No campaign selected → show picker ──────────────────────────────────
  if (!activeCampaignId) {
    return <CampaignPicker campaigns={campaigns} />
  }

  // ── Derive widget data ──────────────────────────────────────────────────
  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId)

  const nextSession =
    sessions
      .filter(
        (s) =>
          s.campaignId === activeCampaignId &&
          (s.status === 'planning' || s.status === 'ready')
      )
      .sort((a, b) => {
        if (b.sessionNumber !== a.sessionNumber) return b.sessionNumber - a.sessionNumber
        if (a.scheduledDate && b.scheduledDate)
          return a.scheduledDate.localeCompare(b.scheduledDate)
        return 0
      })[0] ?? null

  const pinnedNotes = notes
    .filter((n) => n.campaignId === activeCampaignId && n.isPinned)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const party = characters
    .filter((c) => c.campaignId === activeCampaignId && c.type === 'player')
    .sort((a, b) => a.name.localeCompare(b.name))

  const recentActivity: ActivityItem[] = (
    [
      ...characters
        .filter((c) => c.campaignId === activeCampaignId)
        .map((c) => ({
          id: c.id,
          entityType: 'character' as const,
          label: c.name,
          path: `/characters/${c.id}`,
          updatedAt: c.updatedAt
        })),
      ...notes
        .filter((n) => n.campaignId === activeCampaignId)
        .map((n) => ({
          id: n.id,
          entityType: 'note' as const,
          label: n.title,
          path: `/notes/${n.id}`,
          updatedAt: n.updatedAt
        })),
      ...lore
        .filter((l) => l.campaignId === activeCampaignId)
        .map((l) => ({
          id: l.id,
          entityType: 'lore' as const,
          label: l.title,
          path: `/lore/${l.id}`,
          updatedAt: l.updatedAt
        })),
      ...items
        .filter((i) => i.campaignId === activeCampaignId)
        .map((i) => ({
          id: i.id,
          entityType: 'item' as const,
          label: i.name,
          path: `/items/${i.id}`,
          updatedAt: i.updatedAt
        })),
      ...locations
        .filter((l) => l.campaignId === activeCampaignId)
        .map((l) => ({
          id: l.id,
          entityType: 'location' as const,
          label: l.name,
          path: `/locations/${l.id}`,
          updatedAt: l.updatedAt
        })),
      ...factions
        .filter((f) => f.campaignId === activeCampaignId)
        .map((f) => ({
          id: f.id,
          entityType: 'faction' as const,
          label: f.name,
          path: `/factions/${f.id}`,
          updatedAt: f.updatedAt
        })),
      ...sessions
        .filter((s) => s.campaignId === activeCampaignId)
        .map((s) => ({
          id: s.id,
          entityType: 'session' as const,
          label: s.title,
          path: `/sessions/${s.id}`,
          updatedAt: s.updatedAt
        })),
      ...documents
        .filter((d) => d.campaignId === activeCampaignId)
        .map((d) => ({
          id: d.id,
          entityType: 'document' as const,
          label: d.title,
          path: `/documents/${d.id}`,
          updatedAt: d.updatedAt
        }))
    ] as ActivityItem[]
  )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)

  const campaignStats = {
    characters: characters.filter((c) => c.campaignId === activeCampaignId).length,
    locations: locations.filter((l) => l.campaignId === activeCampaignId).length,
    factions: factions.filter((f) => f.campaignId === activeCampaignId).length,
    sessions: sessions.filter((s) => s.campaignId === activeCampaignId).length,
    notes: notes.filter((n) => n.campaignId === activeCampaignId).length
  }

  return (
    <div className="space-y-4">
      {/* Campaign header */}
      {activeCampaign && (
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1
                className="text-2xl font-bold truncate"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {activeCampaign.name}
              </h1>
              {(activeCampaign.system || activeCampaign.setting) && (
                <p
                  className="text-sm mt-0.5"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {[activeCampaign.system, activeCampaign.setting].filter(Boolean).join(' · ')}
                </p>
              )}
              {activeCampaign.description && (
                <p
                  className="text-sm mt-1 line-clamp-2"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {activeCampaign.description}
                </p>
              )}
            </div>
            <Badge>{activeCampaign.status}</Badge>
          </div>
          <div
            className="mt-3 pt-3 border-t flex flex-wrap gap-x-2 gap-y-1 text-xs"
            style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
          >
            <span>{campaignStats.characters} characters</span>
            <span>·</span>
            <span>{campaignStats.locations} locations</span>
            <span>·</span>
            <span>{campaignStats.factions} factions</span>
            <span>·</span>
            <span>{campaignStats.sessions} sessions</span>
            <span>·</span>
            <span>{campaignStats.notes} notes</span>
          </div>
        </div>
      )}

      {/* Widget grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <NextSessionWidget session={nextSession} onNavigate={go} />
          <PartyRosterWidget party={party} locations={locations} onNavigate={go} />
        </div>
        <div className="space-y-4">
          <PinnedNotesWidget notes={pinnedNotes} onNavigate={go} />
          <RecentActivityWidget items={recentActivity} onNavigate={go} />
        </div>
      </div>
    </div>
  )
}
