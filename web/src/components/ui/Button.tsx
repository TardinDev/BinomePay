import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from './cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold ' +
  'transition-[transform,background-color,box-shadow,opacity] duration-200 ease-out ' +
  'outline-none select-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black ' +
  'active:scale-[0.98] ' +
  'disabled:cursor-not-allowed disabled:active:scale-100'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-yellow text-black shadow-sm hover:bg-brand-yellow-soft hover:shadow-md ' +
    'disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none',
  secondary:
    'bg-brand-blue text-white shadow-sm hover:bg-brand-blue-soft hover:shadow-md ' +
    'disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none',
  ghost:
    'bg-transparent text-foreground hover:bg-neutral-800 ' +
    'disabled:bg-transparent disabled:text-neutral-600',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        )}
        <span className={cn(loading && 'opacity-90')}>{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
