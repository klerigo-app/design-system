import { useEffect, useState, type ReactElement } from 'react'
import { Animated, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import { radiusValue } from '../../tokens/tokens'
import { ControlRow } from '../internal/controlRow'
import { createThemedStyles, useTheme, useThemedStyles } from '../theme'

export interface ToggleProps extends Omit<
  PressableProps,
  'children' | 'style' | 'onPress' | 'disabled'
> {
  label: string
  checked: boolean
  /** As on Checkbox: the value being moved to, since RN has no change event. */
  onChange: (checked: boolean) => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

/** Track 48x28 with a 22pt knob inset 3pt, matching web's Toggle exactly. */
const TRACK_WIDTH = 48
const TRACK_HEIGHT = 28
const KNOB_SIZE = 22
const KNOB_INSET = 3
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2

/**
 * A labelled on/off switch.
 *
 * Hand-built rather than wrapping React Native's `Switch`. `Switch` hands the
 * drawing to the OS, which renders 51x31 on iOS and a Material thumb with its
 * own ripple on Android — three appearances for one component, sitting next to
 * a Checkbox that matches web to the pixel. The tokens and geometry here are
 * web's, so the two platforms and the two controls all agree.
 *
 * `accessibilityRole="switch"` on the row (see ControlRow) is what keeps the
 * screen-reader affordance the platform control would have given for free.
 */
export function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  style,
  ...props
}: ToggleProps): ReactElement {
  const styles = useThemedStyles(themedStyles)
  const { colors } = useTheme()
  // `left` rather than a transform, matching web — though for a different
  // reason: web avoids translate because of Tailwind's --tw-* composition (#7),
  // while here it simply keeps the knob's position and its travel in one unit.
  // Lazy useState rather than a ref, matching Toast: reading `.current` during
  // render is what the refs lint rule exists to stop.
  const [offset] = useState(() => new Animated.Value(checked ? KNOB_TRAVEL : 0))

  useEffect(() => {
    Animated.timing(offset, {
      toValue: checked ? KNOB_TRAVEL : 0,
      duration: 150,
      // `left` is a layout property, which the native driver cannot animate.
      useNativeDriver: false,
    }).start()
  }, [checked, offset])

  const trackColor = disabled ? colors.disabledBg : checked ? colors.teal[500] : colors.borderInput

  return (
    <ControlRow
      controlRole="switch"
      label={label}
      checked={checked}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={style}
      {...props}
    >
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.knob, disabled && styles.knobDisabled, { left: offset }]} />
      </View>
    </ControlRow>
  )
}

const themedStyles = createThemedStyles((theme) => ({
  track: {
    height: TRACK_HEIGHT,
    width: TRACK_WIDTH,
    flexShrink: 0,
    borderRadius: radiusValue.pill,
    justifyContent: 'center',
  },
  /**
   * White knob on both schemes and both states: it sits on a saturated teal or
   * a neutral track, neither of which flips underneath it, so this is the same
   * sanctioned literal the buttons use for their labels.
   */
  knob: {
    position: 'absolute',
    top: KNOB_INSET,
    marginLeft: KNOB_INSET,
    height: KNOB_SIZE,
    width: KNOB_SIZE,
    borderRadius: radiusValue.pill,
    backgroundColor: '#FFFFFF',
    /**
     * Translucent black rather than a token, mirroring web's arbitrary
     * `shadow-[0_1px_3px_rgba(0,0,0,0.2)]`. Not a palette colour and not a
     * candidate to become one: at 20% alpha it reads as a shadow over both the
     * teal and the neutral track, in both schemes, which is why web never
     * tokenised it either. `theme.colors.scrim` is the near miss to avoid — it
     * is fully opaque and would paint a solid blob.
     */
    boxShadow: [
      { offsetX: 0, offsetY: 1, blurRadius: 3, spreadDistance: 0, color: 'rgba(0, 0, 0, 0.2)' },
    ],
  },
  knobDisabled: { backgroundColor: theme.colors.disabledText },
}))
