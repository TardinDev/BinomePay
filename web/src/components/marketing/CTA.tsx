import { CtaLink } from './CtaLink'

/**
 * Final conversion band. Server Component.
 */
export function CTA() {
  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-gray-800 bg-neutral-900 px-6 py-14 text-center sm:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-brand-yellow/15 absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full blur-[110px]" />
          <div className="bg-brand-blue/10 absolute -bottom-24 right-0 h-64 w-64 rounded-full blur-[90px]" />
        </div>

        <h2 className="text-foreground text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Prêt à trouver votre binôme&nbsp;?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
          Créez votre compte en quelques secondes et publiez votre première intention d’échange.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaLink href="/register" variant="primary" size="lg" className="px-8">
            Créer un compte
          </CtaLink>
          <CtaLink href="/login" variant="ghost" size="lg" className="px-8">
            Se connecter
          </CtaLink>
        </div>

        <p className="mt-6 text-xs text-neutral-500">Également disponible sur Android et iOS.</p>
      </div>
    </section>
  )
}
