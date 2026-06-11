import { Badge } from '@/components/ui'
import { CtaLink } from './CtaLink'
import { CurrencyConverter } from './CurrencyConverter'

/**
 * Landing hero — value proposition + CTAs and a CSS/SVG-only brand visual.
 * Server Component: zero client JS, motion handled by CSS (reduced-motion safe).
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:pb-28 sm:pt-24">
      {/* Ambient brand mesh — purely decorative */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-brand-yellow/12 absolute -top-40 left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="bg-brand-blue/10 absolute -right-24 top-32 h-80 w-80 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Copy column */}
        <div className="flex flex-col items-start gap-6">
          <span className="ring-brand-yellow/25 bg-brand-yellow/10 text-brand-yellow-soft inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset">
            <span className="bg-brand-yellow inline-block h-1.5 w-1.5 rounded-full" />
            Échange de devises entre particuliers
          </span>

          <h1 className="text-foreground max-w-2xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Envoyez et recevez de l&apos;argent{' '}
            <span className="from-brand-yellow to-brand-yellow-soft bg-gradient-to-r bg-clip-text text-transparent">
              sans intermédiaire
            </span>
            .
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            BinomePay vous met directement en relation avec un binôme de confiance qui veut
            l&apos;échange inverse du vôtre. Vous convenez du montant, vous discutez dans
            l&apos;app, vous échangez localement — sans frais cachés.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="/register" variant="primary" size="lg" className="px-7">
              Créer un compte
            </CtaLink>
            <CtaLink href="/login" variant="ghost" size="lg" className="px-7">
              Se connecter
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

        {/* Visual column — stylized SEND → RECEIVE corridor on a mock app card */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="from-brand-yellow/20 to-brand-blue/20 absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br via-transparent blur-2xl"
          />
          <div className="rounded-3xl border border-gray-800 bg-neutral-900/70 p-5 shadow-2xl backdrop-blur-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Mise en relation
              </span>
              <Badge status="MATCHED">Binôme trouvé</Badge>
            </div>

            <CorridorVisual />

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Vous envoyez" value="500 €" sub="France" tone="yellow" />
              <Stat label="Votre binôme reçoit" value="5 450 MAD" sub="Maroc" tone="blue" />
            </div>
          </div>
        </div>
        {/* Currency converter — full width, 3rd row */}
        <div className="lg:col-span-2">
          <CurrencyConverter />
        </div>
      </div>
    </section>
  )
}

type StatTone = 'yellow' | 'blue'

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone: StatTone
}) {
  const accent = tone === 'yellow' ? 'text-brand-yellow-soft' : 'text-brand-blue-soft'
  return (
    <div className="rounded-2xl border border-gray-800 bg-black/40 p-4">
      <p className="text-[0.7rem] uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent}`}>{value}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>
    </div>
  )
}

/** Decorative SEND → RECEIVE corridor built entirely in SVG. */
function CorridorVisual() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 120"
      className="h-auto w-full"
      role="presentation"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="corridor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <radialGradient id="nodeY" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#EAB308" />
        </radialGradient>
        <radialGradient id="nodeB" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </radialGradient>
      </defs>

      {/* Connecting corridor */}
      <path
        d="M58 60 H262"
        stroke="url(#corridor)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 10"
        opacity="0.55"
      />
      <path d="M58 60 H262" stroke="url(#corridor)" strokeWidth="3" strokeLinecap="round">
        <animate
          attributeName="stroke-dasharray"
          values="0 204; 70 134; 0 204"
          dur="3.2s"
          repeatCount="indefinite"
        />
      </path>

      {/* SEND node */}
      <circle cx="58" cy="60" r="22" fill="url(#nodeY)" />
      <path
        d="M52 60 h10 M58 55 l5 5 -5 5"
        stroke="#000"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text x="58" y="100" textAnchor="middle" fontSize="11" fill="#a3a3a3" fontWeight="600">
        ENVOIE
      </text>

      {/* RECEIVE node */}
      <circle cx="262" cy="60" r="22" fill="url(#nodeB)" />
      <path
        d="M268 60 h-10 M262 55 l-5 5 5 5"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text x="262" y="100" textAnchor="middle" fontSize="11" fill="#a3a3a3" fontWeight="600">
        REÇOIT
      </text>
    </svg>
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
