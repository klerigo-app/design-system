# EspañoLenka Design System — Component Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@espanolenka/design-system`, an installable React + TypeScript component library implementing the EspañoLenka brand system (tokens, logo, core components, learning components) as specified in `espanolenka_design_system/README.md` and `docs/superpowers/specs/2026-07-01-design-system-library-design.md`.

**Architecture:** Single pnpm package at repo root, built with Vite in library mode. Tailwind CSS utility classes read all visual values through a CSS-custom-property token layer (`src/tokens/tokens.css`), so the README's exact hex/px values live in one place. Components use `class-variance-authority` for variant logic and are organized one-folder-per-component with co-located tests (Vitest + Testing Library) and Storybook stories.

**Tech Stack:** React 18/19, TypeScript, Vite + vite-plugin-dts, Tailwind CSS v3, class-variance-authority, clsx, @phosphor-icons/react, @fontsource (Baloo 2 / DM Sans / DM Mono), Vitest + @testing-library/react, Storybook (Vite builder), ESLint 9 flat config + Prettier, pnpm.

## Global Constraints

- Package name: `@espanolenka/design-system`. Single package at repo root — no monorepo.
- All color/radius/shadow/focus-ring values must come from `src/tokens/tokens.css` custom properties, referenced through `tailwind.config.js` `theme.extend` — never hardcode a token hex value directly in a component's Tailwind class or inline style. One-off values not in the token set (e.g. a specific hover color) may use Tailwind arbitrary-value syntax (`bg-[#E0402D]`).
- Every component: native semantic HTML elements for interactive controls (`<button>`, `<input>`, `<select>`) — no reimplementing controls with `<div role="...">`.
- No i18n/copy logic inside components. All text (labels, button text, captions) is a consumer-supplied prop.
- No animation library. CSS transitions/`@keyframes` only.
- Chip/Badge variants are the fixed named set from the spec (`level | category | new | completed | live | dark | outline`) — no generic freeform color prop.
- Every component ships a co-located `.test.tsx` (Vitest + Testing Library) and `.stories.tsx` (Storybook).
- Commit after each task's tests pass.

## Addendum (found during Task 10): Tailwind CSS was never actually generated

Tasks 1-9 shipped correctly per their briefs, but the plan itself had a foundational
gap that none of the automated checks (`pnpm test`/`lint`/`build`, Storybook booting
without console errors) could catch: **no file anywhere contained the `@tailwind
base; @tailwind components; @tailwind utilities;` directives**, so Tailwind never
generated any actual CSS for the utility classes every component uses (`bg-coral-500`,
`rounded-lg`, etc.). Every component rendered completely unstyled. The user caught
this by actually looking at Storybook. Fixed retroactively as follows — treat this as
the authoritative build/CSS architecture for Task 10 onward, superseding anything
Tasks 1/2/20 said about `tokens.css`/`fonts.css` build output:

- `src/tokens/tokens.css` now starts with `@tailwind base; @tailwind components;
  @tailwind utilities;` before the `:root { ... }` custom properties block.
- `src/index.ts` now has `import './tokens/tokens.css'` at the top (so Vite's library
  build actually processes and emits it as `dist/index.css`, scanned against
  `tailwind.config.js`'s `content` globs). It deliberately does NOT import
  `./tokens/fonts.css` — see below for why.
- `tsconfig.json` needed `"types": ["vite/client"]` added to `compilerOptions` so
  TypeScript accepts the CSS side-effect import.
- `fonts.css` is intentionally kept OUT of the JS/CSS module graph. When it was
  imported through Vite's library build, the `@fontsource` WOFF2 files got
  base64-inlined directly into the CSS (Vite lib mode has no stable public asset path
  to emit loose files to), producing a 1.7MB stylesheet. Since `fonts.css` only
  contains bare-specifier `@import '@fontsource/...'` statements (no component
  styling), it doesn't need Tailwind/PostCSS processing at all — it just needs to
  reach `dist/fonts.css` verbatim, the same as the source file, so that a *consuming
  app's own bundler* resolves the `@fontsource` imports against its own
  `node_modules` (standard pattern; `@fontsource/*` are real `dependencies`, not
  `devDependencies`, of this package, from Task 1, so they install transitively).
  `package.json`'s `build` script is now `"tsc -p tsconfig.json && vite build && cp
  src/tokens/fonts.css dist/fonts.css"`.
- `package.json`'s `exports` map: `"./tokens.css"` now points at `"./dist/index.css"`
  (Vite names the library's CSS output after the JS entry, not after the source file
  it started as) — the public subpath name `tokens.css` is unchanged, only its target
  moved. `"./fonts.css"` still points at `"./dist/fonts.css"`, now populated by the
  copy step above instead of a Vite-bundled (and bloated) file.
- `.storybook/preview.tsx` needed no changes — it already imports both source files
  directly (`../src/tokens/tokens.css`, `../src/tokens/fonts.css`), and Storybook's
  own Vite dev/build (an app build, not a library build) correctly expands the
  `@tailwind` directives and emits real separate font asset files rather than
  inlining them, since app-mode Vite's default asset handling differs from lib mode.

Verified end-to-end: `dist/index.css` contains real rules (e.g.
`.bg-coral-500{background-color:var(--color-coral-500)}`) at ~12KB; `dist/fonts.css`
is ~4KB of `@import`/custom-properties; `pnpm build-storybook`'s output CSS also
contains the same real utility rules and emits actual `.woff2` files (not inlined).

---
## Task 1: Project scaffolding & tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.setup.ts`
- Create: `tailwind.config.js`, `postcss.config.js`
- Create: `eslint.config.js`, `.prettierrc`, `.gitignore`
- Create: `src/index.ts` (placeholder barrel)
- Create: `.storybook/main.ts`, `.storybook/preview.ts` (via Storybook generator, then edited)

**Interfaces:**
- Produces: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm dev` (Storybook), `pnpm build-storybook` scripts that every later task relies on.

- [ ] **Step 1: Initialize the package and install dependencies**

```bash
pnpm init
pnpm add react react-dom class-variance-authority clsx @phosphor-icons/react \
  @fontsource/baloo-2 @fontsource/dm-sans @fontsource/dm-mono
pnpm add -D typescript vite @vitejs/plugin-react vite-plugin-dts \
  tailwindcss postcss autoprefixer \
  vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks \
  prettier fontkit @types/react @types/react-dom
```

- [ ] **Step 2: Edit `package.json`**

Replace its contents with:

```json
{
  "name": "@espanolenka/design-system",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./tokens.css": "./dist/tokens.css",
    "./fonts.css": "./dist/fonts.css"
  },
  "files": ["dist"],
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "tsc -p tsconfig.json && vite build",
    "build-storybook": "storybook build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "peerDependencies": {
    "react": "^18.3.0 || ^19.0.0",
    "react-dom": "^18.3.0 || ^19.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": false },
    "react-dom": { "optional": false }
  }
}
```

Then re-run `pnpm install` so pnpm re-links dependency fields you didn't touch (it preserves the `dependencies`/`devDependencies` blocks pnpm already wrote — only merge in the fields above, do not delete the dependency lists from Step 1).

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationDir": "dist",
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "exclude": ["src/**/*.stories.tsx", "src/**/*.test.tsx"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

- [ ] **Step 5: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: {
          50: 'var(--color-coral-50)',
          100: 'var(--color-coral-100)',
          300: 'var(--color-coral-300)',
          500: 'var(--color-coral-500)',
          700: 'var(--color-coral-700)',
          900: 'var(--color-coral-900)',
        },
        sun: {
          50: 'var(--color-sun-50)',
          100: 'var(--color-sun-100)',
          300: 'var(--color-sun-300)',
          500: 'var(--color-sun-500)',
          700: 'var(--color-sun-700)',
          900: 'var(--color-sun-900)',
        },
        teal: {
          50: 'var(--color-teal-50)',
          100: 'var(--color-teal-100)',
          300: 'var(--color-teal-300)',
          500: 'var(--color-teal-500)',
          700: 'var(--color-teal-700)',
          900: 'var(--color-teal-900)',
        },
        paper: 'var(--color-paper)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        'border-input': 'var(--color-border-input)',
        muted: 'var(--color-muted)',
        slate: 'var(--color-slate)',
        ink: 'var(--color-ink)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        'lift-coral': 'var(--shadow-button-lift-coral)',
        'lift-sun': 'var(--shadow-button-lift-sun)',
        elevated: 'var(--shadow-card-elevated)',
        device: 'var(--shadow-device)',
        'focus-teal': 'var(--focus-ring-teal)',
        'focus-error': 'var(--focus-ring-error)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 8: Create `eslint.config.js`**

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist/**', 'storybook-static/**', '.storybook/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
)
```

- [ ] **Step 9: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

- [ ] **Step 10: Create `.gitignore`**

```
node_modules
dist
storybook-static
*.log
```

- [ ] **Step 11: Create placeholder `src/index.ts`**

```ts
export {}
```

- [ ] **Step 12: Verify the build pipeline runs end-to-end**

Run: `pnpm build`
Expected: completes with no errors, producing `dist/index.js` and `dist/index.d.ts` (empty module is fine at this stage).

Run: `pnpm lint`
Expected: no errors (no source files to lint yet besides config files).

- [ ] **Step 13: Install and configure Storybook**

```bash
pnpm dlx storybook@latest init --type react --builder vite --yes
```

Expected: adds `@storybook/react-vite` and related packages, creates `.storybook/main.ts` and `.storybook/preview.ts`, and a `storybook` + `build-storybook` script in `package.json` (rename/merge the generated script into the `build-storybook` key already defined in Step 2 if the generator names it differently).

Edit `.storybook/main.ts` so the `stories` field reads:

```ts
stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
```

Edit `.storybook/preview.ts` to import the token stylesheets at the top:

```ts
import '../src/tokens/tokens.css'
import '../src/tokens/fonts.css'
```

(These two files don't exist yet — they're created in Task 2. Storybook will only need them once that task lands; the import lines are safe to add now.)

- [ ] **Step 14: Verify Storybook boots**

Run: `pnpm dev` (or `pnpm storybook` if the generator used that script name), then stop it once the Storybook UI loads at `http://localhost:6006` without errors (it will show the generator's example stories — that's expected at this stage).

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "Scaffold @espanolenka/design-system package (Vite, Tailwind, Vitest, Storybook, ESLint)"
```

---

## Task 2: Design tokens

**Files:**
- Create: `src/tokens/tokens.css`, `src/tokens/tokens.ts`, `src/tokens/tokens.test.ts`
- Create: `src/tokens/fonts.css`
- Create: `src/tokens/Tokens.stories.tsx`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `colors`, `radii`, `shadows` named exports from `src/tokens/tokens.ts`, and the CSS custom properties consumed by `tailwind.config.js` (Task 1, Step 7).

- [ ] **Step 1: Write the failing test**

Create `src/tokens/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { colors, radii, shadows } from './tokens'

