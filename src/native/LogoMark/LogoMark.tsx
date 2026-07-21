import { type ReactElement } from 'react'
import { Circle, Path, Rect, Svg } from 'react-native-svg'
import { LETTER_K_PATH } from '../../components/Logo/glyphPaths'
import { useTheme } from '../theme'

export type LogoMarkVariant = 'coral' | 'knockout' | 'outline'

export interface LogoMarkProps {
  size?: number
  variant?: LogoMarkVariant
  testID?: string
}

/**
 * The Klerigo app icon: rounded tile, Baloo 2 'K', sun dot.
 *
 * The one component here that needs `react-native-svg`. The 'K' is a real glyph
 * outline extracted from the typeface (scripts/extract-glyph-paths.mjs), so it
 * cannot be approximated with a `<Text>` — the metrics would not land in the
 * same place — and the path is imported from the web component's own
 * glyphPaths.ts so the two marks cannot drift.
 *
 * Colours come from the brand-mark tokens, which are theme-invariant: the logo
 * is fixed artwork and a mark that recoloured itself in dark would be a
 * different mark. Note the ink does two jobs — the knockout tile *and* the
 * outline variant's letter, where the other two use the white token.
 */
export function LogoMark({ size = 160, variant = 'coral', testID }: LogoMarkProps): ReactElement {
  const { colors } = useTheme()

  const tileFill: Record<LogoMarkVariant, string> = {
    coral: colors.brandMarkTile,
    knockout: colors.brandMarkInk,
    outline: 'none',
  }
  const letterFill: Record<LogoMarkVariant, string> = {
    coral: colors.brandMarkLetter,
    knockout: colors.brandMarkLetter,
    outline: colors.brandMarkInk,
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      accessibilityRole="image"
      accessibilityLabel="Klerigo"
      testID={testID}
    >
      {variant === 'outline' ? (
        <Rect
          x={4}
          y={4}
          width={504}
          height={504}
          rx={130}
          fill="none"
          stroke={colors.brandMarkInk}
          strokeWidth={8}
        />
      ) : (
        <Rect width={512} height={512} rx={132} fill={tileFill[variant]} />
      )}
      <Path d={LETTER_K_PATH} fill={letterFill[variant]} />
      <Circle cx={382} cy={140} r={30} fill={colors.brandMarkDot} />
    </Svg>
  )
}
