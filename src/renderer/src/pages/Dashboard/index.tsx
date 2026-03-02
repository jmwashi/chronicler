import { useEffect } from 'react'
import { useCampaignStore } from '@/store/campaignStore'
import { useCharacterStore } from '@/store/characterStore'
import { useEventStore } from '@/store/eventStore'
import { useNoteStore } from '@/store/noteStore'
import { BookOpen, Users, Clock, StickyNote } from 'lucide-react'

export default function Dashboard() {
  const campaigns  = useCampaignStore((s) => s.campaigns)
  const characters = useCharacterStore((s) => s.characters)
  const events     = useEventStore((s) => s.events)
  const notes      = useNoteStore((s) => s.notes)

  useEffect(() => {
    useCampaignStore.getState().load()
    useCharacterStore.getState().load()
    useEventStore.getState().load()
    useNoteStore.getState().load()
  }, [])

  const stats = [
    { label: 'Campaigns',  value: campaigns.length,  icon: BookOpen  },
    { label: 'Characters', value: characters.length, icon: Users     },
    { label: 'Events',     value: events.length,     icon: Clock     },
    { label: 'Notes',      value: notes.length,      icon: StickyNote }
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
        Dashboard
      </h1>
      <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Welcome to Chronicler — your D&amp;D campaign companion.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border p-4 flex flex-col gap-2"
            style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {label}
              </span>
              <Icon size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
            <span className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
