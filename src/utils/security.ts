/**
 * Security utilities for BinomePay
 * Provides security measures, encryption, and fraud detection
 */

import { Platform } from 'react-native'

// Security constants
const MAX_DAILY_AMOUNT = 5000 // EUR equivalent
const MAX_MONTHLY_AMOUNT = 15000 // EUR equivalent
const SUSPICIOUS_KEYWORDS = [
  'urgent', 'vite', 'rapide', 'secret', 'confidentiel',
  'bitcoin', 'crypto', 'western union', 'moneygram',
  'carte bancaire', 'rib', 'iban', 'swift', 'password', 'pin'
]

export interface SecurityCheck {
  isSecure: boolean
  riskLevel: 'low' | 'medium' | 'high'
  warnings: string[]
  blockers: string[]
}

export interface UserSession {
  userId: string
  deviceId: string
  ipAddress?: string
  lastActivity: number
  isVerified: boolean
}

/**
 * Simple hash function for basic data integrity
 * NOT for passwords - use proper crypto libraries for production
 */
export const simpleHash = (text: string): string => {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * Generate a secure device fingerprint
 */
export const generateDeviceFingerprint = (): string => {
  const components = [
    Platform.OS,
    Platform.Version,
    new Date().getTimezoneOffset(),
    Math.random().toString(36)
  ]
  
  return simpleHash(components.join('|'))
}

/**
 * Validate session security
 */
export const validateSession = (session: UserSession): SecurityCheck => {
  const warnings: string[] = []
  const blockers: string[] = []
  
  // Check session age (24 hours max)
  const sessionAge = Date.now() - session.lastActivity
  const maxAge = 24 * 60 * 60 * 1000
  
  if (sessionAge > maxAge) {
    blockers.push('Session expirée, veuillez vous reconnecter')
  }
  
  // Check verification status for high-value operations
  if (!session.isVerified) {
    warnings.push('Vérification d\'identité requise pour les montants élevés')
  }
  
  // Device fingerprint should be consistent
  const currentFingerprint = generateDeviceFingerprint()
  if (session.deviceId !== currentFingerprint) {
    warnings.push('Appareil inhabituel détecté')
  }
  
  return {
    isSecure: blockers.length === 0,
    riskLevel: blockers.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low',
    warnings,
    blockers
  }
}

/**
 * Analyze transaction for fraud patterns
 */
export const analyzeTransaction = (
  amount: number,
  currency: string,
  originCountry: string,
  destCountry: string,
  userHistory: { amounts: number[], countries: string[], dates: number[] }
): SecurityCheck => {
  const warnings: string[] = []
  const blockers: string[] = []
  
  // Amount-based checks
  if (amount > MAX_DAILY_AMOUNT) {
    warnings.push(`Montant élevé détecté (${amount} ${currency})`)
  }
  
  // Check daily/monthly limits
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime()
  
  const todayTotal = userHistory.amounts
    .filter((_, index) => userHistory.dates[index] >= todayStart)
    .reduce((sum, amt) => sum + amt, 0)
    
  const monthTotal = userHistory.amounts
    .filter((_, index) => userHistory.dates[index] >= monthStart)
    .reduce((sum, amt) => sum + amt, 0)
  
  if (todayTotal + amount > MAX_DAILY_AMOUNT) {
    blockers.push('Limite quotidienne dépassée')
  }
  
  if (monthTotal + amount > MAX_MONTHLY_AMOUNT) {
    blockers.push('Limite mensuelle dépassée')
  }
  
  // Geographic risk analysis
  const highRiskCountries = ['Afghanistan', 'Syrie', 'Corée du Nord', 'Iran']
  if (highRiskCountries.includes(destCountry) || highRiskCountries.includes(originCountry)) {
    warnings.push('Corridor à risque élevé')
  }
  
  // Pattern analysis
  const recentCountries = userHistory.countries.slice(-10)
  const uniqueCountries = new Set(recentCountries).size
  if (uniqueCountries > 5) {
    warnings.push('Activité inhabituelle détectée - nombreux pays')
  }
  
  // Velocity check (too many transactions in short time)
  const recentTransactions = userHistory.dates.filter(date => 
    Date.now() - date < 60 * 60 * 1000 // Last hour
  ).length
  
  if (recentTransactions > 3) {
    warnings.push('Fréquence de transaction élevée')
  }
  
  return {
    isSecure: blockers.length === 0,
    riskLevel: blockers.length > 0 ? 'high' : 
               warnings.length > 2 ? 'medium' : 'low',
    warnings,
    blockers
  }
}

/**
 * Analyze message content for suspicious patterns
 */
export const analyzeMessageContent = (message: string): SecurityCheck => {
  const warnings: string[] = []
  const blockers: string[] = []
  
  const lowerMessage = message.toLowerCase()
  
  // Check for suspicious keywords
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword)
  )
  
  if (foundKeywords.length > 0) {
    warnings.push(`Contenu potentiellement sensible détecté: ${foundKeywords.join(', ')}`)
  }
  
  // Check for potential financial data
  const patterns = {
    cardNumber: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
    iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/,
    phone: /\b(\+33|0)[1-9](\d{8})\b/,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  }
  
  Object.entries(patterns).forEach(([type, pattern]) => {
    if (pattern.test(message)) {
      warnings.push(`Information ${type} détectée dans le message`)
    }
  })
  
  // Check message length and repetition
  if (message.length > 1000) {
    warnings.push('Message inhabituellement long')
  }
  
  // Check for repeated patterns (spam)
  const repeatedChars = /(.)\1{10,}/.test(message)
  const repeatedWords = /\b(\w+)\b[\s\W]*\1[\s\W]*\1/i.test(message)
  
  if (repeatedChars || repeatedWords) {
    blockers.push('Message suspect détecté (spam potentiel)')
  }
  
  return {
    isSecure: blockers.length === 0,
    riskLevel: blockers.length > 0 ? 'high' : 
               warnings.length > 1 ? 'medium' : 'low',
    warnings,
    blockers
  }
}

