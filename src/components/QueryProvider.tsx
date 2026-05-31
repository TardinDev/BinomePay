import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface QueryProviderProps {
  children: React.ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // Créer une instance unique du QueryClient
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error: unknown) => {
              // Don't retry on authentication errors
              const status = (error as { status?: number } | null)?.status
              if (status === 401 || status === 403) {
                return false
              }
              return failureCount < 2 // Réduire les tentatives
            },
            refetchOnWindowFocus: false, // Important pour RN
            refetchOnMount: false, // Réduire les refetch automatiques
            refetchOnReconnect: false, // Réduire les refetch automatiques
            refetchInterval: false, // Pas de polling automatique
          },
          mutations: {
            retry: (failureCount, error: unknown) => {
              // Don't retry on client errors (4xx)
              const status = (error as { status?: number } | null)?.status
              if (status !== undefined && status >= 400 && status < 500) {
                return false
              }
              return failureCount < 1 // Réduire les tentatives
            },
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
