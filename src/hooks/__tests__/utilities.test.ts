import { formatTimeRemaining } from '../useRateLimit'
import { retryAsync } from '../useRetry'

// ─────────────────────────────────────────────────
// formatTimeRemaining
// ─────────────────────────────────────────────────
describe('formatTimeRemaining', () => {
  it('affiche les secondes quand < 60s', () => {
    expect(formatTimeRemaining(5000)).toBe('5s')
    expect(formatTimeRemaining(59000)).toBe('59s')
    expect(formatTimeRemaining(1000)).toBe('1s')
  })

  it('arrondit au supérieur pour les millisecondes', () => {
    expect(formatTimeRemaining(1500)).toBe('2s')
    expect(formatTimeRemaining(500)).toBe('1s')
  })

  it('affiche les minutes quand >= 60s et < 60min', () => {
    expect(formatTimeRemaining(60000)).toBe('1m')
    expect(formatTimeRemaining(120000)).toBe('2m')
  })

  it('affiche minutes + secondes si reste des secondes', () => {
    expect(formatTimeRemaining(90000)).toBe('1m 30s')
    expect(formatTimeRemaining(150000)).toBe('2m 30s')
  })

  it('affiche les heures quand >= 60min', () => {
    expect(formatTimeRemaining(3600000)).toBe('1h')
    expect(formatTimeRemaining(7200000)).toBe('2h')
  })

  it('affiche heures + minutes si reste des minutes', () => {
    expect(formatTimeRemaining(3660000)).toBe('1h 1m')
    expect(formatTimeRemaining(5400000)).toBe('1h 30m')
  })

  it('gère 0ms', () => {
    expect(formatTimeRemaining(0)).toBe('0s')
  })
})

// ─────────────────────────────────────────────────
// retryAsync
// ─────────────────────────────────────────────────
describe('retryAsync', () => {
  it('retourne le résultat immédiatement si succès au premier essai', async () => {
    const fn = jest.fn().mockResolvedValue('success')

    const result = await retryAsync(fn, { maxRetries: 3, baseDelayMs: 1 })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retente et réussit après un échec', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('success')

    const result = await retryAsync(fn, {
      maxRetries: 3,
      baseDelayMs: 1,
      maxDelayMs: 5,
      backoffMultiplier: 1,
    })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('lance l erreur après avoir épuisé les tentatives', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Network error'))

    await expect(
      retryAsync(fn, {
        maxRetries: 2,
        baseDelayMs: 1,
        maxDelayMs: 5,
        backoffMultiplier: 1,
        retryCondition: () => true,
      })
    ).rejects.toThrow('Network error')

    expect(fn).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
  })

  it('ne retente pas si retryCondition retourne false', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Auth error'))

    await expect(
      retryAsync(fn, {
        maxRetries: 3,
        baseDelayMs: 1,
        retryCondition: () => false,
      })
    ).rejects.toThrow('Auth error')

    expect(fn).toHaveBeenCalledTimes(1) // Pas de retry
  })

  it('retente sur erreurs réseau par défaut', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockResolvedValueOnce('ok')

    const result = await retryAsync(fn, {
      maxRetries: 1,
      baseDelayMs: 1,
      maxDelayMs: 5,
    })

    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retente sur erreurs 5xx par défaut', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce({ status: 500, message: 'Internal Server Error' })
      .mockResolvedValueOnce('recovered')

    const result = await retryAsync(fn, {
      maxRetries: 1,
      baseDelayMs: 1,
      maxDelayMs: 5,
    })

    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retente sur erreur 429 (rate limit) par défaut', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce({ status: 429, message: 'Too many requests' })
      .mockResolvedValueOnce('ok')

    const result = await retryAsync(fn, {
      maxRetries: 1,
      baseDelayMs: 1,
      maxDelayMs: 5,
    })

    expect(result).toBe('ok')
  })

  it('ne retente pas sur erreur 4xx (sauf 429) par défaut', async () => {
    const fn = jest.fn().mockRejectedValue({ status: 404, message: 'Not found' })

    await expect(retryAsync(fn, { maxRetries: 3, baseDelayMs: 1 })).rejects.toEqual({
      status: 404,
      message: 'Not found',
    })

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('respecte maxRetries = 0 (pas de retry)', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Network error'))

    await expect(
      retryAsync(fn, { maxRetries: 0, baseDelayMs: 1, retryCondition: () => true })
    ).rejects.toThrow('Network error')

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
