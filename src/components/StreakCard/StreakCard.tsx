import type { ReactElement } from 'react'
import { cn } from '../../lib/cn'
import { colors } from '../../tokens/tokens'

export interface StreakCardProps {
  days: number
  title: string
  subtitle: string
  activeDays: boolean[]
  dayLetters: string[]
}

export function StreakCard({
  days,
  title,
  subtitle,
  activeDays,
  dayLetters,
}: StreakCardProps): ReactElement {
  return (
    <div className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-ink p-6 text-white">
      <div className="flex items-center gap-4">
        <div
          className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, ${colors.sun[500]}, ${colors.coral[500]})`,
          }}
        >
          {days}
        </div>
        <div>
          <p className="font-display text-lg font-medium">{title}</p>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {dayLetters.map((letter, index) => (
          <div
            key={`${letter}-${index}`}
            className={cn(
              'flex h-[34px] flex-1 items-center justify-center rounded-[9px] text-sm font-semibold',
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
