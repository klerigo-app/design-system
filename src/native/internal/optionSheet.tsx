import { type ReactElement, type ReactNode } from 'react'
import { Feather } from '@expo/vector-icons'
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  Text as RNText,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { radiusValue } from '../../tokens/tokens'
import { fontFamily } from '../fonts'
import { createThemedStyles, useTheme, useThemedStyles } from '../theme'
import { fieldStyles } from './fieldParts'

/**
 * The trigger + slide-up panel shared by `Select` and `MultiSelect`.
 *
 * Internal: not exported from index.ts.
 *
 * Neither component is a port. React Native has no `<select>`, and it has no
 * way for an absolutely positioned panel to escape its parent's bounds, so
 * web's anchored dropdown cannot be reproduced without measuring the trigger
 * and rendering through an overlay anyway. Given an overlay is unavoidable, one
 * bottom sheet serves both, is identical on iOS and Android, and is the idiom a
 * phone user expects.
 *
 * The trigger reuses `fieldStyles.control`, so it is the same box `Field` and
 * `TextInput` draw rather than a lookalike that drifts from them.
 *
 * UNVERIFIED: nesting inside this package's `Modal`. That is also a React
 * Native `Modal`, so a `Select` inside one is modal-in-modal — fragile on both
 * platforms for z-ordering and dismissal, and worst on Android. The test suite
 * cannot speak to it either way: rn-stub renders `Modal` as a plain `<div>`, so
 * a nesting test passes without proving anything. Put it on a device before
 * relying on it.
 */
export interface OptionSheetTriggerProps {
  /** Selected text, or the placeholder when nothing is selected. */
  text: string
  /** Render `text` in the muted placeholder tone. */
  isPlaceholder: boolean
  open: boolean
  error?: boolean
  onPress: () => void
  accessibilityLabel: string
  style?: StyleProp<ViewStyle>
}

export function OptionSheetTrigger({
  text,
  isPlaceholder,
  open,
  error = false,
  onPress,
  accessibilityLabel,
  style,
}: OptionSheetTriggerProps): ReactElement {
  const control = useThemedStyles(fieldStyles)
  const styles = useThemedStyles(sheetStyles)
  const { colors } = useTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ expanded: open }}
      onPress={onPress}
      style={[
        control.control,
        // Error outranks open, matching how the field layer ranks error over
        // focus: an invalid control keeps its red ring while it is being used.
        open && !error && control.controlFocused,
        error && control.controlError,
        styles.trigger,
        style,
      ]}
    >
      <RNText
        numberOfLines={1}
        style={[styles.triggerText, isPlaceholder && { color: colors.muted }]}
      >
        {text}
      </RNText>
      <Feather name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
    </Pressable>
  )
}

export interface OptionSheetProps {
  open: boolean
  onClose: () => void
  /** Shown as the sheet's heading — the field's own label. */
  title: string
  children: ReactNode
  /** Rendered under the options; MultiSelect's Done button. */
  footer?: ReactNode
}

export function OptionSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: OptionSheetProps): ReactElement {
  const styles = useThemedStyles(sheetStyles)

  return (
    <RNModal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Empty onPress claims the touch responder so taps inside the sheet do
            not fall through to the overlay — the same guard Modal uses. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <RNText style={styles.title}>{title}</RNText>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {children}
          </ScrollView>
          {footer}
        </Pressable>
      </Pressable>
    </RNModal>
  )
}

const sheetStyles = createThemedStyles((theme) => ({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerText: {
    flexShrink: 1,
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: theme.colors.ink,
  },

  /** Bottom-anchored, unlike Modal's centred card — same scrim treatment. */
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: `${theme.colors.scrim}99`,
  },
  sheet: {
    gap: 12,
    borderTopLeftRadius: radiusValue['2xl'],
    borderTopRightRadius: radiusValue['2xl'],
    backgroundColor: theme.colors.surfaceRaised,
    paddingTop: 20,
    paddingHorizontal: 20,
    /**
     * 20 of padding plus 34 for the home indicator.
     *
     * A fixed number rather than a real inset: reading one needs
     * react-native-safe-area-context, and this package deliberately carries no
     * dependency on it. 34pt is the iOS indicator height, and on a device
     * without one it reads as generous bottom padding rather than a bug.
     */
    paddingBottom: 54,
    maxHeight: '75%',
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    color: theme.colors.ink,
  },
  list: { flexGrow: 0 },
  listContent: { gap: 4, paddingBottom: 4 },
}))

/** One tappable row in the sheet. Used by `Select`; MultiSelect renders Checkboxes. */
export function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}): ReactElement {
  const styles = useThemedStyles(rowStyles)
  const { colors } = useTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.row, selected && styles.rowSelected]}
    >
      <RNText style={[styles.label, selected && styles.labelSelected]}>{label}</RNText>
      {selected ? <Feather name="check" size={18} color={colors.teal[500]} /> : null}
    </Pressable>
  )
}

const rowStyles = createThemedStyles((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: radiusValue.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  rowSelected: { backgroundColor: theme.colors.surfaceSelected },
  label: { flexShrink: 1, fontFamily: fontFamily.body, fontSize: 16, color: theme.colors.ink },
  labelSelected: { fontFamily: fontFamily.bodySemiBold },
}))
