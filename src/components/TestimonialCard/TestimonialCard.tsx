import { type ReactNode } from 'react'
import { StarIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { Card } from '../Card/Card'

export interface TestimonialCardProps {
  /** 0-5, defaults to 5. Values outside range are clamped, and non-integers are rounded. */
  rating?: number
  quote: ReactNode
  /** Avatar slot — consumer supplies an <img> or its own placeholder node. */
  avatar?: ReactNode
  name: string
  role: string
  className?: string
}

const MAX_RATING = 5

export function TestimonialCard({
  rating = 5,
  quote,
  avatar,
  name,
  role,
  className,
}: TestimonialCardProps) {
  const filled = Math.max(0, Math.min(MAX_RATING, Math.round(rating)))

  return (
    <Card
      variant="elevated"
      className={clsx('!rounded-[var(--radius-card)] !p-7 flex flex-col gap-4', className)}
    >
      <div>
        <div className="flex items-center gap-1" data-testid="testimonial-stars" aria-hidden>
          {Array.from({ length: MAX_RATING }, (_, i) => (
            <StarIcon
              key={i}
              weight="fill"
              className={clsx('w-4 h-4', i < filled ? 'text-sun-500' : 'text-border')}
            />
          ))}
        </div>
        <span className="sr-only">
          Valoración: {filled} de {MAX_RATING} estrellas
        </span>
      </div>

      <p className="font-body text-base leading-relaxed text-[#3A454F]">&ldquo;{quote}&rdquo;</p>

      <div className="flex items-center gap-3 mt-1">
        <div
          className="w-[46px] h-[46px] rounded-full overflow-hidden shrink-0 bg-surface flex items-center justify-center"
          data-testid="testimonial-avatar"
        >
          {avatar}
        </div>
        <div className="flex flex-col">
          <span className="font-display font-medium text-[15.5px] text-ink">{name}</span>
          <span className="font-body font-semibold text-[12.5px] text-muted">{role}</span>
        </div>
      </div>
    </Card>
  )
}
