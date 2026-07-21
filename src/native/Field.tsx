import { forwardRef, useState } from 'react'
import { TextInput, type TextInput as RNTextInput, type TextInputProps } from 'react-native'
import { fieldStyles } from './fieldParts'
import { useTheme, useThemedStyles } from './theme'

export interface FieldProps extends TextInputProps {
  /** Draw the control in its invalid state. Set by `TextInput` from its `error` prop. */
  error?: boolean
}

/**
 * The bare field control — border, background, focus ring and error state, with
 * no label or message.
 *
 * This stays bare on purpose. `TextInput` is the component that assembles a
 * label and a message around it; `Field` is what Modal's type-to-confirm input
 * uses, and what #10's Select, SearchField and MultiSelect compose.
 */
export const Field = forwardRef<RNTextInput, FieldProps>(
  ({ style, error = false, onFocus, onBlur, ...props }, ref) => {
    const styles = useThemedStyles(fieldStyles)
    // placeholderTextColor is a prop, not a style, so it cannot live in the sheet.
    const { colors } = useTheme()
    const [focused, setFocused] = useState(false)

    return (
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        style={[
          styles.control,
          // Error wins over focus, as on web: the cva's error branch carries no
          // focus variant, so an invalid field keeps its red ring while focused.
          focused && !error && styles.controlFocused,
          error && styles.controlError,
          style,
        ]}
        {...props}
      />
    )
  },
)
Field.displayName = 'Field'
