import { useEffect, useRef, useState } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'
import { FieldLabel, FieldMessage, fieldControlStyles } from '../../internal/field'
import { Checkbox } from '../Checkbox/Checkbox'
import type { SelectOption } from '../Select/Select'

export interface MultiSelectProps {
  id: string
  label: string
  options: SelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  helperText?: string
  className?: string
}

export function MultiSelect({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecciona opciones',
  helperText,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const helperId = `${id}-helper`

  // Click-outside and Escape both dismiss the panel — same idiom Modal uses
  // for its own keydown effect, added here as a ref+mousedown listener since
  // there's no full-screen overlay to hang an onClick off of.
  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function toggleValue(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    )
  }

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((o) => o.label)
  const triggerLabel = selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder

  return (
    <div className={cn('flex flex-col', className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-describedby={helperText ? helperId : undefined}
          onClick={() => setOpen((isOpen) => !isOpen)}
          className={cn(
            fieldControlStyles(),
            'flex w-full items-center justify-between gap-2 py-3 pl-[14px] pr-3 text-left',
          )}
        >
          <span className={cn('truncate', selectedLabels.length === 0 && 'text-muted')}>
            {triggerLabel}
          </span>
          <CaretDownIcon
            className={cn('h-5 w-5 shrink-0 text-muted transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div
            role="listbox"
            aria-multiselectable="true"
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 flex max-h-[280px] flex-col gap-0.5 overflow-y-auto rounded-md border-[1.5px] border-border-input bg-white p-1.5 shadow-elevated"
          >
            {options.map((option) => (
              <div key={option.value} className="rounded-sm px-2.5 py-2 hover:bg-paper">
                <Checkbox
                  id={`${id}-${option.value}`}
                  label={option.label}
                  checked={value.includes(option.value)}
                  onChange={() => toggleValue(option.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {helperText && (
        <FieldMessage id={helperId} tone="helper">
          {helperText}
        </FieldMessage>
      )}
    </div>
  )
}
