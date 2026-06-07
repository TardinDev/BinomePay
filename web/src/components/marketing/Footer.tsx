import Link from 'next/link'

/**
 * Site footer. Server Component.
 */
export function Footer() {
  return (
    <footer className="border-t border-gray-800 px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span
            className="bg-brand-yellow inline-block h-2.5 w-2.5 rounded-full"
            aria-hidden="true"
          />
          <span className="text-foreground text-lg font-bold tracking-tight">BinomePay</span>
        </div>

        <nav aria-label="Liens de pied de page">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-400">
            <li>
              <Link
                href="/register"
                className="focus-visible:ring-brand-yellow rounded transition-colors hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2"
              >
                Créer un compte
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="focus-visible:ring-brand-yellow rounded transition-colors hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2"
              >
                Se connecter
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="focus-visible:ring-brand-yellow rounded transition-colors hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2"
              >
                Conditions d’utilisation
              </Link>
            </li>
          </ul>
        </nav>

        <p className="text-xs text-neutral-500">© 2026 BinomePay</p>
      </div>
    </footer>
  )
}
