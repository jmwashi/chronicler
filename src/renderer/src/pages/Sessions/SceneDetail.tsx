import { useState } from 'react'
import { Pencil, Trash2, Save, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCharacterStore } from '@/store/characterStore'
import { useLocationStore } from '@/store/locationStore'
import { useUIStore } from '@/store/uiStore'
import { MarkdownView } from '@/components/MarkdownView'
import { Badge } from '@/components/ListPage'
import { EntityHoverLink } from '@/components/EntityPreview'
import { Field, Input, Select } from '@/components/ui/Field'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import { EntityChipSelect } from '@/components/ui/EntityChipSelect'
import { Combobox } from '@/components/ui/Combobox'
import type { Scene, SceneStatus } from '@/types'

interface Props {
  scene: Scene
  onUpdate: (scene: Scene) => void
  onRemove: (id: string) => void
}

const statusColor = (status: Scene['status']) => {
  if (status === 'planned') return 'hsl(var(--primary))'
  if (status === 'active') return '#f59e0b'
  if (status === 'completed') return '#10b981'
  return 'hsl(var(--muted-foreground))'
}

export function SceneDetail({ scene, onUpdate, onRemove }: Props) {
  const navigate = useNavigate()
  const incrementNavDepth = useUIStore((s) => s.incrementNavDepth)
  const characters = useCharacterStore((s) => s.characters).filter(
    (c) => c.campaignId === scene.campaignId
  )
  const locations = useLocationStore((s) => s.locations).filter(
    (l) => l.campaignId === scene.campaignId
  )
  const [editing, setEditing] = useState(!scene.description && !scene.dmNotes)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Edit form state
  const [title, setTitle] = useState(scene.title)
  const [status, setStatus] = useState<SceneStatus>(scene.status)
  const [locationId, setLocationId] = useState(scene.locationId)
  const [presentCharacterIds, setPresentCharacterIds] = useState([...scene.presentCharacterIds])
  const [description, setDescription] = useState(scene.description)
  const [dmNotes, setDmNotes] = useState(scene.dmNotes)

  const resetForm = () => {
    setTitle(scene.title)
    setStatus(scene.status)
    setLocationId(scene.locationId)
    setPresentCharacterIds([...scene.presentCharacterIds])
    setDescription(scene.description)
    setDmNotes(scene.dmNotes)
  }

  const handleSave = () => {
    if (!title.trim()) return
    onUpdate({
      ...scene,
      title: title.trim(),
      status,
      locationId,
      presentCharacterIds,
      description,
      dmNotes,
      updatedAt: new Date().toISOString()
    })
    setEditing(false)
  }

  const handleCancel = () => {
    resetForm()
    setEditing(false)
  }

  const location = locations.find((l) => l.id === scene.locationId)
  const presentChars = characters.filter((c) => scene.presentCharacterIds.includes(c.id))

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          {editing ? (
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-bold"
              placeholder="Scene title"
            />
          ) : (
            <h2 className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              {scene.title}
            </h2>
          )}
          {!editing && (
            <div className="flex items-center gap-2 mt-1">
              <Badge>
                <span style={{ color: statusColor(scene.status) }}>{scene.status}</span>
              </Badge>
              {location && (
                <EntityHoverLink
                  kind="location"
                  id={location.id}
                  onClick={() => {
                    incrementNavDepth()
                    navigate(`/locations/${location.id}`)
                  }}
                >
                  <span className="text-xs">{location.name}</span>
                </EntityHoverLink>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium hover:opacity-80 disabled:opacity-40"
                style={{
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))'
                }}
                title="Save changes"
              >
                <Save size={13} /> Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs hover:opacity-70"
                style={{ color: 'hsl(var(--muted-foreground))' }}
                title="Cancel editing"
              >
                <X size={13} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded hover:opacity-70"
                style={{ color: 'hsl(var(--muted-foreground))' }}
                title="Edit scene"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded hover:opacity-70"
                style={{ color: 'hsl(var(--muted-foreground))' }}
                title="Delete scene"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        /* ---- EDIT MODE: Inline form fields ---- */
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value as SceneStatus)}>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped</option>
              </Select>
            </Field>
            <Field label="Location">
              <Combobox
                value={locationId}
                onChange={(val) => setLocationId(val)}
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
                placeholder="Select location..."
              />
            </Field>
          </div>

          <Field label="Present Characters">
            <EntityChipSelect
              selected={presentCharacterIds}
              options={characters.map((c) => ({ id: c.id, name: c.name }))}
              onChange={(ids) => setPresentCharacterIds(ids)}
              placeholder="Add characters..."
            />
          </Field>

          <Field label="Description">
            <WikiTextarea
              campaignId={scene.campaignId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              placeholder="What happens in this scene? Supports [[wikilinks]] and markdown."
            />
          </Field>

          <Field label="DM Notes">
            <WikiTextarea
              campaignId={scene.campaignId}
              value={dmNotes}
              onChange={(e) => setDmNotes(e.target.value)}
              rows={6}
              placeholder="Private notes for this scene..."
            />
          </Field>
        </div>
      ) : (
        /* ---- VIEW MODE: Rendered content ---- */
        <div className="space-y-5">
          {/* Present characters */}
          {presentChars.length > 0 && (
            <div>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Present Characters
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {presentChars.map((c) => (
                  <EntityHoverLink
                    key={c.id}
                    kind="character"
                    id={c.id}
                    onClick={() => {
                      incrementNavDepth()
                      navigate(`/characters/${c.id}`)
                    }}
                  >
                    <span
                      className="inline-flex text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'hsl(var(--primary) / 0.15)' }}
                    >
                      {c.name}
                    </span>
                  </EntityHoverLink>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {scene.description ? (
            <div>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Description
              </h3>
              <div
                className="text-sm cursor-pointer rounded-md p-4 border"
                style={{
                  color: 'hsl(var(--foreground))',
                  borderColor: 'hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))'
                }}
                onClick={() => setEditing(true)}
                title="Click to edit"
              >
                <MarkdownView content={scene.description} />
              </div>
            </div>
          ) : null}

          {/* DM Notes */}
          {scene.dmNotes ? (
            <div>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                DM Notes
              </h3>
              <div
                className="text-sm rounded-md p-4 border cursor-pointer"
                style={{
                  backgroundColor: 'hsl(var(--muted))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
                onClick={() => setEditing(true)}
                title="Click to edit"
              >
                <MarkdownView content={scene.dmNotes} />
              </div>
            </div>
          ) : null}

          {!scene.description && !scene.dmNotes && (
            <div
              className="text-center py-12 rounded-lg border-2 border-dashed cursor-pointer hover:opacity-70"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
              onClick={() => setEditing(true)}
            >
              <p className="text-sm">This scene has no content yet.</p>
              <p className="text-xs mt-1">Click to start editing</p>
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div
          className="mt-6 p-3 rounded-md border flex items-center gap-3"
          style={{ borderColor: 'hsl(var(--destructive))', backgroundColor: 'hsl(var(--muted))' }}
        >
          <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
            Delete this scene?
          </span>
          <button
            onClick={() => onRemove(scene.id)}
            className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-80"
            style={{
              backgroundColor: 'hsl(var(--destructive))',
              color: 'hsl(var(--destructive-foreground))'
            }}
          >
            Yes, delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-2 py-0.5 rounded text-xs hover:opacity-80"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
