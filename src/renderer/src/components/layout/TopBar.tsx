import { Moon, Sun } from 'lucide-react'
import { useUIStore, type Theme } from '@/store/uiStore'

export function TopBar() {
  const { theme, setTheme } = useUIStore()

  const toggleTheme = (): void => {
    const next: Theme = theme === 'dark' ? 'parchment' : 'dark'
    setTheme(next)
  }

  return (
    <header
      className="h-11 flex items-center justify-end px-4 border-b flex-shrink-0"
      style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
    >
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
    </header>
  )
}
