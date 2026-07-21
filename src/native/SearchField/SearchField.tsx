import { forwardRef } from 'react'
import { Feather } from '@expo/vector-icons'
import { type TextInput as RNTextInput } from 'react-native'
import { Field, type FieldProps } from '../Field'
import { useTheme } from '../theme'

export interface SearchFieldProps extends Omit<FieldProps, 'error' | 'leading'> {
  /**
   * Required, as on web. A search box with no visible label needs *something*
   * naming it, and web's required `aria-label` is the same requirement wearing
   * the DOM's name for it.
   */
  accessibilityLabel: string
  placeholder: string
}

/**
 * A search input: the standard field box with a magnifier inside it.
 *
 * Web's `type="search"` has no React Native equivalent, so the two differences
 * it implies are set explicitly here rather than inherited from the platform.
 */
export const SearchField = forwardRef<RNTextInput, SearchFieldProps>(
  ({ accessibilityLabel, placeholder, ...props }, ref) => {
    // A prop on the icon rather than a style, so it cannot live in a stylesheet.
    const { colors } = useTheme()

    return (
      <Field
        ref={ref}
        accessibilityLabel={accessibilityLabel}
        placeholder={placeholder}
        // Matching web's `type="search"`: no autocorrect, no leading capital.
        autoCorrect={false}
        autoCapitalize="none"
        leading={<Feather name="search" size={20} color={colors.muted} />}
        {...props}
      />
    )
  },
)
SearchField.displayName = 'SearchField'
