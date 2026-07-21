# Native API Parity — Design

**Date:** 2026-07-21
**Repo:** `@klerigo/design-system` (branch off `master`)
**Ticket:** [#9](https://github.com/klerigo-app/design-system/issues/9)
**Status:** Re-grilled 2026-07-21 against measured klerigo-app data. All open questions
closed. Ready for implementation.

## Problem

`/native` has three components whose API does not match its web counterpart closely
enough to build a screen on: `Field` renders the input box with no label, helper or
error slot; `Button` exists as two of web's six variants; `Modal` defaults its button
labels to Spanish. #9 asks for those three.

Exploring them turned up that the gap is wider than the API. Native and web disagree
on radius, border colour, padding, type size, disabled treatment, shadows, and fonts.
A screen built from `/native` today does not look like the same product as the web app,
even when every prop is correct. This spec covers both: the three API gaps and the
visual parity underneath them.

The scope decision is deliberate and was taken with the size visible (§1).

## What is actually true today

- **The `shadows` export is the same shape of bug `colors` was.** It is light-only,
  hand-written CSS strings, and an incomplete subset: `tokens.css` declares
  `--shadow-button-pressed-coral` / `-sun` (`:88-89`) which `tokens.ts` omits entirely.
  `tokens.parity.test.ts` only covers `--color-*`, so nothing catches it. This is the
  same finding the #8 spec recorded about `tokens.ts` before it was completed.
- **No web code reads `shadows`.** Every `shadow` occurrence in `src/components/*/*.tsx`
  is a Tailwind class name; the preset resolves them from CSS custom properties
  (`tailwind-preset.js:94-99`). Its only consumers are the `/native` re-export
  (`src/native/index.ts:27`) and `tokens.test.ts:25-27`. So `/native` currently
  re-exports a light-only shadow map — a standing frozen-palette export one layer down
  from the one #8 removed.
- **RN 0.86 supports `boxShadow`.** `StyleSheetTypes.d.ts:516` types it as
  `ReadonlyArray<BoxShadowValue> | string`. The #8 spec's out-of-scope note
  ("it needs `shadowColor`/`shadowOffset`/`shadowRadius`/`elevation`") predates this and
  is now wrong. It matters: `0 4px 0 #7a2e21` is a hard, zero-blur, coloured offset, and
  Android's legacy `elevation` cannot express any of those three properties.
  `boxShadow` requires the New Architecture.
- **No native component sets `fontFamily`.** Web buttons and headings are `font-display`
  (Baloo 2, weight 500 — `Button.tsx:22`, `Heading.tsx:13`); native renders in the OS
  system font at weight 700 (`Text.tsx:31`, `PrimaryButton.tsx:44`). This is the largest
  single visual difference and the issue does not mention it.
- **`@fontsource` ships no TTF.** `@fontsource/baloo-2` and `@fontsource/dm-sans` contain
  woff/woff2 only (verified: zero `.ttf` files). React Native needs ttf/otf, so native
  fonts require files sourced separately from Google Fonts.
- **Native `SecondaryButton` matches neither web variant.** It is 1px border,
  `borderColor: palette.slate` (#5C6670), `color: palette.ink`
  (`SecondaryButton.tsx:36-46`). Web `outline` is 1px `border-border-input` (#E4D9C4)
  with `text-ink`; web `secondary` is `border-2 border-teal-500 text-teal-500`. It is
  outline-shaped with the wrong border colour, under the wrong name, and web's real
  teal secondary has no native equivalent at all.
- **Native already renders a danger button**, inlined in `Modal.tsx:105-116`
  (`backgroundColor: palette.error`, white label) rather than as a reusable variant.
  The issue's "danger is admin-only, so mobile doesn't need it yet" is true of screens
  and false of the code.
- **Web Modal defaults to Spanish too.** `components/Modal/Modal.tsx:83-84` has the same
  `'Confirmar'` / `'Cancelar'` as native. Web additionally has a Spanish
  `confirmationLabel` fallback (`:207`), where native's equivalent is English
  (`native/Modal.tsx:91`). The issue frames this as a `/native` leftover; it is not.
- **Web Modal's cancel is `variant="ghost"`** (`Modal.tsx:216`), not secondary. Native
  uses `SecondaryButton` (`native/Modal.tsx:104`), so the two Modals differ in the
  cancel button's whole visual identity.
- **Disabled has already been decided once.** #5 (`a715462`) deliberately moved web
  Checkbox off opacity onto the `disabled-bg` / `disabled-text` tokens. Native buttons
  still use `opacity: 0.6` (`PrimaryButton.tsx:41`, `SecondaryButton.tsx:41`,
  `Modal.tsx:174`), contradicting that decision.
- **The source guard is non-recursive.** `themed-source.test.ts:11` reads
  `src/native` with `readdirSync` and no recursion, so anything in a subdirectory
  escapes the frozen-palette and hardcoded-hex checks.
- **`src/native/index.ts` is a Vite lib entry** (`vite.config.ts:21`). Asset requires
  written inside `src/native` are processed by Vite's asset pipeline and lose the Metro
  semantics that make them work.
- **RN has no `aria-invalid`** and no `invalid` in `accessibilityState`. It has
  `aria-label`, `aria-labelledby`, `nativeID`, and `accessibilityLabelledBy` — the last
  is Android-only.

## Decisions

### 1. Scope: the three API gaps, plus visual parity, plus shadows and fonts

The alternative was API-only, filing the visual drift separately. Rejected because #10
adds nine more native components within weeks, each of which would be built against a
baseline that is knowingly wrong — the same compounding argument that put shadows in
scope, applied to every remaining axis.

The cost is real and should be stated: this is a much larger change than #9's text
describes, it breaks the package's API in four places, and it adds font binaries to the
repo.

### 2. `getShadows(scheme)` replaces the `shadows` export — breaking

```ts
export function getShadows(scheme: ColorScheme): Shadows
```

`shadows` is removed rather than kept alongside. Keeping it would leave the light-only
map as the shortest path to a shadow, which is precisely the shape that produced the
frozen-palette bug — and #8 already set the precedent by removing `colors` rather than
aliasing it.

Blast radius inside this repo is `tokens.test.ts:25-27` and `src/native/index.ts:27`.
Externally it is a typecheck failure at build, not a silent runtime regression. In
klerigo-app it is one line — `packages/mobile-shared/src/theme/tokens.ts:4` re-exports
`shadows` and nothing imports it, so the migration is a deletion.

The map gains the two `pressed` variants `tokens.css` already declares and `tokens.ts`
never had.

### 3. Shadows are structured `BoxShadowValue` objects, not CSS strings

```ts
getShadows('dark').buttonLiftCoral
// { offsetX: 0, offsetY: 4, blurRadius: 0, spreadDistance: 0, color: '#7a2e21' }
```

The three candidates were legacy `shadowColor`/`elevation`, CSS strings handed to RN's
`boxShadow` parser, and structured objects.

Legacy loses on fidelity: Android `elevation` is a blurred grey drop shadow with no
offset or colour control, so the brand's signature hard coloured lift is unreproducible
there. Raw strings lose on testability — the parity test would have nothing to compare
against but a string, and RN's CSS parser becomes a single point of failure for forms
like `cardElevated`'s negative spread. Structured objects can be parsed out of
`tokens.css` and compared field by field.

`spreadDistance` carries the focus rings (`0 0 0 3px`), and `color` must accept `rgba()`
strings because the dark focus rings use them (`tokens.css:169-170`).

Note the CSS namespace is inconsistent here: lift/pressed/card/device are `--shadow-*`,
but the focus rings are `--focus-ring-teal` / `--focus-ring-error`. The parity test has
to know both prefixes.

**This requires the New Architecture.** On the old architecture `boxShadow` is ignored
and every shadow silently disappears. Verifying the apps' architecture is a gate on
merging, not a follow-up (§13).

### 4. The theme context carries `{ colors, shadows }`

```tsx
const themedStyles = createThemedStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.coral[500],
    boxShadow: [theme.shadows.buttonLiftCoral],
  },
}))
```

`useTheme()` returns the theme object rather than a bare `Palette`, and all seven
existing native files migrate `palette.X` → `theme.colors.X`.

The cheaper alternative — a second positional builder argument — would have left the
existing files untouched, but positional axes get awkward the moment a third one
appears, and `boxShadow` belongs inside the stylesheet rather than spread at the call
site (the pattern `Field.tsx:12` already documents as a special case for
`placeholderTextColor`).

The per-palette style cache (`theme.tsx:76`) keys on the theme object identity instead.

### 5. Ship the brand fonts as Latin-subset static TTFs — 551 KB

*Re-decided after measurement; supersedes the draft's "ten full statics from Google
Fonts", whose premise was false — see "Measured against klerigo-app".*

Ten files: Baloo 2 400/500/600/700, DM Sans 400/500/600/700, DM Mono 400/500 — the same
set `fonts.css:1-10` loads for web (OFL 1.1; `OFL.txt` ships alongside).

Static instances rather than variable fonts: RN's variable-font handling is inconsistent
across iOS and Android versions, and a weight silently snapping to the default instance is
hard to notice. iOS is unbuilt today but still a declared target, so that risk is live.

Because upstream ships only variable fonts, the statics are **instanced with
`fontTools.varLib.instancer`** (Baloo 2 on `wght`; DM Sans on `wght` at `opsz=14`). DM
Mono's upstream statics are used as-is. This means the repo needs the font build step §5
originally disclaimed — and once that step exists, subsetting is one further flag, so the
"Out of scope" entry rejecting Latin subsetting is withdrawn.

Only Baloo 2 is subset; DM Sans and DM Mono carry no Devanagari and are already small.

| | Per weight | Total |
| --- | --- | --- |
| Baloo 2, full charset | 412.4 KB | 1650 KB |
| Baloo 2, subset | **57.7 KB** | 231 KB |
| DM Sans, instanced | 55.5 KB | 222 KB |
| DM Mono, upstream statics | ~49 KB | 98 KB |
| | | **551 KB** |

Devanagari is 86% of Baloo 2's weight and no Klerigo surface renders it.

**The subset range is load-bearing and belongs in code, not prose:**

```
U+0000-00FF, U+0100-017F, U+0218-021B, U+0131, U+0152-0153, U+02BB-02BC,
U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
U+2193, U+2212, U+2215, U+FEFF, U+FFFD
```

Two ranges beyond Google's stock `latin` subset are deliberate, and both were found by
testing rather than reasoning:

- `U+0100-017F` (Latin Extended-A). Stock `latin` omits it. Without it Baloo 2 loses
  `čďěĺľňŕřšťůž` — 12 of the 20 Czech/Slovak accented letters — to save 16 KB per weight.
- `U+0218-021B` (comma-below S/T). Romanian `șț` live here, outside Latin Extended-A,
  while their cedilla lookalikes `şţ` are inside it. Omitting the range makes Romanian
  render *half* correctly, which is worse than failing. Costs 0.1 KB.

Verified present across the subset: Spanish `áéíóúüñ¿¡`, French `àâçèêëîôûÿœæ«»`, German
`ß`, Portuguese `ãõç`, Italian, Czech, Slovak, Polish `ąćęłńśźż`, Hungarian `őű`,
Croatian `čćđšž`, Turkish `çğıİş`, Romanian `ăâîșț`, Catalan `·`, and `€£¢`.

Full weight parity rather than only the four weights native components reference means
nobody has to check which weights exist before using one. DM Mono ships with no native
consumer.

### 5a. The fonts are committed, scripted, and covered by a test

`prepare` runs `npm run build`, and klerigo-app installs this package straight from git
(`git+https://github.com/klerigo-app/design-system.git#<sha>`), so `prepare` executes on
every developer and CI machine that installs the app. Putting `fonttools` in that path is
not acceptable, so the TTFs are **committed binaries** — a first for this repo, which
tracks none today (`dist` is gitignored and rebuilt).

Committed binaries cannot be regenerated by CI, so nothing would otherwise catch a future
regeneration that drops a range. Two guards:

- `scripts/build-fonts.py` holds the weight list and the subset range as the single
  source of truth. The range above is a copy of it, not the original.
- `src/native/fonts.test.ts` parses each committed TTF's `cmap` directly — no `fonttools`,
  so it runs in ordinary CI — and asserts that every language's letters resolve to a glyph
  with **non-empty bounds**. Presence in `cmap` alone is not enough: subsetting can leave
  a mapped-but-hollow glyph, which renders as blank rather than as tofu.

The failure this exists to catch is a font that reads fine in English and mojibakes on
`příliš` or `mañana`.

### 6. Fonts are delivered by an unbundled root module

```js
// klerigo-app
import { klerigoFonts } from '@klerigo/design-system/native-fonts'
const [loaded] = useFonts(klerigoFonts)
```

A hand-written `native-fonts/index.js` at the repo root, listed in `files` with its own
export path — the `tailwind-preset.js` pattern. It must sit outside `src/` because the
`/native` entry is bundled by Vite (`vite.config.ts:21`), which would rewrite the asset
requires.

The package takes **no dependency on `expo-font`**. Owning font loading end-to-end would
mean the design system dictating that consumers are Expo apps; its peer dependencies are
`react` / `react-dom` and should stay that way.

DS components hardcode the family names the map registers, so the keys and the styles
cannot drift. Consequently the theme gains no `fonts` axis.

Which native component takes which family, derived from its web counterpart's classes.
Every native component that renders text is on this list — adopting fonts in the buttons
alone would ship the binaries and leave headings in the system font:

| Native role                                   | Family            | Weight | From                                    |
| --------------------------------------------- | ----------------- | ------ | --------------------------------------- |
| `Heading` (both sizes), all six button labels | `Baloo2-Medium`   | 500    | web `font-display font-medium`          |
| `Text` body and muted, `Field` control text   | `DMSans-Regular`  | 400    | web `font-body`, `fieldControlStyles`   |
| `FieldMessage` (error/helper)                 | `DMSans-Medium`   | 500    | web `font-medium` (`field.tsx:31`)      |
| `FieldLabel`, `Toast` link labels             | `DMSans-SemiBold` | 600    | web `font-semibold`; `Toast.tsx:270`    |

Two existing weights change as a result: `Heading` and `PrimaryButton`'s label drop from
`fontWeight: '700'` to 500, because web's display type is `font-medium` throughout.

DM Mono ships (§5) with no native consumer. Baloo 2 400/600/700 and DM Sans 700 likewise.

The failure mode when an app forgets to register: RN falls back to the system font
silently. Accepted — the emulator pass (§13) is what catches it, and the font table above
is what it checks against.

### 7. Buttons stay one component per variant, over a shared internal base

Six public components: `PrimaryButton`, `SecondaryButton`, `OutlineButton`,
`GhostButton`, `DangerButton`, `RewardButton`. `DangerButton` absorbs the fill
`Modal.tsx:105-116` currently hand-rolls.

A single `Button` with a `variant` prop would have mirrored web's shape exactly and was
the recommended option; one-per-variant was chosen instead. Given that, the geometry
cannot live six times over: an internal `ButtonBase` holds the size scale, disabled
handling, icon slot and `Pressable` wiring, and each variant file supplies only its
colours.

`ButtonBase` is a **flat file** in `src/native/`, not a subdirectory, so
`themed-source.test.ts`'s non-recursive scan still guards it. It is not exported from
`index.ts`.

### 8. `SecondaryButton` is renamed and its name reused — migrated, not accepted

- Today's `SecondaryButton` becomes `OutlineButton`, with its border corrected
  `slate` → `border-input` to match web's `outline`.
- A new `SecondaryButton` is built to web's real secondary: `border-2 border-teal-500`,
  `bg-surface-raised`, `text-teal-500`.

*Resolved during the re-grill; the draft accepted a silent restyle here and no longer
does.* Reusing the name with an identical prop shape (`label` + `PressableProps`) means
existing call sites compile fine and quietly turn teal. Measurement showed that is not
merely risky but wrong:

| Site | Label |
| --- | --- |
| `mobile-tutor/src/screens/MoreScreen.tsx:29` | Log out |
| `mobile-tutor/src/screens/SettingsScreen.tsx:26` | Log out |
| `mobile-student/src/screens/SettingsScreen.tsx:27` | Log out |
| `mobile-shared/src/screens/ErrorState.tsx:32` | Try again |

All four are neutral, low-emphasis actions. A teal brand-accented "Log out" is the
opposite of the weight three of them want.

So the restyle is **migrated rather than accepted**: a companion klerigo-app PR flips
these four to `OutlineButton` and lands with this one. That PR has to exist regardless —
the 11 `useTheme()` call sites need it — so the marginal cost is four lines.

Deferring the teal secondary to #10 was the alternative. Rejected because it trades a
release's worth of web/native vocabulary drift for a migration that is already happening.

### 8a. Delivery spans two repos, merged together

This restates §14's rationale, which the measured blast radius invalidated.

The draft justified a single PR as "klerigo-app migrates once across all four breaking
changes." That is not what the numbers show: `shadows` has no live consumer, the native
Modal has no call sites, and §12 costs web nothing. The real consumer migration is 11
mechanical `useTheme()` renames and the four buttons above.

The rationale is instead that **`OutlineButton` cannot land safely without the consumer
change**, so the two repos are coordinated by necessity:

| Repo | Change |
| --- | --- |
| `design-system` | this spec |
| `klerigo-app` | 11 `useTheme()` → `theme.colors`, 4 `SecondaryButton` → `OutlineButton`, delete the dead `shadows` re-export (`packages/mobile-shared/src/theme/tokens.ts:4`) |

klerigo-app pins the design system by commit SHA, so its PR is opened against this branch's
merge commit and the emulator pass (§13) runs on that pair.

### 9. Button props and states mirror web

New props: `size` (`sm` | `md` | `lg`, default `md`), `fullWidth`, `icon`. `label`
stays a string rather than moving to `children` — RN requires text be wrapped in
`<Text>`, so a children API either wraps blindly or documents a constraint web does not
have.

Sizes take web's values exactly: radius `md`/`lg`/`xl` (12/16/20 — web's `sm` size uses
`rounded-md`, not `rounded-sm`, per `Button.tsx:37`), padding 16×8 / 26×14 / 34×18, text
13/16/18. Native's current 16×12 matches no web size, so `md` is a change either way.

`icon` accepts a node the app supplies; `@phosphor-icons/react` is web-only, so the DS
ships the slot and the layout (20×20, 9px gap) but not the glyphs.

States:

- **Disabled** moves off `opacity: 0.6` onto `disabled-bg` / `disabled-text`, per #5.
  A disabled ghost or outline button becomes a solid grey box, as on web. This also
  removes the last opacity-based state, which reads differently over light and dark
  surfaces.
- **Pressed** swaps `buttonLift*` for `buttonPressed*` and shifts 3px down via
  `Pressable`'s pressed state — the reason the pressed shadow tokens exist. The layout
  shift must not nudge surrounding content.
- **Hover** uses the `*-hover` tokens via `onHoverIn`/`onHoverOut`, for iPad pointer and
  Android mouse.

### 10. `Field` keeps its job; a public `TextInput` is added above it

Web has two layers and native has one. Native gains the missing layer rather than
overloading the component it has:

- internal `FieldLabel`, `FieldMessage`, and shared field-control styles — flat files,
  so the source guards still see them
- public `TextInput`, assembling label + control + one-of error/helper
- `Field` stays the bare control, for `Modal.tsx:93` and for #10's `Select`,
  `SearchField` and `MultiSelect` to compose

Overloading `Field` with optional `label`/`error` props was simpler and non-breaking,
but it gives one component two visual identities and leaves #10's `Select` to either
duplicate the label/message rendering or reach inside `Field`. Web solved this once in
`internal/field.tsx`, shared by four components; native needs the same layer for the
same reason, and needs it before #10 rather than after.

The public name matches web's `TextInput` even though it shadows React Native's, which
`Field.tsx:2` already handles with an import alias.

Focus and error styling live on the **control**, matching web's `fieldControlStyles`:
`Field` gains `error?: boolean` and internal focus state, and `TextInput` passes
`Boolean(error)` down. Modal's type-to-confirm input therefore gains a focus ring.

### 11. `TextInput` associates its label without an `id`

The input carries `accessibilityLabel={label}`; when `error` is set it is appended to
`accessibilityHint` so screen readers announce it with the field.

Web's `id` exists to wire `htmlFor` and `aria-describedby`. Its nearest native
equivalent, `accessibilityLabelledBy`, is Android-only, so a required `id` would be
ceremony that buys nothing on iOS while every call site pays for it. RN has no
`aria-invalid`, so the error is announced as text rather than flagged as a state.

This is the one place the native API deliberately does not mirror web's signature.

### 12. Both Modals require their strings, typed conditionally

`confirmText`, `cancelText` and `confirmationLabel` become required on **web and
native alike**, removing `'Confirmar'` / `'Cancelar'` from both, web's Spanish
`confirmationLabel` fallback (`Modal.tsx:207`), and native's English one
(`native/Modal.tsx:91`).

The issue scopes this to `/native`. Fixing only native would leave web shipping Spanish
to callers who forget, and would make the two Modals' prop contracts diverge — web/native
drift pointing the other way.

Required-ness is expressed as a discriminated union rather than three flat required
props, because two of the three are conditionally rendered:

```ts
type ModalProps = Base &
  ({ onCancel: () => void; cancelText: string } | { onCancel?: never; cancelText?: never }) &
  ({ confirmationValue: string; confirmationLabel: string } |
   { confirmationValue?: never; confirmationLabel?: never })
```

A caller who forgets a string it needs fails to typecheck; a caller with no cancel button
is not asked to invent a label for it. The cost is denser types and worse TS error
messages on unions.

Native's Modal also moves its cancel to `GhostButton` (matching `Modal.tsx:216`) and its
danger action to `DangerButton`.

This rewrites `Modal.test.tsx:44-45`, `:53`, `:60`, which assert the Spanish strings by
accessible name, and four stories.

### 13. Verification: stub tests for wiring, emulator for rendering

`rn-stub.tsx` renders to the DOM and serialises styles onto a `data-style` attribute. It
can assert that `boxShadow: [{…}]` and `fontFamily: 'Baloo2-Medium'` are present with the
right values in both schemes. It cannot show that React Native honours either.

Most of what this spec adds — fonts, shadows, padding, press offsets — is exactly the
class of change that looks correct in a serialised style object and wrong on a device.
So an emulator pass is a merge gate, not a follow-up:

1. Confirm both Expo apps run the **New Architecture** before trusting any shadow.
2. Run both apps, both themes (`adb shell cmd uimode night yes|no`).
3. **Sample pixels** against expected token hexes rather than eyeballing screenshots —
   a colour that fails to resolve falls back to transparent, so a broken result still
   looks plausible.

Test surface changes:

| File                    | Change                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| `tokens.parity.test.ts` | extend to shadows, parsing CSS into the structured form, both prefixes |
| `tokens.test.ts`        | `:25-27` rewritten for `getShadows`                                 |
| `themed-source.test.ts` | also ban importing `getShadows` from the token module; file floor rises |
| `components.test.tsx`   | six buttons, `TextInput`, `Field` states — each in both schemes      |
| `Modal.test.tsx` (web)  | rewritten off the Spanish accessible names                          |
| `fonts.test.ts` (new)   | cmap coverage across 14 languages, non-empty glyph bounds (§5a)     |

Step 1 is now answered ahead of implementation: `newArchEnabled=true` in both apps
(`android/gradle.properties:38`), RN 0.86 / Expo SDK 57. It stays on the checklist because
the property is per-app and a third app would need checking.

Neither app has a committed `ios/`, so the emulator pass is Android-only. iOS remains a
declared target (`app.json` sets `ios.bundleIdentifier`, no `platforms` restriction), which
is why §5 still ships static instances rather than variable fonts — the risk it guards
against is not currently testable here.

### 14. One branch, sequenced commits, one PR — spec approved first

*Rationale restated by §8a; the original justification did not survive measurement.*

Everything lands on one design-system branch, paired with the companion klerigo-app PR
described in §8a.

The alternative was filing the token/font work as separate blocking issues in the
#8 → #9 pattern, matching this repo's history of small single-purpose PRs. Rejected
because `OutlineButton` and the `useTheme()` reshape have to reach klerigo-app together
anyway, and splitting the producer side would multiply the coordination without reducing
it. The cost is a large PR spanning tokens, fonts, binaries, ten-plus components and both
Modals — hard to review and hard to bisect when the emulator pass finds something.

The spec is grilled and approved before implementation starts, following #8.

## What #10 inherits

Every decision here is a prerequisite it builds on: the theme object shape, the shadow
scale, the font families, the internal field layer, `ButtonBase`, and the flat-file
convention the source guards depend on. `Select`, `SearchField` and `MultiSelect` in
particular are expected to compose the internal field parts from §10 rather than
re-deriving them.

## Out of scope

- **NativeWind alignment.** Unchanged from #8: the apps' own Tailwind config is theirs.
- **A `List` / `ListRow` primitive.** #10 records why porting `Table` is the wrong
  answer; it remains a design question.
- **Re-tuning any token value.** Colours and shadows are taken from the CSS layer as-is.
- ~~**Latin-subset fonts.**~~ Withdrawn — §5 now subsets, because instancing forces the
  build step this entry assumed away.
- **Non-Latin scripts.** Devanagari, Greek and Cyrillic are dropped by §5's subset. Adding
  one means re-running `scripts/build-fonts.py` with a wider range, not new tooling.
- **The nine components in #10.** This unblocks them; it does not do them.

## Measured against klerigo-app (2026-07-21)

The three klerigo-app questions this draft left open have been answered against
`klerigo/main` @ `apps/{mobile-student,mobile-tutor}`. Both apps pin the design system at
`fa7b17b` (the #8 merge). Two answers change what is written above.

### New Architecture: confirmed, §3 holds

`newArchEnabled=true` in both apps' `android/gradle.properties:38`, on RN 0.86 / Expo
SDK 57. `boxShadow` is available, so §3 stands and §4/§7/§9 keep their foundation.

Neither app has a committed `ios/` directory — they are Android-prebuilt today. iOS is
still a declared target: `app.json` sets `ios.bundleIdentifier` and `ios.supportsTablet`
with no `platforms` restriction. So iOS is unbuilt, not dropped, and §5's iOS-specific
reasoning still applies.

### Blast radius: much smaller than §14 assumed

| Breaking change | klerigo-app sites |
| --- | --- |
| `shadows` removal | 1 — `packages/mobile-shared/src/theme/tokens.ts:4`, a re-export with **no downstream consumers**. Dead code. |
| `useTheme()` shape | 11, all of the form `const palette = useTheme()` across both apps + `mobile-shared`. Mechanical. |
| `SecondaryButton` restyle | 4 — `mobile-tutor/MoreScreen.tsx:29`, both `SettingsScreen.tsx:26/27`, `mobile-shared/ErrorState.tsx:32`. |
| Modal required strings | **0 on native** — the native Modal is not used anywhere in klerigo-app. **0 on web** — all 17 `<Modal>` sites already pass `confirmText`; the two without `cancelText` (`LessonBuilderPage.tsx:447,467`) also have no `onCancel`, which §12's union permits; all four `confirmationValue` sites already pass `confirmationLabel`. |

This undercuts §14's stated rationale. "Land together so klerigo-app migrates once across
all four breaking changes" describes a migration that is really one mechanical rename
(`useTheme`), one dead-code deletion, and four buttons to eyeball. §12 costs the consumer
nothing at all. Single-PR may still be right, but it needs a different reason.

It also sharpens §8: the silent teal restyle lands on exactly four call sites, and all
four are log-out / settings / error-state actions — the places a neutral outline button is
most likely to be what was wanted.

### Fonts: §5's source does not exist as described

`google/fonts` ships **only variable** TTFs for both families — `ofl/baloo2` contains
`Baloo2[wght].ttf` and nothing else; `ofl/dmsans` contains `DMSans[opsz,wght].ttf` and its
italic. There are no static instances upstream to source. DM Mono is the exception and
does ship statics.

Statics are obtainable by instancing (`fonttools varLib.instancer`, present in this
environment), but that is exactly "a reproducible font build step the repo does not have"
— the reason §5 and "Out of scope" gave for rejecting Latin subsetting. The objection now
applies to the statics themselves.

Measured, at Baloo 2 `wght`, DM Sans `wght` at `opsz=14`:

| Bundle | Size |
| --- | --- |
| §5 as written — 10 full statics | **1.92 MB** (Baloo 2 alone is 1.65 MB, 412 KB × 4) |
| 2 variable + 2 DM Mono statics | **999 KB** |
| 10 Latin-subset statics | **551 KB** |

Baloo 2's Devanagari coverage is 86% of its weight: 412 KB → 58 KB per weight subset to
Latin. Since instancing already requires the build step, subsetting is one further flag on
a pipeline that has to exist either way.

§5 is therefore not implementable as written and is **reopened** — see below. Its
variable-font objection (inconsistent RN handling across iOS and Android versions) is
untouched by this and still stands, iOS being a live target.

## Open questions

All of the draft's open questions are now closed: §3's New Architecture dependency is
confirmed, blast radius is measured, §5 is re-decided against real numbers, §8's silent
restyle is migrated away, and §14's rationale is restated by §8a.
