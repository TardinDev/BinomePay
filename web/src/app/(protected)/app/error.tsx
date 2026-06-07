'use client'

import { Button, Card } from '@/components/ui'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <h2 className="text-foreground text-lg font-semibold">Une erreur est survenue</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Quelque chose s’est mal passé. Vous pouvez réessayer.
        </p>
        <div className="mt-5 flex justify-center">
          <Button onClick={() => reset()}>Réessayer</Button>
        </div>
      </Card>
    </div>
  )
}
