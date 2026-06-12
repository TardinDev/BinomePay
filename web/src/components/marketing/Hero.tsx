import { CtaLink } from './CtaLink'
import { CurrencyConverter } from './CurrencyConverter'
import { IntentionAds } from './IntentionAds'

/**
 * Landing hero — value proposition + CTAs and the weekly intention showcase.
 * Server Component: zero client JS.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Copy column */}
        <div className="flex flex-col items-start gap-6">
          <span className="ring-brand-yellow/25 bg-brand-yellow/10 text-brand-yellow-soft inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset">
            <span className="bg-brand-yellow inline-block h-1.5 w-1.5 rounded-full" />
            Échange de devises entre particuliers
          </span>

          <h1 className="text-foreground max-w-2xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Envoyez et recevez de l&apos;argent{' '}
            <span className="text-brand-yellow">sans intermédiaire</span>.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            BinomePay vous met directement en relation avec un binôme de confiance qui veut
            l&apos;échange inverse du vôtre. Vous convenez du montant, vous discutez dans
            l&apos;app, vous échangez localement — sans frais cachés.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="#comment-ca-fonctionne" variant="primary" size="lg" className="px-7">
              Comment ça fonctionne
            </CtaLink>
          </div>

          <ul className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500">
            <li className="flex items-center gap-2">
              <CheckIcon /> Sans frais cachés
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon /> Profils vérifiés (KYC)
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon /> Android &amp; iOS
            </li>
          </ul>
        </div>

        {/* Visual column */}
        <div className="flex flex-col gap-4">
          <CurrencyConverter />

          <div className="relative">
            <div className="rounded-3xl border border-gray-800 bg-neutral-900 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Mise en relation
                </span>
                <span className="text-xs text-neutral-500">Cette semaine</span>
              </div>

              <IntentionAds />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="text-brand-yellow h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <path d="M4 10.5 8 14.5 16 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
