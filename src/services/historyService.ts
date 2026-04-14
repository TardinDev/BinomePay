import { supabase } from '@/lib/supabase'

export interface TransactionHistory {
  id: string
  type:
    | 'match_created'
    | 'match_accepted'
    | 'match_completed'
    | 'match_cancelled'
    | 'message_sent'
    | 'intention_created'
    | 'rating_given'
  userId: string
  counterpartId?: string
  counterpartName?: string
  amount?: number
  currency?: string
  corridor?: string
  description: string
  details: Record<string, any>
  timestamp: number
  status: 'success' | 'pending' | 'failed' | 'cancelled'
}

export interface TransactionSummary {
  totalTransactions: number
  completedTransactions: number
  totalVolume: Record<string, number> // par devise
  averageRating: number
  successRate: number
  mostActiveCorridors: Array<{
    corridor: string
    count: number
    volume: number
    currency: string
  }>
  monthlyStats: Array<{
    month: string
    year: number
    transactions: number
    volume: Record<string, number>
  }>
}

export interface FilterOptions {
  startDate?: number
  endDate?: number
  type?: TransactionHistory['type']
  status?: TransactionHistory['status']
  currency?: string
  minAmount?: number
  maxAmount?: number
  counterpartName?: string
}

class HistoryService {
  private readonly STORAGE_KEY = '@binomepay_history'

