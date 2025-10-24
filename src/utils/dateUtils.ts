import { useMemo } from 'react'

// Cache pour éviter les recalculs répétés
const formatCache = new Map<string, string>()

export const formatDate = (timestamp: number, format: 'time' | 'datetime' = 'datetime'): string => {
  const cacheKey = `${timestamp}-${format}`
  
  const cached = formatCache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  const date = new Date(timestamp)
  const formatted = format === 'time' 
    ? date.toLocaleTimeString()
    : date.toLocaleString()
  
  // Limiter le cache à 100 entrées pour éviter les fuites mémoire
  if (formatCache.size >= 100) {
    const firstKey = formatCache.keys().next().value
    if (firstKey) {
      formatCache.delete(firstKey)
    }
  }
  
  formatCache.set(cacheKey, formatted)
  return formatted
}

// Alias pour formatTimestamp (compatibilité)
export const formatTimestamp = formatDate

// Hook pour memoization React
export const useFormattedDate = (timestamp: number, format: 'time' | 'datetime' = 'datetime') => {
  return useMemo(() => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - timestamp
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    // Si c'est aujourd'hui (moins de 24h)
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }
    
    // Si c'est hier
    if (diffDays === 1) {
      return 'Hier'
    }
    
    // Si c'est cette semaine (moins de 7 jours)
    if (diffDays < 7) {
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
      }).format(date)
    }
    
    // Si c'est cette année
    if (date.getFullYear() === now.getFullYear()) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
      }).format(date)
    }
    
    // Date complète pour les années précédentes
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }, [timestamp, format])
}