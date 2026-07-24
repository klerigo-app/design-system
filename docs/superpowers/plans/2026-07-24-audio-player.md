# Design-System AudioPlayer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared, headless `AudioPlayer` component (web React + React Native) to `@klerigo/design-system` — a custom-styled play/pause + scrubber that owns no playback state and is driven entirely by props, so consuming apps can render it above exercise questions.

**Architecture:** The component is purely presentational — it holds no audio element, no `expo-audio`, and no playback state; the consuming app owns playback and drives every visual via the six-prop contract, exactly like `Button`/`AnswerOption`/`Toast` in this library today. Web styles through `cva`/Tailwind utilities and a standard `<input type="range">` (whose `accent-color` draws the elapsed fill + thumb for free); native styles through `useThemedStyles`/`StyleSheet` and a tap-to-seek `Pressable` bar (`onLayout` captures width, `onPress` reads `nativeEvent.locationX`), adding **no** new native dependency. Icons reuse the library's existing conventions with **no `package.json` change**: web uses `@phosphor-icons/react` (`PlayIcon`/`PauseIcon`, already a real `dependency`), native uses `@expo/vector-icons` `Feather` (`play`/`pause`) — already imported by real native source (`Chip`, `AnswerOption`, `Checkbox`, `SearchField`) and intentionally a `devDependency` because `vite.config.ts` externalizes it, the consuming Expo app provides it at runtime, and vitest aliases it to a stub.

**Tech Stack:** React 19, TypeScript 6 (strict), Vitest 4 + `@testing-library/react` (jsdom), `class-variance-authority`/`tailwind-merge` (web), React Native 0.86 `StyleSheet` + design tokens (native), `@phosphor-icons/react` (web icons), `@expo/vector-icons` (native icons), Storybook 10 (web only).

## Global Constraints

- **Prop contract — identical on web and native, verbatim:**
  ```ts
  interface AudioPlayerProps {
    isPlaying: boolean;
    currentTime: number; // seconds, elapsed
    duration: number;    // seconds, total; 0 while unknown/loading
    onTogglePlay: () => void;
    onSeek: (time: number) => void; // seconds, absolute position to seek to
    label?: string; // optional accessible label/caption, e.g. "Audio"
  }
  ```
- **Exactly these six props** — the component signature is `AudioPlayerProps` itself. Do **not** extend `HTMLAttributes`/`PressableProps` and do **not** add a `testID` prop (the downstream consuming-app plan builds against this exact interface).
- **Headless:** no `<audio>`, no `expo-audio`, no timers, no internal playback state. The only internal state permitted is pure UI state (native scrubber bar width from `onLayout`).
- **Native scrubber adds no new dependency:** no `react-native-gesture-handler`. Tap-to-seek via `Pressable` + `onLayout` + `event.nativeEvent.locationX`.
- **Web scrubber:** a standard `<input type="range">` styled with `accent-teal-500`.
- **No `package.json` change.** Web `PlayIcon`/`PauseIcon` from `@phosphor-icons/react` (existing `dependency`); native `Feather name="play"|"pause"` from `@expo/vector-icons` (existing `devDependency`, externalized + app-provided + stubbed — same pattern as `AnswerOption`).
- **Token/styling conventions:** web reuses classes `border-border-input`, `bg-surface-raised`, `bg-teal-500`, `text-teal-700`, `text-slate`, `font-mono`, `rounded-[14px]`; native reuses `theme.colors.borderInput`, `surfaceRaised`, `teal[500]`, `teal[700]`, `progressTrack`, `slate` and `radiusValue.pill`/`.sm`, matching `QuizCard`/`AnswerOption`/`ProgressBar`.
- **Native return type must be explicit `: ReactElement`** (declaration-emit portability; see `PrimaryButton`).
- **Barrels are the only export registry.** Nothing in `package.json`/`tsconfig*` needs editing when adding a component directory — everything flows through `src/index.ts` (web) and `src/native/index.ts` (native).
- **CI gate per task:** `pnpm test` (Vitest) green and `pnpm typecheck` (`tsc -p tsconfig.typecheck.json`) clean. Baseline before this work: 534/534 tests pass.

---

### Task 1: Web AudioPlayer

