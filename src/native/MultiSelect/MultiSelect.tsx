import { useState, type ReactElement } from 'react'
import { View, type ViewProps } from 'react-native'
import { PrimaryButton } from '../Button'
import { Checkbox } from '../Checkbox'
import { FieldLabel, FieldMessage } from '../internal/fieldParts'
import { OptionSheet, OptionSheetTrigger } from '../internal/optionSheet'
import type { SelectOption } from '../Select'

export interface MultiSelectProps extends ViewProps {
  label: string
  options: SelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  /** Required, with no default — see the note on `Select`'s placeholder. */
  placeholder: string
  /** Label for the button that dismisses the sheet. Required for the same reason. */
  doneText: string
  helper?: string
}

/**
 * A labelled multi-choice field — tutor role assignment.
 *
 * Same sheet as `Select`, with two differences that follow from picking more
 * than one thing: the rows are `Checkbox`es rather than commit-on-tap rows, and
 * the sheet needs an explicit dismiss, because there is no single choice that
 * means "done".
 */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  doneText,
  helper,
  style,
  ...props
}: MultiSelectProps): ReactElement {
  const [open, setOpen] = useState(false)

  // Ordered by `options` rather than by `value`, so the trigger text does not
  // reshuffle itself as the user ticks boxes in an arbitrary order.
  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)

  const toggle = (optionValue: string) =>
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    )

  return (
    <View style={style} {...props}>
      <FieldLabel>{label}</FieldLabel>
      <OptionSheetTrigger
        accessibilityLabel={label}
        text={selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
        isPlaceholder={selectedLabels.length === 0}
        open={open}
        onPress={() => setOpen(true)}
      />
      <OptionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        footer={<PrimaryButton label={doneText} fullWidth onPress={() => setOpen(false)} />}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={value.includes(option.value)}
            onChange={() => toggle(option.value)}
            style={styles.row}
          />
        ))}
      </OptionSheet>
      {helper ? <FieldMessage tone="helper">{helper}</FieldMessage> : null}
    </View>
  )
}

// Not themed — geometry only, so a plain object rather than a themed sheet.
const styles = { row: { paddingHorizontal: 12, paddingVertical: 10 } } as const
