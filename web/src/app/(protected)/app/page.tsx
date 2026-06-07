'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button, Card, Skeleton } from '@/components/ui'
import { useSessionUser } from '@/components/app/SessionProvider'
import { useRequests } from '@/lib/queries/useRequests'
import { useSuggestions } from '@/lib/queries/useSuggestions'
import { useMatches } from '@/lib/queries/useMatches'
import { IntentionCard } from '@/components/app/IntentionCard'
import { MatchCard } from '@/components/app/MatchCard'
import { SuggestedCard } from '@/components/app/SuggestedCard'
import { CountryFilter } from '@/components/app/CountryFilter'

export default function HomePage() {
  const { id, firstName } = useSessionUser()

  const requests = useRequests(id)
  const suggestions = useSuggestions(id)
  const matches = useMatches(id)

  const [destFilter, setDestFilter] = useState<string | null>(null)

  const suggestionItems = useMemo(() => suggestions.data ?? [], [suggestions.data])
  const destOptions = useMemo(
    () => Array.from(new Set(suggestionItems.map((s) => s.destCountryName))).sort(),
    [suggestionItems]
  )
  const filteredSuggestions = destFilter
    ? suggestionItems.filter((s) => s.destCountryName === destFilter)
    : suggestionItems

  const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour'

  return (
    <div className="flex flex-col gap-10">
      {/* Greeting */}
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting}
        </h1>
        <p className="text-sm text-neutral-400">
          Voici vos binômes, vos intentions et les propositions des autres membres.
        </p>
      </header>

      {/* Matches récents */}
      <Section title="Matches récents" subtitle="Vos binômes en cours">
        {matches.isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-64 shrink-0 rounded-xl" />
            ))}
          </div>
        ) : matches.isError ? (
          <ErrorState message="Impossible de charger vos binômes." />
        ) : (matches.data ?? []).length === 0 ? (
          <EmptyState message="Aucun binôme pour l’instant. Vos correspondances apparaîtront ici." />
        ) : (
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
            {matches.data?.map((m) => (
              <div key={m.id} className="snap-start">
                <MatchCard item={m} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Mes intentions */}
      <Section
        title="Mes intentions"
        subtitle="Les demandes que vous avez publiées"
        action={
          <Link href="/app/new-intention">
            <Button variant="ghost" size="sm">
              + Nouvelle
            </Button>
          </Link>
        }
      >
        {requests.isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
            ))}
          </div>
        ) : requests.isError ? (
          <ErrorState message="Impossible de charger vos intentions." />
        ) : (requests.data ?? []).length === 0 ? (
          <EmptyState
            message="Vous n’avez pas encore d’intention active."
            cta={
              <Link href="/app/new-intention">
                <Button size="sm">Créer une intention</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {requests.data?.map((r) => (
              <IntentionCard key={r.id} item={r} />
            ))}
          </div>
        )}
      </Section>

      {/* Propositions pour vous */}
      <Section title="Propositions pour vous" subtitle="Les intentions ouvertes des autres membres">
        {suggestions.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : suggestions.isError ? (
          <ErrorState message="Impossible de charger les propositions." />
        ) : suggestionItems.length === 0 ? (
          <EmptyState message="Aucune proposition disponible pour le moment. Revenez bientôt." />
        ) : (
          <div className="flex flex-col gap-4">
            {destOptions.length > 1 && (
              <CountryFilter options={destOptions} value={destFilter} onChange={setDestFilter} />
            )}
            {filteredSuggestions.length === 0 ? (
              <EmptyState message="Aucune proposition pour cette destination." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredSuggestions.map((s) => (
                  <SuggestedCard key={s.id} item={s} />
                ))}
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-foreground text-lg font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function EmptyState({ message, cta }: { message: string; cta?: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-3 border-dashed py-8 text-center">
      <p className="max-w-sm text-sm text-neutral-400">{message}</p>
      {cta}
    </Card>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-red-500/30 bg-red-500/5 py-6 text-center">
      <p className="text-sm text-red-300">{message}</p>
    </Card>
  )
}
