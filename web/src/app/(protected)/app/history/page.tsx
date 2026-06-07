import { redirect } from 'next/navigation'
import { Badge, Card } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'

type TxStatus = 'success' | 'pending' | 'failed' | 'cancelled'

interface TransactionRow {
  id: string
  type: string | null
  counterpart_name: string | null
  amount: number | null
  currency: string | null
  corridor: string | null
  status: TxStatus | null
  created_at: string | null
}

const STATUS_LABELS: Record<TxStatus, string> = {
  success: 'Réussie',
  pending: 'En attente',
  failed: 'Échouée',
  cancelled: 'Annulée',
}

const STATUS_BADGE: Record<TxStatus, string> = {
  success: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  pending: 'bg-brand-yellow/15 text-brand-yellow-soft ring-brand-yellow/30',
  failed: 'bg-red-500/15 text-red-300 ring-red-500/30',
  cancelled: 'bg-neutral-700/30 text-neutral-400 ring-neutral-600/40',
}

const TYPE_LABELS: Record<string, string> = {
  match_created: 'Binôme créé',
  match_accepted: 'Binôme accepté',
  match_completed: 'Échange terminé',
  match_cancelled: 'Binôme annulé',
  message_sent: 'Message envoyé',
  intention_created: 'Intention créée',
  rating_given: 'Évaluation donnée',
}

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

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('transaction_history')
    .select('id, type, counterpart_name, amount, currency, corridor, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as TransactionRow[]

  // Summary stats computed from the rows.
  const total = rows.length
  const volumeByCurrency: Record<string, number> = {}
  const countByStatus: Partial<Record<TxStatus, number>> = {}
  for (const row of rows) {
    if (typeof row.amount === 'number' && row.currency) {
      volumeByCurrency[row.currency] = (volumeByCurrency[row.currency] ?? 0) + row.amount
    }
    if (row.status) {
      countByStatus[row.status] = (countByStatus[row.status] ?? 0) + 1
    }
  }
  const volumeEntries = Object.entries(volumeByCurrency).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Historique
        </h1>
        <p className="text-sm text-neutral-400">
          Le récapitulatif de vos échanges et de votre activité.
        </p>
      </header>

      {error && (
        <Card className="border-red-500/30 bg-red-500/5 py-6 text-center">
          <p className="text-sm text-red-300">Impossible de charger votre historique.</p>
        </Card>
      )}

      {!error && total === 0 && (
        <Card className="flex flex-col items-center gap-3 border-dashed py-12 text-center">
          <p className="max-w-sm text-sm text-neutral-400">Aucune transaction pour le moment.</p>
          <p className="text-xs text-neutral-500">
            Vos échanges et activités apparaîtront ici au fil du temps.
          </p>
        </Card>
      )}

      {!error && total > 0 && (
        <>
          {/* Summary */}
          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Transactions" value={String(total)} />
            <StatCard
              label="Volume total"
              value={
                volumeEntries.length > 0
                  ? volumeEntries.map(([cur, amt]) => formatAmount(amt, cur)).join(' · ')
                  : '—'
              }
            />
            <StatCard label="Réussies" value={`${countByStatus.success ?? 0} / ${total}`} />
          </section>

          {/* List */}
          <section className="flex flex-col gap-3">
            {rows.map((row) => {
              const status = row.status ?? 'pending'
              const typeLabel = row.type ? (TYPE_LABELS[row.type] ?? row.type) : 'Transaction'
              return (
                <Card key={row.id} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-foreground text-sm font-semibold">{typeLabel}</span>
                      <Badge className={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</Badge>
                    </div>
                    <p className="truncate text-sm text-neutral-400">
                      {row.counterpart_name || 'Membre BinomePay'}
                      {row.corridor ? ` · ${row.corridor}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
                    {typeof row.amount === 'number' && row.currency ? (
                      <span className="text-foreground text-sm font-semibold">
                        {formatAmount(row.amount, row.currency)}
                      </span>
                    ) : (
                      <span className="text-sm text-neutral-600">—</span>
                    )}
                    {row.created_at && (
                      <time dateTime={row.created_at} className="text-xs text-neutral-500">
                        {formatDate(row.created_at)}
                      </time>
                    )}
                  </div>
                </Card>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="text-foreground text-lg font-semibold tracking-tight">{value}</span>
    </Card>
  )
}
