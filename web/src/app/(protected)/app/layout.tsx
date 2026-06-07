import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SessionProvider, type SessionUser } from '@/components/app/SessionProvider'
import { AppNav } from '@/components/app/AppNav'

/**
 * Authenticated app shell. Server Component: reads the Supabase session and
 * redirects unauthenticated visitors to the login screen. The user identity is
 * handed to client components through a small SessionProvider context.
 */
export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const metadata = user.user_metadata ?? {}
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email ?? null,
    firstName: (metadata.firstName as string | undefined) ?? null,
  }

  return (
    <SessionProvider value={sessionUser}>
      <div className="flex min-h-full flex-col">
        <AppNav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
