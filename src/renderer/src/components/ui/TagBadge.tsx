import { useTagStore } from '@/store/tagStore'

export function TagBadge({ tagId }: { tagId: string }) {
  const tag = useTagStore((s) => s.tags.find((t) => t.id === tagId))
  if (!tag) return null

  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
      style={{ backgroundColor: tag.color + '22', color: tag.color }}
    >
      {tag.name}
    </span>
  )
}
