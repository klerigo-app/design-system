# EspañoLenka — Design System & Component Library Handoff

## Overview
EspañoLenka is a private Spanish tutor (Lenka) offering 1:1 online/offline lessons, backed by a student portal and a guided learning app. This package documents the complete **brand + design system**: logo, color tokens, typography, iconography, core UI components, and learning-specific components (lessons, progress, streaks, quiz).

Visual direction: **"¡Fiesta!"** — warm, playful, and encouraging, for a broad all-ages audience.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look, spacing, and behavior. They are **not production code to copy directly**.

Your task is to **recreate this design system in the target codebase's environment** using its established patterns. If no codebase exists yet, choose the most appropriate stack (a React + TypeScript component library with CSS variables / a tokens file is a natural fit) and implement the system there. Build reusable, documented components — not one-off screens.

Open the HTML files in a browser to inspect live rendering. Each `.dc.html` requires `support.js` in the same folder.

## Fidelity
**High-fidelity.** All colors, typography, spacing, radii, and states below are final. Recreate pixel-accurately using the target environment's primitives.

---

## Design Tokens

### Color — Brand ramps
Each brand hue ships as a tint→shade ramp. `500` is the base.

**Coral** (`--coral`, primary actions)
| Step | Hex |
|---|---|
| 50 | `#FEECE8` |
| 100 | `#FBC7BC` |
| 300 | `#F79684` |
| 500 | `#F14E3A` |
| 700 | `#C63823` |
| 900 | `#8A2415` |

**Sunshine** (`--sun`, rewards / highlights)
| Step | Hex |
|---|---|
| 50 | `#FFF6E1` |
| 100 | `#FFE7AE` |
| 300 | `#FFD574` |
| 500 | `#FFC23C` |
| 700 | `#C98A16` |
| 900 | `#8A5C09` |

**Teal** (`--teal`, progress / accent)
| Step | Hex |
|---|---|
| 50 | `#E1F3F3` |
| 100 | `#B3E0E0` |
| 300 | `#5CBFBF` |
| 500 | `#17A2A2` |
| 700 | `#0F7373` |
| 900 | `#0A4A4A` |

### Color — Neutrals
| Token | Hex | Use |
|---|---|---|
| Paper | `#FFFDF7` | App background |
| Surface | `#FFF9EE` | Cards / panels |
| Border | `#F0E6D0` | Hairline borders |
| Border (input) | `#E4D9C4` | Form field borders |
| Muted | `#A79C89` | Tertiary text / captions |
| Slate | `#5C6670` | Secondary text |
| Ink | `#1F2933` | Primary text / dark surfaces |

### Color — Semantic
| Token | Hex |
|---|---|
| Success | `#3DAE6B` |
| Warning | `#F5A623` |
| Error | `#E23B3B` |
| Info | `#17A2A2` |

**Accessibility:** Coral 500 on Paper passes AA for large text only; use **Coral 700** (`#C63823`) for body-size text on light surfaces.

### Typography
- **Display / headings / buttons:** `Baloo 2` (weights 400/500/600/700). Rounded, warm. Chosen because it fully supports **Czech diacritics** (ě š č ř ž ů ď ť ň) as well as Spanish — the site is bilingual CZ/ES, so every display face must render both cleanly.
- **Body & UI:** `DM Sans` (400/500/600/700).
- **Mono / codes / pronunciation:** `DM Mono` (400/500).

Type scale:
| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Display | Baloo 2 | 60px | 600 | line-height 1.02, letter-spacing -0.01em |
| H1 | Baloo 2 | 38px | 600 | letter-spacing -0.01em |
| H2 | Baloo 2 | 28px | 500 | |
| H3 | DM Sans | 20px | 700 | |
| Body | DM Sans | 16px | 400 | line-height 1.5 |
| Small | DM Sans | 13px | 500 | secondary/caption |
| Mono | DM Mono | 13px | 400 | e.g. `[preˈteɾito]` |

Always include Spanish **and Czech** glyphs: `á é í ó ú ñ ¿ ¡` · `ě š č ř ž ý á í é ů ú ň ď ť`. Do not substitute a font that lacks Czech carons (e.g. Fredoka) — it breaks words like “Španělština”.

### Spacing
Base unit **4px**. Common steps: 4, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30, 34, 44, 56, 64, 72.

