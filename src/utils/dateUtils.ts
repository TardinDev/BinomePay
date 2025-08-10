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

// Hook pour memoization React
export const useFormattedDate = (timestamp: number, format: 'time' | 'datetime' = 'datetime') => {
  return useMemo(() => formatDate(timestamp, format), [timestamp, format])
}