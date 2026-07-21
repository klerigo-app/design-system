import { forwardRef } from 'react'
import { View, type TextInput as RNTextInput } from 'react-native'
import { Field, type FieldProps } from './Field'
import { FieldLabel, FieldMessage } from './fieldParts'

export interface TextInputProps extends Omit<FieldProps, 'error'> {
  label: string
  /** Invalid-state message. Replaces `helper` when both are set, as on web. */
  error?: string
  helper?: string
}

/**
 * A labelled text field: label, control, and one of error/helper.
 *
 * Named to match web's `TextInput` even though it shadows React Native's own —
 * `Field.tsx` already handles that collision with an import alias, and matching
 * web's name is worth more than avoiding it.
 *
 * Accessibility deliberately diverges from web here, and it is the one place in
 * this package that does. Web wires label and message through `id` +
 * `htmlFor` + `aria-describedby`. React Native's nearest equivalent,
 * `accessibilityLabelledBy`, is Android-only, so a required `id` would be
 * ceremony every call site pays for and iOS ignores. Instead the control
 * carries the label directly, and the error is appended to the hint — RN has no
 * `aria-invalid` and no `invalid` in `accessibilityState`, so an error can only
 * be announced as text, not flagged as a state.
 */
export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({ label, error, helper, accessibilityHint, ...props }, ref) => {
    const message = error ?? helper
    const hint = [accessibilityHint, error].filter(Boolean).join('. ') || undefined

    return (
      <View>
        <FieldLabel>{label}</FieldLabel>
        <Field
          ref={ref}
          error={Boolean(error)}
          accessibilityLabel={label}
          accessibilityHint={hint}
          {...props}
        />
        {message ? <FieldMessage tone={error ? 'error' : 'helper'}>{message}</FieldMessage> : null}
      </View>
    )
  },
)
TextInput.displayName = 'TextInput'