### Border radius
| Token | Value | Use |
|---|---|---|
| sm | 8px | chips inner, small controls |
| md | 12px | inputs, small buttons |
| lg | 14–16px | buttons, list cards |
| xl | 18–20px | cards, panels |
| 2xl | 22–24px | feature cards, containers |
| pill | 20px+ / 9999 | chips, badges, toggles |

### Shadows
- **Button lift (primary):** `0 4px 0 <color-700>` — a solid offset "press" shadow, not a blur. Pressed state: `transform: translateY(3px); box-shadow: 0 1px 0 <color-700>`.
- **Elevated card:** `0 14px 30px -18px rgba(90,60,30,0.45)`
- **Device / hero:** `0 30px 60px -30px rgba(90,60,30,0.5)`

### Focus ring
`border-color:#17A2A2; box-shadow:0 0 0 3px #D6EFEF` (teal). Error ring: `border-color:#E23B3B; box-shadow:0 0 0 3px #FBDCDC`.

---

## Logo

The **eL monogram** — `e` (España) + `L` (Lenka) — inside a rounded coral tile, capped with the Spanish tilde in Sunshine.

- **Tile:** background `#F14E3A`, corner radius ≈ 26% of tile size (e.g. 42px on a 160px tile, 16px on 60px, 11px on 40px).
- **Letters:** Baloo 2, white `#FFFFFF`. `e` weight 500, `L` weight 600 and ~12% larger than `e`. Letter gap between them: `margin-left: -0.04em` on the `L` (kerning overlap — expressed in em so it scales at any size).
- **Tilde:** Sunshine `#FFC23C`, drawn as a rounded wave stroke centered above the letters. SVG path (viewBox `0 0 86 30`): `M6 18 C 16 2, 30 2, 43 14 C 56 26, 70 26, 80 10`, `stroke-width` ~12, `stroke-linecap:round`.
- **Wordmark:** `Españo` in Ink (or white on dark), `Lenka` in Coral (or Sunshine on dark). Baloo 2 600.
- **One-color variants:** knockout (white eL + white tilde on Ink) and outline (Ink eL + Ink tilde on white). Always keep the tilde — it is the signature.
- **Clear space:** ½ the icon height on all sides.
- **Don't:** recolor the tile, gradient the letters, stretch/rotate, add drop-shadows to letterforms, separate the tilde, or swap the typeface.

---

## Core Components

### Button
Baloo 2 500. Radius 16 (medium). Padding: 14px 26px (medium). Sizes: small (13px / 8px 16px / radius 12), medium (16px / 14px 26px / radius 16), large (18px / 18px 34px / radius 20).

Variants:
- **Primary:** bg `#F14E3A`, text white, lift shadow `0 4px 0 #C63823`. Hover `#E0402D`. Active: translateY(3px), shadow `0 1px 0 #C63823`.
- **Reward:** bg `#FFC23C`, text `#1F2933`, lift `0 4px 0 #D99A18`. Hover `#F5B52E`.
- **Secondary:** bg white, text `#17A2A2`, 2px border `#17A2A2`. Hover bg `#E1F3F3`.
- **Ghost:** transparent, text `#5C6670`. Hover bg `#F0E6D0`, text Ink.
- **Disabled:** bg `#E9EDEE`, text `#A6ADB3`, `cursor:not-allowed`, no shadow.
- With leading icon: 20px icon, gap 9px. Full-width: `width:100%`.

One primary action per screen.

### Inputs & Forms
- Text input: bg white, 1.5px border `#E4D9C4`, radius 12, padding 12px 14px, DM Sans 15px. Label: DM Sans 13px/600, `#3A454F`, 7px below.
- Focus: teal ring (see tokens). Error: red ring + helper text `#E23B3B` 12.5px/500.
- Select: same box, custom chevron icon 20px `#A79C89` at right 12px, `appearance:none`.
- Checkbox: 24px, radius 8; checked = `#F14E3A` fill + white check (3px stroke).
- Radio: 24px circle, 2px border; selected = teal border `#17A2A2` + 12px teal dot.
- Toggle: 48×28 track radius 20; on = `#17A2A2`, off = `#E4D9C4`; 22px white knob with `0 1px 3px rgba(0,0,0,0.2)`.
- Search field: white, 1.5px border `#E4D9C4`, radius 12, leading magnifier icon, placeholder `#A79C89`.

