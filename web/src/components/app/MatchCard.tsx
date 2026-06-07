import { Avatar, Badge, Card } from '@/components/ui'
import type { MatchItem } from '@/lib/schemas'

const STATUS_LABEL: Record<MatchItem['status'], string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Accepté',
  EXPIRED: 'Expiré',
}

const STATUS_BADGE: Record<MatchItem['status'], 'OPEN' | 'MATCHED' | 'CLOSED'> = {
  ACCEPTED: 'MATCHED',
  PENDING: 'OPEN',
  EXPIRED: 'CLOSED',
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

export function MatchCard({ item }: { item: MatchItem }) {
  return (
    <Card interactive className="flex w-64 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={item.counterpartName} size="sm" />
          <span className="text-foreground truncate text-sm font-semibold">
            {item.counterpartName}
          </span>
        </div>
        <Badge status={STATUS_BADGE[item.status]} className="shrink-0">
          {STATUS_LABEL[item.status]}
        </Badge>
      </div>

      <div>
        <p className="text-foreground text-lg font-semibold">
          {formatAmount(item.amount, item.currency)}
        </p>
        <p className="text-sm text-neutral-400">{item.corridor}</p>
      </div>
    </Card>
  )
}
