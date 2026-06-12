import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Auth shell: centered, dark, branded container with a glass card surface.
 * Server Component — the interactive forms live in each page's Client Component.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="focus-visible:ring-brand-yellow group inline-flex items-center gap-2.5 rounded-xl px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="bg-brand-yellow flex h-9 w-9 items-center justify-center rounded-xl font-black text-black shadow-sm">
              B
            </span>
            <span className="text-foreground text-xl font-bold tracking-tight">
              Binome<span className="text-brand-yellow">Pay</span>
            </span>
          </Link>
          <p className="text-sm text-neutral-400">
            Échangez vos devises entre particuliers, en toute confiance.
          </p>
        </div>

        {/* Card surface */}
        <div className="rounded-2xl border border-gray-800 bg-neutral-900/70 p-6 shadow-xl backdrop-blur-sm sm:p-7">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          En continuant, vous acceptez nos{' '}
          <Link
            href="/terms"
            className="text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
          >
            conditions d&apos;utilisation
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