**Files:**
- Create: `src/components/AudioPlayer/AudioPlayer.tsx`
- Create: `src/components/AudioPlayer/index.ts`
- Create: `src/components/AudioPlayer/AudioPlayer.stories.tsx`
- Modify: `src/index.ts` (add one barrel line)
- Test: `src/components/AudioPlayer/AudioPlayer.test.tsx`

**Interfaces:**
- Consumes: `cn` from `../../lib/cn`; `PlayIcon`, `PauseIcon` from `@phosphor-icons/react`.
- Produces:
  - `AudioPlayer: (props: AudioPlayerProps) => JSX.Element` — exported from `@klerigo/design-system`.
  - `AudioPlayerProps` — the six-prop interface above; **must be byte-identical to Task 2's** `AudioPlayerProps`.
  - Accessibility surface later tasks/tests rely on: toggle is a `button` whose accessible name is `'Play'` when paused and `'Pause'` when playing; scrubber is `role="slider"` (native `<input type="range">`) with accessible name `Seek {label}`; time reads `"{m:ss} / {m:ss}"`; `formatTime` stays **internal** (not exported).

- [ ] **Step 1: Write the failing test**

Create `src/components/AudioPlayer/AudioPlayer.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AudioPlayer } from './AudioPlayer'

const baseProps = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  onTogglePlay: () => {},
  onSeek: () => {},
}

describe('AudioPlayer', () => {
  it('labels the toggle Play when paused and Pause when playing', () => {
    const { rerender } = render(<AudioPlayer {...baseProps} isPlaying={false} />)
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    rerender(<AudioPlayer {...baseProps} isPlaying />)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('fires onTogglePlay when the toggle is clicked', async () => {
    const onTogglePlay = vi.fn()
    render(<AudioPlayer {...baseProps} onTogglePlay={onTogglePlay} />)
    await userEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(onTogglePlay).toHaveBeenCalledTimes(1)
  })

  it('reports the absolute seek position from the range input', () => {
    const onSeek = vi.fn()
    render(<AudioPlayer {...baseProps} currentTime={10} duration={120} onSeek={onSeek} />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '42' } })
    expect(onSeek).toHaveBeenCalledWith(42)
  })

  it('renders elapsed and total time as m:ss', () => {
    render(<AudioPlayer {...baseProps} currentTime={65} duration={185} />)
    expect(screen.getByText('1:05 / 3:05')).toBeInTheDocument()
  })

  it('shows 0:00 for both times while duration is unknown', () => {
    render(<AudioPlayer {...baseProps} currentTime={0} duration={0} />)
    expect(screen.getByText('0:00 / 0:00')).toBeInTheDocument()
  })

  it('captions "Audio" by default and honours an explicit label', () => {
    const { rerender } = render(<AudioPlayer {...baseProps} />)
    expect(screen.getByText('Audio')).toBeInTheDocument()
    rerender(<AudioPlayer {...baseProps} label="Listen" />)
    expect(screen.getByText('Listen')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/AudioPlayer/AudioPlayer.test.tsx`
Expected: FAIL — module `./AudioPlayer` cannot be resolved (`Failed to resolve import "./AudioPlayer"`), so all six tests error.

- [ ] **Step 3: Write implementation**

Create `src/components/AudioPlayer/AudioPlayer.tsx`:

