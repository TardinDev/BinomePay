/**
 * Liste d'intentions « vitrines » affichée dans la carte Mise en relation du hero.
 * Rotation automatique chaque semaine (déterministe, calculée au rendu serveur) :
 * France → Gabon est toujours affichée, seul son montant change ; les trois
 * autres lignes tournent dans le pool ci-dessous. Aucune base de données.
 */

type AdType = 'ENVOI' | 'RÉCEPTION'

type IntentionAd = {
  type: AdType
  from: string
  to: string
  amount: string
}

/** Montants hebdomadaires pour France → Gabon. */
const GABON_AMOUNTS = ['250 €', '300 €', '180 €', '350 €', '220 €', '400 €']

/** Pool de rotation — la semaine 0 affiche les trois premières entrées. */
const ROTATION: IntentionAd[] = [
  { type: 'RÉCEPTION', from: 'France', to: 'Cameroun', amount: '200 €' },
  { type: 'ENVOI', from: 'Belgique', to: 'Congo', amount: '250 €' },
  { type: 'RÉCEPTION', from: 'USA', to: 'Sénégal', amount: '350 $' },
  { type: 'ENVOI', from: 'France', to: 'Côte d’Ivoire', amount: '150 €' },
  { type: 'RÉCEPTION', from: 'Belgique', to: 'Mali', amount: '300 €' },
  { type: 'ENVOI', from: 'USA', to: 'Togo', amount: '180 $' },
  { type: 'RÉCEPTION', from: 'France', to: 'Bénin', amount: '220 €' },
  { type: 'ENVOI', from: 'Belgique', to: 'Maroc', amount: '400 €' },
]

/** Lundi 2026-06-08 : semaine 0 de la rotation. */
const ROTATION_START_MS = Date.UTC(2026, 5, 8)
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function currentWeek(): number {
  return Math.max(0, Math.floor((Date.now() - ROTATION_START_MS) / WEEK_MS))
}

export function weeklyIntentions(): IntentionAd[] {
  const week = currentWeek()
  const gabon: IntentionAd = {
    type: 'ENVOI',
    from: 'France',
    to: 'Gabon',
    amount: GABON_AMOUNTS[week % GABON_AMOUNTS.length],
  }
  const others = [0, 1, 2].map((i) => ROTATION[(week * 3 + i) % ROTATION.length])
  return [gabon, ...others]
}

export function IntentionAds() {
  return (
    <ul className="divide-y divide-gray-800">
      {weeklyIntentions().map((ad) => (
        <li
          key={`${ad.from}-${ad.to}`}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <span
            className={
              ad.type === 'ENVOI'
                ? 'bg-brand-yellow/10 text-brand-yellow-soft w-24 shrink-0 rounded-md px-2 py-1 text-center text-[0.65rem] font-bold uppercase tracking-wide'
                : 'bg-brand-blue/10 text-brand-blue-soft w-24 shrink-0 rounded-md px-2 py-1 text-center text-[0.65rem] font-bold uppercase tracking-wide'
            }
          >
            {ad.type}
          </span>
          <span className="text-foreground flex-1 truncate text-sm font-medium">
            {ad.from} <span aria-hidden="true">→</span> {ad.to}
          </span>
          <span className="text-foreground shrink-0 text-sm font-bold">{ad.amount}</span>
        </li>
      ))}
    </ul>
  )
}
