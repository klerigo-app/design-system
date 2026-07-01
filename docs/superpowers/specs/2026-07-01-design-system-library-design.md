# EspañoLenka Design System — Component Library

Date: 2026-07-01

## Purpose

Recreate the EspañoLenka brand + design system (documented as static HTML references in
`espanolenka_design_system/`) as a real, installable React + TypeScript component library.
The HTML files are prototypes only — not production code. This spec covers the component
library alone; the bilingual marketing website described in the reference README is being
built in a separate repository and is out of scope here.

Source of truth for all visual values (colors, type, spacing, radii, shadows, component
variants/states) is `espanolenka_design_system/README.md`. This spec does not restate those
values — it defines how they get implemented.

## Stack

- **Language/framework:** React + TypeScript.
- **Package manager:** pnpm.
- **Build:** Vite in library mode → ESM output + `.d.ts` type declarations. `react` and
  `react-dom` as peer dependencies.
- **Styling:** Tailwind CSS, theme extended from CSS custom properties (see Tokens below).
- **Variant logic:** `class-variance-authority` (cva) for components with multiple
  variants/sizes (Button, Chip, Card, AnswerOption, etc.).
- **Fonts:** Baloo 2, DM Sans, DM Mono via `@fontsource` packages (self-hosted, Latin
  Extended subset for Czech diacritics) rather than a Google Fonts `<link>`, so the library
  works offline and in tests/Storybook without a network dependency.
- **Icons:** `@phosphor-icons/react`, `weight="regular"` (24px grid, matches the README's
  rounded 2px-stroke spec).
- **Testing:** Vitest + React Testing Library + jsdom.
- **Docs/catalog:** Storybook (Vite builder).
- **Lint/format:** ESLint (TypeScript strict mode) + Prettier.
- **Package name:** `@espanolenka/design-system`, single package at repo root (no monorepo
  — the marketing site lives elsewhere).

## Design tokens

`src/tokens/tokens.css` — CSS custom properties transcribed directly from the reference
README, grouped as:

- **Brand ramps:** `--color-coral-{50,100,300,500,700,900}`, same steps for `--color-sun-*`
  and `--color-teal-*`.
- **Neutrals:** `--color-paper`, `--color-surface`, `--color-border`, `--color-border-input`,
  `--color-muted`, `--color-slate`, `--color-ink`.
- **Semantic:** `--color-success`, `--color-warning`, `--color-error`, `--color-info`.
- **Radii:** `--radius-sm` (8px) through `--radius-2xl` (24px), `--radius-pill` (9999px).
- **Shadows:** `--shadow-button-lift-coral`, `--shadow-button-lift-sun` (the `0 4px 0
  <700-shade>` press shadows for the two variants that use them), `--shadow-card-elevated`,
  `--shadow-device`.
