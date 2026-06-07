import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from './cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a subtle hover lift + border highlight for interactive cards. */
  interactive?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-gray-800 bg-neutral-900 p-5 shadow-sm',
        interactive &&
          'transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-700 hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

Card.displayName = 'Card'
