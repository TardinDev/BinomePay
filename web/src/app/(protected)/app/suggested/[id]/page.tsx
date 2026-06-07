import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { AcceptButton } from './AcceptButton'

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

interface SuggestedPageProps {
  params: Promise<{ id: string }>
}

export default async function SuggestedDetailPage({ params }: SuggestedPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: intent } = await supabase
    .from('intents')
    .select('id, amount, currency, origin_country, dest_country, user_name, note, status')
    .eq('id', id)
    .single()

  if (!intent || intent.status !== 'OPEN') {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <Card className="flex flex-col items-center gap-4 border-dashed py-12 text-center">
          <h1 className="text-foreground text-lg font-semibold tracking-tight">
            Cette proposition n’est plus disponible
          </h1>
          <p className="max-w-sm text-sm text-neutral-400">
            Elle a peut-être déjà été acceptée ou retirée. Découvrez les autres propositions
            ouvertes sur votre accueil.
          </p>
          <Link href="/app">
            <Button size="sm">Retour aux propositions</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Proposition d’échange
        </h1>
        <p className="text-sm text-neutral-400">
          Vérifiez les détails avant d’accepter cette proposition.
        </p>
      </header>

      <Card className="flex flex-col gap-6">
        {/* Montant */}
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Montant</span>
          <span className="text-foreground text-3xl font-bold tracking-tight">
            {formatAmount(intent.amount, intent.currency)}
          </span>
        </div>

        <div className="h-px bg-gray-800" />

        {/* Corridor */}
        <DetailRow label="Trajet">
          <span className="text-foreground font-medium">{intent.origin_country}</span>
          <span className="px-2 text-neutral-600">→</span>
          <span className="text-foreground font-medium">{intent.dest_country}</span>
        </DetailRow>

        {/* Membre */}
        <DetailRow label="Membre">
          <span className="text-foreground font-medium">{intent.user_name}</span>
        </DetailRow>

        {/* Note */}
        {intent.note && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Note</span>
            <p className="rounded-lg bg-neutral-800/50 px-3 py-2.5 text-sm text-neutral-300">
              {intent.note}
            </p>
          </div>
        )}
      </Card>

      <AcceptButton suggestionId={intent.id} />
    </div>
  )
}

function BackLink() {
  return (
    <Link href="/app" className="text-sm text-neutral-400 transition-colors hover:text-neutral-200">
      ← Retour
    </Link>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="flex items-center text-sm">{children}</span>
    </div>
  )
}
