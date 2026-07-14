# Dark Mode at the Token Layer — Design

**Date:** 2026-07-14
**Repo:** `@klerigo/design-system` (branch off `master`)
**Status:** Approved design — ready for implementation plan

## Goal

Add dark-mode styling to the design system **at the token layer** so that every
component and every future claude.ai/design work recolours automatically, with no
per-component changes. Every web utility (`bg-paper`, `text-ink`, `shadow-elevated`,
…) resolves through `tailwind-preset.js` → CSS custom properties in
`src/tokens/tokens.css`. Overriding those custom properties for dark recolours the
whole system.

## Scope

**In scope**

- Dark-mode CSS-custom-property overrides in `src/tokens/tokens.css`.
- Token tests for the dark layer (`src/tokens/tokens.test.ts` or a sibling).
- A dark-mode section in `.design-sync/conventions.md`.
- Re-sync to the pinned claude.ai/design project after tokens land.

**Out of scope**

- **React Native / `src/tokens/tokens.ts`.** The JS mirror is a flat, single-value
  export consumed by the native build, which cannot read media queries or
  `data-theme`. True native dark mode needs a theme context + `useColorScheme` — a
  separate, larger effort, and not what the re-sync target (web) needs. `tokens.ts`
  and its tests stay light-only and unchanged.
- Component source changes. This is a pure token-layer change.

## Palette provenance

The dark palette is **not derived** — it is the palette Claude Design already
authored, living in the `[data-theme="dark"]` block of the **TutorConsole template**
(`templates/tutor-console/TutorConsole.dc.html`) in the synced project. That block
overrides 21 DS `--color-*` tokens directly; those values are used **verbatim**.
The template does not exercise every DS token, so tokens it leaves untouched but
which would look broken on a dark surface (some tints/borders, hovers, shadows,
focus rings) get **derived-to-complete** values, grounded in the template's own
accent/shadow palette where possible. Every derived value is marked below and is
provisional — final tuning happens in Storybook's dark preview.

## Activation strategy: media query default + `data-theme` override (both)

The TutorConsole template activates dark via `[data-theme="dark"]`. claude.ai/design's
theme-aware viewer stamps `data-theme` on the root. So the DS uses **both**: an OS
default via media query, plus an explicit `data-theme` toggle that wins in both
directions.

```css
/* src/tokens/tokens.css — appended after the existing :root { …light… } block */

/* OS preference sets the default (unless an explicit light toggle opts out) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    /* …dark declarations… */
  }
}

/* Explicit toggle wins over the OS in both directions.
   :root is already light, so [data-theme="light"] needs no block. */
:root[data-theme='dark'] {
  /* …dark declarations (identical set)… */
}
```

Behaviour truth table:

| OS preference | `data-theme` attr | Result                                                     |
| ------------- | ----------------- | ---------------------------------------------------------- |
| dark          | (none)            | dark (media block matches)                                 |
| dark          | `light`           | light (media block excluded by `:not`; `:root` light wins) |
| light         | `dark`            | dark (`[data-theme="dark"]` block)                         |
| dark          | `dark`            | dark (both blocks agree)                                   |
| light         | (none)            | light (`:root` default)                                    |

**Duplication note.** A media-query selector and an attribute selector cannot be
merged, so the dark declaration list appears in both blocks. A test (below) asserts
the two blocks declare an **identical** property set and values, so they cannot
drift. (Alternative considered: hoist each dark hex into a single `--dark-*`
variable referenced by both blocks — eliminates hex duplication but adds 30+
indirection variables and hurts readability for the design agent reading this file.
Rejected in favour of plain duplication + a drift test.)

## Token mapping

Source legend: **[T]** = verbatim from the TutorConsole `[data-theme="dark"]` block ·
**[T-shadow]** = from the template's accent/shadow/overlay palette ·
**[D]** = derived-to-complete (provisional, tune in Storybook) ·
**[keep]** = intentionally unchanged in dark.

### Neutrals

| Token                  | Light     | Dark      | Src |
| ---------------------- | --------- | --------- | --- |
| `--color-paper`        | `#fffdf7` | `#181310` | T   |
| `--color-surface`      | `#fff9ee` | `#241d18` | T   |
| `--color-border`       | `#f0e6d0` | `#39302a` | T   |
| `--color-border-input` | `#e4d9c4` | `#453a32` | T   |
| `--color-muted`        | `#a79c89` | `#8f8578` | T   |
| `--color-slate`        | `#5c6670` | `#b8ad9f` | T   |
| `--color-ink`          | `#1f2933` | `#f4efe7` | T   |
| `--color-label`        | `#3a454f` | `#dcd3c6` | T   |

