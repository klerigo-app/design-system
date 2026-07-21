import { forwardRef, useState, type ReactNode } from 'react'
import { TextInput, View, type TextInput as RNTextInput, type TextInputProps } from 'react-native'
import { fieldStyles } from '../internal/fieldParts'
import { useTheme, useThemedStyles } from '../theme'

export interface FieldProps extends TextInputProps {
  /** Draw the control in its invalid state. Set by `TextInput` from its `error` prop. */
  error?: boolean
  /**
   * Adornment before the text, inside the box — `SearchField`'s magnifier.
   *
   * A slot rather than each caller rebuilding the box: the focus and error
   * wiring below is the part worth not duplicating, and an absolutely
   * positioned overlay would have to guess this control's height.
   */
  leading?: ReactNode
}

/**
 * The bare field control — border, background, focus ring and error state, with
 * no label or message.
 *
 * This stays bare on purpose. `TextInput` is the component that assembles a
 * label and a message around it; `Field` is what Modal's type-to-confirm input
 * uses, and what SearchField wraps. Select and MultiSelect do not wrap it —
 * they have no text to type — but their trigger borrows its styles so all four
 * controls draw the same box.
 */
export const Field = forwardRef<RNTextInput, FieldProps>(
  ({ style, error = false, leading, onFocus, onBlur, ...props }, ref) => {
    const styles = useThemedStyles(fieldStyles)
    // placeholderTextColor is a prop, not a style, so it cannot live in the sheet.
    const { colors } = useTheme()
    const [focused, setFocused] = useState(false)

    return (
      // The box is a wrapper rather than the TextInput itself. See fieldStyles:
      // on Android a background change resets a view's padding, so the focus
      // ring and the padding must not live on the same view.
      <View
        style={[
          styles.control,
          // Error wins over focus, as on web: the cva's error branch carries no
          // focus variant, so an invalid field keeps its red ring while focused.
          focused && !error && styles.controlFocused,
          error && styles.controlError,
          leading ? styles.controlWithLeading : null,
          style,
        ]}
      >
        {leading ? <View style={styles.leading}>{leading}</View> : null}
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
          style={[styles.input, leading ? styles.inputWithLeading : null]}
          {...props}
        />
      </View>
    )
  },
)
Field.displayName = 'Field'
