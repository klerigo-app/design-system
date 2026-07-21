import { type ReactElement } from 'react'
import { Feather } from '@expo/vector-icons'
import {
  Pressable,
  Text as RNText,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { radiusValue } from '../../tokens/tokens'
import { fontFamily } from '../fonts'
import { createThemedStyles, useThemedStyles } from '../theme'

export type AnswerOptionStatus = 'default' | 'selected' | 'correct' | 'wrong'

export interface AnswerOptionProps extends Omit<PressableProps, 'children' | 'style'> {
  status?: AnswerOptionStatus
  /** Option text. A string rather than children, as on ButtonBase and Chip. */
  label: string
  onSelect?: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * One choice in an exercise: tappable, with the four states the renderer drives.
 *
 * The only gamified component mobile needs. The rest of that family
 * (LessonCard, QuizCard, ProgressRing, …) is not mirrored, because the web app
 * imports none of it — it is EspañoLenka-era design that the product built past.
 *
 * Web's `default` state carries hover styling; there is no touch equivalent and
 * it is dropped rather than approximated with a press state, which would fire
 * on the way to selecting and read as a flicker.
 */
export function AnswerOption({
  status = 'default',
  label,
  onSelect,
  style,
  ...props
}: AnswerOptionProps): ReactElement {
  const styles = useThemedStyles(themedStyles)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: status === 'selected' }}
      onPress={onSelect}
      style={[styles.base, styles[status], style]}
      {...props}
    >
      <RNText style={styles.label}>{label}</RNText>
      {status === 'selected' ? <View style={styles.dot} /> : null}
      {status === 'correct' ? (
        <View style={[styles.badge, styles.badgeCorrect]}>
          <Feather name="check" size={16} color="#FFFFFF" />
        </View>
      ) : null}
      {status === 'wrong' ? (
        <View style={[styles.badge, styles.badgeWrong]}>
          <Feather name="x" size={16} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  )
}

// rounded-[14px] border-2 px-[15px] py-[14px], from web's AnswerOption.
const themedStyles = createThemedStyles((theme) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  default: {
    borderColor: theme.colors.borderInput,
    backgroundColor: theme.colors.surfaceRaised,
  },
  selected: {
    borderColor: theme.colors.teal[500],
    backgroundColor: theme.colors.surfaceSelected,
  },
  correct: { borderColor: theme.colors.success, backgroundColor: theme.colors.successTint },
  wrong: { borderColor: theme.colors.errorBorder, backgroundColor: theme.colors.errorTint },

  // `flexShrink: 1` so a long option wraps rather than shoving the badge out.
  label: { flexShrink: 1, fontFamily: fontFamily.body, fontSize: 16, color: theme.colors.ink },

  dot: {
    height: 12,
    width: 12,
    flexShrink: 0,
    borderRadius: radiusValue.pill,
    backgroundColor: theme.colors.teal[500],
  },
  badge: {
    height: 24,
    width: 24,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusValue.pill,
  },
  badgeCorrect: { backgroundColor: theme.colors.success },
  badgeWrong: { backgroundColor: theme.colors.error },
}))
