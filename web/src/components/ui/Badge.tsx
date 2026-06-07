import { type HTMLAttributes } from 'react'
import { cn } from './cn'

/** Semantic statuses shared with the mobile app. */
export type BadgeStatus = 'OPEN' | 'MATCHED' | 'CLOSED' | 'unverified' | 'pending' | 'verified'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic status that maps to a preset color. Falls back to neutral. */
  status?: BadgeStatus
}

const statusStyles: Record<BadgeStatus, string> = {
  // Intention statuses
  OPEN: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  MATCHED: 'bg-brand-blue/15 text-brand-blue-soft ring-brand-blue/30',
  CLOSED: 'bg-neutral-700/30 text-neutral-400 ring-neutral-600/40',
  // KYC statuses
  unverified: 'bg-red-500/15 text-red-300 ring-red-500/30',
  pending: 'bg-brand-yellow/15 text-brand-yellow-soft ring-brand-yellow/30',
  verified: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
}

const neutralStyle = 'bg-neutral-700/30 text-neutral-300 ring-neutral-600/40'

export function Badge({ status, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        status ? statusStyles[status] : neutralStyle,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
