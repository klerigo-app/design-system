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
