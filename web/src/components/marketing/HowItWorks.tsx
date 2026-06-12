import Image from 'next/image'

/**
 * Three-step explainer with photo illustrations. Server Component.
 * Photos: Unsplash (licence libre) — Atlantic Money, Mina Rad, Jakub Żerdzicki.
 */
export function HowItWorks() {
  return (
    <section
      id="comment-ca-fonctionne"
      className="scroll-mt-20 border-y border-gray-800/60 bg-neutral-950 px-5 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-foreground text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Comment ça fonctionne
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Trois étapes, de la publication à l’échange.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="overflow-hidden rounded-2xl border border-gray-800 bg-neutral-900"
            >
              <div className="relative aspect-[3/2]">
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-7">
                <span
                  aria-hidden="true"
                  className="bg-brand-yellow mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-black"
                >
                  {i + 1}
                </span>
                <h3 className="text-foreground text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const STEPS = [
  {
    title: 'Publiez une intention',
    body: 'Indiquez si vous voulez envoyer ou recevoir, le montant, la devise et le corridor (ex. France → Maroc).',
    image: '/images/how-it-works/step-1-intention.jpg',
    imageAlt: 'Personne saisissant un montant à convertir sur son téléphone',
  },
  {
    title: 'Soyez mis en relation',
    body: 'BinomePay vous propose un binôme compatible dont le besoin complète le vôtre.',
    image: '/images/how-it-works/step-2-mise-en-relation.jpg',
    imageAlt: 'Deux personnes se serrant la main lors d’une rencontre',
  },
  {
    title: 'Échangez en confiance',
    body: 'Discutez dans l’app, convenez des modalités et finalisez l’échange localement.',
    image: '/images/how-it-works/step-3-echange.jpg',
    imageAlt: 'Mains comptant des billets en euros lors d’un échange',
  },
]
