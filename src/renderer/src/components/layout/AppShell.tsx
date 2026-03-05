import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ScratchPadDrawer } from '../ScratchPadDrawer'
import { DiceDrawer } from '../DiceDrawer'
import { QuickAddNote } from '../QuickAddNote'
import { useUIStore } from '@/store/uiStore'
import { useTagStore } from '@/store/tagStore'
import { useSessionStore } from '@/store/sessionStore'

export function AppShell() {
  useEffect(() => {
    useUIStore.getState().loadPreferences()
    useTagStore.getState().load()
    useSessionStore.getState().load()

    // One-time migration: clear old notes (schema changed) and init documents
    ;(async () => {
      const prefs = (await window.api.getAll('preferences')) as Record<string, unknown>
      if (!prefs.notesMigrated) {
        await window.api.set('notes', [])
        await window.api.set('documents', [])
        await window.api.set('preferences', { ...prefs, notesMigrated: true })
      }
      if (!prefs.eventsMigratedToLore) {
        await window.api.set('lore', [])
        await window.api.set('preferences', {
          ...(await window.api.getAll('preferences') as Record<string, unknown>),
          eventsMigratedToLore: true
        })
      }
    })()
  }, [])

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ScratchPadDrawer />
      <DiceDrawer />
      <QuickAddNote />
    </div>
  )
}
