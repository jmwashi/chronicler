import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BookOpen,
  Check,
  ChevronDown,
  ScrollText,
  FileText,
  LayoutDashboard,
  Gavel,
  MapPin,
  Package,
  Plus,
  Scroll,
  Shield,
  StickyNote,
  Tag,
  Trash2,
  Users,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { Modal } from '@/components/Modal'
import { Field, Input, Select, Textarea, FormActions } from '@/components/ui/Field'
import type { Campaign } from '@/types'

const nav = [
  { to: '/',           label: 'Dashboard',  icon: LayoutDashboard, end: true  },
  { to: '/sessions',   label: 'Sessions',   icon: Scroll,          end: false },
  { to: '/characters', label: 'Characters', icon: Users,           end: false },
  { to: '/lore',       label: 'Lore',       icon: ScrollText,      end: false },
  { to: '/documents',  label: 'Documents',  icon: FileText,        end: false },
  { to: '/notes',      label: 'Notes',      icon: StickyNote,      end: false },
  { to: '/items',      label: 'Items',      icon: Package,         end: false },
  { to: '/locations',  label: 'Locations',  icon: MapPin,          end: false },
  { to: '/factions',   label: 'Factions',   icon: Shield,          end: false },
  { to: '/tags',       label: 'Tags',       icon: Tag,             end: false },
  { to: '/game-rules', label: 'Game Rules', icon: Gavel,           end: false },
  { to: '/tools',      label: 'Tools',      icon: Wrench,          end: false }
]

// ── Campaign modal ────────────────────────────────────────────────────────────

interface CampaignFormState {
  name: string
  system: string
  setting: string
  description: string
  status: Campaign['status']
}

const emptyCampaignForm: CampaignFormState = {
  name: '',
  system: '',
  setting: '',
  description: '',
  status: 'active'
}

function CampaignModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState<CampaignFormState>(emptyCampaignForm)
  const { add } = useCampaignStore()
  const { activeCampaignId, setActiveCampaign } = useUIStore()

  const handleClose = () => {
    setForm(emptyCampaignForm)
    onClose()
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    const now = new Date().toISOString()
    const campaign: Campaign = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      system: form.system.trim(),
      setting: form.setting.trim(),
      description: form.description.trim(),
      status: form.status,
      createdAt: now,
      updatedAt: now
    }
    await add(campaign)
    if (!activeCampaignId) setActiveCampaign(campaign.id)
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Campaign">
      <div className="space-y-4">
        <Field label="Name *">
          <Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} placeholder="e.g. Lost Mine of Phandelver" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="System">
            <Input value={form.system} onChange={(e) => setForm({ ...form, system: e.target.value })} placeholder="D&D 5e" />
          </Field>
          <Field label="Setting">
            <Input value={form.setting} onChange={(e) => setForm({ ...form, setting: e.target.value })} placeholder="Faerûn" />
          </Field>
        </div>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Campaign['status'] })}>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the campaign..." rows={3} />
        </Field>
        <FormActions onCancel={handleClose} onSave={handleSave} disabled={!form.name.trim()} />
      </div>
    </Modal>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const campaigns = useCampaignStore((s) => s.campaigns)
  const removeCascade = useCampaignStore((s) => s.removeCascade)
  const { activeCampaignId, setActiveCampaign } = useUIStore()
  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId)

  useEffect(() => {
    useCampaignStore.getState().load()
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [dropdownOpen])

  return (
    <aside
      className="w-56 flex-shrink-0 border-r flex flex-col"
      style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      {/* App title */}
      <div
        className="flex items-center gap-2 p-4 border-b"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <BookOpen size={20} style={{ color: 'hsl(var(--primary))' }} />
        <span className="text-lg font-bold tracking-wide" style={{ color: 'hsl(var(--foreground))' }}>
          Chronicler
        </span>
      </div>

      {/* Campaign selector */}
      <div
        className="px-2 py-2 border-b relative"
        style={{ borderColor: 'hsl(var(--border))' }}
        ref={dropdownRef}
      >
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
        >
          <span className="truncate font-medium">
            {activeCampaign ? activeCampaign.name : 'No campaign selected'}
          </span>
          <ChevronDown
            size={14}
            className={cn('flex-shrink-0 ml-1 transition-transform', dropdownOpen && 'rotate-180')}
          />
        </button>

        {dropdownOpen && (
          <div
            className="absolute left-2 right-2 top-full mt-1 z-40 rounded-md border shadow-lg overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
          >
            {campaigns.length === 0 && (
              <p className="px-3 py-2 text-xs italic" style={{ color: 'hsl(var(--muted-foreground))' }}>
                No campaigns yet
              </p>
            )}
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center">
                {confirmDeleteId === c.id ? (
                  <div className="w-full flex items-center justify-between px-3 py-2 text-xs gap-2" style={{ color: 'hsl(var(--foreground))' }}>
                    <span className="truncate">Delete &quot;{c.name}&quot;?</span>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={async () => {
                          await removeCascade(c.id)
                          setConfirmDeleteId(null)
                          if (campaigns.length <= 1) setDropdownOpen(false)
                        }}
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-80"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setActiveCampaign(c.id)
                        setDropdownOpen(false)
                      }}
                      className="flex-1 flex items-center justify-between px-3 py-2 text-sm text-left hover:opacity-80 transition-opacity"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      <span className="truncate">{c.name}</span>
                      {c.id === activeCampaignId && (
                        <Check size={13} style={{ color: 'hsl(var(--primary))' }} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDeleteId(c.id)
                      }}
                      className="px-2 py-2 hover:opacity-80 transition-opacity flex-shrink-0"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                      title="Delete campaign"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
            <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }} />
            <button
              onClick={() => {
                setDropdownOpen(false)
                setCampaignModalOpen(true)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:opacity-80 transition-opacity"
              style={{ color: 'hsl(var(--primary))' }}
            >
              <Plus size={13} />
              New Campaign
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive ? 'text-primary-foreground' : 'hover:opacity-80'
              )
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'hsl(var(--primary))' : 'transparent',
              color: isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <CampaignModal isOpen={campaignModalOpen} onClose={() => setCampaignModalOpen(false)} />
    </aside>
  )
}
