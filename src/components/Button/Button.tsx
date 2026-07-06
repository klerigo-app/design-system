import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

// Explicit return type so declaration emit doesn't need to reference cva's
// internal (non-exported) `ClassProp` type — see espanolenka-design ADR-less
// note: `class`/`className` are never passed to this call directly (cn()
// merges className afterwards instead), so they're safely omitted here.
type ButtonStyleProps = {
  variant?: 'primary' | 'reward' | 'secondary' | 'ghost' | 'danger' | 'disabled'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const buttonStyles: (props?: ButtonStyleProps) => string = cva(
  'inline-flex items-center justify-center gap-[9px] font-display font-medium transition-transform duration-150 disabled:cursor-not-allowed disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-coral-500 text-white shadow-lift-coral hover:bg-coral-hover active:translate-y-[3px] active:shadow-pressed-coral',
        reward:
          'bg-sun-500 text-ink shadow-lift-sun hover:bg-sun-hover active:translate-y-[3px] active:shadow-pressed-sun',
        secondary: 'border-2 border-teal-500 bg-white text-teal-500 hover:bg-teal-50',
        ghost: 'bg-transparent text-slate hover:bg-border hover:text-ink',
        danger: 'bg-error text-white hover:bg-error-hover active:translate-y-[1px]',
        disabled: 'bg-disabled-bg text-disabled-text',
      },
      size: {
        sm: 'rounded-md px-4 py-2 text-[13px]',
        md: 'rounded-lg px-[26px] py-[14px] text-base',
        lg: 'rounded-xl px-[34px] py-[18px] text-lg',
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

type ButtonOwnProps = {
  variant?: 'primary' | 'reward' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: ReactNode
  disabled?: boolean
  className?: string
  children?: ReactNode
}

export type ButtonProps = ButtonOwnProps &
  (
    | ({ as?: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>)
    | ({ as: 'a' } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps>)
  )

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    { variant, size, fullWidth, icon, disabled, className, children, as = 'button', ...props },
    ref,
  ) => {
    const resolvedVariant = disabled ? 'disabled' : variant
    const classes = cn(buttonStyles({ variant: resolvedVariant, size, fullWidth }), className)
    const content = (
      <>
        {icon && <span className="h-5 w-5 shrink-0">{icon}</span>}
        {children}
      </>
    )

    if (as === 'a') {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={classes}
          aria-disabled={disabled || undefined}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      )
    }

    const { type = 'button', ...buttonProps } = props as ButtonHTMLAttributes<HTMLButtonElement>
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled}
        className={classes}
        {...buttonProps}
      >
        {content}
      </button>
    )
  },
)
Button.displayName = 'Button'
