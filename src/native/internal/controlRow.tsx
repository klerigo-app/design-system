import { type ReactElement, type ReactNode } from 'react'
import {
  Pressable,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { fontFamily } from '../fonts'
import { createThemedStyles, useThemedStyles } from '../theme'

/**
 * Control on the left, label text on the right, the whole row tappable — the
 * native counterpart of src/internal/ControlLabel.tsx, shared by Checkbox and
 * Toggle exactly as the web one is shared by Checkbox, Radio and Toggle.
 *
 * Internal: not exported from index.ts.
 *
 * Web gets the tappable label for free from `<label htmlFor>`. React Native has
 * no such association, so the row itself is the Pressable and the control
 * inside it is inert — which is also why the accessibility role and state live
 * out here rather than on the box the user can see.
 */
export interface ControlRowProps extends Omit<
  PressableProps,
  'children' | 'style' | 'onPress' | 'disabled'
> {
  label: string
  checked: boolean
  disabled?: boolean
  onPress: () => void
  /**
   * Which control this row wraps. Named `controlRole` rather than `role`
   * because React Native's own `PressableProps` already declares a `role`, and
   * a narrower one of the same name is overwritten the moment the remaining
   * props are spread through.
   */
  controlRole: 'checkbox' | 'switch'
  children: ReactNode
  /**
   * Plain style rather than `PressableProps['style']`: that union also admits a
   * `(state) => style` callback, which cannot be composed into the array below.
   */
  style?: StyleProp<ViewStyle>
}

export function ControlRow({
  label,
  checked,
  disabled = false,
  onPress,
  controlRole,
  children,
  style,
  ...props
}: ControlRowProps): ReactElement {
  const styles = useThemedStyles(controlRowStyles)

  return (
    <Pressable
      accessibilityRole={controlRole}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.row, style]}
      {...props}
    >
      {children}
      <RNText style={[styles.label, disabled && styles.labelDisabled]}>{label}</RNText>
    </Pressable>
  )
}

const controlRowStyles = createThemedStyles((theme) => ({
  // gap-2 and text-base text-ink, from web's ControlLabel.
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8 },
  label: { fontFamily: fontFamily.body, fontSize: 16, color: theme.colors.ink },
  /**
   * Web leaves the label at `text-ink` when disabled and greys only the box.
   * Native greys both: without a cursor there is no other signal that the row
   * is inert, and #5's disabled tokens exist precisely to carry that.
   */
  labelDisabled: { color: theme.colors.disabledText },
}))
