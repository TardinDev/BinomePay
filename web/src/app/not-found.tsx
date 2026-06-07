import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-brand-yellow text-sm font-semibold uppercase tracking-widest">
        Erreur 404
      </p>
      <h1 className="text-foreground text-3xl font-bold tracking-tight">Page introuvable</h1>
      <p className="max-w-md text-sm text-neutral-400">
        La page que vous cherchez n’existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="from-brand-yellow to-brand-yellow-soft focus-visible:ring-brand-yellow mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-b px-6 text-sm font-semibold text-black transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Retour à l’accueil
      </Link>
    </main>
  )
}
