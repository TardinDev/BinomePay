'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface SessionUser {
  id: string
  email: string | null
  firstName: string | null
}

const SessionContext = createContext<SessionUser | null>(null)

export function SessionProvider({ value, children }: { value: SessionUser; children: ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/** Returns the authenticated user surfaced by the protected layout. */
export function useSessionUser(): SessionUser {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSessionUser must be used within a SessionProvider')
  }
  return ctx
}
