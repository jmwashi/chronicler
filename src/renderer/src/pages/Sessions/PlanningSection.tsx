import { useState } from 'react'
import { ChevronDown, ChevronRight, Eye, Pencil, Trash2, GripVertical } from 'lucide-react'
import { MarkdownView } from '@/components/MarkdownView'
import { WikiTextarea } from '@/components/ui/WikiTextarea'
import type { PlanningSection as PlanningSectionType } from '@/types'

interface Props {
  section: PlanningSectionType
  campaignId: string
  onUpdate: (section: PlanningSectionType) => void
  onRemove: (id: string) => void
}

export function PlanningSection({ section, campaignId, onUpdate, onRemove }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(false)
  const [title, setTitle] = useState(section.title)
  const [content, setContent] = useState(section.content)

  const handleSaveContent = () => {
    onUpdate({ ...section, content })
    setEditing(false)
  }

  const handleSaveTitle = () => {
    if (title.trim()) {
      onUpdate({ ...section, title: title.trim() })
    } else {
      setTitle(section.title)
    }
    setEditTitle(false)
  }

  return (
    <div
      className="rounded-lg border"
      style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-1 px-3 py-2 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <GripVertical
          size={12}
          className="flex-shrink-0 cursor-grab"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          onClick={(e) => e.stopPropagation()}
        />
        {collapsed ? (
          <ChevronRight size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
        ) : (
          <ChevronDown size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
        )}

        {editTitle ? (
          <input
            autoFocus
            className="flex-1 text-sm font-semibold bg-transparent outline-none border-b"
            style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--foreground))' }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle()
              if (e.key === 'Escape') {
                setTitle(section.title)
                setEditTitle(false)
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold"
            style={{ color: 'hsl(var(--foreground))' }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditTitle(true)
            }}
          >
            {section.title}
          </span>
        )}

        <div
          className="flex items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setEditing((e) => !e)}
            className="p-1 rounded hover:opacity-70"
            style={{ color: editing ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
            title={editing ? 'Preview' : 'Edit'}
          >
            {editing ? <Eye size={13} /> : <Pencil size={13} />}
          </button>
          <button
            onClick={() => onRemove(section.id)}
            className="p-1 rounded hover:opacity-70"
            style={{ color: 'hsl(var(--muted-foreground))' }}
            title="Remove section"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="px-3 pb-3">
          {editing ? (
            <div className="space-y-2">
              <WikiTextarea
                campaignId={campaignId}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Write markdown here... Use [[Entity Name]] for wikilinks."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setContent(section.content)
                    setEditing(false)
                  }}
                  className="px-2 py-1 rounded text-xs hover:opacity-70"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContent}
                  className="px-3 py-1 rounded text-xs font-medium hover:opacity-80"
                  style={{
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : section.content ? (
            <div
              className="text-sm cursor-pointer"
              style={{ color: 'hsl(var(--foreground))' }}
              onClick={() => setEditing(true)}
            >
              <MarkdownView content={section.content} />
            </div>
          ) : (
            <p
              className="text-xs italic cursor-pointer py-2"
              style={{ color: 'hsl(var(--muted-foreground))' }}
              onClick={() => setEditing(true)}
            >
              Click to add content...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