```tsx
import { type ChangeEvent } from 'react'
import { PlayIcon, PauseIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'

export interface AudioPlayerProps {
  isPlaying: boolean
  currentTime: number // seconds, elapsed
  duration: number // seconds, total; 0 while unknown/loading
  onTogglePlay: () => void
  onSeek: (time: number) => void // seconds, absolute position to seek to
  label?: string // optional accessible label/caption, e.g. "Audio"
}

// m:ss, e.g. 65 -> "1:05". Non-finite, negative, and the loading `duration: 0`
// case all collapse to "0:00". Kept internal — duplicated on native, since the
// two platforms deliberately do not share sub-component helpers.
function formatTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Headless audio transport: a play/pause button and a scrubber with an
 * elapsed/duration read-out. Owns no playback — the consumer drives every
 * value and handles `onTogglePlay`/`onSeek`.
 */
export function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  label = 'Audio',
}: AudioPlayerProps) {
  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(event.target.value))
  }

  return (
    <div className="flex items-center gap-3 rounded-[14px] border-2 border-border-input bg-surface-raised px-[15px] py-3">
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white transition-colors hover:bg-teal-700"
      >
        {isPlaying ? (
          <PauseIcon weight="fill" className="h-5 w-5" />
        ) : (
          <PlayIcon weight="fill" className="h-5 w-5" />
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1">
        <span className="font-body text-[13px] font-semibold uppercase tracking-[0.08em] text-teal-700">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            aria-label={`Seek ${label}`}
            className={cn('h-1.5 flex-1 cursor-pointer accent-teal-500')}
          />
          <span className="shrink-0 font-mono text-[13px] tabular-nums text-slate">
            {`${formatTime(currentTime)} / ${formatTime(duration)}`}
          </span>
        </div>
      </div>
    </div>
  )
}
```

Create `src/components/AudioPlayer/index.ts`:

```ts
export * from './AudioPlayer'
```

Modify `src/index.ts` — add the barrel line immediately after the existing `export * from './components/QuizCard'` line (line 21):

```ts
export * from './components/QuizCard'
export * from './components/AudioPlayer'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/AudioPlayer/AudioPlayer.test.tsx`
Expected: PASS — 6 passed.

Then confirm the barrel + types compile:
Run: `pnpm typecheck`
Expected: exits 0, no output.

- [ ] **Step 5: Write the Storybook stories**

Create `src/components/AudioPlayer/AudioPlayer.stories.tsx`:

```tsx
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AudioPlayer } from './AudioPlayer'

const meta: Meta<typeof AudioPlayer> = {
  title: 'Learning/AudioPlayer',
  component: AudioPlayer,
}
export default meta

type Story = StoryObj<typeof AudioPlayer>

export const Default: Story = {
  render: () => {
    const duration = 154
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(37)
    return (
      <div style={{ maxWidth: 480 }}>
        <AudioPlayer
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={() => setIsPlaying((playing) => !playing)}
          onSeek={setCurrentTime}
        />
      </div>
    )
  },
}

export const Loading: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <AudioPlayer
        isPlaying={false}
        currentTime={0}
        duration={0}
        onTogglePlay={() => {}}
        onSeek={() => {}}
        label="Listening exercise"
      />
    </div>
  ),
}
```

- [ ] **Step 6: Run the full suite + lint to confirm nothing regressed**

Run: `pnpm test`
Expected: PASS — 540 passed (534 baseline + 6 new).
Run: `pnpm lint`
Expected: exits 0 (ESLint clean including the story, then typecheck clean).

- [ ] **Step 7: Commit**

```bash
git add src/components/AudioPlayer/AudioPlayer.tsx \
        src/components/AudioPlayer/index.ts \
        src/components/AudioPlayer/AudioPlayer.stories.tsx \
        src/components/AudioPlayer/AudioPlayer.test.tsx \
        src/index.ts
git commit -m "feat: add headless web AudioPlayer component"
```

---

### Task 2: Native AudioPlayer

**Files:**
- Create: `src/native/AudioPlayer/AudioPlayer.tsx`
- Create: `src/native/AudioPlayer/index.ts`
- Modify: `src/native/index.ts` (add one barrel line)
- Test: `src/native/AudioPlayer/AudioPlayer.test.tsx`
- **No `package.json` change** — see Global Constraints (`@expo/vector-icons` stays a `devDependency`, externalized + app-provided + stubbed).

**Interfaces:**
- Consumes: `Feather` from `@expo/vector-icons`; `Pressable`, `Text`, `View`, and types `GestureResponderEvent`, `LayoutChangeEvent` from `react-native`; `radiusValue` from `../../tokens/tokens`; `fontFamily` from `../fonts`; `createThemedStyles`, `useThemedStyles` from `../theme`.
- Produces:
  - `AudioPlayer: (props: AudioPlayerProps) => ReactElement` — exported from `@klerigo/design-system/native`.
  - `AudioPlayerProps` — **byte-identical to Task 1's** interface (same six fields, same order, same comments).
  - `seekTargetForTap(locationX: number, barWidth: number, duration: number): number` — pure, exported from `AudioPlayer.tsx` for direct unit testing; **deliberately not re-exported through the barrel** (kept out of the public `@klerigo/design-system/native` surface).
  - Accessibility surface: toggle is `accessibilityRole="button"` with accessible name `'Play'`/`'Pause'`; scrubber is `accessibilityRole="adjustable"` with accessible name `Seek {label}`; time reads `"{m:ss} / {m:ss}"`.

