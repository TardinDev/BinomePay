import { Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
