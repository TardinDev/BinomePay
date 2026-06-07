import { type HTMLAttributes } from 'react'
import { cn } from './cn'

export type SkeletonProps = HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded bg-neutral-800', className)}
      {...props}
    />
  )
}