**Why the native seek path is tested through a pure helper (read before writing tests):** the Vitest harness aliases `react-native` to `src/native/__test__/rn-stub.tsx`, which invokes `onPress()` with **no event** (so `event.nativeEvent.locationX` throws) and never fires `onLayout` in jsdom (so `barWidth` stays 0). A component-level `fireEvent`→`onSeek` assertion is therefore impossible. The seek maths lives in `seekTargetForTap` and is unit-tested directly; the component's `onPress` guards against a missing event and a zero bar width. Do **not** add a step asserting `onSeek` from a simulated tap. The stub's `styleOf`/`iconOf` helpers and the `@expo/vector-icons` stub's `iconOf`/`Feather` are already present and exported.

- [ ] **Step 1: Write the failing test**

Create `src/native/AudioPlayer/AudioPlayer.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { type ReactElement } from 'react'
import { styleOf } from '../__test__/rn-stub'
import { iconOf } from '../__test__/vector-icons-stub'
import { getPalette, type ColorScheme, type Palette } from '../../tokens/tokens'
import { ThemeProvider } from '../theme'
import { AudioPlayer, seekTargetForTap } from './AudioPlayer'

const baseProps = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  onTogglePlay: () => {},
  onSeek: () => {},
}

const inScheme = (scheme: ColorScheme, ui: ReactElement) =>
  render(<ThemeProvider scheme={scheme}>{ui}</ThemeProvider>)

// Render in both schemes and hand each palette to the assertion — a colour that
// is right in light and frozen in dark is exactly the bug this harness catches.
function bothSchemes(ui: ReactElement, assert: (palette: Palette) => void) {
  for (const scheme of ['light', 'dark'] as const) {
    const { unmount } = inScheme(scheme, ui)
    assert(getPalette(scheme))
    unmount()
  }
}

describe('seekTargetForTap', () => {
  it('maps a tap position to an absolute time', () => {
    expect(seekTargetForTap(50, 200, 120)).toBe(30)
  })

  it('clamps to the track bounds', () => {
    expect(seekTargetForTap(-10, 200, 120)).toBe(0)
    expect(seekTargetForTap(400, 200, 120)).toBe(120)
  })

  it('returns 0 before layout or while duration is unknown', () => {
    expect(seekTargetForTap(50, 0, 120)).toBe(0)
    expect(seekTargetForTap(50, 200, 0)).toBe(0)
  })
})

describe('AudioPlayer (native)', () => {
  it('labels and glyphs the toggle for the paused and playing states', () => {
    const paused = inScheme('light', <AudioPlayer {...baseProps} isPlaying={false} />)
    const pausedBtn = screen.getByRole('button', { name: 'Play' })
    expect(iconOf(pausedBtn.querySelector('[data-icon]')!).name).toBe('play')
    paused.unmount()

    inScheme('light', <AudioPlayer {...baseProps} isPlaying />)
    const playingBtn = screen.getByRole('button', { name: 'Pause' })
    expect(iconOf(playingBtn.querySelector('[data-icon]')!).name).toBe('pause')
  })

  it('reports a toggle press', () => {
    const onTogglePlay = vi.fn()
    inScheme('light', <AudioPlayer {...baseProps} onTogglePlay={onTogglePlay} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(onTogglePlay).toHaveBeenCalledTimes(1)
  })

  it('themes the toggle, the track and the elapsed fill in both schemes', () => {
    bothSchemes(<AudioPlayer {...baseProps} currentTime={30} duration={120} />, (palette) => {
      expect(styleOf(screen.getByRole('button', { name: 'Play' })).backgroundColor).toBe(
        palette.teal[500],
      )
      const bar = screen.getByLabelText('Seek Audio')
      expect(styleOf(bar).backgroundColor).toBe(palette.progressTrack)
      expect(styleOf(bar.children[0]).backgroundColor).toBe(palette.teal[500])
    })
  })

  it('renders elapsed and total time as m:ss', () => {
    inScheme('light', <AudioPlayer {...baseProps} currentTime={65} duration={185} />)
    expect(screen.getByText('1:05 / 3:05')).toBeTruthy()
  })

  it('captions "Audio" by default and honours an explicit label', () => {
    const first = inScheme('light', <AudioPlayer {...baseProps} />)
    expect(screen.getByText('Audio')).toBeTruthy()
    first.unmount()

    inScheme('light', <AudioPlayer {...baseProps} label="Listen" />)
    expect(screen.getByText('Listen')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/native/AudioPlayer/AudioPlayer.test.tsx`
