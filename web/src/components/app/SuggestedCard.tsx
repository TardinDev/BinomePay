import Link from 'next/link'
import { Avatar, Button, Card } from '@/components/ui'
import type { SuggestedItem } from '@/lib/schemas'

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

export function SuggestedCard({ item }: { item: SuggestedItem }) {
  return (
    <Card interactive className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={item.senderName} size="md" />
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-semibold">{item.senderName}</p>
            <p className="truncate text-xs text-neutral-500">
              {item.originCountryName} <span className="text-neutral-600">→</span>{' '}
              {item.destCountryName}
            </p>
          </div>
        </div>
        <p className="text-foreground shrink-0 text-base font-semibold">
          {formatAmount(item.amount, item.currency)}
        </p>
      </div>

      {item.note && (
        <p className="line-clamp-2 rounded-lg bg-neutral-800/50 px-3 py-2 text-sm text-neutral-300">
          {item.note}
        </p>
      )}

      <Link href={`/app/suggested/${item.id}`} className="block">
        <Button variant="secondary" size="sm" className="w-full">
          Voir
        </Button>
      </Link>
    </Card>
  )
}