describe('tokens', () => {
  it('exposes all three brand color ramps with the 6 README steps', () => {
    for (const ramp of [colors.coral, colors.sun, colors.teal]) {
      expect(Object.keys(ramp)).toEqual(['50', '100', '300', '500', '700', '900'])
    }
  })

  it('matches the README hex values for the 500 steps', () => {
    expect(colors.coral[500]).toBe('#F14E3A')
    expect(colors.sun[500]).toBe('#FFC23C')
    expect(colors.teal[500]).toBe('#17A2A2')
  })

  it('matches the README neutral and semantic hex values', () => {
    expect(colors.paper).toBe('#FFFDF7')
    expect(colors.ink).toBe('#1F2933')
    expect(colors.error).toBe('#E23B3B')
  })

  it('exposes the button lift shadows and pill radius', () => {
    expect(shadows.buttonLiftCoral).toBe('0 4px 0 #C63823')
    expect(shadows.buttonLiftSun).toBe('0 4px 0 #D99A18')
    expect(radii.pill).toBe('9999px')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/tokens/tokens.test.ts`
Expected: FAIL — `Cannot find module './tokens'`.

- [ ] **Step 3: Create `src/tokens/tokens.ts`**

```ts
export const colors = {
  coral: { 50: '#FEECE8', 100: '#FBC7BC', 300: '#F79684', 500: '#F14E3A', 700: '#C63823', 900: '#8A2415' },
  sun: { 50: '#FFF6E1', 100: '#FFE7AE', 300: '#FFD574', 500: '#FFC23C', 700: '#C98A16', 900: '#8A5C09' },
  teal: { 50: '#E1F3F3', 100: '#B3E0E0', 300: '#5CBFBF', 500: '#17A2A2', 700: '#0F7373', 900: '#0A4A4A' },
  paper: '#FFFDF7',
  surface: '#FFF9EE',
  border: '#F0E6D0',
  borderInput: '#E4D9C4',
  muted: '#A79C89',
  slate: '#5C6670',
  ink: '#1F2933',
  success: '#3DAE6B',
  warning: '#F5A623',
  error: '#E23B3B',
  info: '#17A2A2',
} as const

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  pill: '9999px',
  card: '22px',
} as const

export const shadows = {
  buttonLiftCoral: '0 4px 0 #C63823',
  buttonLiftSun: '0 4px 0 #D99A18',
  cardElevated: '0 14px 30px -18px rgba(90, 60, 30, 0.45)',
  device: '0 30px 60px -30px rgba(90, 60, 30, 0.5)',
  focusRingTeal: '0 0 0 3px #D6EFEF',
  focusRingError: '0 0 0 3px #FBDCDC',
} as const
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/tokens/tokens.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `src/tokens/tokens.css`**

```css
:root {
  /* Coral */
  --color-coral-50: #FEECE8;
  --color-coral-100: #FBC7BC;
  --color-coral-300: #F79684;
  --color-coral-500: #F14E3A;
  --color-coral-700: #C63823;
  --color-coral-900: #8A2415;

  /* Sunshine */
  --color-sun-50: #FFF6E1;
  --color-sun-100: #FFE7AE;
  --color-sun-300: #FFD574;
  --color-sun-500: #FFC23C;
  --color-sun-700: #C98A16;
  --color-sun-900: #8A5C09;

  /* Teal */
  --color-teal-50: #E1F3F3;
  --color-teal-100: #B3E0E0;
  --color-teal-300: #5CBFBF;
  --color-teal-500: #17A2A2;
  --color-teal-700: #0F7373;
  --color-teal-900: #0A4A4A;

  /* Neutrals */
  --color-paper: #FFFDF7;
  --color-surface: #FFF9EE;
  --color-border: #F0E6D0;
  --color-border-input: #E4D9C4;
  --color-muted: #A79C89;
  --color-slate: #5C6670;
  --color-ink: #1F2933;

  /* Semantic */
  --color-success: #3DAE6B;
  --color-warning: #F5A623;
  --color-error: #E23B3B;
  --color-info: #17A2A2;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-pill: 9999px;
  --radius-card: 22px;

  /* Shadows */
  --shadow-button-lift-coral: 0 4px 0 #C63823;
  --shadow-button-lift-sun: 0 4px 0 #D99A18;
  --shadow-card-elevated: 0 14px 30px -18px rgba(90, 60, 30, 0.45);
  --shadow-device: 0 30px 60px -30px rgba(90, 60, 30, 0.5);

  /* Focus rings */
  --focus-ring-teal: 0 0 0 3px #D6EFEF;
  --focus-ring-error: 0 0 0 3px #FBDCDC;
}
```

- [ ] **Step 6: Create `src/tokens/fonts.css`**

```css
@import '@fontsource/baloo-2/400.css';
@import '@fontsource/baloo-2/500.css';
@import '@fontsource/baloo-2/600.css';
@import '@fontsource/baloo-2/700.css';
@import '@fontsource/dm-sans/400.css';
@import '@fontsource/dm-sans/500.css';
@import '@fontsource/dm-sans/600.css';
@import '@fontsource/dm-sans/700.css';
@import '@fontsource/dm-mono/400.css';
@import '@fontsource/dm-mono/500.css';

:root {
  --font-display: 'Baloo 2', 'Trebuchet MS', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
}
```

- [ ] **Step 7: Create `src/tokens/Tokens.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { colors, radii } from './tokens'

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: hex, border: '1px solid #F0E6D0' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        {name}: {hex}
      </span>
    </div>
  )
}

function TokensPage() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-display)' }}>Color ramps</h2>
      {(['coral', 'sun', 'teal'] as const).map((ramp) => (
        <div key={ramp} style={{ marginBottom: 16 }}>
          <h3>{ramp}</h3>
          {Object.entries(colors[ramp]).map(([step, hex]) => (
            <Swatch key={step} name={`${ramp}-${step}`} hex={hex} />
          ))}
        </div>
      ))}
      <h2 style={{ fontFamily: 'var(--font-display)' }}>Radii</h2>
      {Object.entries(radii).map(([name, value]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 60, height: 40, borderRadius: value, background: colors.teal[100] }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            {name}: {value}
          </span>
        </div>
      ))}
    </div>
  )
}

const meta: Meta<typeof TokensPage> = {
  title: 'Tokens/Overview',
  component: TokensPage,
}
export default meta

type Story = StoryObj<typeof TokensPage>
export const Overview: Story = {}
```

- [ ] **Step 8: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
```

- [ ] **Step 9: Verify build and lint still pass**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add src/tokens package.json src/index.ts
git commit -m "Add design tokens (CSS vars + typed tokens.ts + fonts)"
```

---

## Task 3: Logo (glyph outline extraction + LogoMark + Logo)

**Files:**
- Create: `scripts/extract-glyph-paths.mjs`
- Create: `src/components/Logo/glyphPaths.ts`
- Create: `src/components/Logo/LogoMark.tsx`, `src/components/Logo/Logo.tsx`
- Create: `src/components/Logo/Logo.test.tsx`, `src/components/Logo/Logo.stories.tsx`
- Create: `src/components/Logo/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `LogoMark` (props: `size?: number`, `variant?: 'coral' | 'knockout' | 'outline'`, `className?: string`), `Logo` (props: `variant?`, `orientation?: 'horizontal' | 'stacked'`, `markSize?: number`, `className?: string`).

- [ ] **Step 1: Write the one-off glyph extraction script**

Create `scripts/extract-glyph-paths.mjs`:

```js
// One-off dev script: extracts 'e' (weight 500) and 'L' (weight 600) glyph
// outlines from the Baloo 2 font and prints ready-to-paste path constants
// for src/components/Logo/glyphPaths.ts.
// Run with: node scripts/extract-glyph-paths.mjs
import fontkit from 'fontkit'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// Matches the reference logo-mark-*.svg construction: 512x512 tile,
// text anchored at x=256 (text-anchor: middle), baseline y=360,
// 'e' at font-size 250 (weight 500), 'L' at font-size 280 (weight 600), dx=-10 before 'L'.
const TILE_CENTER_X = 256
const BASELINE_Y = 360
const E_FONT_SIZE = 250
const L_FONT_SIZE = 280
const L_DX = -10

function glyphPathAt(font, char, fontSize, originX, baselineY) {
  const glyph = font.glyphForCodePoint(char.codePointAt(0))
  const scale = fontSize / font.unitsPerEm
  const advance = glyph.advanceWidth * scale

  const toSvgPoint = (x, y) => `${(originX + x * scale).toFixed(2)},${(baselineY - y * scale).toFixed(2)}`

  const commands = glyph.path.commands.map((cmd) => {
    switch (cmd.command) {
      case 'moveTo':
        return `M ${toSvgPoint(cmd.args[0], cmd.args[1])}`
      case 'lineTo':
        return `L ${toSvgPoint(cmd.args[0], cmd.args[1])}`
      case 'quadraticCurveTo':
        return `Q ${toSvgPoint(cmd.args[0], cmd.args[1])} ${toSvgPoint(cmd.args[2], cmd.args[3])}`
      case 'bezierCurveTo':
        return `C ${toSvgPoint(cmd.args[0], cmd.args[1])} ${toSvgPoint(cmd.args[2], cmd.args[3])} ${toSvgPoint(cmd.args[4], cmd.args[5])}`
      case 'closePath':
        return 'Z'
      default:
        throw new Error(`Unhandled path command: ${cmd.command}`)
    }
  })

  return { d: commands.join(' '), advance }
}

const fontE = fontkit.openSync(require.resolve('@fontsource/baloo-2/files/baloo-2-latin-500-normal.woff2'))
const fontL = fontkit.openSync(require.resolve('@fontsource/baloo-2/files/baloo-2-latin-600-normal.woff2'))

// First pass (at origin 0,0) just to read advance widths, so the "eL" pair
// can be centered as one block around TILE_CENTER_X, matching the source SVG's
// single <text text-anchor="middle"> behavior.
const eProbe = glyphPathAt(fontE, 'e', E_FONT_SIZE, 0, 0)
const lProbe = glyphPathAt(fontL, 'L', L_FONT_SIZE, 0, 0)
const totalWidth = eProbe.advance + L_DX + lProbe.advance
const startX = TILE_CENTER_X - totalWidth / 2

const e = glyphPathAt(fontE, 'e', E_FONT_SIZE, startX, BASELINE_Y)
const l = glyphPathAt(fontL, 'L', L_FONT_SIZE, startX + e.advance + L_DX, BASELINE_Y)

console.log('// Paste into src/components/Logo/glyphPaths.ts')
console.log(`export const LETTER_E_PATH = '${e.d}'`)
console.log(`export const LETTER_L_PATH = '${l.d}'`)
```

- [ ] **Step 2: Run the script and capture its output**

Run: `node scripts/extract-glyph-paths.mjs`
Expected: prints two `export const` lines with SVG path `d` strings (the exact coordinates depend on the font's real glyph outlines, so they can't be predicted ahead of time — that's the point of running the script).

- [ ] **Step 3: Create `src/components/Logo/glyphPaths.ts`**

Paste the script's exact output into this file. It will look like this shape (values will differ — use what your run of the script printed, do not use these placeholder numbers verbatim):

```ts
// Generated by scripts/extract-glyph-paths.mjs — do not hand-edit.
export const LETTER_E_PATH = 'M 190.10,321.40 ... Z'
export const LETTER_L_PATH = 'M 300.20,360.00 ... Z'
```

- [ ] **Step 4: Write the failing test for LogoMark and Logo**

Create `src/components/Logo/Logo.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LogoMark } from './LogoMark'
import { Logo } from './Logo'

describe('LogoMark', () => {
  it('renders with an accessible label', () => {
    render(<LogoMark />)
    expect(screen.getByRole('img', { name: 'EspañoLenka' })).toBeInTheDocument()
  })

  it.each(['coral', 'knockout', 'outline'] as const)('renders the %s variant without throwing', (variant) => {
    render(<LogoMark variant={variant} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})

describe('Logo', () => {
  it('renders both parts of the wordmark', () => {
    render(<Logo />)
    expect(screen.getByText('Españo')).toBeInTheDocument()
    expect(screen.getByText('Lenka')).toBeInTheDocument()
  })

  it.each(['horizontal', 'stacked'] as const)('renders the %s orientation without throwing', (orientation) => {
    render(<Logo orientation={orientation} />)
    expect(screen.getByText('Españo')).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `pnpm vitest run src/components/Logo/Logo.test.tsx`
Expected: FAIL — `Cannot find module './LogoMark'`.

- [ ] **Step 6: Create `src/components/Logo/LogoMark.tsx`**

```tsx
import { LETTER_E_PATH, LETTER_L_PATH } from './glyphPaths'

const TILDE_PATH = 'M6 18 C 16 2, 30 2, 43 14 C 56 26, 70 26, 80 10'

export type LogoMarkVariant = 'coral' | 'knockout' | 'outline'

export interface LogoMarkProps {
  size?: number
  variant?: LogoMarkVariant
  className?: string
}

const TILE_FILL: Record<LogoMarkVariant, string> = {
  coral: '#F14E3A',
  knockout: '#1F2933',
  outline: 'none',
}

const LETTER_FILL: Record<LogoMarkVariant, string> = {
  coral: '#FFFFFF',
  knockout: '#FFFFFF',
  outline: '#1F2933',
}

const STROKE_COLOR: Record<LogoMarkVariant, string> = {
  coral: '#FFC23C',
  knockout: '#FFFFFF',
  outline: '#1F2933',
}

export function LogoMark({ size = 160, variant = 'coral', className }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" role="img" aria-label="EspañoLenka" className={className}>
      {variant === 'outline' ? (
        <rect x={4} y={4} width={504} height={504} rx={130} fill="none" stroke={STROKE_COLOR.outline} strokeWidth={8} />
      ) : (
        <rect width={512} height={512} rx={132} fill={TILE_FILL[variant]} />
      )}
      <g
        transform="translate(161,104) scale(2.21)"
        fill="none"
        stroke={STROKE_COLOR[variant]}
        strokeWidth={11}
        strokeLinecap="round"
      >
        <path d={TILDE_PATH} />
      </g>
      <path d={LETTER_E_PATH} fill={LETTER_FILL[variant]} />
      <path d={LETTER_L_PATH} fill={LETTER_FILL[variant]} />
    </svg>
  )
}
```

- [ ] **Step 7: Create `src/components/Logo/Logo.tsx`**

```tsx
import { LogoMark, type LogoMarkVariant } from './LogoMark'

export type LogoOrientation = 'horizontal' | 'stacked'

export interface LogoProps {
  variant?: LogoMarkVariant
  orientation?: LogoOrientation
  markSize?: number
  className?: string
}

const ESPANO_COLOR: Record<LogoMarkVariant, string> = {
  coral: '#1F2933',
  knockout: '#FFFFFF',
  outline: '#1F2933',
}

const LENKA_COLOR: Record<LogoMarkVariant, string> = {
  coral: '#F14E3A',
  knockout: '#FFC23C',
  outline: '#F14E3A',
}

export function Logo({ variant = 'coral', orientation = 'horizontal', markSize = 40, className }: LogoProps) {
  const isStacked = orientation === 'stacked'
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: isStacked ? 'column' : 'row',
        alignItems: 'center',
        gap: isStacked ? 8 : 12,
      }}
    >
      <LogoMark size={markSize} variant={variant} />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: markSize * 0.46,
          color: ESPANO_COLOR[variant],
          whiteSpace: 'nowrap',
        }}
      >
        Españo
        <span style={{ color: LENKA_COLOR[variant] }}>Lenka</span>
      </span>
    </div>
  )
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm vitest run src/components/Logo/Logo.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 9: Create `src/components/Logo/index.ts`**

```ts
export * from './LogoMark'
export * from './Logo'
```

- [ ] **Step 10: Create `src/components/Logo/Logo.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from './Logo'
import { LogoMark } from './LogoMark'

const meta: Meta<typeof Logo> = {
  title: 'Brand/Logo',
  component: Logo,
  argTypes: {
    variant: { control: 'select', options: ['coral', 'knockout', 'outline'] },
    orientation: { control: 'select', options: ['horizontal', 'stacked'] },
  },
}
export default meta

type Story = StoryObj<typeof Logo>

export const Horizontal: Story = { args: { orientation: 'horizontal' } }
export const Stacked: Story = { args: { orientation: 'stacked' } }
export const Knockout: Story = {
  args: { variant: 'knockout' },
  decorators: [(Story) => <div style={{ background: '#1F2933', padding: 24 }}><Story /></div>],
}

export const MarkOnly: StoryObj<typeof LogoMark> = {
  render: (args) => <LogoMark {...args} />,
  args: { size: 160, variant: 'coral' },
}
```

- [ ] **Step 11: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
```

- [ ] **Step 12: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 13: Commit**

```bash
git add scripts src/components/Logo src/index.ts package.json
git commit -m "Add Logo and LogoMark components with extracted glyph outlines"
```

---

## Task 4: Button

**Files:**
- Create: `src/components/Button/Button.tsx`, `src/components/Button/Button.test.tsx`, `src/components/Button/Button.stories.tsx`, `src/components/Button/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `Button` component, `ButtonProps` (`variant?: 'primary' | 'reward' | 'secondary' | 'ghost'`, `size?: 'sm' | 'md' | 'lg'`, `fullWidth?: boolean`, `icon?: ReactNode`, `disabled?: boolean`, plus native `<button>` attributes).

- [ ] **Step 1: Write the failing test**

Create `src/components/Button/Button.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it.each(['primary', 'reward', 'secondary', 'ghost'] as const)('renders the %s variant', (variant) => {
    render(<Button variant={variant}>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it.each(['sm', 'md', 'lg'] as const)('renders the %s size', (size) => {
    render(<Button size={size}>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('fires onClick when enabled', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders a leading icon when provided', () => {
    render(<Button icon={<svg data-testid="icon" />}>Click me</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/Button/Button.test.tsx`
Expected: FAIL — `Cannot find module './Button'`.

- [ ] **Step 3: Create `src/components/Button/Button.tsx`**

```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-[9px] font-display font-medium transition-transform duration-150 disabled:cursor-not-allowed disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-coral-500 text-white shadow-lift-coral hover:bg-[#E0402D] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-coral-700)]',
        reward:
          'bg-sun-500 text-ink shadow-lift-sun hover:bg-[#F5B52E] active:translate-y-[3px] active:shadow-[0_1px_0_#D99A18]',
        secondary: 'bg-white text-teal-500 border-2 border-teal-500 hover:bg-teal-50',
        ghost: 'bg-transparent text-slate hover:bg-border hover:text-ink',
        disabled: 'bg-[#E9EDEE] text-[#A6ADB3]',
      },
      size: {
        sm: 'text-[13px] px-4 py-2 rounded-md',
        md: 'text-base px-[26px] py-[14px] rounded-lg',
        lg: 'text-lg px-[34px] py-[18px] rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
)

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    Omit<VariantProps<typeof buttonStyles>, 'variant'> {
  variant?: 'primary' | 'reward' | 'secondary' | 'ghost'
  icon?: ReactNode
  disabled?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, fullWidth, icon, disabled, className, children, ...props }, ref) => {
    const resolvedVariant = disabled ? 'disabled' : variant
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(buttonStyles({ variant: resolvedVariant, size, fullWidth }), className)}
        {...props}
      >
        {icon && <span className="w-5 h-5 shrink-0">{icon}</span>}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/Button/Button.test.tsx`
Expected: PASS (9 tests).

- [ ] **Step 5: Create `src/components/Button/index.ts`**

```ts
export * from './Button'
```

- [ ] **Step 6: Create `src/components/Button/Button.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Core/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'reward', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Reservar clase' },
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { variant: 'primary' } }
export const Reward: Story = { args: { variant: 'reward' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Disabled: Story = { args: { disabled: true } }
export const FullWidth: Story = { args: { fullWidth: true } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/Button src/index.ts
git commit -m "Add Button component"
```

---

## Task 5: TextInput

**Files:**
- Create: `src/components/TextInput/TextInput.tsx`, `src/components/TextInput/TextInput.test.tsx`, `src/components/TextInput/TextInput.stories.tsx`, `src/components/TextInput/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `TextInput` component, `TextInputProps` (`id: string`, `label: string`, `helperText?: string`, `error?: string`, plus native `<input>` attributes except `id`).

- [ ] **Step 1: Write the failing test**

Create `src/components/TextInput/TextInput.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextInput } from './TextInput'

describe('TextInput', () => {
  it('associates the label with the input', () => {
    render(<TextInput id="email" label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows helper text when there is no error', () => {
    render(<TextInput id="email" label="Email" helperText="We will not share this" />)
    expect(screen.getByText('We will not share this')).toBeInTheDocument()
  })

  it('shows error text instead of helper text, and marks the input invalid', () => {
    render(<TextInput id="email" label="Email" helperText="hint" error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.queryByText('hint')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('fires onChange as the user types', async () => {
    const onChange = vi.fn()
    render(<TextInput id="email" label="Email" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Email'), 'a')
    expect(onChange).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/TextInput/TextInput.test.tsx`
Expected: FAIL — `Cannot find module './TextInput'`.

- [ ] **Step 3: Create `src/components/TextInput/TextInput.tsx`**

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  helperText?: string
  error?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, helperText, error, className, ...props }, ref) => {
    const hasError = Boolean(error)
    return (
      <div className="flex flex-col">
        <label htmlFor={id} className="font-body text-[13px] font-semibold text-[#3A454F] mb-[7px]">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={clsx(
            'font-body text-[15px] bg-white border-[1.5px] rounded-md px-[14px] py-3 outline-none transition-shadow',
            hasError
              ? 'border-error shadow-focus-error'
              : 'border-border-input focus:border-teal-500 focus:shadow-focus-teal',
            className,
          )}
          {...props}
        />
        {error ? (
          <span id={`${id}-error`} className="text-[12.5px] font-medium text-error mt-1">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${id}-helper`} className="text-[12.5px] font-medium text-slate mt-1">
            {helperText}
          </span>
        ) : null}
      </div>
    )
  },
)
TextInput.displayName = 'TextInput'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/TextInput/TextInput.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `src/components/TextInput/index.ts`**

```ts
export * from './TextInput'
```

- [ ] **Step 6: Create `src/components/TextInput/TextInput.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextInput } from './TextInput'

const meta: Meta<typeof TextInput> = {
  title: 'Core/TextInput',
  component: TextInput,
  args: { id: 'name', label: 'Nombre' },
}
export default meta

type Story = StoryObj<typeof TextInput>

export const Default: Story = {}
export const WithHelperText: Story = { args: { helperText: 'Como aparece en tu documento' } }
export const WithError: Story = { args: { error: 'Este campo es obligatorio' } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/TextInput src/index.ts
git commit -m "Add TextInput component"
```

---

## Task 6: Select

**Files:**
- Create: `src/components/Select/Select.tsx`, `src/components/Select/Select.test.tsx`, `src/components/Select/Select.stories.tsx`, `src/components/Select/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `Select` component, `SelectOption` (`{ value: string; label: string }`), `SelectProps` (`id: string`, `label: string`, `options: SelectOption[]`, `error?: string`, plus native `<select>` attributes except `id`).

- [ ] **Step 1: Write the failing test**

Create `src/components/Select/Select.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const options = [
  { value: 'a2', label: 'A2 · Elemental' },
  { value: 'b1', label: 'B1 · Intermedio' },
]

describe('Select', () => {
  it('associates the label with the select and renders all options', () => {
    render(<Select id="level" label="Nivel" options={options} />)
    const select = screen.getByLabelText('Nivel')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'A2 · Elemental' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'B1 · Intermedio' })).toBeInTheDocument()
  })

  it('shows error text and marks the select invalid', () => {
    render(<Select id="level" label="Nivel" options={options} error="Elige un nivel" />)
    expect(screen.getByText('Elige un nivel')).toBeInTheDocument()
    expect(screen.getByLabelText('Nivel')).toHaveAttribute('aria-invalid', 'true')
  })

  it('fires onChange when a new option is selected', async () => {
    const onChange = vi.fn()
    render(<Select id="level" label="Nivel" options={options} onChange={onChange} />)
    await userEvent.selectOptions(screen.getByLabelText('Nivel'), 'b1')
    expect(onChange).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/Select/Select.test.tsx`
Expected: FAIL — `Cannot find module './Select'`.

- [ ] **Step 3: Create `src/components/Select/Select.tsx`**

```tsx
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string
  label: string
  options: SelectOption[]
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, label, options, error, className, ...props }, ref) => {
    const hasError = Boolean(error)
    return (
      <div className="flex flex-col">
        <label htmlFor={id} className="font-body text-[13px] font-semibold text-[#3A454F] mb-[7px]">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={hasError}
            className={clsx(
              'appearance-none w-full font-body text-[15px] bg-white border-[1.5px] rounded-md pl-[14px] pr-10 py-3 outline-none transition-shadow',
              hasError
                ? 'border-error shadow-focus-error'
                : 'border-border-input focus:border-teal-500 focus:shadow-focus-teal',
              className,
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <CaretDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        </div>
        {error && <span className="text-[12.5px] font-medium text-error mt-1">{error}</span>}
      </div>
    )
  },
)
Select.displayName = 'Select'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/Select/Select.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Create `src/components/Select/index.ts`**

```ts
export * from './Select'
```

- [ ] **Step 6: Create `src/components/Select/Select.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './Select'

const options = [
  { value: 'a1', label: 'A1 · Principiante' },
  { value: 'a2', label: 'A2 · Elemental' },
  { value: 'b1', label: 'B1 · Intermedio' },
]

const meta: Meta<typeof Select> = {
  title: 'Core/Select',
  component: Select,
  args: { id: 'level', label: 'Nivel', options },
}
export default meta

type Story = StoryObj<typeof Select>

export const Default: Story = {}
export const WithError: Story = { args: { error: 'Elige un nivel' } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/Select src/index.ts
git commit -m "Add Select component"
```

---

## Task 7: Checkbox

**Files:**
- Create: `src/components/Checkbox/Checkbox.tsx`, `src/components/Checkbox/Checkbox.test.tsx`, `src/components/Checkbox/Checkbox.stories.tsx`, `src/components/Checkbox/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `Checkbox` component, `CheckboxProps` (`id: string`, `label: string`, plus native `<input type="checkbox">` attributes except `id`/`type`).

- [ ] **Step 1: Write the failing test**

Create `src/components/Checkbox/Checkbox.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('associates the label with the checkbox', () => {
    render(<Checkbox id="terms" label="Acepto los términos" />)
    expect(screen.getByLabelText('Acepto los términos')).toBeInTheDocument()
  })

  it('renders as an actual checkbox input', () => {
    render(<Checkbox id="terms" label="Acepto los términos" />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('fires onChange when clicked and toggles checked state', async () => {
    const onChange = vi.fn()
    render(<Checkbox id="terms" label="Acepto los términos" onChange={onChange} />)
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(checkbox).toBeChecked()
  })

  it('does not fire onChange when disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox id="terms" label="Acepto los términos" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/Checkbox/Checkbox.test.tsx`
Expected: FAIL — `Cannot find module './Checkbox'`.

- [ ] **Step 3: Create `src/components/Checkbox/Checkbox.tsx`**

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ id, label, className, ...props }, ref) => {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="relative inline-flex w-6 h-6 shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={clsx(
            'peer appearance-none w-6 h-6 rounded-sm border-2 border-border-input checked:bg-coral-500 checked:border-coral-500',
            className,
          )}
          {...props}
        />
        <CheckIcon
          weight="bold"
          className="pointer-events-none absolute inset-0 w-6 h-6 p-1 text-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className="font-body text-base text-ink">{label}</span>
    </label>
  )
})
Checkbox.displayName = 'Checkbox'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/Checkbox/Checkbox.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `src/components/Checkbox/index.ts`**

```ts
export * from './Checkbox'
```

- [ ] **Step 6: Create `src/components/Checkbox/Checkbox.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Core/Checkbox',
  component: Checkbox,
  args: { id: 'terms', label: 'Acepto los términos' },
}
export default meta

type Story = StoryObj<typeof Checkbox>

export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/Checkbox src/index.ts
git commit -m "Add Checkbox component"
```

---

## Task 8: Radio

**Files:**
- Create: `src/components/Radio/Radio.tsx`, `src/components/Radio/Radio.test.tsx`, `src/components/Radio/Radio.stories.tsx`, `src/components/Radio/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `Radio` component, `RadioProps` (`id: string`, `label: string`, plus native `<input type="radio">` attributes except `id`/`type`).

- [ ] **Step 1: Write the failing test**

Create `src/components/Radio/Radio.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Radio } from './Radio'

describe('Radio', () => {
  it('associates the label with the radio input', () => {
    render(<Radio id="online" name="mode" label="En línea" />)
    expect(screen.getByLabelText('En línea')).toBeInTheDocument()
  })

  it('renders as an actual radio input', () => {
    render(<Radio id="online" name="mode" label="En línea" />)
    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('only allows one radio in a group to be checked', async () => {
    render(
      <>
        <Radio id="online" name="mode" label="En línea" />
        <Radio id="inperson" name="mode" label="Presencial" />
      </>,
    )
    await userEvent.click(screen.getByLabelText('En línea'))
    expect(screen.getByLabelText('En línea')).toBeChecked()
    await userEvent.click(screen.getByLabelText('Presencial'))
    expect(screen.getByLabelText('Presencial')).toBeChecked()
    expect(screen.getByLabelText('En línea')).not.toBeChecked()
  })

  it('does not fire onChange when disabled', async () => {
    const onChange = vi.fn()
    render(<Radio id="online" name="mode" label="En línea" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/Radio/Radio.test.tsx`
Expected: FAIL — `Cannot find module './Radio'`.

- [ ] **Step 3: Create `src/components/Radio/Radio.tsx`**

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ id, label, className, ...props }, ref) => {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="relative inline-flex w-6 h-6 shrink-0">
        <input
          ref={ref}
          id={id}
          type="radio"
          className={clsx(
            'peer appearance-none w-6 h-6 rounded-full border-2 border-border-input checked:border-teal-500',
            className,
          )}
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 m-auto w-3 h-3 rounded-full bg-teal-500 opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="font-body text-base text-ink">{label}</span>
    </label>
  )
})
Radio.displayName = 'Radio'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/Radio/Radio.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `src/components/Radio/index.ts`**

```ts
export * from './Radio'
```

- [ ] **Step 6: Create `src/components/Radio/Radio.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Radio } from './Radio'

const meta: Meta<typeof Radio> = {
  title: 'Core/Radio',
  component: Radio,
  args: { id: 'online', name: 'mode', label: 'En línea' },
}
export default meta

type Story = StoryObj<typeof Radio>

export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/Radio src/index.ts
git commit -m "Add Radio component"
```

---

## Task 9: Toggle

**Files:**
- Create: `src/components/Toggle/Toggle.tsx`, `src/components/Toggle/Toggle.test.tsx`, `src/components/Toggle/Toggle.stories.tsx`, `src/components/Toggle/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `Toggle` component, `ToggleProps` (`id: string`, `label: string`, plus native `<input type="checkbox" role="switch">` attributes except `id`/`type`).

- [ ] **Step 1: Write the failing test**

Create `src/components/Toggle/Toggle.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('associates the label with the switch', () => {
    render(<Toggle id="notifications" label="Notificaciones" />)
    expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument()
  })

  it('exposes a switch role', () => {
    render(<Toggle id="notifications" label="Notificaciones" />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('fires onChange and toggles on click', async () => {
    const onChange = vi.fn()
    render(<Toggle id="notifications" label="Notificaciones" onChange={onChange} />)
    const toggle = screen.getByRole('switch')
    await userEvent.click(toggle)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(toggle).toBeChecked()
  })

  it('does not fire onChange when disabled', async () => {
    const onChange = vi.fn()
    render(<Toggle id="notifications" label="Notificaciones" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/Toggle/Toggle.test.tsx`
Expected: FAIL — `Cannot find module './Toggle'`.

- [ ] **Step 3: Create `src/components/Toggle/Toggle.tsx`**

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(({ id, label, className, ...props }, ref) => {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="relative inline-flex w-12 h-7 shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          className={clsx('peer sr-only', className)}
          {...props}
        />
        <span className="absolute inset-0 rounded-pill bg-border-input transition-colors peer-checked:bg-teal-500" />
        <span className="absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform peer-checked:translate-x-5" />
      </span>
      <span className="font-body text-base text-ink">{label}</span>
    </label>
  )
})
Toggle.displayName = 'Toggle'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/Toggle/Toggle.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `src/components/Toggle/index.ts`**

```ts
export * from './Toggle'
```

- [ ] **Step 6: Create `src/components/Toggle/Toggle.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toggle } from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Core/Toggle',
  component: Toggle,
  args: { id: 'notifications', label: 'Notificaciones' },
}
export default meta

type Story = StoryObj<typeof Toggle>

export const Off: Story = {}
export const On: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/Toggle src/index.ts
git commit -m "Add Toggle component"
```

---

## Task 10: SearchField

**Files:**
- Create: `src/components/SearchField/SearchField.tsx`, `src/components/SearchField/SearchField.test.tsx`, `src/components/SearchField/SearchField.stories.tsx`, `src/components/SearchField/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `SearchField` component, `SearchFieldProps` (`id: string`, `'aria-label': string`, `placeholder: string`, plus native `<input type="search">` attributes except `id`/`type`/`placeholder`). `placeholder` is required — the component has no default copy baked in, per the Global Constraint that all text is consumer-supplied.

- [ ] **Step 1: Write the failing test**

Create `src/components/SearchField/SearchField.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchField } from './SearchField'

describe('SearchField', () => {
  it('renders a search input with the given accessible label', () => {
    render(<SearchField id="search" aria-label="Buscar lecciones" placeholder="Buscar..." />)
    expect(screen.getByRole('searchbox', { name: 'Buscar lecciones' })).toBeInTheDocument()
  })

  it('uses the given placeholder', () => {
    render(<SearchField id="search" aria-label="Buscar lecciones" placeholder="Gramática..." />)
    expect(screen.getByPlaceholderText('Gramática...')).toBeInTheDocument()
  })

  it('fires onChange as the user types', async () => {
    const onChange = vi.fn()
    render(<SearchField id="search" aria-label="Buscar lecciones" placeholder="Buscar..." onChange={onChange} />)
    await userEvent.type(screen.getByRole('searchbox'), 'a')
    expect(onChange).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/SearchField/SearchField.test.tsx`
Expected: FAIL — `Cannot find module './SearchField'`.

- [ ] **Step 3: Create `src/components/SearchField/SearchField.tsx`**

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type' | 'placeholder'> {
  id: string
  'aria-label': string
  placeholder: string
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ id, className, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          ref={ref}
          id={id}
          type="search"
          placeholder={placeholder}
          className={clsx(
            'w-full font-body text-[15px] bg-white border-[1.5px] border-border-input rounded-md pl-11 pr-[14px] py-3 outline-none placeholder:text-muted focus:border-teal-500 focus:shadow-focus-teal transition-shadow',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
SearchField.displayName = 'SearchField'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/SearchField/SearchField.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Create `src/components/SearchField/index.ts`**

```ts
export * from './SearchField'
```

- [ ] **Step 6: Create `src/components/SearchField/SearchField.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchField } from './SearchField'

const meta: Meta<typeof SearchField> = {
  title: 'Core/SearchField',
  component: SearchField,
  args: { id: 'search', 'aria-label': 'Buscar lecciones', placeholder: 'Buscar lecciones...' },
}
export default meta

type Story = StoryObj<typeof SearchField>

export const Default: Story = {}
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/SearchField src/index.ts
git commit -m "Add SearchField component"
```

---

## Task 11: Card

**Files:**
- Create: `src/components/Card/Card.tsx`, `src/components/Card/Card.test.tsx`, `src/components/Card/Card.stories.tsx`, `src/components/Card/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `Card` component, `CardProps` (`variant?: 'flat' | 'elevated' | 'feature'`, `decorativeCircle?: boolean`, plus native `<div>` attributes). Later tasks (LessonCard is standalone; QuizCard) rely on `Card` accepting `className` for radius overrides and rendering `children`.

- [ ] **Step 1: Write the failing test**

Create `src/components/Card/Card.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it.each(['flat', 'elevated', 'feature'] as const)('renders the %s variant with its children', (variant) => {
    render(<Card variant={variant}>Contenido</Card>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('does not render a decorative circle by default', () => {
    render(
      <Card variant="feature" data-testid="card">
        Contenido
      </Card>,
    )
    expect(screen.getByTestId('card').querySelectorAll('[aria-hidden]')).toHaveLength(0)
  })

  it('renders a decorative circle only on the feature variant when requested', () => {
    render(
      <Card variant="feature" decorativeCircle data-testid="card">
        Contenido
      </Card>,
    )
    expect(screen.getByTestId('card').querySelectorAll('[aria-hidden]')).toHaveLength(1)
  })

  it('ignores decorativeCircle on non-feature variants', () => {
    render(
      <Card variant="flat" decorativeCircle data-testid="card">
        Contenido
      </Card>,
    )
    expect(screen.getByTestId('card').querySelectorAll('[aria-hidden]')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/Card/Card.test.tsx`
Expected: FAIL — `Cannot find module './Card'`.

- [ ] **Step 3: Create `src/components/Card/Card.tsx`**

```tsx
import { type HTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const cardStyles = cva('rounded-xl', {
  variants: {
    variant: {
      flat: 'bg-white border border-border p-6',
      elevated: 'bg-white border border-border p-6 shadow-elevated transition-transform hover:-translate-y-1',
      feature: 'bg-ink text-white p-6 relative overflow-hidden',
    },
  },
  defaultVariants: {
    variant: 'flat',
  },
})

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardStyles> {
  decorativeCircle?: boolean
  children?: ReactNode
}

export function Card({ variant, decorativeCircle, className, children, ...props }: CardProps) {
  return (
    <div className={clsx(cardStyles({ variant }), className)} {...props}>
      {variant === 'feature' && decorativeCircle && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-sun-500 opacity-[0.17]"
        />
      )}
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/Card/Card.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Create `src/components/Card/index.ts`**

```ts
export * from './Card'
```

- [ ] **Step 6: Create `src/components/Card/Card.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
  argTypes: {
    variant: { control: 'select', options: ['flat', 'elevated', 'feature'] },
    decorativeCircle: { control: 'boolean' },
  },
  args: { children: 'Contenido de la tarjeta' },
}
export default meta

type Story = StoryObj<typeof Card>

export const Flat: Story = { args: { variant: 'flat' } }
export const Elevated: Story = { args: { variant: 'elevated' } }
export const Feature: Story = { args: { variant: 'feature', decorativeCircle: true } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/Card src/index.ts
git commit -m "Add Card component"
```

---

## Task 12: Chip

**Files:**
- Create: `src/components/Chip/Chip.tsx`, `src/components/Chip/Chip.test.tsx`, `src/components/Chip/Chip.stories.tsx`, `src/components/Chip/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `Chip` component, `ChipVariant` (`'level' | 'category' | 'new' | 'completed' | 'live' | 'dark' | 'outline'`), `ChipProps` (`variant: ChipVariant`, `children: ReactNode`, plus native `<span>` attributes). `LessonCard` (Task 16) consumes `Chip` with `variant="level"` and `variant="category"`.

- [ ] **Step 1: Write the failing test**

Create `src/components/Chip/Chip.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Chip } from './Chip'

describe('Chip', () => {
  it.each(['level', 'category', 'new', 'completed', 'live', 'dark', 'outline'] as const)(
    'renders the %s variant with its text',
    (variant) => {
      render(<Chip variant={variant}>Etiqueta</Chip>)
      expect(screen.getByText('Etiqueta')).toBeInTheDocument()
    },
  )

  it('renders a leading check mark only for the completed variant', () => {
    const { container: completed } = render(<Chip variant="completed">Completado</Chip>)
    const { container: level } = render(<Chip variant="level">A2</Chip>)
    expect(completed.querySelectorAll('svg')).toHaveLength(1)
    expect(level.querySelectorAll('svg')).toHaveLength(0)
  })

  it('renders a leading dot only for the live variant', () => {
    render(<Chip variant="live">En vivo</Chip>)
    expect(screen.getByText('En vivo').parentElement?.querySelector('[aria-hidden]')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/Chip/Chip.test.tsx`
Expected: FAIL — `Cannot find module './Chip'`.

- [ ] **Step 3: Create `src/components/Chip/Chip.tsx`**

```tsx
import { type HTMLAttributes, type ReactNode } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

export type ChipVariant = 'level' | 'category' | 'new' | 'completed' | 'live' | 'dark' | 'outline'

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant: ChipVariant
  children: ReactNode
}

const VARIANT_CLASSES: Record<ChipVariant, string> = {
  level: 'bg-teal-50 text-teal-700',
  category: 'bg-coral-50 text-coral-700',
  new: 'bg-sun-50 text-sun-700',
  completed: 'bg-[#EAF6EF] text-[#2E8B54]',
  live: 'bg-coral-500 text-white',
  dark: 'bg-ink text-white',
  outline: 'bg-transparent text-slate border-[1.5px] border-border-input',
}

export function Chip({ variant, className, children, ...props }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-pill px-[14px] py-[7px] text-[13px] font-semibold',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {variant === 'completed' && <CheckIcon weight="bold" className="w-3.5 h-3.5" />}
      {variant === 'live' && <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-white" />}
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/Chip/Chip.test.tsx`
Expected: PASS (9 tests).

- [ ] **Step 5: Create `src/components/Chip/index.ts`**

```ts
export * from './Chip'
```

- [ ] **Step 6: Create `src/components/Chip/Chip.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip } from './Chip'

const meta: Meta<typeof Chip> = {
  title: 'Core/Chip',
  component: Chip,
  argTypes: {
    variant: {
      control: 'select',
      options: ['level', 'category', 'new', 'completed', 'live', 'dark', 'outline'],
    },
  },
}
export default meta

type Story = StoryObj<typeof Chip>

export const Level: Story = { args: { variant: 'level', children: 'A2 · Elemental' } }
export const Category: Story = { args: { variant: 'category', children: 'Gramática' } }
export const New: Story = { args: { variant: 'new', children: 'Nuevo' } }
export const Completed: Story = { args: { variant: 'completed', children: 'Completado' } }
export const Live: Story = { args: { variant: 'live', children: 'En vivo' } }
export const Dark: Story = { args: { variant: 'dark', children: 'Oscuro' } }
export const Outline: Story = { args: { variant: 'outline', children: 'Contorno' } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
export * from './components/Chip'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/Chip src/index.ts
git commit -m "Add Chip component"
```

---

## Task 13: ProgressBar

**Files:**
- Create: `src/components/ProgressBar/ProgressBar.tsx`, `src/components/ProgressBar/ProgressBar.test.tsx`, `src/components/ProgressBar/ProgressBar.stories.tsx`, `src/components/ProgressBar/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `ProgressBar` component, `ProgressBarProps` (`value: number`, `max?: number`, `variant?: 'teal' | 'xp-gradient'`, `height?: number`, plus native `<div>` attributes except `children`). Consumed by `LessonCard` (Task 16, default `variant="teal"`) and `QuizCard` (Task 17, `variant="xp-gradient"`).

- [ ] **Step 1: Write the failing test**

Create `src/components/ProgressBar/ProgressBar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('exposes progressbar semantics with the current value', () => {
    render(<ProgressBar value={6} max={10} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '6')
    expect(bar).toHaveAttribute('aria-valuemax', '10')
  })

  it('defaults max to 100', () => {
    render(<ProgressBar value={40} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100')
  })

  it('clamps the fill width to 100% when value exceeds max', () => {
    render(<ProgressBar value={15} max={10} />)
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.style.width).toBe('100%')
  })

  it('clamps the fill width to 0% when value is negative', () => {
    render(<ProgressBar value={-5} max={10} />)
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.style.width).toBe('0%')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/ProgressBar/ProgressBar.test.tsx`
Expected: FAIL — `Cannot find module './ProgressBar'`.

- [ ] **Step 3: Create `src/components/ProgressBar/ProgressBar.tsx`**

```tsx
import { type HTMLAttributes } from 'react'
import clsx from 'clsx'

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number
  max?: number
  variant?: 'teal' | 'xp-gradient'
  height?: number
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'teal',
  height = 10,
  className,
  ...props
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={clsx('w-full rounded-md bg-[#F1E7D2] overflow-hidden', className)}
      style={{ height }}
      {...props}
    >
      <div
        className={clsx(
          'h-full rounded-md transition-[width] duration-300 ease-out',
          variant === 'teal' ? 'bg-teal-500' : 'bg-gradient-to-r from-sun-300 to-sun-500',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/ProgressBar/ProgressBar.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `src/components/ProgressBar/index.ts`**

```ts
export * from './ProgressBar'
```

- [ ] **Step 6: Create `src/components/ProgressBar/ProgressBar.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Learning/ProgressBar',
  component: ProgressBar,
  argTypes: {
    variant: { control: 'select', options: ['teal', 'xp-gradient'] },
  },
  args: { value: 6, max: 10 },
}
export default meta

type Story = StoryObj<typeof ProgressBar>

export const Teal: Story = { args: { variant: 'teal' } }
export const XpGradient: Story = { args: { variant: 'xp-gradient' } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
export * from './components/Chip'
export * from './components/ProgressBar'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/ProgressBar src/index.ts
git commit -m "Add ProgressBar component"
```

---

## Task 14: ProgressRing

**Files:**
- Create: `src/components/ProgressRing/ProgressRing.tsx`, `src/components/ProgressRing/ProgressRing.test.tsx`, `src/components/ProgressRing/ProgressRing.stories.tsx`, `src/components/ProgressRing/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `ProgressRing` component, `ProgressRingProps` (`percent: number`, `size?: number`, `label?: string`, `caption?: string`).

- [ ] **Step 1: Write the failing test**

Create `src/components/ProgressRing/ProgressRing.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressRing } from './ProgressRing'

describe('ProgressRing', () => {
  it('exposes an accessible label with the rounded percent', () => {
    render(<ProgressRing percent={62.4} />)
    expect(screen.getByRole('img', { name: '62% complete' })).toBeInTheDocument()
  })

  it('shows the percent as the inner label by default', () => {
    render(<ProgressRing percent={75} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows a custom label when provided', () => {
    render(<ProgressRing percent={75} label="Unidad 3" />)
    expect(screen.getByText('Unidad 3')).toBeInTheDocument()
    expect(screen.queryByText('75%')).not.toBeInTheDocument()
  })

  it('shows a caption when provided', () => {
    render(<ProgressRing percent={75} caption="completado" />)
    expect(screen.getByText('completado')).toBeInTheDocument()
  })

  it('clamps percent into the 0-100 range', () => {
    render(<ProgressRing percent={140} />)
    expect(screen.getByRole('img', { name: '100% complete' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/ProgressRing/ProgressRing.test.tsx`
Expected: FAIL — `Cannot find module './ProgressRing'`.

- [ ] **Step 3: Create `src/components/ProgressRing/ProgressRing.tsx`**

```tsx
import { colors } from '../../tokens/tokens'

export interface ProgressRingProps {
  percent: number
  size?: number
  label?: string
  caption?: string
}

export function ProgressRing({ percent, size = 88, label, caption }: ProgressRingProps) {
  const pct = Math.min(100, Math.max(0, percent))
  return (
    <div
      role="img"
      aria-label={`${Math.round(pct)}% complete`}
      className="relative inline-flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${colors.teal[500]} 0% ${pct}%, #E7EFEF ${pct}% 100%)`,
      }}
    >
      <div
        className="absolute rounded-full bg-surface flex flex-col items-center justify-center"
        style={{ width: size * 0.727, height: size * 0.727 }}
      >
        <span className="font-display font-semibold text-[22px] text-ink">{label ?? `${Math.round(pct)}%`}</span>
        {caption && <span className="text-[11px] text-slate">{caption}</span>}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/ProgressRing/ProgressRing.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Create `src/components/ProgressRing/index.ts`**

```ts
export * from './ProgressRing'
```

- [ ] **Step 6: Create `src/components/ProgressRing/ProgressRing.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressRing } from './ProgressRing'

const meta: Meta<typeof ProgressRing> = {
  title: 'Learning/ProgressRing',
  component: ProgressRing,
  args: { percent: 62, caption: 'de la unidad' },
}
export default meta

type Story = StoryObj<typeof ProgressRing>

export const Default: Story = {}
export const CustomLabel: Story = { args: { label: 'Unidad 3', caption: undefined } }
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
export * from './components/Chip'
export * from './components/ProgressBar'
export * from './components/ProgressRing'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/ProgressRing src/index.ts
git commit -m "Add ProgressRing component"
```

---

## Task 15: UnitPath

**Files:**
- Create: `src/components/UnitPath/UnitPath.tsx`, `src/components/UnitPath/UnitPath.test.tsx`, `src/components/UnitPath/UnitPath.stories.tsx`, `src/components/UnitPath/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `UnitPath` component, `UnitNodeState` (`'completed' | 'current' | 'locked'`), `UnitNode` (`{ label: string; state: UnitNodeState }`), `UnitPathProps` (`nodes: UnitNode[]`).

- [ ] **Step 1: Write the failing test**

Create `src/components/UnitPath/UnitPath.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UnitPath, type UnitNode } from './UnitPath'

const nodes: UnitNode[] = [
  { label: '1', state: 'completed' },
  { label: '2', state: 'current' },
  { label: '3', state: 'locked' },
]

describe('UnitPath', () => {
  it('renders a node for each entry', () => {
    render(<UnitPath nodes={nodes} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders one fewer connector than nodes', () => {
    const { container } = render(<UnitPath nodes={nodes} />)
    // each node wrapper renders at most one connector sibling; 3 nodes -> 2 connectors
    expect(container.querySelectorAll('[data-connector]')).toHaveLength(2)
  })

  it('renders a lock icon for locked nodes and nothing equivalent for completed/current', () => {
    render(<UnitPath nodes={nodes} />)
    expect(screen.getByTestId('unit-node-locked')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/UnitPath/UnitPath.test.tsx`
Expected: FAIL — `Cannot find module './UnitPath'`.

- [ ] **Step 3: Create `src/components/UnitPath/UnitPath.tsx`**

```tsx
import { CheckIcon, LockIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { colors } from '../../tokens/tokens'

export type UnitNodeState = 'completed' | 'current' | 'locked'

export interface UnitNode {
  label: string
  state: UnitNodeState
}

export interface UnitPathProps {
  nodes: UnitNode[]
}

function Connector({ fromState, toState }: { fromState: UnitNodeState; toState: UnitNodeState }) {
  if (fromState === 'completed' && toState === 'locked') {
    return (
      <div
        data-connector
        className="flex-1 h-1 rounded-md"
        style={{ background: `linear-gradient(90deg, ${colors.teal[500]} 50%, #E7EFEF 50%)` }}
      />
    )
  }
  if (fromState === 'completed') {
    return <div data-connector className="flex-1 h-1 rounded-md bg-teal-500" />
  }
  return <div data-connector className="flex-1 h-1 rounded-md bg-[#E7EFEF]" />
}

export function UnitPath({ nodes }: UnitPathProps) {
  return (
    <div className="flex items-center w-full">
      {nodes.map((node, index) => (
        <div key={`${node.label}-${index}`} className="flex items-center flex-1 last:flex-none">
          <div
            data-testid={`unit-node-${node.state}`}
            className={clsx(
              'flex items-center justify-center rounded-full shrink-0 font-display',
              node.state === 'completed' && 'w-14 h-14 bg-teal-500',
              node.state === 'current' && 'w-16 h-16 bg-coral-500 shadow-[0_0_0_5px_#FBD3CB]',
              node.state === 'locked' &&
                'w-14 h-14 bg-white border-2 border-dashed border-[#D8CDB6] opacity-[0.55]',
            )}
          >
            {node.state === 'completed' && <CheckIcon weight="bold" className="w-6 h-6 text-white" />}
            {node.state === 'current' && <span className="text-white font-semibold">{node.label}</span>}
            {node.state === 'locked' && <LockIcon className="w-5 h-5 text-muted" />}
          </div>
          {index < nodes.length - 1 && (
            <Connector fromState={node.state} toState={nodes[index + 1].state} />
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/UnitPath/UnitPath.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Create `src/components/UnitPath/index.ts`**

```ts
export * from './UnitPath'
```

- [ ] **Step 6: Create `src/components/UnitPath/UnitPath.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { UnitPath } from './UnitPath'

const meta: Meta<typeof UnitPath> = {
  title: 'Learning/UnitPath',
  component: UnitPath,
  args: {
    nodes: [
      { label: '1', state: 'completed' },
      { label: '2', state: 'completed' },
      { label: '3', state: 'current' },
      { label: '4', state: 'locked' },
      { label: '5', state: 'locked' },
    ],
  },
}
export default meta

type Story = StoryObj<typeof UnitPath>

export const Default: Story = {}
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
export * from './components/Chip'
export * from './components/ProgressBar'
export * from './components/ProgressRing'
export * from './components/UnitPath'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/UnitPath src/index.ts
git commit -m "Add UnitPath component"
```

---

## Task 16: LessonCard

**Files:**
- Create: `src/components/LessonCard/LessonCard.tsx`, `src/components/LessonCard/LessonCard.test.tsx`, `src/components/LessonCard/LessonCard.stories.tsx`, `src/components/LessonCard/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `Chip` (`src/components/Chip/Chip.tsx`, props `variant: ChipVariant`, `children`), `ProgressBar` (`src/components/ProgressBar/ProgressBar.tsx`, props `value`, `max`), `Button` (`src/components/Button/Button.tsx`, props `variant`, `size`, `onClick`).
- Produces: `LessonCard` component, `LessonCardProps` (`number: number`, `levelLabel: string`, `levelVariant?: ChipVariant`, `categoryLabel: string`, `duration: string`, `title: string`, `subtitle: string`, `progress: number`, `progressMax: number`, `actionLabel: string`, `onAction?: () => void`, `actionSlot?: ReactNode`).

- [ ] **Step 1: Write the failing test**

Create `src/components/LessonCard/LessonCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LessonCard } from './LessonCard'

const baseProps = {
  number: 6,
  levelLabel: 'A2 · Elemental',
  categoryLabel: 'Gramática',
  duration: '8 min',
  title: 'El pretérito indefinido',
  subtitle: 'Aprende a conjugar verbos regulares',
  progress: 6,
  progressMax: 10,
  actionLabel: 'Seguir',
}

describe('LessonCard', () => {
  it('renders the lesson number, title, subtitle, and progress fraction', () => {
    render(<LessonCard {...baseProps} />)
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('El pretérito indefinido')).toBeInTheDocument()
    expect(screen.getByText('Aprende a conjugar verbos regulares')).toBeInTheDocument()
    expect(screen.getByText('6 / 10')).toBeInTheDocument()
  })

  it('renders the level and category chips and the duration', () => {
    render(<LessonCard {...baseProps} />)
    expect(screen.getByText('A2 · Elemental')).toBeInTheDocument()
    expect(screen.getByText('Gramática')).toBeInTheDocument()
    expect(screen.getByText('8 min')).toBeInTheDocument()
  })

  it('fires onAction when the default action button is clicked', async () => {
    const onAction = vi.fn()
    render(<LessonCard {...baseProps} onAction={onAction} />)
    await userEvent.click(screen.getByRole('button', { name: 'Seguir' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders a custom actionSlot instead of the default button when provided', () => {
    render(<LessonCard {...baseProps} actionSlot={<span>Personalizado</span>} />)
    expect(screen.getByText('Personalizado')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Seguir' })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/LessonCard/LessonCard.test.tsx`
Expected: FAIL — `Cannot find module './LessonCard'`.

- [ ] **Step 3: Create `src/components/LessonCard/LessonCard.tsx`**

```tsx
import { type ReactNode } from 'react'
import { Chip, type ChipVariant } from '../Chip/Chip'
import { ProgressBar } from '../ProgressBar/ProgressBar'
import { Button } from '../Button/Button'

export interface LessonCardProps {
  number: number
  levelLabel: string
  levelVariant?: ChipVariant
  categoryLabel: string
  duration: string
  title: string
  subtitle: string
  progress: number
  progressMax: number
  actionLabel: string
  onAction?: () => void
  actionSlot?: ReactNode
}

export function LessonCard({
  number,
  levelLabel,
  levelVariant = 'level',
  categoryLabel,
  duration,
  title,
  subtitle,
  progress,
  progressMax,
  actionLabel,
  onAction,
  actionSlot,
}: LessonCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white border border-border shadow-elevated p-6 flex gap-5">
      <div
        className="w-[70px] h-[70px] rounded-[18px] flex items-center justify-center font-display font-semibold text-white text-[28px] shrink-0"
        style={{ background: 'linear-gradient(135deg, #FFC23C, #F14E3A)' }}
      >
        {number}
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Chip variant={levelVariant}>{levelLabel}</Chip>
          <Chip variant="category">{categoryLabel}</Chip>
          <span className="text-[13px] text-muted ml-auto">{duration}</span>
        </div>
        <p className="font-display font-medium text-xl text-ink">{title}</p>
        <p className="font-body text-sm text-slate">{subtitle}</p>
        <div className="flex items-center gap-3 mt-1">
          <ProgressBar value={progress} max={progressMax} className="flex-1" />
          <span className="font-body text-[13px] text-slate whitespace-nowrap">
            {progress} / {progressMax}
          </span>
          {actionSlot ?? (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/LessonCard/LessonCard.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `src/components/LessonCard/index.ts`**

```ts
export * from './LessonCard'
```

- [ ] **Step 6: Create `src/components/LessonCard/LessonCard.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LessonCard } from './LessonCard'

const meta: Meta<typeof LessonCard> = {
  title: 'Learning/LessonCard',
  component: LessonCard,
  args: {
    number: 6,
    levelLabel: 'A2 · Elemental',
    categoryLabel: 'Gramática',
    duration: '8 min',
    title: 'El pretérito indefinido',
    subtitle: 'Aprende a conjugar verbos regulares en pasado',
    progress: 6,
    progressMax: 10,
    actionLabel: 'Seguir',
  },
}
export default meta

type Story = StoryObj<typeof LessonCard>

export const Default: Story = {}
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
export * from './components/Chip'
export * from './components/ProgressBar'
export * from './components/ProgressRing'
export * from './components/UnitPath'
export * from './components/LessonCard'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/LessonCard src/index.ts
git commit -m "Add LessonCard component"
```

---

## Task 17: AnswerOption + QuizCard

**Files:**
- Create: `src/components/QuizCard/AnswerOption.tsx`, `src/components/QuizCard/AnswerOption.test.tsx`
- Create: `src/components/QuizCard/QuizCard.tsx`, `src/components/QuizCard/QuizCard.test.tsx`
- Create: `src/components/QuizCard/QuizCard.stories.tsx`, `src/components/QuizCard/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `Card` (`src/components/Card/Card.tsx`, prop `variant="elevated"`), `ProgressBar` (`src/components/ProgressBar/ProgressBar.tsx`, prop `variant="xp-gradient"`), `Button` (`src/components/Button/Button.tsx`, prop `variant="primary"`, `fullWidth`).
- Produces: `AnswerOption` component, `AnswerOptionStatus` (`'default' | 'selected' | 'correct' | 'wrong'`), `AnswerOptionProps` (`status?: AnswerOptionStatus`, `onSelect?: () => void`, `children: ReactNode`). `QuizCard` component, `QuizCardProps` (`current: number`, `total: number`, `promptLabel: string`, `question: ReactNode`, `children: ReactNode`, `onSubmit?: () => void`, `submitLabel: string`, `submitDisabled?: boolean`). `submitLabel` is required — no default copy is baked into the component, per the Global Constraint that all text is consumer-supplied. `QuizCard`'s `children` is expected to be a list of `AnswerOption` elements, composed by the consumer.

- [ ] **Step 1: Write the failing test for AnswerOption**

Create `src/components/QuizCard/AnswerOption.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnswerOption } from './AnswerOption'

describe('AnswerOption', () => {
  it.each(['default', 'selected', 'correct', 'wrong'] as const)('renders the %s status with its text', (status) => {
    render(<AnswerOption status={status}>fui</AnswerOption>)
    expect(screen.getByText('fui')).toBeInTheDocument()
  })

  it('fires onSelect when clicked', async () => {
    const onSelect = vi.fn()
    render(<AnswerOption onSelect={onSelect}>fui</AnswerOption>)
    await userEvent.click(screen.getByRole('button', { name: 'fui' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('renders a check badge only for the correct status', () => {
    const { container } = render(<AnswerOption status="correct">fui</AnswerOption>)
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })

  it('renders an x badge only for the wrong status', () => {
    const { container } = render(<AnswerOption status="wrong">fui</AnswerOption>)
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/QuizCard/AnswerOption.test.tsx`
Expected: FAIL — `Cannot find module './AnswerOption'`.

- [ ] **Step 3: Create `src/components/QuizCard/AnswerOption.tsx`**

```tsx
import { type ReactNode } from 'react'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

export type AnswerOptionStatus = 'default' | 'selected' | 'correct' | 'wrong'

export interface AnswerOptionProps {
  status?: AnswerOptionStatus
  onSelect?: () => void
  children: ReactNode
}

const STATUS_CLASSES: Record<AnswerOptionStatus, string> = {
  default: 'border-border-input bg-white hover:border-teal-500 hover:bg-[#F3FAFA]',
  selected: 'border-teal-500 bg-[#F3FAFA]',
  correct: 'border-success bg-[#EAF6EF]',
  wrong: 'border-[#F4C7C1] bg-[#FDECE9]',
}

export function AnswerOption({ status = 'default', onSelect, children }: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'w-full flex items-center justify-between text-left rounded-[14px] border-2 px-[15px] py-[14px] font-body text-base transition-colors',
        STATUS_CLASSES[status],
      )}
    >
      <span>{children}</span>
      {status === 'selected' && <span className="w-3 h-3 rounded-full bg-teal-500 shrink-0" />}
      {status === 'correct' && (
        <span className="w-6 h-6 rounded-full bg-success flex items-center justify-center shrink-0">
          <CheckIcon weight="bold" className="w-4 h-4 text-white" />
        </span>
      )}
      {status === 'wrong' && (
        <span className="w-6 h-6 rounded-full bg-error flex items-center justify-center shrink-0">
          <XIcon weight="bold" className="w-4 h-4 text-white" />
        </span>
      )}
    </button>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/QuizCard/AnswerOption.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 4b: Create `src/components/QuizCard/AnswerOption.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnswerOption } from './AnswerOption'

const meta: Meta<typeof AnswerOption> = {
  title: 'Learning/AnswerOption',
  component: AnswerOption,
  argTypes: {
    status: { control: 'select', options: ['default', 'selected', 'correct', 'wrong'] },
  },
  args: { children: 'fui' },
}
export default meta

type Story = StoryObj<typeof AnswerOption>

export const Default: Story = { args: { status: 'default' } }
export const Selected: Story = { args: { status: 'selected' } }
export const Correct: Story = { args: { status: 'correct' } }
export const Wrong: Story = { args: { status: 'wrong' } }
```

- [ ] **Step 5: Write the failing test for QuizCard**

Create `src/components/QuizCard/QuizCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizCard } from './QuizCard'
import { AnswerOption } from './AnswerOption'

describe('QuizCard', () => {
  it('renders the counter, prompt label, and question', () => {
    render(
      <QuizCard
        current={2}
        total={5}
        promptLabel="Completa la frase"
        question="Ayer yo ___ al cine."
        submitLabel="Comprobar"
      >
        <AnswerOption>fui</AnswerOption>
      </QuizCard>,
    )
    expect(screen.getByText('2/5')).toBeInTheDocument()
    expect(screen.getByText('Completa la frase')).toBeInTheDocument()
    expect(screen.getByText('Ayer yo ___ al cine.')).toBeInTheDocument()
  })

  it('renders the answer options passed as children', () => {
    render(
      <QuizCard
        current={2}
        total={5}
        promptLabel="Completa la frase"
        question="Ayer yo ___ al cine."
        submitLabel="Comprobar"
      >
        <AnswerOption>fui</AnswerOption>
        <AnswerOption>fue</AnswerOption>
      </QuizCard>,
    )
    expect(screen.getByRole('button', { name: 'fui' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fue' })).toBeInTheDocument()
  })

  it('fires onSubmit when the submit button is clicked', async () => {
    const onSubmit = vi.fn()
    render(
      <QuizCard current={2} total={5} promptLabel="p" question="q" submitLabel="Comprobar" onSubmit={onSubmit}>
        <AnswerOption>fui</AnswerOption>
      </QuizCard>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('disables the submit button when submitDisabled is set', async () => {
    const onSubmit = vi.fn()
    render(
      <QuizCard
        current={2}
        total={5}
        promptLabel="p"
        question="q"
        submitLabel="Comprobar"
        onSubmit={onSubmit}
        submitDisabled
      >
        <AnswerOption>fui</AnswerOption>
      </QuizCard>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('uses the given submit label', () => {
    render(
      <QuizCard current={2} total={5} promptLabel="p" question="q" submitLabel="Enviar">
        <AnswerOption>fui</AnswerOption>
      </QuizCard>,
    )
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `pnpm vitest run src/components/QuizCard/QuizCard.test.tsx`
Expected: FAIL — `Cannot find module './QuizCard'`.

- [ ] **Step 7: Create `src/components/QuizCard/QuizCard.tsx`**

```tsx
import { type ReactNode } from 'react'
import { Card } from '../Card/Card'
import { ProgressBar } from '../ProgressBar/ProgressBar'
import { Button } from '../Button/Button'

export interface QuizCardProps {
  current: number
  total: number
  promptLabel: string
  question: ReactNode
  children: ReactNode
  onSubmit?: () => void
  submitLabel: string
  submitDisabled?: boolean
}

export function QuizCard({
  current,
  total,
  promptLabel,
  question,
  children,
  onSubmit,
  submitLabel,
  submitDisabled,
}: QuizCardProps) {
  return (
    <Card variant="elevated" className="!rounded-[var(--radius-card)] flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={current} max={total} variant="xp-gradient" height={6} className="flex-1" />
        <span className="font-mono text-[13px] text-slate">
          {current}/{total}
        </span>
      </div>
      <div>
        <p className="font-body text-[13px] font-semibold uppercase tracking-[0.08em] text-teal-700 mb-2">
          {promptLabel}
        </p>
        <p className="font-display font-medium text-2xl text-ink">{question}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
      <Button variant="primary" fullWidth onClick={onSubmit} disabled={submitDisabled}>
        {submitLabel}
      </Button>
    </Card>
  )
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm vitest run src/components/QuizCard/QuizCard.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 9: Create `src/components/QuizCard/index.ts`**

```ts
export * from './AnswerOption'
export * from './QuizCard'
```

- [ ] **Step 10: Create `src/components/QuizCard/QuizCard.stories.tsx`**

```tsx
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QuizCard } from './QuizCard'
import { AnswerOption, type AnswerOptionStatus } from './AnswerOption'

const meta: Meta<typeof QuizCard> = {
  title: 'Learning/QuizCard',
  component: QuizCard,
}
export default meta

type Story = StoryObj<typeof QuizCard>

export const Default: Story = {
  render: () => {
    const options = ['fui', 'fue', 'iba'] as const
    const [selected, setSelected] = useState<(typeof options)[number] | null>(null)
    const statusFor = (option: string): AnswerOptionStatus => (selected === option ? 'selected' : 'default')
    return (
      <QuizCard
        current={2}
        total={5}
        promptLabel="Completa la frase"
        question="Ayer yo ___ al cine con mis amigos."
        submitLabel="Comprobar"
        onSubmit={() => {}}
      >
        {options.map((option) => (
          <AnswerOption key={option} status={statusFor(option)} onSelect={() => setSelected(option)}>
            {option}
          </AnswerOption>
        ))}
      </QuizCard>
    )
  },
}

export const AnswerStates: Story = {
  render: () => (
    <QuizCard
      current={2}
      total={5}
      promptLabel="Completa la frase"
      question="Ayer yo ___ al cine."
      submitLabel="Comprobar"
    >
      <AnswerOption status="correct">fui</AnswerOption>
      <AnswerOption status="wrong">fue</AnswerOption>
      <AnswerOption status="default">iba</AnswerOption>
    </QuizCard>
  ),
}
```

- [ ] **Step 11: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
export * from './components/Chip'
export * from './components/ProgressBar'
export * from './components/ProgressRing'
export * from './components/UnitPath'
export * from './components/LessonCard'
export * from './components/QuizCard'
```

- [ ] **Step 12: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 13: Commit**

```bash
git add src/components/QuizCard src/index.ts
git commit -m "Add AnswerOption and QuizCard components"
```

---

## Task 18: StreakCard

**Files:**
- Create: `src/components/StreakCard/StreakCard.tsx`, `src/components/StreakCard/StreakCard.test.tsx`, `src/components/StreakCard/StreakCard.stories.tsx`, `src/components/StreakCard/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `StreakCard` component, `StreakCardProps` (`days: number`, `title: string`, `subtitle: string`, `activeDays: boolean[]`, `dayLetters: string[]`).

- [ ] **Step 1: Write the failing test**

Create `src/components/StreakCard/StreakCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakCard } from './StreakCard'

const props = {
  days: 12,
  title: 'Racha de 12 días',
  subtitle: '¡Sigue así, lo estás haciendo genial!',
  dayLetters: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  activeDays: [true, true, true, true, true, false, false],
}

describe('StreakCard', () => {
  it('renders the day count, title, and subtitle', () => {
    render(<StreakCard {...props} />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Racha de 12 días')).toBeInTheDocument()
    expect(screen.getByText('¡Sigue así, lo estás haciendo genial!')).toBeInTheDocument()
  })

  it('renders one cell per day letter', () => {
    render(<StreakCard {...props} />)
    expect(screen.getAllByText(/^[LMXJVSD]$/)).toHaveLength(7)
  })

  it('renders the same number of cells as day letters even if activeDays is shorter', () => {
    render(<StreakCard {...props} activeDays={[true]} />)
    expect(screen.getAllByText(/^[LMXJVSD]$/)).toHaveLength(7)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/StreakCard/StreakCard.test.tsx`
Expected: FAIL — `Cannot find module './StreakCard'`.

- [ ] **Step 3: Create `src/components/StreakCard/StreakCard.tsx`**

```tsx
import clsx from 'clsx'

export interface StreakCardProps {
  days: number
  title: string
  subtitle: string
  activeDays: boolean[]
  dayLetters: string[]
}

export function StreakCard({ days, title, subtitle, activeDays, dayLetters }: StreakCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] bg-ink text-white p-6 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div
          className="w-[66px] h-[66px] rounded-2xl flex items-center justify-center font-display font-semibold text-white text-2xl shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFC23C, #F14E3A)' }}
        >
          {days}
        </div>
        <div>
          <p className="font-display font-medium text-lg">{title}</p>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {dayLetters.map((letter, index) => (
          <div
            key={`${letter}-${index}`}
            className={clsx(
              'flex-1 h-[34px] rounded-[9px] flex items-center justify-center text-sm font-semibold',
              activeDays[index] ? 'bg-sun-500 text-ink' : 'bg-white/[0.14] text-white/50',
            )}
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/StreakCard/StreakCard.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Create `src/components/StreakCard/index.ts`**

```ts
export * from './StreakCard'
```

- [ ] **Step 6: Create `src/components/StreakCard/StreakCard.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { StreakCard } from './StreakCard'

const meta: Meta<typeof StreakCard> = {
  title: 'Learning/StreakCard',
  component: StreakCard,
  args: {
    days: 12,
    title: 'Racha de 12 días',
    subtitle: '¡Sigue así, lo estás haciendo genial!',
    dayLetters: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    activeDays: [true, true, true, true, true, false, false],
  },
}
export default meta

type Story = StoryObj<typeof StreakCard>

export const Default: Story = {}
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
export * from './components/Chip'
export * from './components/ProgressBar'
export * from './components/ProgressRing'
export * from './components/UnitPath'
export * from './components/LessonCard'
export * from './components/QuizCard'
export * from './components/StreakCard'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/StreakCard src/index.ts
git commit -m "Add StreakCard component"
```

---

## Task 19: RewardBanner

**Files:**
- Create: `src/components/RewardBanner/RewardBanner.tsx`, `src/components/RewardBanner/RewardBanner.test.tsx`, `src/components/RewardBanner/RewardBanner.stories.tsx`, `src/components/RewardBanner/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `RewardBanner` component, `RewardBannerProps` (`title: string`, `subtitle: string`).

- [ ] **Step 1: Write the failing test**

Create `src/components/RewardBanner/RewardBanner.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RewardBanner } from './RewardBanner'

describe('RewardBanner', () => {
  it('renders the title and subtitle', () => {
    render(<RewardBanner title="¡Lección completada!" subtitle="+50 XP · Nuevo logro" />)
    expect(screen.getByText('¡Lección completada!')).toBeInTheDocument()
    expect(screen.getByText('+50 XP · Nuevo logro')).toBeInTheDocument()
  })

  it('renders a check icon', () => {
    const { container } = render(<RewardBanner title="¡Lección completada!" subtitle="+50 XP" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/components/RewardBanner/RewardBanner.test.tsx`
Expected: FAIL — `Cannot find module './RewardBanner'`.

- [ ] **Step 3: Create `src/components/RewardBanner/RewardBanner.tsx`**

```tsx
import { CheckIcon } from '@phosphor-icons/react'

export interface RewardBannerProps {
  title: string
  subtitle: string
}

export function RewardBanner({ title, subtitle }: RewardBannerProps) {
  return (
    <div className="rounded-[18px] bg-[#EAF6EF] border border-[#C9E8D5] p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-success flex items-center justify-center shrink-0">
        <CheckIcon weight="bold" className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-display font-medium text-lg text-ink">{title}</p>
        <p className="text-sm text-[#3E7C58]">{subtitle}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/components/RewardBanner/RewardBanner.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Create `src/components/RewardBanner/index.ts`**

```ts
export * from './RewardBanner'
```

- [ ] **Step 6: Create `src/components/RewardBanner/RewardBanner.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RewardBanner } from './RewardBanner'

const meta: Meta<typeof RewardBanner> = {
  title: 'Learning/RewardBanner',
  component: RewardBanner,
  args: { title: '¡Lección completada!', subtitle: '+50 XP · Nuevo logro' },
}
export default meta

type Story = StoryObj<typeof RewardBanner>

export const Default: Story = {}
```

- [ ] **Step 7: Update `src/index.ts`**

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
export * from './components/Chip'
export * from './components/ProgressBar'
export * from './components/ProgressRing'
export * from './components/UnitPath'
export * from './components/LessonCard'
export * from './components/QuizCard'
export * from './components/StreakCard'
export * from './components/RewardBanner'
```

- [ ] **Step 8: Verify build, lint, and tests**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/RewardBanner src/index.ts
git commit -m "Add RewardBanner component"
```

---

## Task 20: Package README and final verification

**Files:**
- Create: `README.md` (package-level, at repo root — the existing design-reference README lives at `espanolenka_design_system/README.md` and is untouched)
- Verify: `src/index.ts` exports every component built in Tasks 2–19

**Interfaces:**
- Consumes: every export added to `src/index.ts` across Tasks 2–19.

- [ ] **Step 1: Verify `src/index.ts` contains every export**

Read `src/index.ts` and confirm it matches exactly:

```ts
export * from './tokens/tokens'
export * from './components/Logo'
export * from './components/Button'
export * from './components/TextInput'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Toggle'
export * from './components/SearchField'
export * from './components/Card'
export * from './components/Chip'
export * from './components/ProgressBar'
export * from './components/ProgressRing'
export * from './components/UnitPath'
export * from './components/LessonCard'
export * from './components/QuizCard'
export * from './components/StreakCard'
export * from './components/RewardBanner'
```

If any line is missing (each task's Step 7/8 already added its own line, so this should just be confirmation), add it.

- [ ] **Step 2: Write the package README**

Create `README.md` at the repo root:

```markdown
# @espanolenka/design-system

React + TypeScript component library implementing the EspañoLenka brand and design system.
Source spec: `espanolenka_design_system/README.md`. Design/plan history:
`docs/superpowers/specs/` and `docs/superpowers/plans/`.

## Install

    pnpm add @espanolenka/design-system

## Usage

Import the token and font stylesheets once, at your app's entry point:

    import '@espanolenka/design-system/tokens.css'
    import '@espanolenka/design-system/fonts.css'

Then use components:

    import { Button, Card, Chip } from '@espanolenka/design-system'

    function Example() {
      return (
        <Card variant="elevated">
          <Chip variant="level">A2 · Elemental</Chip>
          <Button variant="primary">Reservar clase</Button>
        </Card>
      )
    }

Tailwind utility classes (`bg-coral-500`, `rounded-lg`, etc.) are also available if your app's
own Tailwind config extends `tailwind.config.js` from this package, since all components are
styled with them internally.

## Development

    pnpm install
    pnpm dev             # Storybook at http://localhost:6006
    pnpm test             # Vitest
    pnpm lint
    pnpm build            # Vite library build -> dist/
    pnpm build-storybook   # static Storybook site
```

- [ ] **Step 3: Run the full verification suite**

```bash
pnpm lint
pnpm test
pnpm build
pnpm build-storybook
```

Expected: all four commands exit 0. `pnpm build` produces `dist/index.js` and `dist/index.d.ts` exporting every component. `pnpm build-storybook` produces `storybook-static/` with no errors.

- [ ] **Step 4: Manually spot-check Storybook against the reference README**

Run: `pnpm dev`, open `http://localhost:6006`, and compare at least these against `espanolenka_design_system/README.md`'s written values (colors/px/behavior) — not against the `.dc.html` files, which are prototypes only:
- Tokens/Overview story: ramp hex values match the README's color tables.
- Core/Button: primary variant shows the `0 4px 0 #C63823` lift shadow at rest, and the press interaction (translateY 3px, shadow shrinks to `0 1px 0 #C63823`) on `:active`.
- Learning/QuizCard: AnswerStates story shows correct (green) and wrong (red) states matching the README's hex values.
- Brand/Logo: Horizontal story renders "Españo" in ink and "Lenka" in coral, with the coral monogram tile and sunshine tilde.

Stop the dev server once confirmed.

- [ ] **Step 5: Commit**

```bash
git add README.md src/index.ts
git commit -m "Add package README and finalize barrel exports"
```

---
