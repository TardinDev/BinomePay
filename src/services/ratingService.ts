import { supabase } from '@/lib/supabase'

export interface Rating {
  id: string
  fromUserId: string
  toUserId: string
  transactionId: string
  rating: number // 1-5 étoiles
  comment?: string
  categories: {
    punctuality: number // Ponctualité
    communication: number // Communication
    reliability: number // Fiabilité
    overall: number // Note globale
  }
  createdAt: number
  isAnonymous: boolean
}

export interface UserRating {
  userId: string
  averageRating: number
  totalRatings: number
  ratingBreakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  categoryAverages: {
    punctuality: number
    communication: number
    reliability: number
  }
  recentRatings: Rating[]
  trustScore: number // Score de confiance calculé (0-100)
}

export interface Transaction {
  id: string
  participants: string[]
  amount: number
  currency: string
  status: 'completed' | 'cancelled' | 'disputed'
  completedAt?: number
  canRate: boolean
  ratings?: Rating[]
}

class RatingService {
  // Calculer la moyenne des notes
  calculateAverageRating(ratings: Rating[]): number {
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    return Math.round((sum / ratings.length) * 10) / 10
  }

  // Calculer la répartition des notes
  calculateRatingBreakdown(ratings: Rating[]): UserRating['ratingBreakdown'] {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    ratings.forEach((rating) => {
      const roundedRating = Math.round(rating.rating) as keyof typeof breakdown
      if (roundedRating >= 1 && roundedRating <= 5) {
        breakdown[roundedRating]++
      }
    })

    return breakdown
  }

  // Calculer les moyennes par catégorie
  calculateCategoryAverages(ratings: Rating[]): UserRating['categoryAverages'] {
    if (ratings.length === 0) {
      return { punctuality: 0, communication: 0, reliability: 0 }
    }

    const totals = ratings.reduce(
      (acc, rating) => ({
        punctuality: acc.punctuality + rating.categories.punctuality,
        communication: acc.communication + rating.categories.communication,
        reliability: acc.reliability + rating.categories.reliability,
      }),
      { punctuality: 0, communication: 0, reliability: 0 }
    )

    return {
      punctuality: Math.round((totals.punctuality / ratings.length) * 10) / 10,
      communication: Math.round((totals.communication / ratings.length) * 10) / 10,
      reliability: Math.round((totals.reliability / ratings.length) * 10) / 10,
    }
  }

  // Calculer le score de confiance
  calculateTrustScore(userRating: UserRating): number {
    if (userRating.totalRatings === 0) return 0

    const { averageRating, totalRatings, ratingBreakdown } = userRating

    // Score de base basé sur la note moyenne (0-50 points)
    const baseScore = (averageRating / 5) * 50

    // Bonus pour le nombre de transactions (0-25 points)
    const volumeBonus = Math.min((totalRatings / 20) * 25, 25)

    // Bonus pour la consistance (moins de notes faibles = bonus) (0-15 points)
    const lowRatingsRatio = (ratingBreakdown[1] + ratingBreakdown[2]) / totalRatings
    const consistencyBonus = (1 - lowRatingsRatio) * 15

    // Bonus pour l'activité récente (0-10 points)
    const recentActivity = this.calculateRecentActivityBonus(userRating.recentRatings)

    const totalScore = baseScore + volumeBonus + consistencyBonus + recentActivity
    return Math.round(Math.min(totalScore, 100))
  }

  // Calculer le bonus d'activité récente
  private calculateRecentActivityBonus(recentRatings: Rating[]): number {
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

    const recentRatingsCount = recentRatings.filter(
      (rating) => rating.createdAt > thirtyDaysAgo
    ).length

    return Math.min(recentRatingsCount * 2, 10)
  }

  // Obtenir le rating d'un utilisateur
  async getUserRating(userId: string): Promise<UserRating> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const ratings: Rating[] = (data ?? []).map((row: any) => ({
        id: row.id,
        fromUserId: row.from_user_id,
        toUserId: row.to_user_id,
        transactionId: row.transaction_id,
        rating: row.rating,
        comment: row.comment ?? undefined,
        categories: {
          punctuality: row.punctuality,
          communication: row.communication,
          reliability: row.reliability,
          overall: row.rating,
        },
        createdAt: new Date(row.created_at).getTime(),
        isAnonymous: row.is_anonymous,
      }))

