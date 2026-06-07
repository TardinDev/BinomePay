'use client'

import { useState, type HTMLAttributes } from 'react'
import { cn } from './cn'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image URL; when missing or failed, initials are shown instead. */
  src?: string | null
  /** Full name used to derive initials and the accessible label. */
  name: string
  size?: AvatarSize
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? '') : ''
  return (first.charAt(0) + last.charAt(0)).toUpperCase() || '?'
}

/**
 * Avatar with initials fallback. Uses a plain <img> (avatars are arbitrary
 * remote URLs; next/image remote-host config is wired in a later phase).
 */
export function Avatar({ src, name, size = 'md', className, ...props }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'text-brand-yellow-soft bg-neutral-800 font-semibold ring-1 ring-inset ring-gray-800',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}
