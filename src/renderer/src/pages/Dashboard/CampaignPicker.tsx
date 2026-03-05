import { useState } from 'react'
import { BookOpen, Plus, ChevronDown, Sparkles } from 'lucide-react'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Badge } from '@/components/ListPage'
import { seedExampleCampaign } from '@/lib/seedExampleCampaign'
import type { Campaign } from '@/types'

interface CampaignFormState {
  name: string
  system: string
  setting: string
  description: string
  status: Campaign['status']
}

const emptyForm: CampaignFormState = {
  name: '',
  system: '',
  setting: '',
  description: '',
  status: 'active'
}

function InlineCreateForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const [form, setForm] = useState<CampaignFormState>(emptyForm)
  const add = useCampaignStore((s) => s.add)
  const setActiveCampaign = useUIStore((s) => s.setActiveCampaign)

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
    setActiveCampaign(campaign.id)
    setForm(emptyForm)
    onCreated?.(campaign.id)
  }

  return (
    <div className="space-y-4">
      <Field label="Name *">
        <Input
          autoFocus
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="e.g. Lost Mine of Phandelver"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="System">
          <Input
            value={form.system}
            onChange={(e) => setForm({ ...form, system: e.target.value })}
            placeholder="D&D 5e"
          />
        </Field>
        <Field label="Setting">
          <Input
            value={form.setting}
            onChange={(e) => setForm({ ...form, setting: e.target.value })}
            placeholder="Faerûn"
          />
        </Field>
      </div>
      <Field label="Status">
        <Select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as Campaign['status'] })}
        >
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </Select>
      </Field>
      <Field label="Description">
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of the campaign..."
          rows={3}
        />
      </Field>
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!form.name.trim()}
          className="px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))'
          }}
        >
          Create Campaign
        </button>
      </div>
    </div>
  )
}

interface Props {
  campaigns: Campaign[]
}

export default function CampaignPicker({ campaigns }: Props) {
  const setActiveCampaign = useUIStore((s) => s.setActiveCampaign)
  const [showCreateForm, setShowCreateForm] = useState(campaigns.length === 0)
  const [seeding, setSeeding] = useState(false)

  const handleGenerateExample = async () => {
    setSeeding(true)
    try {
      await seedExampleCampaign()
    } finally {
      setSeeding(false)
    }
  }

  if (campaigns.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-16 space-y-8">
        <div className="text-center space-y-3">
          <BookOpen
            size={48}
            className="mx-auto"
            style={{ color: 'hsl(var(--primary))' }}
          />
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Welcome to Chronicler
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Start by creating your first campaign.
          </p>
        </div>
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        >
          <InlineCreateForm />
        </div>

        <div className="flex items-center gap-3 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          <div className="flex-1 h-px" style={{ backgroundColor: 'hsl(var(--border))' }} />
          or
          <div className="flex-1 h-px" style={{ backgroundColor: 'hsl(var(--border))' }} />
        </div>

        <button
          onClick={handleGenerateExample}
          disabled={seeding}
          className="w-full py-2.5 rounded-lg border text-sm font-medium hover:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
        >
          <Sparkles size={14} />
          {seeding ? 'Generating...' : 'Try an example D&D 5e campaign'}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          Select a Campaign
        </h1>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Choose a campaign to view its dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {campaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCampaign(c.id)}
            className="rounded-lg border p-4 text-left hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-sm font-semibold truncate"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {c.name}
              </h3>
              <Badge>{c.status}</Badge>
            </div>
            {(c.system || c.setting) && (
              <p
                className="text-xs mt-1 truncate"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {[c.system, c.setting].filter(Boolean).join(' · ')}
              </p>
            )}
            {c.description && (
              <p
                className="text-xs mt-1.5 line-clamp-2"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {c.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Collapsible create form */}
      <div
        className="rounded-lg border"
        style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
      >
        <button
          onClick={() => setShowCreateForm((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: 'hsl(var(--primary))' }}
        >
          <span className="flex items-center gap-2">
            <Plus size={14} />
            Create new campaign
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform ${showCreateForm ? 'rotate-180' : ''}`}
          />
        </button>
        {showCreateForm && (
          <div className="px-4 pb-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="pt-4">
              <InlineCreateForm />
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={handleGenerateExample}
          disabled={seeding}
          className="text-xs hover:underline disabled:opacity-40 inline-flex items-center gap-1"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <Sparkles size={12} />
          {seeding ? 'Generating...' : 'Generate example campaign'}
        </button>
      </div>
    </div>
  )
}
