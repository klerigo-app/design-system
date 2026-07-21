import { type ReactElement } from 'react'
import { Pressable, Text as RNText, View, type ViewProps } from 'react-native'
import { fontFamily } from '../fonts'
import { createThemedStyles, useThemedStyles } from '../theme'

export interface SegmentedControlOption {
  value: string
  label: string
}

export interface SegmentedControlProps extends ViewProps {
  options: SegmentedControlOption[]
  value: string
  onChange: (value: string) => void
}

/**
 * A two-or-three-way switch over one list — calendar day/week/month, or the
 * Upcoming/Past filter on the student Lessons tab.
 *
 * This replaces the copy the student app grew locally while `/native` had none.
 * Note the active segment is coral with a white label, not the raised surface
 * that copy used: the token layer has carried `segmentedTrack` all along with
 * no component behind it, and web is the reference for what sits on it.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  style,
  ...props
}: SegmentedControlProps): ReactElement {
  const styles = useThemedStyles(themedStyles)

  return (
    <View accessibilityRole="tablist" style={[styles.track, style]} {...props}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <RNText style={[styles.label, selected ? styles.labelSelected : styles.labelIdle]}>
              {option.label}
            </RNText>
          </Pressable>
        )
      })}
    </View>
  )
}

// Geometry is web's: a 16-radius track with 3pt padding and a 3pt gap, holding
// 14-radius segments at px-3 py-[6px].
const themedStyles = createThemedStyles((theme) => ({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    borderRadius: 16,
    padding: 3,
    backgroundColor: theme.colors.segmentedTrack,
  },
  segment: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  segmentSelected: { backgroundColor: theme.colors.coral[500] },
  // Family only, no fontWeight — see the note in Text.tsx.
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: 13 },
  // White on coral-500, which is theme-invariant: the sanctioned literal.
  labelSelected: { color: '#FFFFFF' },
  labelIdle: { color: theme.colors.slate },
}))
