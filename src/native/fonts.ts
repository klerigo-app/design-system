/**
 * The brand font families, by the role each plays.
 *
 * These strings must match the keys `native-fonts/index.js` registers, or React
 * Native falls back to the system font silently — there is no error, no tofu,
 * just slightly wrong type that is easy to look past. `fonts.test.ts` checks
 * these names against the files actually committed in native-fonts/.
 *
 * The design system does not load fonts (see native-fonts/index.js). If a
 * consuming app forgets to register them, every component here renders in the
 * system font. That is what the emulator pass is for.
 *
 * Weights come from the web layer rather than from taste: `font-display` is
 * `font-medium` throughout on web, which is why headings and primary buttons
 * are 500 here and not the 700 native used before fonts existed.
 */
export const fontFamily = {
  /** Headings and every button label — web `font-display font-medium` (500). */
  display: 'Baloo2-Medium',
  /** Body text, muted text, and field control text — web `font-body` (400). */
  body: 'DMSans-Regular',
  /** Field helper and error messages — web `font-medium` (field.tsx:31). */
  bodyMedium: 'DMSans-Medium',
  /** Field labels and Toast link labels — web `font-semibold` (600). */
  bodySemiBold: 'DMSans-SemiBold',
} as const

export type FontFamily = (typeof fontFamily)[keyof typeof fontFamily]
