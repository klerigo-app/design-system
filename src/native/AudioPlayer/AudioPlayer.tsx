import { useState, type ReactElement } from 'react'
import { Feather } from '@expo/vector-icons'
import {
  Pressable,
  Text as RNText,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native'
import { radiusValue } from '../../tokens/tokens'
import { fontFamily } from '../fonts'
import { createThemedStyles, useThemedStyles } from '../theme'

export interface AudioPlayerProps {
  isPlaying: boolean
  currentTime: number // seconds, elapsed
  duration: number // seconds, total; 0 while unknown/loading
  onTogglePlay: () => void
  onSeek: (time: number) => void // seconds, absolute position to seek to
  label?: string // optional accessible label/caption, e.g. "Audio"
}

/**
 * Seconds to seek to for a tap at `locationX` on a bar `barWidth` wide.
 *
 * Pure and exported so the seek maths is unit-testable directly: under the RN
 * test stub `onPress` fires with no event and `onLayout` never runs, so a tap
 * can never reach this through the component. Deliberately absent from the
 * barrel — it is an implementation detail of the scrubber, not public API.
 */
export function seekTargetForTap(locationX: number, barWidth: number, duration: number): number {
  if (barWidth <= 0 || duration <= 0) return 0
  const ratio = locationX / barWidth
  const clamped = Math.min(1, Math.max(0, ratio))
  return clamped * duration
}

// m:ss, matching web's formatTime. Duplicated rather than shared: web and
// native deliberately do not import each other's sub-component helpers, and RN
// has no monospace brand face, so the read-out here rides fontFamily.body.
function formatTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Headless audio transport for React Native. Mirrors the web AudioPlayer's
 * six-prop contract exactly; the scrubber is tap-to-seek (no gesture-handler
 * dependency): `onLayout` captures the bar width and `onPress` reads the tap's
 * `locationX`.
 */
export function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  label = 'Audio',
}: AudioPlayerProps): ReactElement {
  const styles = useThemedStyles(themedStyles)
  const [barWidth, setBarWidth] = useState(0)

  const pct = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width)
  }
  const onBarPress = (event: GestureResponderEvent) => {
    const locationX = event?.nativeEvent?.locationX
    if (locationX == null || barWidth <= 0 || duration <= 0) return
    onSeek(seekTargetForTap(locationX, barWidth, duration))
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        onPress={onTogglePlay}
        style={styles.toggle}
      >
        <Feather name={isPlaying ? 'pause' : 'play'} size={20} color="#FFFFFF" />
      </Pressable>
      <View style={styles.body}>
        <RNText style={styles.caption}>{label}</RNText>
        <View style={styles.row}>
          <Pressable
            accessibilityRole="adjustable"
            accessibilityLabel={`Seek ${label}`}
            onLayout={onBarLayout}
            onPress={onBarPress}
            style={styles.track}
          >
            <View style={[styles.fill, { width: `${pct * 100}%` }]} />
          </Pressable>
          <RNText style={styles.time}>
            {`${formatTime(currentTime)} / ${formatTime(duration)}`}
          </RNText>
        </View>
      </View>
    </View>
  )
}

// Geometry from web's AudioPlayer: rounded-[14px] border-2 px-[15px], an 11x11
// (44dp) round toggle, a 6dp track. Colours come through the theme so they
// follow the active scheme.
const themedStyles = createThemedStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.borderInput,
    backgroundColor: theme.colors.surfaceRaised,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  toggle: {
    height: 44,
    width: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusValue.pill,
    backgroundColor: theme.colors.teal[500],
  },
  body: { flex: 1, gap: 6 },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: theme.colors.teal[700],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radiusValue.sm,
    backgroundColor: theme.colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radiusValue.sm,
    backgroundColor: theme.colors.teal[500],
  },
  time: {
    flexShrink: 0,
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: theme.colors.slate,
  },
}))
