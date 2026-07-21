# @klerigo/design-system

React + TypeScript component library implementing the Klerigo brand and design system.
Source spec: `klerigo_design_system/README.md`. Design/plan history:
`docs/superpowers/specs/` and `docs/superpowers/plans/`.

## Install

    pnpm add @klerigo/design-system

## Usage

Import the token and font stylesheets once, at your app's entry point:

    import '@klerigo/design-system/tokens.css'
    import '@klerigo/design-system/fonts.css'

Note: `fonts.css` contains bare-specifier `@import '@fontsource/...'` statements that
must be resolved against `node_modules` by your app's own bundler. This works with
Vite, webpack, Next.js, and Parcel, but will NOT work if you load it via a plain
static `<link>` tag with no build step.

Then use components:

    import { Button, Card, Chip } from '@klerigo/design-system'

    function Example() {
      return (
        <Card variant="elevated">
          <Chip variant="level">A2 · Elemental</Chip>
          <Button variant="primary">Reservar clase</Button>
        </Card>
      )
    }

### Tailwind setup in consuming apps

Do NOT copy the theme block into your app's Tailwind config. Use the shared
preset — it is the single source of truth mapping the design tokens to
Tailwind utilities (`bg-coral-500`, `rounded-card`, `shadow-lift-coral`, …):

    // tailwind.config.js
    import klerigoPreset from '@klerigo/design-system/tailwind-preset'

    export default {
      presets: [klerigoPreset],
      content: [
        './src/**/*.{ts,tsx}',
        './node_modules/@klerigo/design-system/dist/**/*.js',
      ],
    }

### React Native / Expo apps

React Native can't import the main entry (it starts with `import './tokens.css'`,
a DOM-only side effect that breaks Metro). Use the dedicated subpaths instead:

    // Tokens only — side-effect-free, safe in Metro and in a CJS tailwind.config.js
    import { getPalette, radiusValue } from '@klerigo/design-system/tokens'

    // Shared RN components (StyleSheet-based, driven by the tokens above)
    import { Screen, Heading, Text, Field, PrimaryButton } from '@klerigo/design-system/native'

`@klerigo/design-system/tokens` is the single source of truth for the
palette and radius scale — apps must import it rather than hand-copying hex
values into `theme/tokens.ts` or `tailwind.config.js`.

#### Dark mode

There is no standing `colors` export. A palette is always requested for a
scheme, because a module-scope one is how every component in this package ended
up frozen in light mode. Wrap the app once:

    import { ThemeProvider } from '@klerigo/design-system/native'

    <ThemeProvider>          {/* follows the OS */}
      <App />
    </ThemeProvider>

`<ThemeProvider scheme="dark">` forces a scheme and wins over the OS in both
directions, mirroring `data-theme` on the web. Components throw without a
provider rather than falling back to light.

Two things the app owns:

- **`userInterfaceStyle: "automatic"` in `app.json`.** While it is `"light"`,
  React Native's `useColorScheme()` returns `'light'` no matter what the OS
  says, and dark mode will look broken-on-arrival. On a prebuilt `android/`
  project this is a native-config regeneration, not a JS change.
- **Persistence, if a theme toggle is wanted.** Reading a stored preference is
  async, so it belongs behind the app's splash gate next to the locale read —
  restore the value there and pass it in as `scheme`. This package deliberately
  has no storage dependency.

Styling your own screens:

    const styles = createThemedStyles((palette) => ({
      card: { backgroundColor: palette.surfaceRaised, borderColor: palette.border },
    }))

    function Card() {
      const s = useThemedStyles(styles)
      return <View style={s.card} />
    }

Never call `StyleSheet.create` with a colour at module scope — that is exactly
the bug. Geometry (`radiusValue`, spacing, font sizes) does not flip and can
stay wherever it is convenient.

#### NativeWind

App screens styled with `className` are a **second, independent** theming
mechanism: they resolve through the app's `tailwind.config.js` at build time
and know nothing about `ThemeProvider`. Left alone, they stay light while the
design-system components go dark, on the same screen.

Drive both from one value. Build the Tailwind theme from
`getPalette('light')` / `getPalette('dark')` under NativeWind's `dark:`
variant, and pass the same scheme to `ThemeProvider` that you hand NativeWind's
`colorScheme` — never let the two decide independently.

### Styling conventions

- **Check here first.** Before styling something in an app, look for an
  existing component or variant (Storybook: `pnpm dev`). Typography goes
  through `Heading` / `Text`, not hand-typed `font-display …` stacks.
- **Rule of three.** The third time you type the same combination of classes,
  extract it — as a component variant here if it's part of the design
  language, or as a local component in the app if it's app-specific.
- **No raw hex colors in classes.** `text-[#3A454F]`-style arbitrary values
  bypass the tokens; add a CSS variable to `src/tokens/tokens.css` and map it
  in `tailwind-preset.js` instead (ESLint warns on this).
- **Merge classes with `cn`** (exported from this package). It is
  Tailwind-aware, so a consumer's `className` cleanly overrides component
  defaults — never use `!important` to fight a component's styles.

## Development

    pnpm install
    pnpm dev             # Storybook at http://localhost:6006
    pnpm test             # Vitest
    pnpm lint
    pnpm build            # Vite library build -> dist/
    pnpm build-storybook   # static Storybook site
