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
