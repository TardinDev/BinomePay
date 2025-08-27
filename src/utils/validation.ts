/**
 * Validation utilities for BinomePay
 * Provides client-side validation with security best practices
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

// Supported countries for money transfers
export const SUPPORTED_COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Canada', 'Espagne',
  'Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso', 'Niger',
  'Guinée', 'Mauritanie', 'Maroc', 'Tunisie', 'Algérie',
  'Cameroun', 'Gabon', 'République Démocratique du Congo',
  'Bénin', 'Togo'
]

// Supported currencies with their limits
export const CURRENCY_LIMITS = {
  EUR: { min: 10, max: 10000 },
  USD: { min: 10, max: 12000 },
  GBP: { min: 10, max: 8500 },
  CAD: { min: 15, max: 15000 }
}

// High-risk corridors that require additional verification
export const HIGH_RISK_CORRIDORS = [
  'France→Mali',
  'Belgique→République Démocratique du Congo',
  'Canada→Mauritanie'
]

/**
 * Validates money transfer intention data
 */
export const validateIntention = (
  amount: number,
  currency: string,
  originCountry: string,
  destCountry: string,
  type: 'SEND' | 'RECEIVE'
): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Amount validation
  if (amount <= 0) {
    errors.push('Le montant doit être supérieur à 0')
  }

  // Currency validation
  if (!Object.keys(CURRENCY_LIMITS).includes(currency)) {
    errors.push(`Devise non supportée: ${currency}`)
  } else {
    const limits = CURRENCY_LIMITS[currency as keyof typeof CURRENCY_LIMITS]
    if (amount < limits.min) {
      errors.push(`Montant minimum: ${limits.min} ${currency}`)
    }
    if (amount > limits.max) {
      errors.push(`Montant maximum: ${limits.max} ${currency}`)
    }
  }

  // Country validation
  if (!SUPPORTED_COUNTRIES.includes(originCountry)) {
    errors.push(`Pays d'origine non supporté: ${originCountry}`)
  }
  if (!SUPPORTED_COUNTRIES.includes(destCountry)) {
    errors.push(`Pays de destination non supporté: ${destCountry}`)
  }
  if (originCountry === destCountry) {
    errors.push('Les pays d\'origine et de destination doivent être différents')
  }

  // High-risk corridor check
  const corridor = `${originCountry}→${destCountry}`
  if (HIGH_RISK_CORRIDORS.includes(corridor)) {
    warnings.push('Ce corridor nécessite une vérification d\'identité renforcée')
  }

  // Large amount warning
  const limits = CURRENCY_LIMITS[currency as keyof typeof CURRENCY_LIMITS]
  if (limits && amount > limits.max * 0.8) {
    warnings.push('Montant élevé - vérification supplémentaire requise')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates user message content
 */
export const validateMessage = (message: string): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Length validation
  if (message.trim().length === 0) {
    errors.push('Le message ne peut pas être vide')
  }
  if (message.length > 500) {
    errors.push('Le message ne peut pas dépasser 500 caractères')
  }

  // Content validation - basic security
  const suspiciousPatterns = [
    /\b(mot de passe|password|pin|code secret)\b/i,
    /\b(carte bancaire|iban|swift|bic)\b/i,
    /\b(\d{4}\s*\d{4}\s*\d{4}\s*\d{4})\b/, // Card number pattern
  ]

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(message)) {
      warnings.push('Attention: évitez de partager des informations sensibles')
    }
  })

  // Spam detection
  const repeatedChars = /(.)\1{10,}/
  if (repeatedChars.test(message)) {
    errors.push('Message suspect détecté')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates user profile data
 */
export const validateUserProfile = (
  name: string,
  phone?: string,
  email?: string
): ValidationResult => {
  const errors: string[] = []

  // Name validation
  if (name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères')
  }
  if (name.length > 50) {
    errors.push('Le nom ne peut pas dépasser 50 caractères')
  }
  if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(name)) {
    errors.push('Le nom contient des caractères non autorisés')
  }

  // Phone validation (optional)
  if (phone) {
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      errors.push('Format de téléphone invalide')
    }
  }

  // Email validation (optional)
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('Format d\'email invalide')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitizes user input to prevent XSS and other attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove dangerous HTML characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 500) // Limit length
}

/**
 * Checks if an amount is within reasonable bounds for the given currency
 */
export const isAmountReasonable = (amount: number, currency: string): boolean => {
  const limits = CURRENCY_LIMITS[currency as keyof typeof CURRENCY_LIMITS]
  return limits ? amount >= limits.min && amount <= limits.max : false
}

/**
 * Formats error messages for user display
 */
export const formatValidationErrors = (result: ValidationResult): string => {
  if (result.isValid) return ''
  
  let message = result.errors.join('\n')
  if (result.warnings && result.warnings.length > 0) {
    message += '\n\nAvertissements:\n' + result.warnings.join('\n')
  }
  
  return message
}