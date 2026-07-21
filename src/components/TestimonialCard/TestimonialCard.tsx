import { type ReactNode } from 'react'
import { StarIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'
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
      className={cn('flex flex-col gap-4 !rounded-[var(--radius-card)] !p-7', className)}
    >
      <div>
        <div className="flex items-center gap-1" data-testid="testimonial-stars" aria-hidden>
          {Array.from({ length: MAX_RATING }, (_, i) => (
            <StarIcon
              key={i}
              weight="fill"
              className={cn('h-4 w-4', i < filled ? 'text-sun-500' : 'text-border')}
            />
          ))}
        </div>
        <span className="sr-only">
          Rating: {filled} of {MAX_RATING} stars
        </span>
      </div>

      <p className="font-body text-base leading-relaxed text-label">&ldquo;{quote}&rdquo;</p>

      <div className="mt-1 flex items-center gap-3">
        <div
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface"
          data-testid="testimonial-avatar"
        >
          {avatar}
        </div>
        <div className="flex flex-col">
          <span className="font-display text-[15.5px] font-medium text-ink">{name}</span>
          <span className="font-body text-[12.5px] font-semibold text-muted">{role}</span>
        </div>
      </div>
    </Card>
  )
}
