import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from './cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  /** Error message; when present the field renders an aria-invalid error state. */
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const hasError = Boolean(error)

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            'text-foreground h-11 w-full rounded-xl border bg-neutral-950 px-3.5 text-sm',
            'placeholder:text-neutral-500',
            'outline-none transition-[border-color,box-shadow] duration-200 ease-out',
            'focus-visible:ring-brand-yellow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'focus-visible:border-brand-yellow border-gray-800',
            className
          )}
          {...props}
        />
        {hasError && (
          <p id={errorId} className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
