import { Suspense } from 'react'
import { Skeleton } from '@/components/ui'
import { VerifyForm } from './verify-form'

// VerifyForm reads `?email=` via useSearchParams, which requires a Suspense
// boundary in Next 16 (a static page that calls it otherwise fails the build
// with the missing-Suspense CSR-bailout error).
function VerifyFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyForm />
    </Suspense>
  )
}
