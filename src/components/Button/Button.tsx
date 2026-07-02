import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-[9px] font-display font-medium transition-transform duration-150 disabled:cursor-not-allowed disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-coral-500 text-white shadow-lift-coral hover:bg-[#E0402D] active:translate-y-[3px] active:shadow-[0_1px_0_#C63823]',
        reward:
          'bg-sun-500 text-ink shadow-lift-sun hover:bg-[#F5B52E] active:translate-y-[3px] active:shadow-[0_1px_0_#D99A18]',
        secondary: 'bg-white text-teal-500 border-2 border-teal-500 hover:bg-teal-50',
        ghost: 'bg-transparent text-slate hover:bg-border hover:text-ink',
        disabled: 'bg-[#E9EDEE] text-[#A6ADB3]',
      },
      size: {
        sm: 'text-[13px] px-4 py-2 rounded-md',
        md: 'text-base px-[26px] py-[14px] rounded-lg',
        lg: 'text-lg px-[34px] py-[18px] rounded-xl',
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

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof buttonStyles> {
  icon?: ReactNode
  disabled?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, fullWidth, icon, disabled, className, children, ...props }, ref) => {
    const resolvedVariant = disabled ? 'disabled' : variant
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(buttonStyles({ variant: resolvedVariant, size, fullWidth }), className)}
        {...props}
      >
        {icon && <span className="w-5 h-5 shrink-0">{icon}</span>}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
