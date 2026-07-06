export const colors = {
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
  paper: '#FFFDF7',
  surface: '#FFF9EE',
  border: '#F0E6D0',
  borderInput: '#E4D9C4',
  muted: '#A79C89',
  slate: '#5C6670',
  ink: '#1F2933',
  success: '#3DAE6B',
  warning: '#F5A623',
  error: '#E23B3B',
  info: '#17A2A2',
  // Locked-state connector line in UnitPath — matches --color-connector-locked.
  connectorLocked: '#E7EFEF',
} as const

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

export const shadows = {
  buttonLiftCoral: '0 4px 0 #C63823',
  buttonLiftSun: '0 4px 0 #D99A18',
  cardElevated: '0 14px 30px -18px rgba(90, 60, 30, 0.45)',
  device: '0 30px 60px -30px rgba(90, 60, 30, 0.5)',
  focusRingTeal: '0 0 0 3px #D6EFEF',
  focusRingError: '0 0 0 3px #FBDCDC',
} as const