### Cards
- **Flat surface:** bg white, 1px border `#F0E6D0`, radius 20, padding 24. No shadow. For lists/static content.
- **Elevated (tappable):** same + `0 14px 30px -18px rgba(90,60,30,0.45)`. Lifts on hover.
- **Feature (dark):** bg `#1F2933`, radius 20, white text; optional Sunshine decorative circle at 16–18% opacity. For promos/hero.

### Chips / Badges
Pill radius 20, padding 7px 14px, weight 600/700, 13px. Patterns:
- Level: bg `#E1F3F3`, text `#0F7373` ("A2 · Elemental").
- Category: bg `#FEECE8`, text `#C63823` ("Gramática").
- New: bg `#FFF6E1`, text `#C98A16`.
- Completed: bg `#EAF6EF`, text `#2E8B54`, leading check.
- Live: bg `#F14E3A`, white, leading white dot.
- Dark: bg `#1F2933`, white. Outline: 1.5px border `#E4D9C4`, text `#5C6670`.

---

## Learning Components

### Lesson card
Rounded card (radius 22, elevated). Left: 70×70 number tile, radius 18, gradient `linear-gradient(135deg,#FFC23C,#F14E3A)`, Baloo 2 600 white 28px. Right: level+category chip + duration (`8 min`, `#A79C89`), title (Baloo 2 500, 21px), subtitle (DM Sans 14px `#5C6670`). Footer: progress bar + `6 / 10` label + "Seguir" primary-small button.

### Progress bar
Track `#F1E7D2` (or `#F0E4D0`), height 8–14px, radius 6–8. Fill: Teal `#17A2A2` for lesson/unit progress; XP fill uses gradient `linear-gradient(90deg,#FFD574,#FFC23C)`.

### Progress ring
Conic gradient: `conic-gradient(#17A2A2 0% <pct>, #E7EFEF <pct> 100%)` on an 88px circle; inner 64px circle in Surface color holds the percent label (Baloo 2 600, 22px) + caption.

### Unit path
Horizontal node track. Node states:
- **Completed:** 56px teal `#17A2A2` circle + white check.
- **Current:** 64px coral `#F14E3A` circle + `0 0 0 5px #FBD3CB` halo, Baloo 2 number, label in coral 700.
- **Locked:** 56px white circle, 2px dashed `#D8CDB6` border, lock icon `#A79C89`, container opacity 0.55.
Connectors: 4px bars; completed = solid teal, partial = `linear-gradient(90deg,#17A2A2 <pct>,#E7EFEF <pct>)`, upcoming = `#E7EFEF`.

### Quiz card
Radius 22, elevated. Top: thin progress bar (Sunshine fill) + `2/5` mono counter. Prompt label: Teal 700, 13px, uppercase, letter-spacing 0.08em. Question: Baloo 2 500, 24px, with blank underscored in Coral. Answer options (radius 14, 2px border, padding 14–15px):
- **Default:** border `#E4D9C4`, bg white. Hover: border `#17A2A2`, bg `#F3FAFA`.
- **Selected:** border `#17A2A2`, bg `#F3FAFA`, filled teal radio.
- **Correct:** border `#3DAE6B`, bg `#EAF6EF`, green check badge + "¡Correcto!".
- **Wrong:** border `#F4C7C1`, bg `#FDECE9`, red ✕ badge.
Submit: full-width primary "Comprobar".

### Streak card
Dark feature card (radius 22, bg `#1F2933`). 66px rounded tile with day count, gradient `linear-gradient(135deg,#FFC23C,#F14E3A)`. Title "Racha de N días" (Baloo 2 500), encouraging subtitle. Week row: 7 day cells (radius 9, 34px tall); active days = Sunshine `#FFC23C` with Ink letter, inactive = `rgba(255,255,255,0.14)` with muted letter.

### Reward / completion banner
bg `#EAF6EF`, 1px border `#C9E8D5`, radius 18. 48px rounded green tile with white check. Title "¡Lección completada!" + "+50 XP · Nuevo logro" in `#3E7C58`.

---

## Iconography
- Single rounded line family — **Phosphor (Rounded)** is the reference set.
- 24px grid, 2px stroke, round caps & joins, ~2px optical padding. Ship at 20 / 24 / 28px.
- Default color Ink. Use one brand hue per icon to signal state (Coral = action, Teal = progress, Sunshine = reward). Never multicolor a single icon.
- On brand-color fills, min 44px tap target.

---

