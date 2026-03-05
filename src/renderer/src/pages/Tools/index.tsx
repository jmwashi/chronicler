import { useState } from 'react'
import { ExternalLink, Plus, Trash2, Wrench } from 'lucide-react'
import { useUIStore, type CustomTool } from '@/store/uiStore'

const PRESET_TOOLS = [
  { name: 'Treasure Generator', url: 'https://donjon.bin.sh/5e5/random/#type=treasure', description: 'Random treasure tables by Donjon' },
  { name: 'D&D Beyond', url: 'https://www.dndbeyond.com', description: 'Official digital toolset for D&D 5e' },
  { name: '5e SRD', url: 'https://5e.d20srd.org', description: 'System Reference Document for 5th Edition' },
  { name: 'D&D Wiki', url: 'https://www.dandwiki.com', description: 'Community wiki for homebrew and official content' },
  { name: 'Fantasy Name Generator', url: 'https://www.fantasynamegenerators.com', description: 'Name generators for characters, places, and more' },
  { name: 'Kobold+ Fight Club', url: 'https://koboldplus.club', description: 'Encounter builder and balancing tool' }
]

export default function Tools() {
  const { customTools, addCustomTool, removeCustomTool } = useUIStore()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const save = async () => {
    if (!name.trim() || !url.trim()) return
    let finalUrl = url.trim()
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl
    const tool: CustomTool = { id: crypto.randomUUID(), name: name.trim(), url: finalUrl }
    await addCustomTool(tool)
    setName('')
    setUrl('')
    setAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); save() }
    if (e.key === 'Escape') { setAdding(false); setName(''); setUrl('') }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Tools</h1>
        <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>External resources and in-app utilities</p>
      </div>

      {/* External Tools */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
          External Tools
        </h2>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_TOOLS.map((tool) => (
            <a
              key={tool.url}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:border-transparent"
              style={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}
            >
              <ExternalLink size={14} className="mt-0.5 shrink-0" style={{ color: 'hsl(var(--primary))' }} />
              <div className="min-w-0">
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{tool.name}</span>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{tool.description}</p>
              </div>
            </a>
          ))}

          {customTools.map((tool) => (
            <div
              key={tool.id}
              className="group relative flex items-start gap-3 rounded-lg border px-4 py-3"
              style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
            >
              <ExternalLink size={14} className="mt-0.5 shrink-0" style={{ color: 'hsl(var(--primary))' }} />
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 hover:underline"
              >
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{tool.name}</span>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{tool.url}</p>
              </a>
              <button
                onClick={() => setConfirmDeleteId(tool.id)}
                className="absolute top-2.5 right-2.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-70"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <Trash2 size={13} />
              </button>

              {confirmDeleteId === tool.id && (
                <div
                  className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg"
                  style={{ backgroundColor: 'hsl(var(--card) / 0.95)' }}
                >
                  <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Remove?</span>
                  <button
                    onClick={() => { removeCustomTool(tool.id); setConfirmDeleteId(null) }}
                    className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-80"
                    style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
                  >Yes</button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-2 py-0.5 rounded text-xs hover:opacity-80"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >No</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add custom link */}
        <div className="mt-3">
          {adding ? (
            <div
              className="rounded-lg border p-4"
              style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--primary) / 0.5)' }}
            >
              <div className="flex gap-3 mb-3">
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'hsl(var(--foreground))' }}
                  placeholder="Link name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <input
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'hsl(var(--foreground))' }}
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={save}
                  disabled={!name.trim() || !url.trim()}
                  className="px-3 py-1.5 rounded-md text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                >Add</button>
                <button
                  onClick={() => { setAdding(false); setName(''); setUrl('') }}
                  className="px-3 py-1.5 rounded-md text-xs hover:opacity-80 transition-opacity"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
              style={{ color: 'hsl(var(--primary))' }}
            >
              <Plus size={13} /> Add custom link
            </button>
          )}
        </div>
      </section>

      {/* In-App Tools */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
          In-App Tools
        </h2>
        <div
          className="rounded-lg border px-6 py-8 text-center"
          style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        >
          <Wrench size={24} className="mx-auto mb-2" style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }} />
          <p className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Coming soon!</p>
          <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground) / 0.7)' }}>Built-in utilities for your campaigns</p>
        </div>
      </section>
    </div>
  )
}
