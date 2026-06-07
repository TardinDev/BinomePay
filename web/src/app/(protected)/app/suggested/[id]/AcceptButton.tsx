'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { acceptSuggestion } from '@/lib/actions/matches'

interface AcceptButtonProps {
  suggestionId: string
}

export function AcceptButton({ suggestionId }: AcceptButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      try {
        const { conversationId } = await acceptSuggestion(suggestionId)
        router.push(`/app/messages/${conversationId}`)
      } catch {
        setError(
          'Impossible d’accepter cette proposition pour le moment. Elle a peut-être déjà été acceptée. Réessayez.'
        )
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300"
        >
          {error}
        </p>
      )}
      <Button
        size="lg"
        loading={isPending}
        disabled={isPending}
        onClick={handleAccept}
        className="w-full"
      >
        {isPending ? 'Acceptation…' : 'Accepter la proposition'}
      </Button>
      <p className="text-center text-xs text-neutral-500">
        En acceptant, une conversation sécurisée s’ouvre avec ce membre.
      </p>
    </div>
  )
}
