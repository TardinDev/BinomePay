import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use in the browser (Client Components).
 * Session is persisted in cookies so the server/proxy can read it.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
