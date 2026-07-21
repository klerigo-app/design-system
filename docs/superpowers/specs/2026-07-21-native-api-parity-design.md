# Native API Parity — Design

**Date:** 2026-07-21
**Repo:** `@klerigo/design-system` (branch off `master`)
**Ticket:** [#9](https://github.com/klerigo-app/design-system/issues/9)
**Status:** Draft — not yet grilled, not ready for implementation

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
Externally it is a typecheck failure at build, not a silent runtime regression. The
klerigo-app call-site count is **not yet measured** (see Open questions).

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

### 5. Ship the brand fonts as static TTFs, full parity with `fonts.css`

Ten files: Baloo 2 400/500/600/700, DM Sans 400/500/600/700, DM Mono 400/500 — the same
set `fonts.css:1-10` loads for web, sourced from Google Fonts (OFL 1.1; `OFL.txt` ships
alongside).

Static instances rather than variable fonts: RN's variable-font handling is inconsistent
across iOS and Android versions, and a weight silently snapping to the default instance
is hard to notice.

Full parity rather than only the four weights native components currently reference
(Baloo 2 500; DM Sans 400/500/600) means nobody has to think about which weights exist
before using one. It also ships DM Mono, which no native component uses today.

The bundle cost is **unmeasured** and should be recorded before merging — Baloo 2's
Google Fonts build carries Devanagari coverage, so its statics are not small. Subsetting
to Latin was considered and rejected for this change: it needs a reproducible font build
step the repo does not have.

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

### 8. `SecondaryButton` is renamed and its name reused — an accepted silent restyle

- Today's `SecondaryButton` becomes `OutlineButton`, with its border corrected
  `slate` → `border-input` to match web's `outline`.
- A new `SecondaryButton` is built to web's real secondary: `border-2 border-teal-500`,
  `bg-surface-raised`, `text-teal-500`.

These two decisions conflict, and the conflict was raised and accepted rather than
resolved. Dropping the name was chosen so existing call sites would fail to typecheck
and a human would pick ghost or outline deliberately. Reintroducing the name in the same
release with an identical prop shape (`label` + `PressableProps`) means those call sites
compile fine and silently turn teal instead.

The mitigation is a changelog entry and the fact that the release breaks
`useTheme()` and `shadows` anyway, so klerigo-app cannot upgrade without a deliberate
pass. That mitigation is weak — nothing points a migrating developer at the restyle.
Deferring the teal secondary to #10 was the alternative and remains available if the
grilling reverses this.

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

### 14. One branch, sequenced commits, one PR — spec approved first

Everything lands together so klerigo-app migrates once across all four breaking changes
(`useTheme` shape, `shadows` removal, `SecondaryButton` restyle, Modal required props).

The alternative was filing the token/font work as separate blocking issues in the
#8 → #9 pattern, matching this repo's history of small single-purpose PRs. Rejected in
favour of a single consumer migration. The cost is a large PR spanning tokens, fonts,
binaries, ten-plus components and both Modals — hard to review and hard to bisect when
the emulator pass finds something.

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
- **Latin-subset fonts.** Needs a reproducible font build step this repo does not have.
- **The nine components in #10.** This unblocks them; it does not do them.

## Open questions

Three of these live in klerigo-app and cannot be answered from this repo. The re-grill
should **open** by pulling those numbers rather than reaching them at the end: the New
Architecture answer in particular can invalidate §3, and §3 is load-bearing for §4, §7
and §9. None of them block this draft; all of them gate implementation.

- **klerigo-app call sites are unmeasured.** Every breaking decision above — removing
  `shadows`, changing `useTheme()`'s return type, restyling `SecondaryButton`, requiring
  the Modal strings — was taken without knowing how many sites each touches. The #8 spec
  measured its blast radius before committing (19 files / 40 sites here, 4 in
  klerigo-app). This one should do the same before it is approved.
- **New Architecture status of both Expo apps is unconfirmed.** If either is on the old
  architecture, §3 does not work: `boxShadow` no-ops, and the representation falls back
  to the legacy `shadowColor`/`elevation` option this spec rejected — which cannot draw
  the hard coloured lift on Android at all. Answer this first.
- **Font bundle size is unmeasured.** Ten static TTFs including Baloo 2's Devanagari
  coverage; the number should be in this spec before it is approved.
- **Is the silent `SecondaryButton` restyle (§8) acceptable on reflection?** It was
  accepted knowingly, but it is the one decision here that trades a guarantee for
  convenience, and deferring the teal secondary to #10 costs almost nothing.