## Interactions & Behavior
- **Primary buttons** use a tactile press: rest shows a 4px solid offset shadow; on `:active` the button drops 3px and the shadow shrinks to 1px.
- **Answer options / tappable cards** shift border to Teal and background to `#F3FAFA` on hover.
- **Progress** (bars, rings, unit path) animates fill width/angle on value change (ease-out ~300ms suggested).
- **Streaks & rewards** should celebrate on completion (e.g., banner slide/scale-in, +XP count-up) — encouraging, never punishing.
- Nav is smooth-scroll within the spec page; in the app, the sidebar/bottom-nav is persistent.

---

## Assets
- **Fonts:** Baloo 2, DM Sans, DM Mono — Google Fonts.
- **Logo:** vector eL monogram (recreate as SVG per the Logo spec above; tilde path provided).
- **Icons:** Phosphor Rounded (or equivalent rounded 2px line set).
- No raster/photo assets are required by the system itself.

---

## Marketing Website

A fully responsive, **bilingual (Czech ⇄ Spanish)** single-page site, built on this system. Primary goal: drive a **contact / inquiry** (free trial lesson).

**Language:** a CZ/ES toggle in the nav swaps all copy live. Persist the choice (e.g. localStorage / route) in production. Every string exists in both languages — see the copy object in `EspañoLenka Website.dc.html` (`this.T.cs` / `this.T.es`) as the source of truth.

**Section order:**
1. **Sticky nav** — logo, section links (How it works / About / Testimonials), CZ·ES toggle, primary "Book a lesson" CTA. Translucent with blur; 1px bottom border `#F0E6D0`.
2. **Hero** — two interchangeable layouts (author chooses via the `heroStyle` tweak):
   - **split** — left: badge + H1 (accent word in Coral) + subhead + two CTAs + star trust line; right: 4:5 Coral-framed photo with a floating "streak" card and decorative Sunshine/Teal shapes.
   - **bold** — centered on Ink `#1F2933` with the eL mark, badge, large H1 (accent in Sunshine), subhead, CTAs, and a 16:9 image band framed by a Sunshine→Teal gradient; soft decorative blobs at low opacity (~0.12–0.16).
3. **How it works** — 4 numbered step cards (Surface bg, 1px border, radius 22). Each: rounded icon tile in a distinct brand tint, step number in the matching hue, title (Baloo 2 500), description. Auto-fit grid, min column 230px.
4. **About Lenka** — photo (1:1, framed) + bio, a 3-item check list, and 3 stat chips (years / students / rating). Two-column, wraps to stacked.
5. **Testimonials** — 3 cards (white, radius 22, soft shadow): 5-star row, quote, circular avatar + name + level. Auto-fit grid, min column 280px.
6. **Contact** — dark section `#1F2933`. Left: kicker + title + subhead + "free / no-obligation / reply in 24h" pill. Right: inquiry form on Paper card — name, email, level select, message textarea, full-width primary submit. Teal focus rings.
7. **Footer** — Ink `#161D24`, logo + tagline + copyright.

**Responsiveness:** fluid type via `clamp()`, `flex-wrap` + auto-fit grids throughout; container is `min(1200px, 92vw)`. No fixed breakpoints required — it reflows continuously and stacks cleanly on mobile.

**Photos:** every image is a drop-in placeholder (`image-slot.js` web component) with a stable `id` so a dropped image persists. Replace with real `<img>`/CMS content in production; keep the frame wrappers (aspect-ratio, radius, padding) as the styling.

**Tweaks (author-facing props):** `heroStyle` = `split` | `bold`; `defaultLang` = `cs` | `es`.

---

## Files
- `EspañoLenka Design System.dc.html` — the full documented system (tokens, type, icons, components, learning components, sample screens).
- `EspañoLenka Logo.dc.html` — the logo sheet (lockups, app-icon sizes, one-color variants, clear space, do/don't). Includes a tweakable letter-gap control.
- `EspañoLenka Website.dc.html` — the bilingual marketing site (nav, two hero layouts, how-it-works, about, testimonials, contact form, footer). Copy lives in the logic class's `T` object.
- `EspañoLenka Brand Directions.dc.html` — the three original brand explorations (context; direction 1b "¡Fiesta!" was chosen).
- `logos/` — the eL logo exported as standalone SVGs (coral / ink / mono marks, horizontal, reversed, stacked). Letters are live Baloo 2 text; convert to outlines if placing where the web font can't load.
- `image-slot.js` — web component powering the drag-to-drop photo placeholders on the website.
- `support.js` — runtime required to open the `.dc.html` files in a browser.
