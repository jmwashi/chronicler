// Shared UI primitives for entity list pages

export function NoCampaign() {
  return (
    <div className="py-16 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
      Select or create a campaign in the sidebar to get started.
    </div>
  )
}

export function EmptyList({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
      {message}
    </div>
  )
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0"
      style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
    >
      {children}
    </span>
  )
}
