/**
 * Metro resolves a `require()` of a .ttf to an opaque asset handle (a number on
 * Android/iOS, an object under some bundlers), so the value type is
 * deliberately loose. What matters to callers is the key set.
 */
export declare const klerigoFonts: Record<KlerigoFontFamily, unknown>

/** Every family name registered by `klerigoFonts`, and accepted by `fontFamily`. */
export type KlerigoFontFamily =
  | 'Baloo2-Regular'
  | 'Baloo2-Medium'
  | 'Baloo2-SemiBold'
  | 'Baloo2-Bold'
  | 'DMSans-Regular'
  | 'DMSans-Medium'
  | 'DMSans-SemiBold'
  | 'DMSans-Bold'
  | 'DMMono-Regular'
  | 'DMMono-Medium'
