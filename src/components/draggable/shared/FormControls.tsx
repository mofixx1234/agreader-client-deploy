import { type ComponentProps, type ReactNode } from 'react'

type ToggleProps = {
  label: string
  defaultChecked?: boolean
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export function Toggle({ label, defaultChecked, checked, disabled, onChange }: ToggleProps) {
  return (
    <label className="flex items-center gap-4 text-sm text-gray-950">
      <span className="relative inline-flex h-5 w-12 shrink-0 items-center rounded-full border border-gray-300 bg-white shadow-inner">
        <input
          type="checkbox"
          className="peer sr-only"
          defaultChecked={defaultChecked}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span className="absolute inset-0 rounded-full transition peer-checked:bg-gray-950" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-7" />
      </span>
      {label}
    </label>
  )
}

export function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`grid items-start gap-4 text-sm font-semibold text-gray-950 sm:grid-cols-[120px_1fr] ${className}`}>
      <span className="pt-2">{label}:</span>
      {children}
    </label>
  )
}

export function TextInput(props: ComponentProps<'input'>) {
  return (
    <input
      className="min-h-9 rounded-md border border-gray-300 bg-white px-2.5 text-xs font-normal text-gray-950 outline-none focus:border-gray-950"
      {...props}
    />
  )
}

export function TextArea(props: ComponentProps<'textarea'>) {
  return (
    <textarea
      className="min-h-16 resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-950 outline-none focus:border-gray-950"
      {...props}
    />
  )
}

export function SaveCloseFooter({
  onClose,
  onSave,
  disabled,
  isSaving,
}: {
  onClose: () => void
  onSave?: () => void
  disabled?: boolean
  isSaving?: boolean
}) {
  return (
    <>
      <button
        type="button"
        className="min-h-10 min-w-[140px] rounded-md bg-gray-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || isSaving}
        onClick={onSave ?? onClose}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
      <button
        type="button"
        className="min-h-10 min-w-[140px] rounded-md border border-gray-950 bg-white px-6 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-950 hover:text-white"
        onClick={onClose}
      >
        Close
      </button>
    </>
  )
}

export function Tabs({
  tabs,
  active = 0,
  onActiveChange,
}: {
  tabs: string[]
  active?: number
  onActiveChange?: (index: number) => void
}) {
  return (
    <div className="flex gap-8 bg-gray-50 px-8 py-3">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={`min-h-10 rounded-md px-6 text-sm font-medium ${
            index === active ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-700 hover:bg-white/70'
          }`}
          aria-selected={index === active}
          onClick={() => onActiveChange?.(index)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
