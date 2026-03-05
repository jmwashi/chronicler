import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Link,
  Minus,
  Table
} from 'lucide-react'

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}

type Action = {
  icon: React.ElementType
  title: string
  action: (text: string, start: number, end: number) => { text: string; cursor: number }
}

function wrapSelection(
  text: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string
): { text: string; cursor: number } {
  const selected = text.slice(start, end)
  const content = selected || placeholder
  const newText = text.slice(0, start) + before + content + after + text.slice(end)
  const cursor = selected
    ? start + before.length + content.length + after.length
    : start + before.length + content.length
  return { text: newText, cursor }
}

function prefixLine(
  text: string,
  start: number,
  _end: number,
  prefix: string
): { text: string; cursor: number } {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const newText = text.slice(0, lineStart) + prefix + text.slice(lineStart)
  return { text: newText, cursor: start + prefix.length }
}

function insertAtCursor(
  text: string,
  start: number,
  _end: number,
  insert: string
): { text: string; cursor: number } {
  const newText = text.slice(0, start) + insert + text.slice(start)
  return { text: newText, cursor: start + insert.length }
}

const actions: Action[] = [
  {
    icon: Bold,
    title: 'Bold',
    action: (t, s, e) => wrapSelection(t, s, e, '**', '**', 'bold text')
  },
  {
    icon: Italic,
    title: 'Italic',
    action: (t, s, e) => wrapSelection(t, s, e, '*', '*', 'italic text')
  },
  {
    icon: Strikethrough,
    title: 'Strikethrough',
    action: (t, s, e) => wrapSelection(t, s, e, '~~', '~~', 'strikethrough')
  },
  { icon: Heading1, title: 'Heading 1', action: (t, s, e) => prefixLine(t, s, e, '# ') },
  { icon: Heading2, title: 'Heading 2', action: (t, s, e) => prefixLine(t, s, e, '## ') },
  { icon: Heading3, title: 'Heading 3', action: (t, s, e) => prefixLine(t, s, e, '### ') },
  { icon: List, title: 'Bullet list', action: (t, s, e) => prefixLine(t, s, e, '- ') },
  { icon: ListOrdered, title: 'Numbered list', action: (t, s, e) => prefixLine(t, s, e, '1. ') },
  {
    icon: CheckSquare,
    title: 'Checklist',
    action: (t, s, e) => prefixLine(t, s, e, '- [ ] ')
  },
  { icon: Quote, title: 'Blockquote', action: (t, s, e) => prefixLine(t, s, e, '> ') },
  {
    icon: Code,
    title: 'Code',
    action: (t, s, e) => {
      const selected = t.slice(s, e)
      if (selected.includes('\n')) {
        return wrapSelection(t, s, e, '```\n', '\n```', 'code')
      }
      return wrapSelection(t, s, e, '`', '`', 'code')
    }
  },
  {
    icon: Link,
    title: 'Link',
    action: (t, s, e) => {
      const selected = t.slice(s, e)
      if (selected) {
        const newText = t.slice(0, s) + `[${selected}](url)` + t.slice(e)
        return { text: newText, cursor: s + selected.length + 3 }
      }
      const insert = '[link text](url)'
      return insertAtCursor(t, s, e, insert)
    }
  },
  {
    icon: Minus,
    title: 'Horizontal rule',
    action: (t, s, e) => insertAtCursor(t, s, e, '\n---\n')
  },
  {
    icon: Table,
    title: 'Table',
    action: (t, s, e) =>
      insertAtCursor(t, s, e, '\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| cell | cell | cell |\n')
  }
]

// Group indices for visual separator
const separatorAfter = new Set([2, 5, 8, 10])

export function MarkdownToolbar({ textareaRef, value, onChange }: Props) {
  const handleAction = (action: Action) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart ?? 0
    const end = ta.selectionEnd ?? start
    const result = action.action(value, start, end)
    onChange(result.text)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(result.cursor, result.cursor)
    }, 0)
  }

  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1 border-b rounded-t-md flex-wrap"
      style={{
        borderColor: 'hsl(var(--border))',
        backgroundColor: 'hsl(var(--muted))'
      }}
    >
      {actions.map((action, i) => (
        <span key={action.title} className="contents">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault() // prevent textarea losing focus
              handleAction(action)
            }}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: 'hsl(var(--muted-foreground))' }}
            title={action.title}
          >
            <action.icon size={14} />
          </button>
          {separatorAfter.has(i) && (
            <span
              className="w-px h-4 mx-0.5"
              style={{ backgroundColor: 'hsl(var(--border))' }}
            />
          )}
        </span>
      ))}
    </div>
  )
}
