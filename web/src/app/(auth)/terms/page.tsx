import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions d’utilisation',
  description:
    'Conditions générales d’utilisation de BinomePay : inscription, vérification d’identité, responsabilité et protection des données.',
}

type Section = { title: string; body: React.ReactNode }

const sections: Section[] = [
  {
    title: '1. Objet du service',
    body: "BinomePay est une application de mise en relation entre particuliers souhaitant effectuer des échanges de devises. BinomePay ne réalise pas d'opérations de change elle-même mais facilite la rencontre entre utilisateurs ayant des besoins complémentaires.",
  },
  {
    title: '2. Inscription et compte',
    body: 'Pour utiliser BinomePay, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité réalisée depuis votre compte est sous votre responsabilité. Vous devez avoir au moins 18 ans pour utiliser le service.',
  },
  {
    title: '3. Vérification d’identité (KYC)',
    body: "Conformément aux réglementations en vigueur, BinomePay peut vous demander de fournir des documents d'identité pour vérifier votre identité. L'accès à certaines fonctionnalités peut être restreint tant que cette vérification n'est pas complétée.",
  },
  {
    title: '4. Utilisation du service',
    body: (
      <>
        En utilisant BinomePay, vous vous engagez à :
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Respecter les lois et réglementations en vigueur dans votre pays</li>
          <li>
            Ne pas utiliser le service à des fins frauduleuses, illégales ou de blanchiment d’argent
          </li>
          <li>Fournir des informations véridiques dans vos intentions d’échange</li>
          <li>Traiter les autres utilisateurs avec respect et courtoisie</li>
          <li>Ne pas tenter de contourner les mesures de sécurité du service</li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Responsabilité',
    body: "BinomePay agit en tant qu'intermédiaire de mise en relation. Les transactions sont effectuées directement entre les utilisateurs. BinomePay ne peut être tenu responsable des pertes, dommages ou litiges résultant des échanges entre utilisateurs. Chaque utilisateur est responsable de vérifier l'identité et la fiabilité de son partenaire d'échange.",
  },
  {
    title: '6. Suspension et résiliation',
    body: 'BinomePay se réserve le droit de suspendre ou de supprimer tout compte en cas de violation des présentes conditions, d’activité suspecte, de fraude, ou de non-conformité avec les obligations légales. Vous pouvez demander la suppression de votre compte à tout moment en nous contactant.',
  },
  {
    title: '7. Protection des données',
    body: "Vos données personnelles sont traitées conformément à notre Politique de Confidentialité et au Règlement Général sur la Protection des Données (RGPD). Vos données sont chiffrées et stockées de manière sécurisée. Vous disposez d'un droit d'accès, de modification et de suppression de vos données.",
  },
  {
    title: '8. Propriété intellectuelle',
    body: "L'application BinomePay, son design, son logo et son contenu sont protégés par les lois sur la propriété intellectuelle. Toute reproduction ou utilisation non autorisée est interdite.",
  },
  {
    title: '9. Modifications',
    body: 'BinomePay peut modifier ces conditions à tout moment. Les utilisateurs seront informés des modifications importantes. L’utilisation continue du service après modification vaut acceptation des nouvelles conditions.',
  },
  {
    title: '10. Contact',
    body: (
      <>
        Pour toute question concernant ces conditions d’utilisation, contactez-nous à :{' '}
        <a
          href="mailto:support@binomepay.com"
          className="text-brand-yellow underline-offset-2 hover:underline"
        >
          support@binomepay.com
        </a>
      </>
    ),
  },
]

export default function TermsPage() {
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-foreground text-xl font-bold tracking-tight">
          Conditions d’utilisation
        </h1>
        <p className="text-xs text-neutral-500">
          Dernière mise à jour : 12 avril 2026 — Version 1.0.1
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-1.5">
            <h2 className="text-foreground text-base font-semibold">{section.title}</h2>
            <div className="text-sm leading-relaxed text-neutral-300">{section.body}</div>
          </section>
        ))}
      </div>

      <Link
        href="/register"
        className="text-brand-yellow self-start text-sm font-semibold underline-offset-2 hover:underline"
      >
        ← Retour à l’inscription
      </Link>
    </article>
  )
}
