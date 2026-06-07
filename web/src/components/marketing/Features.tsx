import type { ReactNode } from 'react'

/**
 * Feature grid — why BinomePay. Icons are inline SVG (no emoji, no raster).
 * Server Component, zero client JS.
 */
export function Features() {
  return (
    <section className="px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-foreground text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Un change direct, pensé pour la confiance
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Pas de bureau de change, pas de commission opaque. Juste deux personnes dont les besoins
            se complètent, mises en relation en toute sécurité.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="group rounded-2xl border border-gray-800 bg-neutral-900 p-6 transition-colors duration-200 hover:border-neutral-700"
            >
              <div className="ring-brand-yellow/15 bg-brand-yellow/10 text-brand-yellow flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset">
                {f.icon}
              </div>
              <h3 className="text-foreground mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

type Feature = { title: string; body: string; icon: ReactNode }

const iconClass = 'h-5 w-5'
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const FEATURES: Feature[] = [
  {
    title: 'Échange direct entre particuliers',
    body: 'Vous êtes mis en relation avec un binôme dont le besoin est exactement l’inverse du vôtre.',
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true" {...stroke}>
        <path d="M4 8h13l-3-3M20 16H7l3 3" />
      </svg>
    ),
  },
  {
    title: 'Zéro frais cachés',
    body: 'Vous convenez du montant entre vous. Aucune commission prélevée sur l’échange.',
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 0 1 4.2-.8M14.5 14.5a2.5 2.5 0 0 1-4.2.8M12 7v10" />
      </svg>
    ),
  },
  {
    title: 'Profils vérifiés & notes',
    body: 'Vérification KYC et système de notation pour échanger avec des binômes de confiance.',
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true" {...stroke}>
        <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Messagerie intégrée',
    body: 'Discutez avec votre binôme et organisez l’échange directement dans l’application.',
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true" {...stroke}>
        <path d="M4 5h16v11H9l-4 3v-3H4z" />
      </svg>
    ),
  },
]
