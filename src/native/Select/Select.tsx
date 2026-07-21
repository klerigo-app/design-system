import { useState, type ReactElement } from 'react'
import { View, type ViewProps } from 'react-native'
import { FieldLabel, FieldMessage } from '../internal/fieldParts'
import { OptionRow, OptionSheet, OptionSheetTrigger } from '../internal/optionSheet'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends ViewProps {
  label: string
  options: SelectOption[]
  value: string
  /** As on the other controls: the next value, since RN has no change event. */
  onChange: (value: string) => void
  /**
   * Shown when nothing is selected. Required, with no default — the same call
   * #9 made for Modal's button labels. Both apps run Lingui, so any string this
   * package invented would be untranslated copy that extraction cannot see.
   */
  placeholder: string
  error?: string
}

/**
 * A labelled single-choice field.
 *
 * Not a port: React Native has no `<select>`. Tapping the control opens a
 * bottom sheet (see internal/optionSheet for why that shape); choosing a row
 * commits and closes, so there is no separate confirm step for one value.
 *
 * Web's required `id` is absent for the reason `TextInput` documents.
 *
 * See internal/optionSheet for one caveat: nesting this inside `Modal` is
 * modal-in-modal and is unverified on a device.
 */
export function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  style,
  ...props
}: SelectProps): ReactElement {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <View style={style} {...props}>
      <FieldLabel>{label}</FieldLabel>
      <OptionSheetTrigger
        accessibilityLabel={label}
        text={selected?.label ?? placeholder}
        isPlaceholder={!selected}
        open={open}
        error={Boolean(error)}
        onPress={() => setOpen(true)}
      />
      <OptionSheet open={open} onClose={() => setOpen(false)} title={label}>
        {options.map((option) => (
          <OptionRow
            key={option.value}
            label={option.label}
            selected={option.value === value}
            onPress={() => {
              onChange(option.value)
              setOpen(false)
            }}
          />
        ))}
      </OptionSheet>
      {/* React Native has no aria-invalid and no `invalid` in
          accessibilityState, so an error can only be announced as text. */}
      {error ? <FieldMessage tone="error">{error}</FieldMessage> : null}
    </View>
  )
}
