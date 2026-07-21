import { type ReactElement } from 'react'
import { Feather } from '@expo/vector-icons'
import { View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import { radiusValue } from '../../tokens/tokens'
import { ControlRow } from '../internal/controlRow'
import { createThemedStyles, useThemedStyles } from '../theme'

export interface CheckboxProps extends Omit<
  PressableProps,
  'children' | 'style' | 'onPress' | 'disabled'
> {
  label: string
  checked: boolean
  /**
   * Web takes a change event here; React Native has none, so this receives the
   * value the control is moving to.
   */
  onChange: (checked: boolean) => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * A labelled checkbox. Also the row `MultiSelect`'s option sheet is built from.
 *
 * Web's required `id` is absent: it exists there to tie `<label htmlFor>` to the
 * input, and React Native's nearest equivalent (`accessibilityLabelledBy`) is
 * Android-only — the same trade `TextInput` documents. The label is carried on
 * the pressable row instead.
 */
export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  style,
  ...props
}: CheckboxProps): ReactElement {
  const styles = useThemedStyles(themedStyles)

  return (
    <ControlRow
      controlRole="checkbox"
      label={label}
      checked={checked}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={style}
      {...props}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          disabled && styles.boxDisabled,
          checked && disabled && styles.boxCheckedDisabled,
        ]}
      >
        {/* Rendered only when checked, rather than web's always-present icon at
            opacity 0: there is no peer-checked selector to drive here, and an
            invisible glyph would still be read out by a screen reader. */}
        {checked ? <Feather name="check" size={16} color="#FFFFFF" /> : null}
      </View>
    </ControlRow>
  )
}

const themedStyles = createThemedStyles((theme) => ({
  // h-6 w-6 rounded-sm border-2, from web's Checkbox.
  box: {
    height: 24,
    width: 24,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusValue.sm,
    borderWidth: 2,
    borderColor: theme.colors.borderInput,
  },
  boxChecked: {
    borderColor: theme.colors.coral[500],
    backgroundColor: theme.colors.coral[500],
  },
  /**
   * Tokens rather than opacity. #5 moved the web Checkbox off `opacity-50` onto
   * these two for a reason that applies harder here: an opacity-dimmed control
   * reads differently over the light paper and the dark one, and native now has
   * both.
   */
  boxDisabled: {
    borderColor: theme.colors.disabledText,
    backgroundColor: theme.colors.disabledBg,
  },
  boxCheckedDisabled: {
    borderColor: theme.colors.disabledText,
    backgroundColor: theme.colors.disabledText,
  },
}))
