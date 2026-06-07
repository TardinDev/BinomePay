import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Auth shell: centered, dark, branded container with a glass card surface.
 * Server Component — the interactive forms live in each page's Client Component.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-12">
      {/* Ambient brand glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-brand-yellow/10 absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-brand-blue/10 absolute bottom-0 right-0 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="focus-visible:ring-brand-yellow group inline-flex items-center gap-2.5 rounded-xl px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="from-brand-yellow to-brand-yellow-soft flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br font-black text-black shadow-sm">
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
