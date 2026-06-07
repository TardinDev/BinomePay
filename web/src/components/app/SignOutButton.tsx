'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/components/ui'

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSignOut = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400',
        'transition-colors hover:bg-neutral-800 hover:text-neutral-100',
        'focus-visible:ring-brand-yellow outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>{loading ? 'Déconnexion…' : 'Se déconnecter'}</span>
    </button>
  )
}
