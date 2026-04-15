import {
  validateIntention,
  validateMessage,
  validateUserProfile,
  sanitizeInput,
  isAmountReasonable,
  formatValidationErrors,
  SUPPORTED_COUNTRIES,
  CURRENCY_LIMITS,
} from '../validation'

describe('validateIntention', () => {
  it('retourne valide pour des données correctes', () => {
    const result = validateIntention(100, 'EUR', 'France', 'Sénégal')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejette un montant négatif', () => {
    const result = validateIntention(-10, 'EUR', 'France', 'Sénégal')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Le montant doit être supérieur à 0')
  })

  it('rejette un montant à 0', () => {
    const result = validateIntention(0, 'EUR', 'France', 'Sénégal')
    expect(result.isValid).toBe(false)
  })

  it('rejette une devise non supportée', () => {
    const result = validateIntention(100, 'BTC', 'France', 'Sénégal')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('Devise non supportée')
  })

  it('rejette un montant en dessous du minimum', () => {
    const result = validateIntention(5, 'EUR', 'France', 'Sénégal')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('Montant minimum')
  })

  it('rejette un montant au-dessus du maximum', () => {
    const result = validateIntention(99999, 'EUR', 'France', 'Sénégal')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('Montant maximum')
  })

  it("rejette un pays d'origine non supporté", () => {
    const result = validateIntention(100, 'EUR', 'Japon', 'Sénégal')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain("Pays d'origine non supporté")
  })

  it('rejette un pays de destination non supporté', () => {
    const result = validateIntention(100, 'EUR', 'France', 'Japon')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('Pays de destination non supporté')
  })

  it('rejette des pays identiques', () => {
    const result = validateIntention(100, 'EUR', 'France', 'France')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain("Les pays d'origine et de destination doivent être différents")
  })

  it('avertit pour un corridor à haut risque', () => {
    const result = validateIntention(100, 'EUR', 'France', 'Mali')
    expect(result.isValid).toBe(true)
    expect(result.warnings).toBeDefined()
    expect(result.warnings![0]).toContain('vérification')
  })

  it('avertit pour un montant élevé (>80% du max)', () => {
    const result = validateIntention(9000, 'EUR', 'France', 'Sénégal')
    expect(result.isValid).toBe(true)
    expect(result.warnings).toBeDefined()
    expect(result.warnings!.some((w) => w.includes('Montant élevé'))).toBe(true)
  })
})

describe('validateMessage', () => {
  it('retourne valide pour un message normal', () => {
    const result = validateMessage('Bonjour, je suis intéressé par votre offre')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejette un message vide', () => {
    const result = validateMessage('')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('vide')
  })

  it('rejette un message avec seulement des espaces', () => {
    const result = validateMessage('   ')
    expect(result.isValid).toBe(false)
  })

  it('rejette un message trop long', () => {
    const longMessage = 'a'.repeat(501)
    const result = validateMessage(longMessage)
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('500 caractères')
  })

  it('avertit pour un message contenant "mot de passe"', () => {
    const result = validateMessage('Quel est votre mot de passe ?')
    expect(result.isValid).toBe(true)
    expect(result.warnings).toBeDefined()
    expect(result.warnings![0]).toContain('informations sensibles')
  })

  it('avertit pour un message contenant un numéro de carte', () => {
    const result = validateMessage('Ma carte: 4532 1234 5678 9012')
    expect(result.isValid).toBe(true)
    expect(result.warnings).toBeDefined()
    expect(result.warnings![0]).toContain('informations sensibles')
  })

  it('rejette un message spam (caractères répétés)', () => {
    const result = validateMessage('aaaaaaaaaaaaaaaaa')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('suspect')
  })
})

describe('validateUserProfile', () => {
  it('retourne valide pour un profil correct', () => {
    const result = validateUserProfile('Jean Dupont')
    expect(result.isValid).toBe(true)
  })

  it('rejette un nom trop court', () => {
    const result = validateUserProfile('J')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('2 caractères')
  })

  it('rejette un nom trop long', () => {
    const result = validateUserProfile('A'.repeat(51))
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('50 caractères')
  })

  it('rejette un nom avec des chiffres', () => {
    const result = validateUserProfile('Jean123')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('caractères non autorisés')
  })

  it('accepte un nom avec accents et tirets', () => {
    const result = validateUserProfile("Marie-Thérèse O'Brien")
    expect(result.isValid).toBe(true)
  })

  it('rejette un téléphone invalide', () => {
    const result = validateUserProfile('Jean', '12345')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('téléphone invalide')
  })

  it('accepte un téléphone français valide', () => {
    const result = validateUserProfile('Jean', '+33612345678')
    expect(result.isValid).toBe(true)
  })

  it('rejette un email invalide', () => {
    const result = validateUserProfile('Jean', undefined, 'not-an-email')
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('email invalide')
  })

  it('accepte un email valide', () => {
    const result = validateUserProfile('Jean', undefined, 'jean@example.com')
    expect(result.isValid).toBe(true)
  })
})

describe('sanitizeInput', () => {
  it('supprime les balises HTML', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script')
  })

  it('normalise les espaces multiples', () => {
    expect(sanitizeInput('hello    world')).toBe('hello world')
  })

  it('supprime les espaces en début et fin', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })

  it('tronque à 500 caractères', () => {
    const longInput = 'a'.repeat(600)
    expect(sanitizeInput(longInput).length).toBe(500)
  })
})

describe('isAmountReasonable', () => {
  it('retourne true pour un montant dans les limites EUR', () => {
    expect(isAmountReasonable(100, 'EUR')).toBe(true)
  })

  it('retourne false pour un montant sous le min EUR', () => {
    expect(isAmountReasonable(5, 'EUR')).toBe(false)
  })

  it('retourne false pour un montant au-dessus du max EUR', () => {
    expect(isAmountReasonable(20000, 'EUR')).toBe(false)
  })

  it('retourne false pour une devise inconnue', () => {
    expect(isAmountReasonable(100, 'BTC')).toBe(false)
  })
})

describe('formatValidationErrors', () => {
  it('retourne une chaîne vide si valide', () => {
    expect(formatValidationErrors({ isValid: true, errors: [] })).toBe('')
  })

  it('concatène les erreurs', () => {
    const result = formatValidationErrors({
      isValid: false,
      errors: ['Erreur 1', 'Erreur 2'],
    })
    expect(result).toContain('Erreur 1')
    expect(result).toContain('Erreur 2')
  })

  it('inclut les warnings', () => {
    const result = formatValidationErrors({
      isValid: false,
      errors: ['Erreur 1'],
      warnings: ['Warning 1'],
    })
    expect(result).toContain('Avertissements')
    expect(result).toContain('Warning 1')
  })
})

describe('constantes', () => {
  it('SUPPORTED_COUNTRIES contient France', () => {
    expect(SUPPORTED_COUNTRIES).toContain('France')
  })

  it('CURRENCY_LIMITS contient EUR avec min et max', () => {
    expect(CURRENCY_LIMITS.EUR).toBeDefined()
    expect(CURRENCY_LIMITS.EUR.min).toBeLessThan(CURRENCY_LIMITS.EUR.max)
  })
})
