import { CtaLink } from './CtaLink'

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        {/* Wordmark */}
        <span className="from-brand-yellow to-brand-yellow-soft bg-gradient-to-r bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
          BinomePay
        </span>

        {/* Nav links */}
        <nav className="flex items-center gap-3">
          <CtaLink href="/login" variant="ghost" size="md">
            Se connecter
          </CtaLink>
          <CtaLink href="/register" variant="primary" size="md">
            Créer un compte
          </CtaLink>
        </nav>
      </div>
    </header>
  )
}
