import { ChevronLeft, Moon, NotebookPen, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore, type Theme } from '@/store/uiStore'

export function TopBar() {
  const navigate = useNavigate()
  const { theme, setTheme, navigationDepth, decrementNavDepth, activeSessionId, scratchPadOpen, toggleScratchPad } = useUIStore()
  const canGoBack = navigationDepth > 0

  const toggleTheme = (): void => {
    const next: Theme = theme === 'dark' ? 'parchment' : 'dark'
    setTheme(next)
  }

  const handleBack = (): void => {
    if (!canGoBack) return
    decrementNavDepth()
    navigate(-1)
  }

  return (
    <header
      className="h-11 flex items-center justify-between px-4 border-b flex-shrink-0"
      style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
    >
      <button
        onClick={handleBack}
        disabled={!canGoBack}
        className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ color: 'hsl(var(--muted-foreground))' }}
        title="Go back"
      >
        <ChevronLeft size={14} />
        <span>Back</span>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleScratchPad}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: scratchPadOpen ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
          title="Toggle scratch pad"
        >
          <span className="relative">
            <NotebookPen size={14} />
            {activeSessionId && (
              <span
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#10b981' }}
              />
            )}
          </span>
          <span>Scratch Pad</span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          title={theme === 'dark' ? 'Switch to Parchment' : 'Switch to Dark'}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={14} />
              <span>Parchment</span>
            </>
          ) : (
            <>
              <Moon size={14} />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  )
}