- **Focus rings:** `--focus-ring-teal`, `--focus-ring-error` as full `box-shadow` values
  (border-color is set separately per component since it isn't expressible in one var).

`tailwind.config` extends `theme.colors`, `theme.borderRadius`, and `theme.boxShadow` to
reference these vars (e.g. `colors.coral[500] = 'var(--color-coral-500)'`), so consumers can
use standard Tailwind utility classes (`bg-coral-500`, `rounded-lg`) that resolve through the
CSS variable layer.

Spacing uses Tailwind's default 4px-based scale as-is — it already matches the README's
step list (4/8/12/16/20/24…), so no custom spacing scale is defined.

`src/tokens/tokens.ts` — a typed constant object mirroring the CSS variables (colors, radii,
shadow strings), for the cases that need a JS-side value rather than a CSS var reference
(e.g. computing the `ProgressRing`'s `conic-gradient` stops from a numeric percentage).

`src/tokens/fonts.css` — `@fontsource` imports for Baloo 2 (400/500/600/700), DM Sans
(400/500/600/700), DM Mono (400/500), plus `--font-display` / `--font-body` / `--font-mono`
CSS vars wired into Tailwind's `fontFamily` theme key.

Consumers import `tokens.css` and `fonts.css` once at their app root; components rely on
those variables being present.

## Logo

`src/components/Logo/`:

- `<LogoMark>` — the eL monogram tile (rounded-rect background + `e`/`L` letterforms +
  tilde). Letterforms are rendered as **SVG path outlines** (not live `<text>`), sourced
  from the path data in the provided `espanolenka_design_system/logos/*.svg` exports, so the
  mark renders correctly regardless of whether the Baloo 2 web font has loaded. Props:
  `size` (px), `variant`: `"coral" | "knockout" | "outline"`.
- `<Logo>` — full wordmark: `<LogoMark>` plus "Españo"/"Lenka" text (this text does use the
  live Baloo 2 font, per the README's wordmark spec — only the monogram itself is
  outlined). Props: `variant` (light/dark coloring), `orientation`: `"horizontal" |
  "stacked"`.
- Clear-space (½ icon height) is documented in the component's usage comments but not
  enforced in code — it's a layout guideline for consumers, not a component constraint.
- "Don't" rules from the README (no recoloring the tile, no gradients on letterforms, no
  stretch/rotate, no drop shadows, tilde never separated) are enforced structurally: the
  components don't expose props that would allow those violations.

## Core components

Each built with `cva` + Tailwind utilities reading from the token layer:

- **Button** — variants: `primary | reward | secondary | ghost | disabled`; sizes:
  `sm | md | lg`; optional leading icon slot; `fullWidth` prop. The tactile press
  interaction (translateY + shadow shrink) is pure CSS (`:active`), no JS state.
- **TextInput** — label, helper text, error text, focus/error ring states; controlled.
- **Select** — same box styling as TextInput; native `<select>` with a custom chevron
  overlay (keeps native accessibility/keyboard behavior).
- **Checkbox**, **Radio**, **Toggle** — each wraps a native `<input>` for accessibility,
  custom-painted via Tailwind `peer` states; controlled.
- **SearchField** — TextInput variant with a baked-in leading magnifier icon slot.
- **Card** — variants: `flat | elevated | feature`; the `feature` (dark) variant supports
  an optional decorative Sunshine circle.
- **Chip/Badge** — fixed named variants matching the README's specific semantic pairings:
  `level | category | new | completed | live | dark | outline`. Colors are not freely
  composable — the README defines specific color+text combinations per meaning, and this
  library encodes those combinations directly rather than exposing a generic color prop.

## Learning components

- **LessonCard** — number tile (gradient), chip + duration, title/subtitle, progress bar,
  a slot for the "Seguir" button. Progress fraction and all copy/labels are consumer-supplied
  props — the library itself carries no i18n logic or hardcoded strings.
- **ProgressBar** — track + fill; `variant`: `"teal" | "xp-gradient"`; animated width
  transition on value change (CSS transition, ease-out ~300ms).
- **ProgressRing** — `conic-gradient`-based ring driven by a numeric percent prop, with an
  inner label slot.
- **UnitPath** — horizontal node track. `nodes` prop: array of
  `{ state: "completed" | "current" | "locked", label }`; renders connectors between nodes
  with the partial-gradient treatment for the segment leading into the "current" node.
- **QuizCard** — progress bar + mono counter, prompt label, question text (with the
  underscored-blank styling), an `AnswerOption` sub-component with a `status` prop
  (`default | selected | correct | wrong`), and a submit button slot.
- **StreakCard** — dark feature card, day-count tile, 7-cell week row driven by an
  `activeDays: boolean[]` prop.
- **RewardBanner** — completion banner with an icon tile and title/subtitle slots.

All animations (progress fill, banner celebrate-in) are implemented with CSS
transitions/`@keyframes` — no animation library dependency.

## Testing

One `.test.tsx` per component (Vitest + Testing Library), covering:

- Every variant/size renders without throwing.
- Disabled/locked states visually and functionally block interaction (no `onClick` fired).
- Controlled inputs (Checkbox, Radio, Toggle, TextInput, Select, AnswerOption) fire their
  change/click handlers with the expected arguments.
- Basic accessibility: labels are associated with their inputs, native input roles are
  preserved (no `<div role="checkbox">`-style reimplementations).

This is unit/interaction coverage only — no visual/pixel regression testing. Visual
fidelity against the README is verified manually through Storybook.

## Storybook

One `.stories.tsx` per component with `argTypes` controls for every variant/size/state prop,
plus a dedicated "Tokens" story rendering swatches for the color ramps, type scale, and
radii — a browsable reference mirroring the reference README's own documentation intent.

## Package structure & exports

```
src/
  tokens/
    tokens.css
    tokens.ts
    fonts.css
  components/
    Button/
      Button.tsx
      Button.stories.tsx
      Button.test.tsx
      index.ts
    ...one folder per component...
  index.ts   # barrel: re-exports every component + tokens.ts + prop types
```

Consumers install the package, import `tokens.css` + `fonts.css` once at their app root,
then use components and Tailwind utility classes normally. A package-level `README.md`
(separate from the existing design-reference README, which stays untouched as the source
spec) documents installation and basic usage.

## Out of scope

- The bilingual marketing website (separate repo).
- Visual/pixel regression testing.
- A generic/composable Chip color API (fixed named variants only, per the README).
- Framer Motion or any animation library (CSS-only animations).
- Enforcing logo clear-space programmatically.
