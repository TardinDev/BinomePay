import { Badge, Card } from '@/components/ui'
import type { RequestItem } from '@/lib/schemas'

const DIRECTION_LABEL: Record<RequestItem['type'], string> = {
  SEND: 'J’envoie',
  RECEIVE: 'Je reçois',
}

const STATUS_LABEL: Record<RequestItem['status'], string> = {
  OPEN: 'Ouverte',
  MATCHED: 'En binôme',
  CLOSED: 'Clôturée',
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

export function IntentionCard({ item }: { item: RequestItem }) {
  const isSend = item.type === 'SEND'
  return (
    <Card interactive className="flex items-center gap-4">
      <span
        aria-hidden="true"
        className={
          isSend
            ? 'bg-brand-yellow/10 text-brand-yellow-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-xl'
            : 'bg-brand-blue/10 text-brand-blue-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-xl'
        }
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          {isSend ? (
            <>
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </>
          ) : (
            <>
              <line x1="17" y1="7" x2="7" y2="17" />
              <polyline points="17 17 7 17 7 7" />
            </>
          )}
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            {DIRECTION_LABEL[item.type]}
          </span>
        </div>
        <p className="text-foreground truncate text-lg font-semibold">
          {formatAmount(item.amount, item.currency)}
        </p>
        <p className="truncate text-sm text-neutral-400">
          {item.originCountry} <span className="text-neutral-600">→</span> {item.destCountry}
        </p>
      </div>

      <Badge status={item.status} className="shrink-0">
        {STATUS_LABEL[item.status]}
      </Badge>
    </Card>
  )
}
