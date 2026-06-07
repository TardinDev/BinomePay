'use client'

import Link from 'next/link'
import { Avatar, Card, Skeleton, cn } from '@/components/ui'
import { useSessionUser } from '@/components/app/SessionProvider'
import { useConversations } from '@/lib/queries'
import type { Conversation } from '@/lib/schemas'

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

export default function MessagesPage() {
  const { id } = useSessionUser()
  const { data: conversations, isLoading, isError } = useConversations(id)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Messages</h1>
        <p className="text-sm text-neutral-400">
          Vos échanges avec les membres ayant accepté une proposition.
        </p>
      </header>

      {isLoading && <ConversationsSkeleton />}

      {isError && !isLoading && (
        <Card className="flex flex-col items-center gap-2 border-dashed py-12 text-center">
          <p className="text-foreground font-semibold">Impossible de charger vos conversations</p>
          <p className="max-w-sm text-sm text-neutral-400">
            Vérifiez votre connexion et réessayez dans un instant.
          </p>
        </Card>
      )}

      {!isLoading && !isError && conversations && conversations.length === 0 && (
        <Card className="flex flex-col items-center gap-2 border-dashed py-12 text-center">
          <p className="text-foreground font-semibold">Aucune conversation pour le moment</p>
          <p className="max-w-sm text-sm text-neutral-400">
            Acceptez une proposition depuis l’accueil pour démarrer un échange.
          </p>
        </Card>
      )}

      {!isLoading && !isError && conversations && conversations.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <ConversationRow conversation={conv} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const { counterpartName, lastMessage, unreadCount, matchDetails } = conversation
  const hasUnread = unreadCount > 0

  return (
    <Link
      href={`/app/messages/${conversation.id}`}
      className="focus-visible:ring-brand-yellow block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <Card interactive className="flex items-center gap-3.5 py-4">
        <div className="relative shrink-0">
          <Avatar name={counterpartName} size="md" />
          {hasUnread && (
            <span
              aria-hidden="true"
              className="bg-brand-yellow absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full ring-2 ring-neutral-900"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'truncate text-sm',
                hasUnread ? 'text-foreground font-semibold' : 'text-foreground font-medium'
              )}
            >
              {counterpartName}
            </span>
            {hasUnread && (
              <span className="bg-brand-yellow flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-black">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          <p
            className={cn('truncate text-sm', hasUnread ? 'text-neutral-200' : 'text-neutral-500')}
          >
            {lastMessage || 'Aucun message pour l’instant'}
          </p>

          {matchDetails && (
            <p className="text-brand-yellow-soft/80 mt-0.5 truncate text-xs font-medium">
              {formatAmount(matchDetails.amount, matchDetails.currency)} · {matchDetails.corridor}
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}

function ConversationsSkeleton() {
  return (
    <ul className="flex flex-col gap-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i}>
          <Card className="flex items-center gap-3.5 py-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}
