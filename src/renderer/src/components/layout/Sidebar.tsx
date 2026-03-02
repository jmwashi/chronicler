import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Clock, StickyNote, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/',           label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/characters', label: 'Characters', icon: Users           },
  { to: '/timeline',   label: 'Timeline',   icon: Clock           },
  { to: '/notes',      label: 'Notes',      icon: StickyNote      }
]

export function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 border-r flex flex-col" style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
      <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <BookOpen size={20} style={{ color: 'hsl(var(--primary))' }} />
        <span className="text-lg font-bold tracking-wide" style={{ color: 'hsl(var(--foreground))' }}>
          Chronicler
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary-foreground'
                  : 'hover:opacity-80'
              )
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'hsl(var(--primary))' : 'transparent',
              color: isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
