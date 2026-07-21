import { type ReactElement } from 'react'
import { Feather } from '@expo/vector-icons'
import { Text as RNText, View, type ViewProps } from 'react-native'
import { radiusValue } from '../../tokens/tokens'
import { fontFamily } from '../fonts'
import { createThemedStyles, useTheme, useThemedStyles, type Theme } from '../theme'

export type ChipVariant = 'level' | 'category' | 'new' | 'completed' | 'live' | 'dark' | 'outline'

export interface ChipProps extends ViewProps {
  variant: ChipVariant
  /**
   * Chip text. A string rather than `children` for the same reason ButtonBase
   * takes a `label`: React Native needs text inside a `<Text>`, and this
   * component is the thing that knows what colour that text has to be.
   */
  label: string
}

/**
 * Small status/category badge — lesson state, CEFR level, user role.
 *
 * All seven of web's variants, including `live`, which no screen uses yet: they
 * are a colour table, so leaving one out would cost more in explanation than it
 * saves in code.
 */
export function Chip({ variant, label, style, ...props }: ChipProps): ReactElement {
  const styles = useThemedStyles(themedStyles)
  // Colours rather than styles, so they go through useTheme instead of the
  // stylesheet — the same shape Modal uses for its variant badge.
  const { background, foreground, borderColor } = chipColors(useTheme())[variant]

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: background },
        borderColor ? { borderWidth: 1.5, borderColor } : null,
        style,
      ]}
      {...props}
    >
      {variant === 'completed' ? <Feather name="check" size={14} color={foreground} /> : null}
      {variant === 'live' ? <View style={styles.liveDot} /> : null}
      <RNText style={[styles.label, { color: foreground }]}>{label}</RNText>
    </View>
  )
}

/**
 * Colours per variant, resolved through the theme so the tinted backgrounds
 * (`teal-50`, `coral-50`, …) follow the scheme — in dark those 50s are deep
 * backgrounds and the 700s are light text, which is the whole reason this
 * cannot be a module-scope table.
 *
 * `#FFFFFF` on `live` and `dark` is the sanctioned literal: both sit on a
 * saturated fill that does not flip, so the label must not either.
 */
interface ChipColors {
  readonly background: string
  readonly foreground: string
  readonly borderColor?: string
}

const chipColors = (theme: Theme): Record<ChipVariant, ChipColors> => ({
  level: { background: theme.colors.teal[50], foreground: theme.colors.teal[700] },
  category: { background: theme.colors.coral[50], foreground: theme.colors.coral[700] },
  new: { background: theme.colors.sun[50], foreground: theme.colors.sun[700] },
  completed: { background: theme.colors.successTint, foreground: theme.colors.successText },
  live: { background: theme.colors.coral[500], foreground: '#FFFFFF' },
  dark: { background: theme.colors.surfaceInverse, foreground: '#FFFFFF' },
  outline: {
    background: 'transparent',
    foreground: theme.colors.slate,
    borderColor: theme.colors.borderInput,
  },
})

const themedStyles = createThemedStyles(() => ({
  // px-[14px] py-[7px], rounded-pill, from web's Chip base classes.
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderRadius: radiusValue.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  // Family only, no fontWeight — see the note in Text.tsx.
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: 13 },
  liveDot: { height: 6, width: 6, borderRadius: radiusValue.pill, backgroundColor: '#FFFFFF' },
}))
