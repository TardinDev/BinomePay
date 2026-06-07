import { Suspense } from 'react'
import { Skeleton } from '@/components/ui'
import { ForgotPasswordForm } from './forgot-password-form'

// ForgotPasswordForm reads `?email=` via useSearchParams to prefill, which
// requires a Suspense boundary in Next 16 to avoid the build-time
// missing-Suspense CSR-bailout error.
function ForgotPasswordFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