      const averageRating = this.calculateAverageRating(ratings)
      const ratingBreakdown = this.calculateRatingBreakdown(ratings)
      const categoryAverages = this.calculateCategoryAverages(ratings)

      const userRating: UserRating = {
        userId,
        averageRating,
        totalRatings: ratings.length,
        ratingBreakdown,
        categoryAverages,
        recentRatings: ratings.slice(0, 5),
        trustScore: 0,
      }

      userRating.trustScore = this.calculateTrustScore(userRating)

      return userRating
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération ratings:', error)
      // Retourner un profil vide en cas d'erreur
      return {
        userId,
        averageRating: 0,
        totalRatings: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        categoryAverages: { punctuality: 0, communication: 0, reliability: 0 },
        recentRatings: [],
        trustScore: 0,
      }
    }
  }

  // Créer une nouvelle note
  async createRating(rating: Omit<Rating, 'id' | 'createdAt'>): Promise<Rating> {
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        from_user_id: rating.fromUserId,
        to_user_id: rating.toUserId,
        transaction_id: rating.transactionId,
        rating: rating.rating,
        comment: rating.comment,
        punctuality: rating.categories.punctuality,
        communication: rating.categories.communication,
        reliability: rating.categories.reliability,
        is_anonymous: rating.isAnonymous,
      })
      .select()
      .single()

    if (error) throw error

    if (__DEV__) console.log('Nouvelle note créée:', data)

    return {
      id: data.id,
      fromUserId: data.from_user_id,
      toUserId: data.to_user_id,
      transactionId: data.transaction_id,
      rating: data.rating,
      comment: data.comment ?? undefined,
      categories: {
        punctuality: data.punctuality,
        communication: data.communication,
        reliability: data.reliability,
        overall: data.rating,
      },
      createdAt: new Date(data.created_at).getTime(),
      isAnonymous: data.is_anonymous,
    }
  }

  // Vérifier si un utilisateur peut noter une transaction
  canRateTransaction(transaction: Transaction, userId: string): boolean {
    if (transaction.status !== 'completed') return false
    if (!transaction.participants.includes(userId)) return false

    // Vérifier si l'utilisateur a déjà noté cette transaction
    const existingRating = transaction.ratings?.find((r) => r.fromUserId === userId)
    return !existingRating
  }

  // Obtenir les badges basés sur le rating
  getUserBadges(userRating: UserRating): Array<{
    id: string
    name: string
    icon: string
    description: string
    color: string
  }> {
    const badges = []

    if (userRating.trustScore >= 90) {
      badges.push({
        id: 'elite_trader',
        name: 'Échangeur Élite',
        icon: '👑',
        description: 'Score de confiance > 90',
        color: '#FFD700',
      })
    }

    if (userRating.totalRatings >= 50) {
      badges.push({
        id: 'veteran',
        name: 'Vétéran',
        icon: '🎖️',
        description: '50+ transactions',
        color: '#C0392B',
      })
    }

    if (userRating.categoryAverages.punctuality >= 4.8) {
      badges.push({
        id: 'punctual',
        name: "Toujours à l'heure",
        icon: '⏰',
        description: 'Excellent en ponctualité',
        color: '#3498DB',
      })
    }

    if (userRating.categoryAverages.communication >= 4.8) {
      badges.push({
        id: 'great_communicator',
        name: 'Super Communicant',
        icon: '💬',
        description: 'Excellente communication',
        color: '#2ECC71',
      })
    }

    return badges
  }

  // Formater l'affichage du rating
  formatRatingDisplay(rating: number): string {
    return (
      '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '') + `${rating.toFixed(1)}`
    )
  }

  // Obtenir la couleur associée à une note
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#2ECC71' // Vert
    if (rating >= 3.5) return '#F39C12' // Orange
    if (rating >= 2.5) return '#E67E22' // Orange foncé
    return '#E74C3C' // Rouge
  }

  // Générer un résumé textuel du rating
  getRatingSummary(userRating: UserRating): string {
    if (userRating.totalRatings === 0) {
      return 'Nouveau utilisateur'
    }

    const { averageRating, totalRatings, trustScore } = userRating

    let summary = `${averageRating.toFixed(1)}/5 (${totalRatings} avis)`

    if (trustScore >= 80) {
      summary += ' • Très fiable'
    } else if (trustScore >= 60) {
      summary += ' • Fiable'
    } else if (trustScore >= 40) {
      summary += ' • Correct'
    }

    return summary
  }
}

export default new RatingService()