Expected: FAIL — `Failed to resolve import "./AudioPlayer"`, so every test errors.

- [ ] **Step 3: Write implementation**

Create `src/native/AudioPlayer/AudioPlayer.tsx`:

```tsx
import { useState, type ReactElement } from 'react'
import { Feather } from '@expo/vector-icons'
import {
  Pressable,
  Text as RNText,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native'
import { radiusValue } from '../../tokens/tokens'
import { fontFamily } from '../fonts'
import { createThemedStyles, useThemedStyles } from '../theme'

export interface AudioPlayerProps {
  isPlaying: boolean
  currentTime: number // seconds, elapsed
  duration: number // seconds, total; 0 while unknown/loading
  onTogglePlay: () => void
  onSeek: (time: number) => void // seconds, absolute position to seek to
  label?: string // optional accessible label/caption, e.g. "Audio"
}

/**
 * Seconds to seek to for a tap at `locationX` on a bar `barWidth` wide.
 *
 * Pure and exported so the seek maths is unit-testable directly: under the RN
 * test stub `onPress` fires with no event and `onLayout` never runs, so a tap
 * can never reach this through the component. Deliberately absent from the
 * barrel — it is an implementation detail of the scrubber, not public API.
 */
export function seekTargetForTap(locationX: number, barWidth: number, duration: number): number {
  if (barWidth <= 0 || duration <= 0) return 0
  const ratio = locationX / barWidth
  const clamped = Math.min(1, Math.max(0, ratio))
  return clamped * duration
}

// m:ss, matching web's formatTime. Duplicated rather than shared: web and
// native deliberately do not import each other's sub-component helpers, and RN
// has no monospace brand face, so the read-out here rides fontFamily.body.
function formatTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Headless audio transport for React Native. Mirrors the web AudioPlayer's
 * six-prop contract exactly; the scrubber is tap-to-seek (no gesture-handler
 * dependency): `onLayout` captures the bar width and `onPress` reads the tap's
 * `locationX`.
 */
export function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  label = 'Audio',
}: AudioPlayerProps): ReactElement {
  const styles = useThemedStyles(themedStyles)
  const [barWidth, setBarWidth] = useState(0)

  const pct = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width)
  }
  const onBarPress = (event: GestureResponderEvent) => {
    const locationX = event?.nativeEvent?.locationX
    if (locationX == null || barWidth <= 0 || duration <= 0) return
    onSeek(seekTargetForTap(locationX, barWidth, duration))
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        onPress={onTogglePlay}
        style={styles.toggle}
      >
        <Feather name={isPlaying ? 'pause' : 'play'} size={20} color="#FFFFFF" />
      </Pressable>
      <View style={styles.body}>
        <RNText style={styles.caption}>{label}</RNText>
        <View style={styles.row}>
          <Pressable
            accessibilityRole="adjustable"
            accessibilityLabel={`Seek ${label}`}
            onLayout={onBarLayout}
            onPress={onBarPress}
            style={styles.track}
          >
            <View style={[styles.fill, { width: `${pct * 100}%` }]} />
          </Pressable>
          <RNText style={styles.time}>
            {`${formatTime(currentTime)} / ${formatTime(duration)}`}
          </RNText>
        </View>
      </View>
    </View>
  )
}

// Geometry from web's AudioPlayer: rounded-[14px] border-2 px-[15px], an 11x11
// (44dp) round toggle, a 6dp track. Colours come through the theme so they
// follow the active scheme.
const themedStyles = createThemedStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.borderInput,
    backgroundColor: theme.colors.surfaceRaised,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  toggle: {
    height: 44,
    width: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusValue.pill,
    backgroundColor: theme.colors.teal[500],
  },
  body: { flex: 1, gap: 6 },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: theme.colors.teal[700],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radiusValue.sm,
    backgroundColor: theme.colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radiusValue.sm,
    backgroundColor: theme.colors.teal[500],
  },
  time: {
    flexShrink: 0,
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: theme.colors.slate,
  },
}))
```

