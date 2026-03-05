import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Eye, Pencil } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useSessionStore } from '@/store/sessionStore'
import { WikiTextarea } from './ui/WikiTextarea'
import { MarkdownView } from './MarkdownView'

export function ScratchPadDrawer() {
  const { scratchPadOpen, toggleScratchPad, activeSessionId } = useUIStore()
  const { sessions, update } = useSessionStore()
  const session = sessions.find((s) => s.id === activeSessionId)

  const [draft, setDraft] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Sync draft when session changes
  useEffect(() => {
    setDraft(session?.scratchPad ?? '')
    setPreviewing(false)
  }, [session?.id])

  // Also sync if the session scratchPad is updated externally
  useEffect(() => {
    if (session && !debounceRef.current) {
      setDraft(session.scratchPad)
    }
  }, [session?.scratchPad])

  const autoSave = useCallback(
    (value: string) => {
      if (!session) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        debounceRef.current = undefined
        await update({
          ...session,
          scratchPad: value,
          updatedAt: new Date().toISOString()
        })
      }, 500)
    },
    [session, update]
  )

  // Cleanup debounce on unmount
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  // Flush pending save when closing
  useEffect(() => {
    if (!scratchPadOpen && debounceRef.current && session) {
      clearTimeout(debounceRef.current)
      debounceRef.current = undefined
      update({
        ...session,
        scratchPad: draft,
        updatedAt: new Date().toISOString()
      })
    }
  }, [scratchPadOpen])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setDraft(value)
    autoSave(value)
  }

  if (!scratchPadOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'hsl(var(--background) / 0.4)' }}
        onClick={toggleScratchPad}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-80 flex flex-col border-l shadow-xl"
        style={{
          backgroundColor: 'hsl(var(--card))',
          borderColor: 'hsl(var(--border))'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div className="min-w-0">
            <h3 className="text-sm font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              Scratch Pad
            </h3>
            {session && (
              <p
                className="text-xs truncate"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {session.title}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {session && draft && (
              <button
                onClick={() => setPreviewing((p) => !p)}
                className="p-1.5 rounded hover:opacity-70"
                style={{ color: 'hsl(var(--muted-foreground))' }}
                title={previewing ? 'Edit' : 'Preview'}
              >
                {previewing ? <Pencil size={14} /> : <Eye size={14} />}
              </button>
            )}
            <button
              onClick={toggleScratchPad}
              className="p-1.5 rounded hover:opacity-70"
              style={{ color: 'hsl(var(--muted-foreground))' }}
              title="Close scratch pad"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {!session ? (
            <div className="flex items-center justify-center h-full">
              <p
                className="text-sm text-center px-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                No active session. Activate a session to use the scratch pad.
              </p>
            </div>
          ) : previewing ? (
            <div
              className="text-sm cursor-pointer"
              style={{ color: 'hsl(var(--foreground))' }}
              onClick={() => setPreviewing(false)}
              title="Click to edit"
            >
              <MarkdownView content={draft} />
            </div>
          ) : (
            <WikiTextarea
              campaignId={session.campaignId}
              value={draft}
              onChange={handleChange}
              rows={30}
              placeholder="Freeform session notes — jot anything down here. Supports markdown and [[wikilinks]]. Auto-saves as you type."
              style={{ minHeight: 'calc(100vh - 120px)' }}
            />
          )}
        </div>
      </div>
    </>
  )
}
