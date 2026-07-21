# React Native Dark Mode — Design

**Date:** 2026-07-21
**Repo:** `@klerigo/design-system` (branch off `master`)
**Ticket:** [#8](https://github.com/klerigo-app/design-system/issues/8)
**Status:** Approved design — ready for implementation plan

## Problem

`/native` components resolve `colors` at module scope inside `StyleSheet.create`, so
the palette is frozen at import time. And there is no dark palette to freeze _to_:
the dark values exist only as CSS custom properties in `src/tokens/tokens.css`, which
React Native cannot read. Dark mode on RN is not unimplemented — it is unrepresentable.

This blocks every dark-capable mobile screen (klerigo-app/main#196, #200).

### What is actually true today

- `tokens.ts` is **not value-drifted** from `tokens.css` — every shared value matches.
  It is an **incomplete subset**, missing ~20 tokens: `label`, `surface-raised`,
  `surface-inverse`, `scrim`, `success-tint`/`error-tint`/`*-border`/`success-text`,
  `surface-selected`, `progress-track`, `segmented-track`, `node-locked-border`,
  `coral-hover`/`sun-hover`/`error-hover`, `disabled-bg`, `disabled-text`.
  Nothing enforces parity.
- Four **web** components reach into the JS palette for inline gradient strings:
  `ProgressRing`, `StreakCard`, `LessonCard`, `UnitPath`.
  `UnitPath` interpolates `colors.connectorLocked`, whose CSS counterpart
  `--color-connector-locked` **does** flip in dark (`#e7efef` → `#2b3230`) — so that
  connector is a **live dark-mode bug** on web today.
- Both Expo apps declare `"userInterfaceStyle": "light"` in `app.json`.
  RN's `useColorScheme()` therefore returns `'light'` unconditionally; any mechanism
  built here is inert in the apps until that flips. `mobile-student` has a prebuilt
  `android/`, so on Android that is a native-config regeneration, not a JS change.
- `src/native` has **zero tests and zero stories**. `react-native` is a devDependency
  for typechecking only. `import 'react-native'` **fails under Vitest 4** — rolldown
  cannot parse RN's Flow-typed source (verified empirically).
- Both apps use **NativeWind 4.2.6** with `className` for screen layout, building their
  Tailwind theme from the frozen light `colors`. That is a second, independent theming
  mechanism on the same screen.

## Decisions

### 1. Parity by hand-authoring + a cross-file drift test

Both `tokens.css` and `tokens.ts` stay hand-authored; a test parses the stylesheet and
asserts they agree. No codegen in either direction.

This matches the precedent set by the 2026-07-14 dark-token spec, which explicitly
rejected single-source generation (`--dark-*` indirection variables) in favour of
duplication plus a drift test, to keep `tokens.css` readable for the Claude Design sync
agent. Generating `tokens.css` from TS would make that file an artifact and break the
sync workflow; generating `tokens.ts` from CSS needs a `--color-border-input` →
`borderInput` mapping table that is itself a drift surface, and loses the file's
hand-written structure and JSDoc.

The failure mode is "a test goes red," not "someone forgot to run a script."

### 2. `tokens.ts` mirrors the full palette, both themes

Add the ~20 missing tokens. The parity test asserts an **exact bidirectional key match**
against the light `:root` block, plus hex equality (case-insensitive).

The dark side needs care: the dark CSS block **deliberately does not re-declare** the
theme-invariants — brand 500s and the unused `-100`/`-300`/`-900` ramp steps — which is
exactly what `THEME_INVARIANT` in the existing `tokens.dark.test.ts` encodes. Since
`getPalette('dark')` is fully resolved (§3), it _will_ carry `coral[500]` while the dark
CSS block does not. So the test reuses that same `THEME_INVARIANT` set rather than
inventing a second one:

- token in `THEME_INVARIANT` → assert the dark palette entry equals the **light** CSS value
- every other token → assert it equals the **dark** CSS value

Extracting `THEME_INVARIANT` into a shared module both test files import keeps one
allowlist, not two. There is no _separate_ "known absent" list to maintain.

The nine native mirrors queued in #10 and the `Field` rework in #9 need
`surface-raised`, `scrim`, and `disabled-*` anyway.

### 3. `getPalette(scheme)` replaces the `colors` export — breaking

```ts
export type ColorScheme = 'light' | 'dark'
export type Palette = { /* full token set */ }
export function getPalette(scheme: ColorScheme): Palette
```

`dark` is **fully resolved**, not just the overrides: the theme-invariants (brand 500s
and the unused `-100`/`-300`/`-900` ramp steps) are copied from light, so a caller
asking for `palette.coral[500]` never has to know it did not flip.

The `colors` export is **removed**, not aliased — the scheme becomes impossible to
forget. Measured blast radius: 19 files / 40 sites in this repo, 4 files in klerigo-app
(`apps/mobile-{student,tutor}/tailwind.config.js`, both `LoginScreen.tsx`).

### 4. Web components leave the JS palette first (separate commit)

`ProgressRing`, `StreakCard`, `LessonCard`, `UnitPath` move their gradient strings onto
`var(--color-*)`. These sites cannot use `getPalette` — a web component has no way to
know the browser's scheme; CSS already handles it. This lands as its own commit because
it **fixes two dark-mode bugs**, which is a defect fix, not an API migration:

- `UnitPath` interpolates `colors.connectorLocked`
- `ProgressRing` hardcodes the same colour as a **raw `#E7EFEF` literal** in its
  `conic-gradient`

So the fix has to catch raw hex, not only `colors.` references. (Checked: `Toggle`,
`QuizCard/AnswerOption` and web `Toast` match a `colors` grep only via the Tailwind
class `transition-colors` — they do not touch the palette.)

After this, no web component depends on the JS palette.

### 5. Provider is controlled and dependency-free; persistence lives in `mobile-shared`

```tsx
<ThemeProvider>                 // follows useColorScheme()
<ThemeProvider scheme="dark">   // forced
<ThemeProvider scheme="light">  // forced
```

Mirrors web's truth table exactly (`:root` / `[data-theme="dark"]` / `[data-theme="light"]`).
The override is not only web-parity — with `userInterfaceStyle: "light"` in both apps it
is the _only_ way to see or test dark before the app-side change lands.

The DS gains **no new dependency**. `packages/mobile-shared` already owns
`expo-secure-store` and the splash-screen hydration gate that the i18n ticket built so a
returning Slovak user never flashes English (`i18n/locale.ts`). A persisted theme has the
identical async-boot problem, so it belongs behind that same gate, next to the locale
read — not inside a SHA-pinned library that would either duplicate the gate or
reintroduce the flash.

### 6. `useTheme()` throws without a provider

Matches the existing `useToast` convention. Half-adoption is impossible, and the app PR
is in scope anyway (§9), so wrapping both roots is marginal cost.

### 7. `createThemedStyles` + `useThemedStyles`

```tsx
const styles = createThemedStyles((p) => ({
  button: { backgroundColor: p.coral[500], borderRadius: radiusValue.lg /* … */ },
}))

export function PrimaryButton(): ReactElement {
  const s = useThemedStyles(styles)
  return <Pressable style={s.button} />
}
```

Memoised **per palette**, not per component instance — each stylesheet is created at
most twice for the process (light and dark), so a 100-row list allocates one, not 100.
A plain `useMemo` in each component would be repeated ~17 times across the current 7
components plus the ~10 coming in #9/#10, and allocates per instance.

File shape stays close to today's: one `styles` block at the bottom, one hook call.

### 8. Verification: stub `react-native`, render with `@testing-library/react`

`import 'react-native'` does not work under Vitest 4 (verified). Wiring the real thing
needs a Babel transform over `node_modules/react-native` using `@react-native/babel-preset`

- `babel-plugin-syntax-hermes-parser`, transforms all of RN on every run, and lands on
  `@testing-library/react-native` → `react-test-renderer`, which **React 19 deprecated**
  (this repo is on React 19.2).

Instead: a small in-repo stub aliased for `react-native` — `StyleSheet.create` as
identity, `View`/`Text`/`Pressable` as host elements, `useColorScheme` settable per test —
rendered with `@testing-library/react`, already a devDependency and React 19 native.
Assertions are real renders: mount a component under `<ThemeProvider scheme="dark">` and
check the resolved style flips.

This proves the theming logic, which is what is under test. RN integration itself is
proven on an emulator (§9) — per #196, "treat 'it compiles' as no evidence."

Test surface:

| File                    | Asserts                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| `tokens.parity.test.ts` | `tokens.css` ↔ `tokens.ts`, both themes, keys + hex                             |
| `theme.test.tsx`        | `getPalette`, `createThemedStyles`, provider precedence, throw-without-provider |
| `native/*.test.tsx`     | each component renders and flips between themes                                 |

### 9. NativeWind is named, not solved here

DS ships the palette, the provider, and a **documented recipe** for the app-side
NativeWind config (plus a `conventions.md` note), including the requirement that
**one scheme value drives both mechanisms** — `mobile-shared`'s wrapper passes the same
scheme to `ThemeProvider` and to NativeWind's `colorScheme`. Otherwise a screen renders
dark DS components on a light NativeWind background.

Implementing it is klerigo-app's, not the DS's: putting NativeWind-4-specific config
inside a SHA-pinned library would couple the DS to NativeWind's API.

### 10. Rollout: DS first, then the klerigo-app PR, proven on a device

Removing `colors` and throwing without a provider means the apps break on pin bump, so
the consumption side is not deferred — it lands right behind the DS merge:

1. **DS PR** — merged, closes #8. Apps untouched, still on the old pin.
2. **klerigo-app PR** — bump the pin; rewrite both `tailwind.config.js`; fix both
   `LoginScreen.tsx`; add the `ThemeProvider` wrap in `mobile-shared` with the persisted
   preference behind the splash gate; flip `userInterfaceStyle` to `"automatic"`;
   regenerate `mobile-student`'s Android native config.
3. **Verify on an emulator** — `pnpm exec expo run:android` with
   `JAVA_HOME=/usr/lib/jvm/java-21-openjdk`, toggle OS dark, check both apps.

A truly atomic cross-repo merge is not achievable — the app cannot pin a DS SHA that
does not exist yet — so step 2 follows step 1 rather than pretending to be simultaneous.
The Android prebuild is the risky step.

## Out of scope

- **Native shadows in dark.** RN cannot consume the CSS `box-shadow` strings
  (`0 4px 0 #7a2e21`); it needs `shadowColor`/`shadowOffset`/`shadowRadius`/`elevation`.
  A themed native shadow scale is its own piece of work. `shadows` stays a
  web-shaped, light-only export.
- **The nine missing native components** (#10) and the `Field` label/helper/error
  rework (#9). This ticket unblocks them; it does not do them.
- **A Settings theme toggle.** No Settings screen exists yet — same reason #196
  deferred the language switcher. The controlled provider means it needs no DS change
  when it arrives.
- **Re-tuning the dark palette.** Values are inherited from the 2026-07-14 spec as-is.
