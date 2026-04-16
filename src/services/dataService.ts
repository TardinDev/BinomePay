import { supabase } from '@/lib/supabase'
import { RequestItem, SuggestedItem, User } from '@/store/useAppStore'

/**
 * Service pour gérer les opérations de données avec Supabase
 * Prêt pour la production avec fallbacks vers mock data
 */

export class DataService {
  /**
   * Synchronise un utilisateur Clerk avec Supabase
   */
  static async syncUserWithSupabase(clerkUser: any): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            clerk_id: clerkUser.id,
            name: clerkUser.firstName || clerkUser.username || 'Utilisateur',
            avatar_url: clerkUser.imageUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'clerk_id', ignoreDuplicates: false }
        )
        .select()
        .single()

      if (error) throw error

      return {
        id: clerkUser.id,
        name: data.name,
        kycStatus: data.kyc_status || 'unverified',
        ratingAvg: data.rating_avg || 0,
        avatarUrl: data.avatar_url,
      }
    } catch (error) {
      if (__DEV__) console.error('Error syncing user with Supabase:', error)
      return {
        id: clerkUser.id,
        name: clerkUser.firstName || clerkUser.username || 'Utilisateur',
        kycStatus: 'unverified',
        ratingAvg: 0,
        avatarUrl: clerkUser.imageUrl,
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
          users!intents_user_id_fkey (name)
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
        senderName: (intent.users as any)?.name || 'Utilisateur',
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