  // Ajouter une entrée à l'historique
  async addHistoryEntry(entry: Omit<TransactionHistory, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase.from('transaction_history').insert({
        type: entry.type,
        user_id: entry.userId,
        counterpart_id: entry.counterpartId,
        counterpart_name: entry.counterpartName,
        amount: entry.amount,
        currency: entry.currency,
        corridor: entry.corridor,
        description: entry.description,
        details: entry.details,
        status: entry.status,
      })

      if (error) throw error

      if (__DEV__) console.log('Nouvelle entrée historique ajoutée')
    } catch (error) {
      if (__DEV__) console.error("Erreur lors de l'ajout à l'historique:", error)
    }
  }

  // Récupérer l'historique complet
  async getHistory(limit?: number): Promise<TransactionHistory[]> {
    try {
      let query = supabase
        .from('transaction_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      return (data ?? []).map((row: any) => ({
        id: row.id,
        type: row.type,
        userId: row.user_id,
        counterpartId: row.counterpart_id ?? undefined,
        counterpartName: row.counterpart_name ?? undefined,
        amount: row.amount ?? undefined,
        currency: row.currency ?? undefined,
        corridor: row.corridor ?? undefined,
        description: row.description,
        details: row.details ?? {},
        timestamp: new Date(row.created_at).getTime(),
        status: row.status,
      }))
    } catch (error) {
      if (__DEV__) console.error("Erreur lors de la récupération de l'historique:", error)
      return []
    }
  }

  // Filtrer l'historique
  async getFilteredHistory(filters: FilterOptions): Promise<TransactionHistory[]> {
    const history = await this.getHistory()

    return history.filter((entry) => {
      // Filtre par date
      if (filters.startDate && entry.timestamp < filters.startDate) return false
      if (filters.endDate && entry.timestamp > filters.endDate) return false

      // Filtre par type
      if (filters.type && entry.type !== filters.type) return false

      // Filtre par statut
      if (filters.status && entry.status !== filters.status) return false

      // Filtre par devise
      if (filters.currency && entry.currency !== filters.currency) return false

      // Filtre par montant
      if (filters.minAmount && (!entry.amount || entry.amount < filters.minAmount)) return false
      if (filters.maxAmount && (!entry.amount || entry.amount > filters.maxAmount)) return false

      // Filtre par nom du partenaire
      if (
        filters.counterpartName &&
        (!entry.counterpartName ||
          !entry.counterpartName.toLowerCase().includes(filters.counterpartName.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }

  // Générer un résumé des transactions
  async getTransactionSummary(userId: string): Promise<TransactionSummary> {
    const history = await this.getHistory()
    const userHistory = history.filter((entry) => entry.userId === userId)

    // Calculer le total des transactions
    const completedTransactions = userHistory.filter(
      (entry) => entry.type === 'match_completed' && entry.status === 'success'
    )

    // Calculer le volume total par devise
    const totalVolume: Record<string, number> = {}
    completedTransactions.forEach((transaction) => {
      if (transaction.amount && transaction.currency) {
        totalVolume[transaction.currency] =
          (totalVolume[transaction.currency] || 0) + transaction.amount
      }
    })

    // Calculer le taux de succès
    const matchTransactions = userHistory.filter(
      (entry) =>
        entry.type === 'match_created' ||
        entry.type === 'match_completed' ||
        entry.type === 'match_cancelled'
    )
    const successRate =
      matchTransactions.length > 0
        ? (completedTransactions.length / matchTransactions.length) * 100
        : 0

    // Calculer les corridors les plus actifs
    const corridorStats: Record<string, { count: number; volume: number; currency: string }> = {}
    completedTransactions.forEach((transaction) => {
      if (transaction.corridor && transaction.amount && transaction.currency) {
        if (!corridorStats[transaction.corridor]) {
          corridorStats[transaction.corridor] = {
            count: 0,
            volume: 0,
            currency: transaction.currency,
          }
        }
        corridorStats[transaction.corridor].count++
        corridorStats[transaction.corridor].volume += transaction.amount
      }
    })

    const mostActiveCorridors = Object.entries(corridorStats)
      .map(([corridor, stats]) => ({ corridor, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculer les statistiques mensuelles
    const monthlyStats = this.calculateMonthlyStats(completedTransactions)

    return {
      totalTransactions: userHistory.length,
      completedTransactions: completedTransactions.length,
      totalVolume,
      averageRating: 0, // Calculé via ratingService
      successRate: Math.round(successRate * 10) / 10,
      mostActiveCorridors,
      monthlyStats,
    }
  }

  // Calculer les statistiques mensuelles
  private calculateMonthlyStats(
    transactions: TransactionHistory[]
  ): TransactionSummary['monthlyStats'] {
    const monthlyData: Record<string, { transactions: number; volume: Record<string, number> }> = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.timestamp)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyData[key]) {
        monthlyData[key] = { transactions: 0, volume: {} }
      }

      monthlyData[key].transactions++

      if (transaction.amount && transaction.currency) {
        monthlyData[key].volume[transaction.currency] =
          (monthlyData[key].volume[transaction.currency] || 0) + transaction.amount
      }
    })

    return Object.entries(monthlyData)
      .map(([key, data]) => {
        const [year, month] = key.split('-')
        return {
          month: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', {
            month: 'long',
          }),
          year: parseInt(year),
          ...data,
        }
      })
      .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month))
      .slice(0, 12) // Derniers 12 mois
  }

  // Exporter l'historique (pour génération de rapports)
  async exportHistory(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const history = await this.getHistory()
    const userHistory = history.filter((entry) => entry.userId === userId)

    if (format === 'json') {
      return JSON.stringify(userHistory, null, 2)
    }

    if (format === 'csv') {
      const headers = [
        'ID',
        'Type',
        'Date',
        'Partenaire',
        'Montant',
        'Devise',
        'Corridor',
        'Statut',
        'Description',
      ]
      const csvRows = [headers.join(',')]

      userHistory.forEach((entry) => {
        const row = [
          entry.id,
          entry.type,
          new Date(entry.timestamp).toLocaleDateString('fr-FR'),
          entry.counterpartName || '',
          entry.amount || '',
          entry.currency || '',
          entry.corridor || '',
          entry.status,
          `"${entry.description.replace(/"/g, '""')}"`, // Échapper les guillemets
        ]
        csvRows.push(row.join(','))
      })

      return csvRows.join('\n')
    }

    return ''
  }

  // Obtenir les statistiques de performance
  async getPerformanceStats(userId: string): Promise<{
    averageCompletionTime: number // en heures
    fastestTransaction: number
    slowestTransaction: number
    totalFees: Record<string, number>
    savingsGenerated: Record<string, number>
  }> {
    const history = await this.getHistory()
    const userHistory = history.filter((entry) => entry.userId === userId)

    // Analyser les temps de completion
    const completionTimes: number[] = []
    const totalFees: Record<string, number> = {}

    userHistory.forEach((entry) => {
      if (entry.type === 'match_completed' && entry.details.completionTime) {
        completionTimes.push(entry.details.completionTime)
      }

      if (entry.details.fees && entry.currency) {
        totalFees[entry.currency] = (totalFees[entry.currency] || 0) + entry.details.fees
      }
    })

    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0

    return {
      averageCompletionTime,
      fastestTransaction: completionTimes.length > 0 ? Math.min(...completionTimes) : 0,
      slowestTransaction: completionTimes.length > 0 ? Math.max(...completionTimes) : 0,
      totalFees,
      savingsGenerated: totalFees, // Basé sur les frais réels
    }
  }

  // Méthodes utilitaires pour l'enregistrement automatique
  async recordMatchCreated(
    matchId: string,
    counterpartName: string,
    amount: number,
    currency: string,
    corridor: string
  ): Promise<void> {
    await this.addHistoryEntry({
      type: 'match_created',
      userId: 'current_user', // À remplacer par l'ID utilisateur actuel
      counterpartName,
      amount,
      currency,
      corridor,
      description: `Match créé avec ${counterpartName}`,
      details: { matchId },
      status: 'success',
    })
  }

  async recordIntentionCreated(
    intentionId: string,
    type: string,
    amount: number,
    currency: string,
    corridor: string
  ): Promise<void> {
    await this.addHistoryEntry({
      type: 'intention_created',
      userId: 'current_user',
      amount,
      currency,
      corridor,
      description: `Intention ${type} créée`,
      details: { intentionId, intentionType: type },
      status: 'success',
    })
  }
}

export default new HistoryService()
