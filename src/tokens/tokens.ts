export type ColorScheme = 'light' | 'dark'

/**
 * The light palette. Mirrors every `--color-*` custom property in the base
 * `:root` block of tokens.css; `src/tokens/tokens.parity.test.ts` fails if the
 * two ever disagree.
 *
 * Not exported: React Native has no way to read the CSS layer, so a palette
 * reachable without naming a scheme is exactly how components end up frozen in
 * light mode. Go through `getPalette`.
 */
const light = {
  coral: {
    50: '#FEECE8',
    100: '#FBC7BC',
    300: '#F79684',
    500: '#F14E3A',
    700: '#C63823',
    900: '#8A2415',
  },
  sun: {
    50: '#FFF6E1',
    100: '#FFE7AE',
    300: '#FFD574',
    500: '#FFC23C',
    700: '#C98A16',
    900: '#8A5C09',
  },
  teal: {
    50: '#E1F3F3',
    100: '#B3E0E0',
    300: '#5CBFBF',
    500: '#17A2A2',
    700: '#0F7373',
    900: '#0A4A4A',
  },

  // Neutrals
  paper: '#FFFDF7',
  surface: '#FFF9EE',
  border: '#F0E6D0',
  borderInput: '#E4D9C4',
  muted: '#A79C89',
  slate: '#5C6670',
  ink: '#1F2933',
  label: '#3A454F',

  // Semantic
  success: '#3DAE6B',
  warning: '#F5A623',
  error: '#E23B3B',
  info: '#17A2A2',

  // Semantic soft-tint backgrounds (status badges, banners)
  successTint: '#EAF6EF',
  errorTint: '#FDECE9',
  successBorder: '#C9E8D5',
  errorBorder: '#F4C7C1',
  successText: '#2E8B54',
  successSubtitle: '#3E7C58',

  // Component surfaces & tracks
  surfaceSelected: '#F3FAFA',
  progressTrack: '#F1E7D2',
  segmentedTrack: '#F3EADB',
  connectorLocked: '#E7EFEF',
  nodeLockedBorder: '#D8CDB6',
  surfaceRaised: '#FFFFFF',
  surfaceInverse: '#1F2933',
  scrim: '#1F2933',

  // Interaction states
  coralHover: '#E0402D',
  sunHover: '#F5B52E',
  errorHover: '#C92F2F',
  disabledBg: '#E9EDEE',
  disabledText: '#A6ADB3',
} as const

export type Palette = {
  readonly [K in keyof typeof light]: (typeof light)[K] extends Record<string, string>
    ? { readonly [S in keyof (typeof light)[K]]: string }
    : string
}

/**
 * The dark palette. Values are the same ones the CSS dark layer declares — see
 * the provenance notes in tokens.css and the 2026-07-14 design spec.
 *
 * Unlike the CSS layer, this is written out in full rather than as a set of
 * overrides: `getPalette('dark').coral[500]` has to answer without the caller
 * knowing that particular token does not flip. Tokens listed in
 * `THEME_INVARIANT` therefore repeat their light value here on purpose, and the
 * parity test asserts exactly that.
 */
const dark = {
  coral: {
    50: '#2C1C17',
    100: '#FBC7BC',
    300: '#F79684',
    500: '#F14E3A',
    700: '#F0A08D',
    900: '#8A2415',
  },
  sun: {
    50: '#2A2213',
    100: '#FFE7AE',
    300: '#FFD574',
    500: '#FFC23C',
    700: '#F0C667',
    900: '#8A5C09',
  },
  teal: {
    50: '#122725',
    100: '#B3E0E0',
    300: '#5CBFBF',
    500: '#17A2A2',
    700: '#63CCCC',
    900: '#0A4A4A',
  },

  // Neutrals
  paper: '#181310',
  surface: '#241D18',
  border: '#39302A',
  borderInput: '#453A32',
  muted: '#8F8578',
  slate: '#B8AD9F',
  ink: '#F4EFE7',
  label: '#DCD3C6',

  // Semantic
  success: '#52C489',
  warning: '#EDB54A',
  error: '#F0806E',
  info: '#4FC4C4',

  // Semantic soft-tint backgrounds
  successTint: '#12251A',
  errorTint: '#2C1715',
  successBorder: '#245C3D',
  errorBorder: '#5A2B26',
  successText: '#79D3A0',
  successSubtitle: '#5FA87F',

  // Component surfaces & tracks
  surfaceSelected: '#2C241D',
  progressTrack: '#39302A',
  segmentedTrack: '#2C241D',
  connectorLocked: '#2B3230',
  nodeLockedBorder: '#4A4234',
  surfaceRaised: '#241D18',
  surfaceInverse: '#2C241D',
  scrim: '#000000',

  // Interaction states
  coralHover: '#FF6A55',
  sunHover: '#FFCE5C',
  errorHover: '#E05548',
  disabledBg: '#2C241D',
  disabledText: '#6E655A',
} as const satisfies Palette

/**
 * The palette for a colour scheme.
 *
 * Web components should not call this — they style through Tailwind utilities
 * and CSS custom properties, which flip on their own. It exists for React
 * Native, which cannot read the CSS layer; there, reach for `useThemedStyles`
 * rather than calling this directly, so styles follow the active theme instead
 * of whichever scheme happened to be read at module scope.
 */
export function getPalette(scheme: ColorScheme): Palette {
  return scheme === 'dark' ? dark : light
}

/**
 * Numeric radius scale (device-independent pixels). This is the source of
 * truth — `radii` (px strings, for CSS) is derived from it. React Native
 * consumers (which need numbers, not "16px") use this directly.
 */
export const radiusValue = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 9999,
  card: 22,
} as const

export const radii = {
  sm: `${radiusValue.sm}px`,
  md: `${radiusValue.md}px`,
  lg: `${radiusValue.lg}px`,
  xl: `${radiusValue.xl}px`,
  '2xl': `${radiusValue['2xl']}px`,
  pill: `${radiusValue.pill}px`,
  card: `${radiusValue.card}px`,
} as const

/**
 * CSS box-shadow strings, light-only. React Native cannot consume these — it
 * needs shadowColor/shadowOffset/shadowRadius/elevation — so a themed native
 * shadow scale is separate, still-unbuilt work.
 */
export const shadows = {
  buttonLiftCoral: '0 4px 0 #C63823',
  buttonLiftSun: '0 4px 0 #D99A18',
  cardElevated: '0 14px 30px -18px rgba(90, 60, 30, 0.45)',
  device: '0 30px 60px -30px rgba(90, 60, 30, 0.5)',
  focusRingTeal: '0 0 0 3px #D6EFEF',
  focusRingError: '0 0 0 3px #FBDCDC',
} as const
