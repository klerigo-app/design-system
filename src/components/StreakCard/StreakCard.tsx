import clsx from 'clsx'
import { colors } from '../../tokens/tokens'

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
          style={{ background: `linear-gradient(135deg, ${colors.sun[500]}, ${colors.coral[500]})` }}
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
