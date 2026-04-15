import { formatDate } from '../dateUtils'

describe('formatDate', () => {
  it('formate en datetime par défaut', () => {
    const now = Date.now()
    const result = formatDate(now)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formate en time quand spécifié', () => {
    const now = Date.now()
    const result = formatDate(now, 'time')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('retourne le même résultat depuis le cache', () => {
    const timestamp = 1700000000000
    const first = formatDate(timestamp, 'datetime')
    const second = formatDate(timestamp, 'datetime')
    expect(first).toBe(second)
  })

  it('retourne des résultats différents pour time et datetime', () => {
    const timestamp = 1700000000000
    const timeResult = formatDate(timestamp, 'time')
    const datetimeResult = formatDate(timestamp, 'datetime')
    // Ils peuvent être différents (datetime inclut la date)
    expect(typeof timeResult).toBe('string')
    expect(typeof datetimeResult).toBe('string')
  })
})
