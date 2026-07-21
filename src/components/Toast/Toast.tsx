import { type ReactElement, type ReactNode } from 'react'
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon, XIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'
import { Heading } from '../Heading/Heading'
import { Text } from '../Text/Text'
import type { ToastLink, ToastVariant } from './types'

// Same icon + badge maps as Modal — the second use, so kept in place rather
// than extracted (rule of three hasn't fired).
const VARIANT_ICON = {
  info: InfoIcon,
  warning: WarningIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
} satisfies Record<ToastVariant, typeof InfoIcon>

const VARIANT_BADGE_CLASSES: Record<ToastVariant, string> = {
  info: 'bg-teal-50 text-info',
  warning: 'bg-sun-50 text-warning',
  error: 'bg-error-tint text-error',
  success: 'bg-success-tint text-success',
}

// Solid ramp fills for the countdown shelf. warning/info have no bg-* token,
// so they borrow the sun/teal ramp solids the rest of the system uses.
const VARIANT_SHELF_CLASSES: Record<ToastVariant, string> = {
  info: 'bg-teal-500',
  warning: 'bg-sun-500',
  error: 'bg-error',
  success: 'bg-success',
}

// Failures and warnings interrupt (assertive alert); confirmations are polite.
const VARIANT_ASSERTIVE: Record<ToastVariant, boolean> = {
  info: false,
  success: false,
  warning: true,
  error: true,
}

export interface ToastProps {
  variant?: ToastVariant
  title: string
  body?: ReactNode
  links?: ToastLink[]
  /** Drain time of the countdown shelf in ms; `null` hides the shelf (persistent). */
  duration?: number | null
  /** Freezes the drain and presses the card down — set while hovered/focused. */
  paused?: boolean
  onDismiss: () => void
  className?: string
}

/**
 * Presentational single toast: variant badge, title/body, optional footer
 * links, close button, and a variant-colored countdown shelf. Stateless — the
 * `ToastProvider` owns timers and toggles `paused`.
 */
export function Toast({
  variant = 'info',
  title,
  body,
  links,
  duration = null,
  paused = false,
  onDismiss,
  className,
}: ToastProps): ReactElement {
  const Icon = VARIANT_ICON[variant]
  const assertive = VARIANT_ASSERTIVE[variant]

  return (
    <div
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto relative w-full animate-toast-in overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-elevated transition-transform duration-150 motion-reduce:animate-none',
        paused && 'translate-y-[2px]',
        className,
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          aria-hidden
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            VARIANT_BADGE_CLASSES[variant],
          )}
        >
          <Icon weight="bold" className="h-5 w-5" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Heading as="p" size="sm">
            {title}
          </Heading>
          {body && <Text variant="muted">{body}</Text>}
          {links && links.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-4">
              {links.map((link, index) => (
                <ToastLinkButton key={index} link={link} />
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Close"
          onClick={onDismiss}
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border hover:text-ink focus-visible:shadow-focus-teal focus-visible:outline-none"
        >
          <XIcon weight="bold" className="h-4 w-4" />
        </button>
      </div>

      {duration !== null && (
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 bottom-0 h-1 origin-left animate-toast-drain motion-reduce:hidden',
            VARIANT_SHELF_CLASSES[variant],
          )}
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      )}
    </div>
  )
}

function ToastLinkButton({ link }: { link: ToastLink }): ReactElement {
  const classes =
    'rounded font-body text-sm font-semibold text-teal-700 underline-offset-2 hover:underline focus-visible:shadow-focus-teal focus-visible:outline-none'
  if (link.href) {
    return (
      <a href={link.href} onClick={link.onClick} className={classes}>
        {link.label}
      </a>
    )
  }
  return (
    <button type="button" onClick={link.onClick} className={classes}>
      {link.label}
    </button>
  )
}
