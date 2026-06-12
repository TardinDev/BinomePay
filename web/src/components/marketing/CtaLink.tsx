import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/components/ui'

type CtaVariant = 'primary' | 'secondary' | 'ghost'
type CtaSize = 'md' | 'lg'

export interface CtaLinkProps extends Omit<ComponentProps<typeof Link>, 'className'> {
  variant?: CtaVariant
  size?: CtaSize
  className?: string
  children: ReactNode
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold ' +
  'transition-[transform,background-color,box-shadow,opacity] duration-200 ease-out ' +
  'outline-none select-none active:scale-[0.98] ' +
  'focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black'

const variants: Record<CtaVariant, string> = {
  primary: 'bg-brand-yellow text-black shadow-sm hover:bg-brand-yellow-soft hover:shadow-md',
  secondary: 'bg-brand-blue text-white shadow-sm hover:bg-brand-blue-soft hover:shadow-md',
  ghost:
    'border border-gray-800 bg-neutral-900/60 text-foreground hover:border-neutral-700 hover:bg-neutral-800',
}

const sizes: Record<CtaSize, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

/**
 * Anchor-as-button for landing CTAs. Mirrors the `Button` visual language but
 * renders a real `<Link>` so navigation is a proper anchor (SEO + a11y).
 */
export function CtaLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: CtaLinkProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  )
}
