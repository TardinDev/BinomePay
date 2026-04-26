import { supabase } from '@/lib/supabase'
import { RequestItem, SuggestedItem, User } from '@/store/useAppStore'

/**
 * Service pour gérer les opérations de données avec Supabase
 * Prêt pour la production avec fallbacks vers mock data
 */

export class DataService {
  /**
   * Récupère le profil utilisateur depuis Supabase.
   * La row dans `users` est créée automatiquement par le trigger SQL `handle_new_user`
   * lors du sign-up, donc cette méthode n'a qu'à lire (et mettre à jour les champs mutables).
   */
  static async syncUserWithSupabase(authUser: {
    id: string
    user_metadata?: Record<string, any>
  }): Promise<User> {
    const firstName = (authUser.user_metadata?.firstName as string) || 'Utilisateur'

    try {
      const { data, error } = await supabase
        .from('users')
        .select('auth_id, name, kyc_status, rating_avg, avatar_url')
        .eq('auth_id', authUser.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        return {
          id: authUser.id,
          name: firstName,
          kycStatus: 'unverified',
          ratingAvg: 0,
          avatarUrl: undefined,
        }
      }

      return {
        id: authUser.id,
        name: data.name || firstName,
        kycStatus: (data.kyc_status as User['kycStatus']) || 'unverified',
        ratingAvg: Number(data.rating_avg) || 0,
        avatarUrl: data.avatar_url || undefined,
      }
    } catch (error) {
      if (__DEV__) console.error('Error syncing user with Supabase:', error)
      return {
        id: authUser.id,
        name: firstName,
        kycStatus: 'unverified',
        ratingAvg: 0,
        avatarUrl: undefined,
      }
    }
  }

  /**
   * Charge les intentions de l'utilisateur
   */
  static async fetchUserRequests(userId: string): Promise<RequestItem[]> {
    try {
      const { data, error } = await supabase
        .from('intents')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((intent) => ({
        id: intent.id,
        type: intent.direction,
        amount: intent.amount,
        currency: intent.currency,
        originCountry: intent.origin_country,
        destCountry: intent.dest_country,
        status: intent.status,
      }))
    } catch (error) {
      if (__DEV__) console.error('Error fetching user requests:', error)
      return [] // Fallback vers données vides
    }
  }

  /**
   * Charge les suggestions pour l'utilisateur (intentions des autres)
   */
  static async fetchSuggestions(currentUserId: string): Promise<SuggestedItem[]> {
    try {
      const { data, error } = await supabase
        .from('intents')
        .select(
          `
          id, amount, currency, origin_country, dest_country, created_at,
          user_name
        `
        )
        .eq('status', 'OPEN')
        .neq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data || []).map((intent) => ({
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        originCountryName: intent.origin_country,
        destCountryName: intent.dest_country,
        senderName: (intent as any).user_name || 'Utilisateur',
        createdAt: new Date(intent.created_at).getTime(),
      }))
    } catch (error) {
      if (__DEV__) console.error('Error fetching suggestions:', error)
      return []
    }
  }

  /**
   * Crée une nouvelle intention
   */
  static async createIntention(
    userId: string,
    intention: {
      type: 'SEND' | 'RECEIVE'
      amount: number
      currency: string
      originCountry: string
      destCountry: string
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('intents')
        .insert([
          {
            user_id: userId,
            direction: intention.type,
            amount: intention.amount,
            currency: intention.currency,
            origin_country: intention.originCountry,
            dest_country: intention.destCountry,
            status: 'OPEN',
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      if (__DEV__) console.error('Error creating intention:', error)
      throw error
    }
  }

  /**
   * Configure les Real-time subscriptions
   */
  static subscribeToIntentions(userId: string, onUpdate: (_suggestions: SuggestedItem[]) => void) {
    return supabase
      .channel('public:intents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intents',
        },
        async () => {
          // Recharger les suggestions quand il y a des changements
          const suggestions = await DataService.fetchSuggestions(userId)
          onUpdate(suggestions)
        }
      )
      .subscribe()
  }
}
