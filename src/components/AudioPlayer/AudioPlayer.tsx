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