### Brand ramps

Brand **500s stay vivid** (matches the template's `--color-*` block, which does not
override them). `-50` steps are used only as tint backgrounds → dark bg. `-700` steps
are used only as foreground text (Chip, Text kicker, Toast link, QuizCard) → light fg.
`-100/-300/-900` are **not used by any component** (only shown in the token-showcase
story) → left light and allowlisted; revisit if a component adopts them.

| Token               | Light     | Dark      | Src             |
| ------------------- | --------- | --------- | --------------- |
| `--color-coral-50`  | `#feece8` | `#2c1c17` | T               |
| `--color-coral-100` | `#fbc7bc` | `#fbc7bc` | keep (unused)   |
| `--color-coral-300` | `#f79684` | `#f79684` | keep (unused)   |
| `--color-coral-500` | `#f14e3a` | `#f14e3a` | keep (vivid)    |
| `--color-coral-700` | `#c63823` | `#f0a08d` | T               |
| `--color-coral-900` | `#8a2415` | `#8a2415` | keep (unused)   |
| `--color-sun-50`    | `#fff6e1` | `#2a2213` | T               |
| `--color-sun-100`   | `#ffe7ae` | `#ffe7ae` | keep (unused)   |
| `--color-sun-300`   | `#ffd574` | `#ffd574` | keep (see note) |
| `--color-sun-500`   | `#ffc23c` | `#ffc23c` | keep (vivid)    |
| `--color-sun-700`   | `#c98a16` | `#f0c667` | T               |
| `--color-sun-900`   | `#8a5c09` | `#8a5c09` | keep (unused)   |
| `--color-teal-50`   | `#e1f3f3` | `#122725` | T               |
| `--color-teal-100`  | `#b3e0e0` | `#b3e0e0` | keep (unused)   |
| `--color-teal-300`  | `#5cbfbf` | `#5cbfbf` | keep (unused)   |
| `--color-teal-500`  | `#17a2a2` | `#17a2a2` | keep (vivid)    |
| `--color-teal-700`  | `#0f7373` | `#63cccc` | T               |
| `--color-teal-900`  | `#0a4a4a` | `#0a4a4a` | keep (unused)   |

> **sun-300 note:** `from-sun-300 to-sun-500` is a gradient in `ProgressBar` (sun
> variant). With 500 kept vivid and 300 kept light, the gradient stays as-is in dark.
> Acceptable first pass; flag for Storybook review.

### Semantic + tints

| Token                      | Light     | Dark      | Src                    |
| -------------------------- | --------- | --------- | ---------------------- |
| `--color-success`          | `#3dae6b` | `#52c489` | D                      |
| `--color-warning`          | `#f5a623` | `#edb54a` | D                      |
| `--color-error`            | `#e23b3b` | `#f0806e` | D (template logout-fg) |
| `--color-info`             | `#17a2a2` | `#4fc4c4` | D (template `--tc-on`) |
| `--color-success-tint`     | `#eaf6ef` | `#12251a` | T                      |
| `--color-error-tint`       | `#fdece9` | `#2c1715` | D                      |
| `--color-success-border`   | `#c9e8d5` | `#245c3d` | D                      |
| `--color-error-border`     | `#f4c7c1` | `#5a2b26` | D                      |
| `--color-success-text`     | `#2e8b54` | `#79d3a0` | T                      |
| `--color-success-subtitle` | `#3e7c58` | `#5fa87f` | D                      |

### Component surfaces + tracks

| Token                        | Light     | Dark      | Src |
| ---------------------------- | --------- | --------- | --- |
| `--color-surface-selected`   | `#f3fafa` | `#2c241d` | T   |
| `--color-progress-track`     | `#f1e7d2` | `#39302a` | T   |
| `--color-segmented-track`    | `#f3eadb` | `#2c241d` | T   |
| `--color-connector-locked`   | `#e7efef` | `#2b3230` | D   |
| `--color-node-locked-border` | `#d8cdb6` | `#4a4234` | D   |

### Interaction states

| Token                   | Light     | Dark      | Src |
| ----------------------- | --------- | --------- | --- |
| `--color-coral-hover`   | `#e0402d` | `#ff6a55` | D   |
| `--color-sun-hover`     | `#f5b52e` | `#ffce5c` | D   |
| `--color-error-hover`   | `#c92f2f` | `#e05548` | D   |
| `--color-disabled-bg`   | `#e9edee` | `#2c241d` | T   |
| `--color-disabled-text` | `#a6adb3` | `#6e655a` | T   |

