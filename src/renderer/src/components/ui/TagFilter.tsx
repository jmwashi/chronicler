import { useTagStore } from '@/store/tagStore'

interface Props {
  availableTagIds: string[]
  selectedTagIds: string[]
  onChange: (ids: string[]) => void
}

export function TagFilter({ availableTagIds, selectedTagIds, onChange }: Props) {
  const tags = useTagStore((s) => s.tags)
  const available = availableTagIds
    .map((id) => tags.find((t) => t.id === id))
    .filter(Boolean)
    .sort((a, b) => a!.name.localeCompare(b!.name))

  if (available.length === 0) return null

  const toggle = (id: string) => {
    onChange(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter((t) => t !== id)
        : [...selectedTagIds, id]
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {available.map((tag) => {
        const active = selectedTagIds.includes(tag!.id)
        return (
          <button
            key={tag!.id}
            onClick={() => toggle(tag!.id)}
            className="text-xs px-2.5 py-1 rounded-full font-medium transition-opacity"
            style={{
              backgroundColor: active ? tag!.color : tag!.color + '22',
              color: active ? '#fff' : tag!.color,
              opacity: active ? 1 : 0.85
            }}
          >
            {tag!.name}
          </button>
        )
      })}
      {selectedTagIds.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-xs px-2 py-1 rounded-full hover:opacity-70"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Clear
        </button>
      )}
    </div>
  )
}
