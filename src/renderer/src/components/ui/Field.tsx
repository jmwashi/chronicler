// Shared form field primitives used across all entity forms

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2 rounded-md text-sm border bg-transparent outline-none focus:ring-1 focus:ring-offset-0'

const inputStyle = {
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--foreground))'
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={inputClass}
      style={{ ...inputStyle, ...props.style }}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={inputClass}
      style={{ ...inputStyle, ...props.style }}
    />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputClass} resize-none`}
      style={{ ...inputStyle, ...props.style }}
    />
  )
}

export function FormActions({
  onCancel,
  onSave,
  saveLabel = 'Save',
  disabled
}: {
  onCancel: () => void
  onSave: () => void
  saveLabel?: string
  disabled?: boolean
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-1.5 rounded-md text-sm hover:opacity-70 transition-opacity"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 hover:opacity-80 transition-opacity"
        style={{
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))'
        }}
      >
        {saveLabel}
      </button>
    </div>
  )
}