### Shadows + focus rings

| Token                           | Light                                   | Dark                                 | Src      |
| ------------------------------- | --------------------------------------- | ------------------------------------ | -------- |
| `--shadow-button-lift-coral`    | `0 4px 0 #c63823`                       | `0 4px 0 #7a2e21`                    | T-shadow |
| `--shadow-button-lift-sun`      | `0 4px 0 #d99a18`                       | `0 4px 0 #8a6613`                    | T-shadow |
| `--shadow-button-pressed-coral` | `0 1px 0 #c63823`                       | `0 1px 0 #7a2e21`                    | T-shadow |
| `--shadow-button-pressed-sun`   | `0 1px 0 #d99a18`                       | `0 1px 0 #8a6613`                    | T-shadow |
| `--shadow-card-elevated`        | `0 14px 30px -18px rgba(90,60,30,0.45)` | `0 14px 30px -18px rgba(0,0,0,0.55)` | T-shadow |
| `--shadow-device`               | `0 30px 60px -30px rgba(90,60,30,0.5)`  | `0 30px 60px -30px rgba(0,0,0,0.6)`  | T-shadow |
| `--focus-ring-teal`             | `0 0 0 3px #d6efef`                     | `0 0 0 3px rgba(79,196,196,0.35)`    | D        |
| `--focus-ring-error`            | `0 0 0 3px #fbdcdc`                     | `0 0 0 3px rgba(240,128,110,0.35)`   | D        |

### Theme-invariant (no dark override)

All radii (`--radius-*`) — geometry, not colour.

## Testing (TDD)

Add dark-mode assertions test-first, before editing `tokens.css`. A small parser
reads `src/tokens/tokens.css` as text (no DOM needed).

1. **Selector presence.** Both `@media (prefers-color-scheme: dark)` (with the
   `:root:not([data-theme="light"])` guard) and `:root[data-theme="dark"]` blocks
   exist.
2. **Completeness.** Every colour/shadow/focus custom property declared in the base
   `:root` block is either (a) overridden in the dark blocks, or (b) on an explicit
   allowlist of intentionally-unchanged tokens (radii; `coral-500/sun-500/teal-500`;
   the inner ramp steps `*-100/*-300/*-900`, kept light). This catches the "forgot
   `--color-progress-track`" class of bug.
3. **Anti-drift.** The `@media` dark block and the `[data-theme="dark"]` block declare
   the **identical** set of properties with identical values.
4. **Anchor values.** Spot-check a few load-bearing verbatim values
   (`--color-paper` → `#181310`, `--color-ink` → `#f4efe7`, `--color-teal-700` →
   `#63cccc`) to lock the template mapping.

`tokens.ts` / `tokens.test.ts` for the JS mirror stay unchanged (out of scope).

## Conventions doc

Add a "Dark mode" section to `.design-sync/conventions.md` telling the design agent:

- Dark mode is automatic via the same utilities — no dark-specific classes.
- The DS follows OS preference by default and honours an explicit `data-theme="dark"`
  / `data-theme="light"` on the root (the viewer's toggle).
- Brand primaries stay vivid in dark; surfaces/text/tints flip via tokens.

## Deployment (re-sync)

After tokens land and build is green, re-sync per the design-sync skill (§7). Dark
tokens change `styleSha` → every component shows as styling-churned (canary). Confirm
light still matches; dark verification needs Storybook rendered in dark (plan a dark
compare or manual visual pass). Update `conventions.md`, then upload to the pinned
project (never delete user-authored `templates/`, `emails/`, `scraps/`, `uploads/`).

Bundle the pending uncommitted sync-state files (`.design-sync/config.json`,
`.design-sync/NOTES.md`) into the same branch/PR.

## Open items to tune in Storybook

- Derived **[D]** values (semantics, error/success borders & tints, hovers,
  connector/node-locked, focus rings) — eyeball against real components in dark.
- The `from-sun-300 to-sun-500` ProgressBar gradient in dark.
- Whether the token-showcase story's mixed light/dark ramp rows (from keeping inner
  steps light) reads acceptably, or whether to theme the unused steps for showcase
  coherence.
- Modal/overlay scrim: the DS has no scrim token (Modal handles its own overlay). The
  template's dark scrim is `rgba(0,0,0,.62)` — check Modal's overlay doesn't hardcode
  a light scrim that looks wrong in dark.
