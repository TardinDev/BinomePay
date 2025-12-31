export interface TransactionHistory {
  id: string;
  type: 'match_created' | 'match_accepted' | 'match_completed' | 'match_cancelled' | 'message_sent' | 'intention_created' | 'rating_given';
  userId: string;
  counterpartId?: string;
  counterpartName?: string;
  amount?: number;
  currency?: string;
  corridor?: string;
  description: string;
  details: Record<string, any>;
  timestamp: number;
  status: 'success' | 'pending' | 'failed' | 'cancelled';
}

export interface TransactionSummary {
  totalTransactions: number;
  completedTransactions: number;
  totalVolume: Record<string, number>; // par devise
  averageRating: number;
  successRate: number;
  mostActiveCorridors: Array<{
    corridor: string;
    count: number;
    volume: number;
    currency: string;
  }>;
  monthlyStats: Array<{
    month: string;
    year: number;
    transactions: number;
    volume: Record<string, number>;
  }>;
}

export interface FilterOptions {
  startDate?: number;
  endDate?: number;
  type?: TransactionHistory['type'];
  status?: TransactionHistory['status'];
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  counterpartName?: string;
}

class HistoryService {
  private readonly STORAGE_KEY = '@binomepay_history';

  // Ajouter une entrée à l'historique
  async addHistoryEntry(entry: Omit<TransactionHistory, 'id' | 'timestamp'>): Promise<void> {
    try {
      const history = await this.getHistory();
      const newEntry: TransactionHistory = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      };

      history.unshift(newEntry); // Ajouter au début
      
      // Garder seulement les 1000 dernières entrées pour éviter un stockage excessif
      const limitedHistory = history.slice(0, 1000);
      
      // En production, ceci serait sauvé en base de données
      if (__DEV__) console.log('Nouvelle entrée historique:', newEntry);

    } catch (error) {
      if (__DEV__) console.error('Erreur lors de l\'ajout à l\'historique:', error);
    }
  }

  // Récupérer l'historique complet
  async getHistory(limit?: number): Promise<TransactionHistory[]> {
    try {
      // En production, ceci viendrait de votre API/base de données
      // Pour maintenant, retourner des données mock
      
      const mockHistory: TransactionHistory[] = [
        {
          id: '1',
          type: 'match_completed',
          userId: 'u_1',
          counterpartId: 'u_2',
          counterpartName: 'Moussa D.',
          amount: 150,
          currency: 'EUR',
          corridor: 'France → Sénégal',
          description: 'Échange complété avec succès',
          details: {
            meetingLocation: 'Châtelet-Les Halles',
            exchangeRate: 655.957,
            fees: 2.5,
          },
          timestamp: Date.now() - 86400000,
          status: 'success',
        },
        {
          id: '2',
          type: 'match_accepted',
          userId: 'u_1',
          counterpartId: 'u_3',
          counterpartName: 'Awa S.',
          amount: 200,
          currency: 'EUR',
          corridor: 'France → Côte d\'Ivoire',
          description: 'Match accepté',
          details: {},
          timestamp: Date.now() - 172800000,
          status: 'success',
        },
        {
          id: '3',
          type: 'intention_created',
          userId: 'u_1',
          amount: 100,
          currency: 'EUR',
          corridor: 'France → Mali',
          description: 'Nouvelle intention créée',
          details: {
            intentionType: 'SEND',
          },
          timestamp: Date.now() - 259200000,
          status: 'success',
        },
      ];

      return limit ? mockHistory.slice(0, limit) : mockHistory;
    } catch (error) {
      if (__DEV__) console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  // Filtrer l'historique
  async getFilteredHistory(filters: FilterOptions): Promise<TransactionHistory[]> {
    const history = await this.getHistory();
    
    return history.filter(entry => {
      // Filtre par date
      if (filters.startDate && entry.timestamp < filters.startDate) return false;
      if (filters.endDate && entry.timestamp > filters.endDate) return false;
      
      // Filtre par type
      if (filters.type && entry.type !== filters.type) return false;
      
      // Filtre par statut
      if (filters.status && entry.status !== filters.status) return false;
      
      // Filtre par devise
      if (filters.currency && entry.currency !== filters.currency) return false;
      
      // Filtre par montant
      if (filters.minAmount && (!entry.amount || entry.amount < filters.minAmount)) return false;
      if (filters.maxAmount && (!entry.amount || entry.amount > filters.maxAmount)) return false;
      
      // Filtre par nom du partenaire
      if (filters.counterpartName && (!entry.counterpartName || 
          !entry.counterpartName.toLowerCase().includes(filters.counterpartName.toLowerCase()))) {
        return false;
      }
      
      return true;
    });
  }

  // Générer un résumé des transactions
  async getTransactionSummary(userId: string): Promise<TransactionSummary> {
    const history = await this.getHistory();
    const userHistory = history.filter(entry => entry.userId === userId);
    
    // Calculer le total des transactions
    const completedTransactions = userHistory.filter(
      entry => entry.type === 'match_completed' && entry.status === 'success'
    );
    
    // Calculer le volume total par devise
    const totalVolume: Record<string, number> = {};
    completedTransactions.forEach(transaction => {
      if (transaction.amount && transaction.currency) {
        totalVolume[transaction.currency] = (totalVolume[transaction.currency] || 0) + transaction.amount;
      }
    });
    
    // Calculer le taux de succès
    const matchTransactions = userHistory.filter(entry => 
      entry.type === 'match_created' || entry.type === 'match_completed' || entry.type === 'match_cancelled'
    );
    const successRate = matchTransactions.length > 0 
      ? (completedTransactions.length / matchTransactions.length) * 100 
      : 0;
    
    // Calculer les corridors les plus actifs
    const corridorStats: Record<string, { count: number; volume: number; currency: string }> = {};
    completedTransactions.forEach(transaction => {
      if (transaction.corridor && transaction.amount && transaction.currency) {
        if (!corridorStats[transaction.corridor]) {
          corridorStats[transaction.corridor] = { count: 0, volume: 0, currency: transaction.currency };
        }
        corridorStats[transaction.corridor].count++;
        corridorStats[transaction.corridor].volume += transaction.amount;
      }
    });
    
    const mostActiveCorridors = Object.entries(corridorStats)
      .map(([corridor, stats]) => ({ corridor, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculer les statistiques mensuelles
    const monthlyStats = this.calculateMonthlyStats(completedTransactions);
    
    return {
      totalTransactions: userHistory.length,
      completedTransactions: completedTransactions.length,
      totalVolume,
      averageRating: 4.7, // Ceci viendrait du service de rating
      successRate: Math.round(successRate * 10) / 10,
      mostActiveCorridors,
      monthlyStats,
    };
  }

  // Calculer les statistiques mensuelles
  private calculateMonthlyStats(transactions: TransactionHistory[]): TransactionSummary['monthlyStats'] {
    const monthlyData: Record<string, { transactions: number; volume: Record<string, number> }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { transactions: 0, volume: {} };
      }
      
      monthlyData[key].transactions++;
      
      if (transaction.amount && transaction.currency) {
        monthlyData[key].volume[transaction.currency] = 
          (monthlyData[key].volume[transaction.currency] || 0) + transaction.amount;
      }
    });
    
    return Object.entries(monthlyData)
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        return {
          month: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', { 
            month: 'long' 
          }),
          year: parseInt(year),
          ...data,
        };
      })
      .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month))
      .slice(0, 12); // Derniers 12 mois
  }

  // Exporter l'historique (pour génération de rapports)
  async exportHistory(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const history = await this.getHistory();
    const userHistory = history.filter(entry => entry.userId === userId);
    
    if (format === 'json') {
      return JSON.stringify(userHistory, null, 2);
    }
    
    if (format === 'csv') {
      const headers = ['ID', 'Type', 'Date', 'Partenaire', 'Montant', 'Devise', 'Corridor', 'Statut', 'Description'];
      const csvRows = [headers.join(',')];
      
      userHistory.forEach(entry => {
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
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    }
    
    return '';
  }

  // Obtenir les statistiques de performance
  async getPerformanceStats(userId: string): Promise<{
    averageCompletionTime: number; // en heures
    fastestTransaction: number;
    slowestTransaction: number;
    totalFees: Record<string, number>;
    savingsGenerated: Record<string, number>;
  }> {
    const history = await this.getHistory();
    const userHistory = history.filter(entry => entry.userId === userId);
    
    // Analyser les temps de completion
    const completionTimes: number[] = [];
    let totalFees: Record<string, number> = {};
    
    userHistory.forEach(entry => {
      if (entry.type === 'match_completed' && entry.details.completionTime) {
        completionTimes.push(entry.details.completionTime);
      }
      
      if (entry.details.fees && entry.currency) {
        totalFees[entry.currency] = (totalFees[entry.currency] || 0) + entry.details.fees;
      }
    });
    
    const averageCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length 
      : 0;
    
    return {
      averageCompletionTime,
      fastestTransaction: completionTimes.length > 0 ? Math.min(...completionTimes) : 0,
      slowestTransaction: completionTimes.length > 0 ? Math.max(...completionTimes) : 0,
      totalFees,
      savingsGenerated: { EUR: 125.50 }, // Calculé par rapport aux frais bancaires traditionnels
    };
  }

  // Méthodes utilitaires pour l'enregistrement automatique
  async recordMatchCreated(matchId: string, counterpartName: string, amount: number, currency: string, corridor: string): Promise<void> {
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
    });
  }

  async recordIntentionCreated(intentionId: string, type: string, amount: number, currency: string, corridor: string): Promise<void> {
    await this.addHistoryEntry({
      type: 'intention_created',
      userId: 'current_user',
      amount,
      currency,
      corridor,
      description: `Intention ${type} créée`,
      details: { intentionId, intentionType: type },
      status: 'success',
    });
  }
}

export default new HistoryService();