Create `src/native/AudioPlayer/index.ts`:

```ts
// seekTargetForTap is deliberately absent: it is how the scrubber's tap maths
// stays unit-testable, not part of the API.
export { AudioPlayer } from './AudioPlayer'
export type { AudioPlayerProps } from './AudioPlayer'
```

Modify `src/native/index.ts` — add the barrel line immediately after the existing `export * from './AnswerOption'` line (line 40):

```ts
export * from './AnswerOption'
export * from './AudioPlayer'
export * from './LogoMark'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/native/AudioPlayer/AudioPlayer.test.tsx`
Expected: PASS — 8 passed (3 helper + 5 component).

- [ ] **Step 5: Run the full suite + lint to confirm nothing regressed**

Run: `pnpm test`
Expected: PASS — 548 passed (540 after Task 1 + 8 new).
Run: `pnpm lint`
Expected: exits 0 (ESLint clean — note the RN-type imports are type-only and the component has an explicit `ReactElement` return; then `tsc -p tsconfig.typecheck.json` clean).

- [ ] **Step 6: Commit**

```bash
git add src/native/AudioPlayer/AudioPlayer.tsx \
        src/native/AudioPlayer/index.ts \
        src/native/AudioPlayer/AudioPlayer.test.tsx \
        src/native/index.ts
git commit -m "feat: add headless native AudioPlayer component"
```

---

## Plan self-review (author checklist — completed)

**Spec coverage.** Every locked requirement maps to a task:
- Headless, no playback state/APIs → Task 1 + Task 2 component bodies (props-only; native's only state is `barWidth` from `onLayout`, pure UI).
- Custom controls (play/pause + scrubber + elapsed/duration) → both components render toggle, scrubber, and `formatTime` read-out.
- Prop contract verbatim on both platforms → identical `AudioPlayerProps` block in `AudioPlayer.tsx` of each task (six fields, same order, same comments); both components' signatures are `AudioPlayerProps` with no extra props.
- Native no new dependency / tap-to-seek → `Pressable` + `onLayout` + `nativeEvent.locationX`, no `react-native-gesture-handler`.
- Web `<input type="range">` → Task 1 scrubber.
- Icon approach + no `package.json` change → web `PlayIcon`/`PauseIcon` (existing dependency), native `Feather` (existing devDependency, externalized/stubbed); Task 2 explicitly touches no `package.json`.
- Barrel-export convention → web `export *` (helper stays internal), native explicit re-export (keeps `seekTargetForTap` off the public surface); both wired into the two barrels; no `tsconfig`/`package.json` export edits.
- Independently testable per task → each task ends green on `pnpm test` + `pnpm typecheck`.

**Placeholder scan.** No TODO/TBD/"add appropriate…" text; every code step contains complete, compilable code and every command has an expected result.

**Type consistency across tasks.** `AudioPlayerProps` is identical in Task 1 and Task 2. Names used across steps agree: `formatTime` (internal both sides), `seekTargetForTap(locationX, barWidth, duration)` used identically in the native component and its test, accessible names `'Play'`/`'Pause'`/`Seek {label}` used identically in components and tests. Web exports `AudioPlayer` + `AudioPlayerProps` via `export *`; native exports the same two via explicit re-export and hides the helper.

## Execution handoff

Two execution options:
1. **Subagent-Driven (recommended)** — one fresh subagent per task, review between tasks.
2. **Inline Execution** — run both tasks in-session with a checkpoint after each.

Tasks are ordered so Task 1 lands the shared `AudioPlayerProps` shape first; Task 2 mirrors it. Either order is technically independent (no cross-import), but reviewing Task 1's interface first is cheaper.
