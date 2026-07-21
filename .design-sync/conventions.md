## Klerigo design system — build conventions

This is a Tailwind-utility design system. There is no theme/context provider to wrap — components style themselves via Tailwind classes generated from a **shared Tailwind preset** (`tailwind-preset.js`), which maps custom design tokens (CSS custom properties in `styles.css`) to Tailwind's color/radius/shadow/font scales. Just link `styles.css` and load `_ds_bundle.js` per the loading snippet below; there is nothing else to set up.

### Styling idiom: real class names, not generic Tailwind

Never invent Tailwind classes (no `bg-blue-500`, `rounded-lg` defaults, etc.) — use this system's actual token-backed utility vocabulary. It exists because the brand palette (coral / sun / teal, on a warm paper background) and shape language (soft, sticker-like radii, "lifted" button shadows) don't map onto stock Tailwind:

| Concern      | Real classes                                                                                                                                                                                                                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand colors | `bg-coral-500` / `text-coral-500` (primary/CTA), `bg-sun-500` (reward/gold), `bg-teal-500` (secondary/success accents) — each has `-50/100/300/500/700/900` steps plus a `-hover` variant (`bg-coral-hover`)                                                                                                                |
| Neutrals     | `bg-paper` (page bg), `bg-surface` (card bg), `bg-surface-raised` (raised card/input/dropdown surface — use instead of `bg-white`), `bg-surface-inverse` (dark hero panels — use instead of `bg-ink`), `bg-scrim` (modal overlay), `border-border`, `text-ink` (headings/body), `text-slate` (secondary text), `text-muted` |
| Semantic     | `bg-success` / `text-success-text` / `bg-success-tint`, `bg-error` / `text-error` / `bg-error-tint`, `text-warning` (pair with `bg-sun-50` tint), `text-info` (pair with `bg-teal-50` tint) — warning/info are text-only tokens, no `bg-warning`/`bg-info` utility exists                                                   |
| Radius       | `rounded-sm                                                                                                                                                                                                                                                                                                                 | md  | lg  | xl  | 2xl`(general),`rounded-pill`(chips/badges/toggles),`rounded-card` (Card component's signature large radius) |
| Shadows      | `shadow-lift-coral` / `shadow-lift-sun` (raised 3D button look) with `shadow-pressed-coral` / `shadow-pressed-sun` for the `:active` press-down state, `shadow-elevated` (Card), `shadow-focus-teal` / `shadow-focus-error` (focus rings)                                                                                   |
| Type         | `font-display` (Baloo 2 — headings, buttons, playful UI), `font-body` (DM Sans — body text), `font-mono` (DM Mono — code/data)                                                                                                                                                                                              |

Compose with `class-variance-authority`-style variant classes the way the components themselves do (e.g. a primary CTA is `bg-coral-500 text-white shadow-lift-coral hover:bg-coral-hover font-display font-medium rounded-lg`) — don't reach for arbitrary hex values or box-shadow values; every color and shadow in this system is a named token.

### Where the truth lives

- `styles.css` — the one stylesheet to link; it `@import`s tokens, fonts, and all compiled component CSS (`_ds_bundle.css`). Read this (or `_ds_bundle.css` directly) before styling anything free-hand, to confirm a class/token actually exists.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage examples and variants.
- `tailwind-preset.js` reference is baked into the class table above — the underlying CSS custom properties (`--color-coral-500`, `--radius-card`, `--shadow-button-lift-coral`, etc.) live in `_ds_bundle.css` if you need the raw token names.

### Example: idiomatic composition

A lesson-completion moment built from real DS parts, following the brand's warm/rounded/lifted idiom for supporting layout:

```jsx
const { Card, Heading, Text, ProgressBar, Button } = window.KlerigoDesignSystem

;<div className="bg-paper p-6 font-body">
  <Card className="mx-auto max-w-sm p-6">
    <Heading size="lg">¡Lección completada!</Heading>
    <Text variant="muted" className="mt-1">
      Sigues sumando racha.
    </Text>
    <ProgressBar value={80} className="mt-4" />
    <Button variant="primary" className="mt-6 w-full">
      Continuar
    </Button>
  </Card>
</div>
```

Layout glue (`p-6`, `max-w-sm`, `mt-4`) uses plain Tailwind spacing utilities — only color/radius/shadow/font need the DS's named tokens.

### Dark mode

Dark mode is **automatic** and requires no dark-specific classes. Every token-backed utility (`bg-paper`, `text-ink`, `bg-surface-raised`, `shadow-elevated`, …) resolves through CSS custom properties that flip in dark, so anything built from the vocabulary above recolours on its own.

Activation follows the OS by default (`prefers-color-scheme`) and honours an explicit theme on the root element: set `data-theme="dark"` (or `data-theme="light"`) on `:root`/`<html>` to force a theme regardless of the OS. The claude.ai/design viewer's theme switch stamps this attribute, so designs preview correctly in both themes with no extra work.

What flips vs. what holds:

- **Surfaces, text, borders, tints** flip: `paper`/`surface`/`surface-raised` go dark, `ink`/`slate`/`label` go light, tints and tracks invert.
- **Brand primaries stay vivid**: `bg-coral-500` / `bg-sun-500` / `bg-teal-500` keep their colour in dark (with `text-white` on them). The `-50` steps become dark tint backgrounds and `-700` steps become light text (e.g. a `bg-teal-50 text-teal-700` chip stays legible in both themes).

To keep new work dark-ready, **never hardcode `bg-white`, `bg-ink`, `text-black`, or arbitrary hex** for surfaces — those do not flip. Use the tokens: `bg-surface-raised` for cards/inputs/dropdowns/toasts/modals, `bg-surface-inverse` for intentionally-dark hero panels, `bg-scrim` for overlays. `text-white` is fine **only** on a saturated brand/semantic fill (e.g. `bg-coral-500`), never on a token surface.

The same applies to **inline `style` gradients**, which Tailwind cannot express: interpolate the custom property (`linear-gradient(90deg, var(--color-teal-500) 50%, var(--color-connector-locked) 50%)`), never a hex or a JS token value. A gradient string is baked at render time, so a literal there freezes that element in light mode — which is how `UnitPath`'s connector and `ProgressRing`'s track were quietly wrong in dark.

### Dark mode on React Native

The `/native` components do not read the CSS layer — React Native cannot — so they resolve colours through a theme context instead. This does not affect web design work; it matters only when a component is mirrored to native.

There is no standing palette export: `getPalette(scheme)` is the only way to get colours, and components declare styles as a function of the theme via `createThemedStyles` + `useThemedStyles`. A colour captured in a module-scope `StyleSheet.create` is frozen at import time and can never flip, which is the bug the whole native theme layer exists to prevent.

`useTheme()` returns `{ colors, shadows }`, so a themed style reads `theme.colors.ink` and `theme.shadows.buttonLiftCoral`. Shadows are structured objects fed to RN's `boxShadow`, not CSS strings, and they are per-scheme like colours — there is no scheme-less `shadows` export, for the same reason there is no scheme-less palette. **`boxShadow` requires the New Architecture**; on the old one it silently draws nothing.

The JS palette and shadow scale in `src/tokens/tokens.ts` mirror every `--color-*`, `--shadow-*` and `--focus-ring-*` token in `tokens.css`, in both themes. **Add tokens to both files** — a cross-file parity test fails the build otherwise.

### Fonts on React Native

Native components name their font families explicitly (`src/native/fonts.ts`). If the app does not register the fonts, React Native falls back to the system font **silently** — no error, no tofu, just subtly wrong type. Register them once at startup:

```js
import { useFonts } from 'expo-font'
import { klerigoFonts } from '@klerigo/design-system/native-fonts'

const [loaded] = useFonts(klerigoFonts)
```

The design system takes no dependency on `expo-font`; it ships the files and the family names, and the app decides how to load them.

The TTFs in `native-fonts/` are committed, generated by `scripts/build-fonts.py`, and subset to Latin. If you regenerate them, keep the subset range in that script: the stock Google Fonts `latin` range drops Latin Extended-A, which costs Czech and Slovak 12 of their 20 accented letters, and the comma-below range that Romanian needs sits outside it again. `src/native/fonts.test.ts` checks 14 languages against the committed files.
