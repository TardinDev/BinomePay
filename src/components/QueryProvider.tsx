import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface QueryProviderProps {
  children: React.ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // Créer une instance unique du QueryClient
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
          // Don't retry on authentication errors
          if (error?.status === 401 || error?.status === 403) {
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
        retry: (failureCount, error: any) => {
          // Don't retry on client errors (4xx)
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          return failureCount < 1 // Réduire les tentatives
        },
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}