/**
 * Generate a secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sanitize and validate user input
 */
export const sanitizeUserInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 1000) // Limit length
}

/**
 * Check if user is attempting rate limiting bypass
 */
export const checkRateLimit = (
  userId: string,
  action: string,
  timestamps: number[],
  maxActions: number = 5,
  windowMs: number = 60000
): { allowed: boolean; resetTime: number } => {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Filter recent actions
  const recentActions = timestamps.filter(ts => ts > windowStart)
  
  const allowed = recentActions.length < maxActions
  const resetTime = recentActions.length > 0 ? 
    Math.min(...recentActions) + windowMs : now
  
  return { allowed, resetTime }
}

/**
 * Validate that sensitive operations are performed in secure context
 */
export const validateSecureContext = (): SecurityCheck => {
  const warnings: string[] = []
  const blockers: string[] = []
  
  // In production, you would check for:
  // - HTTPS connection
  // - Certificate pinning
  // - Root/jailbreak detection
  // - Debugger detection
  
  if (__DEV__) {
    warnings.push('Application en mode développement')
  }
  
  return {
    isSecure: blockers.length === 0,
    riskLevel: warnings.length > 0 ? 'medium' : 'low',
    warnings,
    blockers
  }
}

/**
 * Format security warnings for user display
 */
export const formatSecurityWarnings = (check: SecurityCheck): string => {
  let message = ''
  
  if (check.blockers.length > 0) {
    message += '🚫 Bloqué:\n' + check.blockers.join('\n') + '\n\n'
  }
  
  if (check.warnings.length > 0) {
    message += '⚠️ Avertissements:\n' + check.warnings.join('\n')
  }
  
  return message.trim()
}

/**
 * Log security events for monitoring
 */
export const logSecurityEvent = (
  event: 'login' | 'transaction' | 'message' | 'suspicious_activity',
  details: Record<string, any>,
  riskLevel: SecurityCheck['riskLevel']
): void => {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    riskLevel,
    deviceFingerprint: generateDeviceFingerprint()
  }
  
  // In production, send to security monitoring service
  if (__DEV__) {
    if (riskLevel === 'high') {
      console.warn('HIGH RISK SECURITY EVENT:', logData)
    } else {
      console.log('Security event:', logData)
    }
  }
}