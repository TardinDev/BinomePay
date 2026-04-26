import AsyncStorage from '@react-native-async-storage/async-storage'
import { User, RequestItem, MatchItem, Conversation, SuggestedItem } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'

// Types pour les messages
export type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: number
}

// Types pour les actions hors ligne - discriminated union
export type CreateRequestAction = {
  type: 'CREATE_REQUEST'
  payload: Omit<RequestItem, 'id' | 'status'>
  userId: string
  timestamp: number
}

export type SendMessageAction = {
  type: 'SEND_MESSAGE'
  payload: { conversationId: string; message: string }
  userId: string
  timestamp: number
}

export type AcceptSuggestionAction = {
  type: 'ACCEPT_SUGGESTION'
  payload: { suggestionId: string }
  userId: string
  timestamp: number
}

export type UpdateProfileAction = {
  type: 'UPDATE_PROFILE'
  payload: Partial<User>
  userId: string
  timestamp: number
}

export type OfflineAction =
  | CreateRequestAction
  | SendMessageAction
  | AcceptSuggestionAction
  | UpdateProfileAction

export class ApiService {
  // ================================
  // GESTION UTILISATEUR
  // ================================

  static async fetchUserProfile(userId: string, userName?: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('auth_id, name, kyc_status, rating_avg, avatar_url')
        .eq('auth_id', userId)
        .single()

      if (error) {
        // PGRST116 = 0 rows → l'utilisateur n'existe pas encore, le créer
        if (error.code === 'PGRST116') {
          return await this.createUserProfile(userId, userName)
        }
        throw error
      }

      return {
        id: data.auth_id,
        name: data.name ?? 'Utilisateur',
        kycStatus: (data.kyc_status as User['kycStatus']) ?? 'unverified',
        ratingAvg: Number(data.rating_avg ?? 0),
        avatarUrl: data.avatar_url ?? undefined,
      }
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération profil:', error)
      throw error
    }
  }

  static async createUserProfile(userId: string, userName?: string): Promise<User> {
    try {
      // INSERT idempotent : ON CONFLICT DO NOTHING (préserve les valeurs existantes)
      const { error: upsertError } = await supabase.from('users').upsert(
        {
          auth_id: userId,
          name: userName || 'Utilisateur',
          kyc_status: 'unverified',
          rating_avg: 0,
        },
        { onConflict: 'auth_id', ignoreDuplicates: true }
      )

      if (upsertError) throw upsertError

      // Relire la ligne (nouvellement insérée OU pré-existante)
      const { data, error } = await supabase
        .from('users')
        .select('auth_id, name, kyc_status, rating_avg, avatar_url')
        .eq('auth_id', userId)
        .single()

      if (error) throw error

      if (__DEV__) console.log('Profil utilisateur assuré dans Supabase')

      return {
        id: data.auth_id,
        name: data.name ?? 'Utilisateur',
        kycStatus: (data.kyc_status as User['kycStatus']) ?? 'unverified',
        ratingAvg: Number(data.rating_avg ?? 0),
        avatarUrl: data.avatar_url ?? undefined,
      }
    } catch (error) {
      if (__DEV__) console.error('Erreur création profil:', error)
      throw error
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.kycStatus !== undefined) dbUpdates.kyc_status = updates.kycStatus
      if (updates.ratingAvg !== undefined) dbUpdates.rating_avg = updates.ratingAvg
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl

      const { data, error } = await supabase
        .from('users')
        .update({ ...dbUpdates, updated_at: new Date().toISOString() })
        .eq('auth_id', userId)
        .select('auth_id, name, kyc_status, rating_avg, avatar_url')
        .single()

      if (error) throw error

      return {
        id: data.auth_id,
        name: data.name ?? 'Utilisateur',
        kycStatus: (data.kyc_status as User['kycStatus']) ?? 'unverified',
        ratingAvg: Number(data.rating_avg ?? 0),
        avatarUrl: data.avatar_url ?? undefined,
      }
    } catch (error) {
      if (__DEV__) console.error('Erreur mise à jour profil:', error)
      throw error
    }
  }

  static async updateKycStatus(userId: string, status: User['kycStatus']): Promise<void> {
    try {
      await this.updateUserProfile(userId, { kycStatus: status })
    } catch (error) {
      if (__DEV__) console.error('Erreur mise à jour KYC:', error)
      throw error
    }
  }

  // ================================
  // GESTION DES INTENTIONS (REQUESTS)
  // ================================

  static async fetchUserRequests(userId: string): Promise<RequestItem[]> {
    try {
      const { data, error } = await supabase
        .from('intents')
        .select('id, direction, amount, currency, origin_country, dest_country, status')
        .eq('user_id', userId)
        .in('status', ['OPEN', 'MATCHED'])
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id,
        type: row.direction as 'SEND' | 'RECEIVE',
        amount: Number(row.amount),
        currency: row.currency,
        originCountry: row.origin_country,
        destCountry: row.dest_country,
        status: row.status as 'OPEN' | 'MATCHED' | 'CLOSED',
      }))
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération intentions:', error)
      return []
    }
  }

  static async createRequest(
    userId: string,
    request: Omit<RequestItem, 'id' | 'status'>
  ): Promise<RequestItem> {
    try {
      const { data, error } = await supabase
        .from('intents')
        .insert({
          user_id: userId,
          direction: request.type,
          amount: request.amount,
          currency: request.currency,
          origin_country: request.originCountry,
          dest_country: request.destCountry,
          status: 'OPEN',
        })
        .select('id, direction, amount, currency, origin_country, dest_country, status')
        .single()

      if (error) throw error

      return {
        id: data.id,
        type: data.direction as 'SEND' | 'RECEIVE',
        amount: Number(data.amount),
        currency: data.currency,
        originCountry: data.origin_country,
        destCountry: data.dest_country,
        status: data.status as 'OPEN' | 'MATCHED' | 'CLOSED',
      }
    } catch (error) {
      if (__DEV__) console.error('Erreur création intention:', error)
      throw error
    }
  }

  static async updateRequestStatus(
    requestId: string,
    status: RequestItem['status']
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('intents')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (error) throw error
    } catch (error) {
      if (__DEV__) console.error('Erreur mise à jour statut intention:', error)
      throw error
    }
  }

  // ================================
  // GESTION DES SUGGESTIONS
  // ================================

  static async fetchSuggestionsForUser(userId: string): Promise<SuggestedItem[]> {
    try {
      const { data, error } = await supabase
        .from('intents')
        .select('id, amount, currency, origin_country, dest_country, user_name, note, created_at')
        .neq('user_id', userId)
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id,
        amount: Number(row.amount),
        currency: row.currency,
        originCountryName: row.origin_country,
        destCountryName: row.dest_country,
        senderName: row.user_name ?? 'Utilisateur',
        note: row.note ?? undefined,
        createdAt: new Date(row.created_at).getTime(),
      }))
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération suggestions:', error)
      return []
    }
  }

  static async acceptSuggestion(
    suggestionId: string,
    userId: string
  ): Promise<{ conversationId: string; matchId: string }> {
    try {
      // 1. Récupérer l'intent de la suggestion
      const { data: suggestion, error: suggestionError } = await supabase
        .from('intents')
        .select('id, user_id, direction, amount, currency, origin_country, dest_country, user_name')
        .eq('id', suggestionId)
        .eq('status', 'OPEN')
        .single()

      if (suggestionError || !suggestion) {
        throw new Error('Suggestion introuvable ou déjà acceptée')
      }

      // 2. Récupérer le nom de l'utilisateur acceptant
      const { data: acceptingUser } = await supabase
        .from('users')
        .select('name')
        .eq('auth_id', userId)
        .single()

      const acceptingUserName = acceptingUser?.name ?? 'Utilisateur'

      // 3. Créer un intent complémentaire pour l'utilisateur qui accepte
      const complementaryDirection = suggestion.direction === 'SEND' ? 'RECEIVE' : 'SEND'
      const { data: myIntent, error: myIntentError } = await supabase
        .from('intents')
        .insert({
          user_id: userId,
          user_name: acceptingUserName,
          direction: complementaryDirection,
          amount: suggestion.amount,
          currency: suggestion.currency,
          origin_country: suggestion.origin_country,
          dest_country: suggestion.dest_country,
          status: 'MATCHED',
        })
        .select('id')
        .single()

      if (myIntentError || !myIntent) throw myIntentError ?? new Error("Erreur création d'intent")

      // 4. Créer le match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          intent_a: suggestion.id,
          intent_b: myIntent.id,
          status: 'ACCEPTED',
        })
        .select('id')
        .single()

      if (matchError || !match) throw matchError ?? new Error('Erreur création match')

      // 5. Créer la conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({ match_id: match.id })
        .select('id')
        .single()

      if (convError || !conversation) throw convError ?? new Error('Erreur création conversation')

      // 6. Ajouter les 2 participants
      const { error: participantsError } = await supabase.from('conversation_participants').insert([
        { conversation_id: conversation.id, user_id: userId, unread_count: 0 },
        { conversation_id: conversation.id, user_id: suggestion.user_id, unread_count: 1 },
      ])

      if (participantsError) throw participantsError

      // 7. Mettre à jour l'intent de la suggestion → MATCHED
      await supabase
        .from('intents')
        .update({ status: 'MATCHED', updated_at: new Date().toISOString() })
        .eq('id', suggestion.id)

      // 8. Insérer un message système dans la conversation
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: userId,
        content: `Match créé ! ${acceptingUserName} a accepté la proposition de ${suggestion.amount} ${suggestion.currency}.`,
      })

      return {
        conversationId: conversation.id,
        matchId: match.id,
      }
    } catch (error) {
      if (__DEV__) console.error('Erreur acceptation suggestion:', error)
      throw error
    }
  }

  // ================================
  // GESTION DES MATCHES
  // ================================

  static async fetchUserMatches(userId: string): Promise<MatchItem[]> {
    try {
      // Récupérer les IDs des intents de l'utilisateur
      const { data: userIntents, error: intentsError } = await supabase
        .from('intents')
        .select('id')
        .eq('user_id', userId)

      if (intentsError) throw intentsError

      const intentIds = (userIntents ?? []).map((i) => i.id)
      if (intentIds.length === 0) return []

      // Récupérer les matches où l'utilisateur est impliqué
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, intent_a, intent_b, status, created_at')
        .or(`intent_a.in.(${intentIds.join(',')}),intent_b.in.(${intentIds.join(',')})`)
        .order('created_at', { ascending: false })

      if (matchesError) throw matchesError

      // Pour chaque match, récupérer les détails de l'intent de l'autre utilisateur
      const result: MatchItem[] = []
      for (const match of matches ?? []) {
        const otherIntentId = intentIds.includes(match.intent_a) ? match.intent_b : match.intent_a

        const { data: otherIntent } = await supabase
          .from('intents')
          .select('user_id, amount, currency, origin_country, dest_country')
          .eq('id', otherIntentId)
          .single()

        let counterpartName = 'Utilisateur'
        if (otherIntent?.user_id) {
          const { data: otherUser } = await supabase
            .from('users')
            .select('name')
            .eq('auth_id', otherIntent.user_id)
            .single()
          counterpartName = otherUser?.name ?? 'Utilisateur'
        }

        result.push({
          id: match.id,
          counterpartName,
          amount: Number(otherIntent?.amount ?? 0),
          currency: otherIntent?.currency ?? 'EUR',
          corridor: otherIntent
            ? `${otherIntent.origin_country.slice(0, 2).toUpperCase()} → ${otherIntent.dest_country.slice(0, 2).toUpperCase()}`
            : '',
          status: match.status as MatchItem['status'],
        })
      }

      return result
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération matches:', error)
      return []
    }
  }

  static async updateMatchStatus(matchId: string, status: MatchItem['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', matchId)

      if (error) throw error
    } catch (error) {
      if (__DEV__) console.error('Erreur mise à jour statut match:', error)
      throw error
    }
  }

  // ================================
  // GESTION DES CONVERSATIONS
  // ================================

  static async fetchUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // 1. Récupérer les conversations où l'utilisateur est participant
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, unread_count')
        .eq('user_id', userId)

      if (partError) throw partError
      if (!participations || participations.length === 0) return []

      const convIds = participations.map((p) => p.conversation_id)
      const unreadMap = new Map(participations.map((p) => [p.conversation_id, p.unread_count]))

      // 2. Récupérer les détails des conversations
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, match_id, updated_at')
        .in('id', convIds)
        .order('updated_at', { ascending: false })

      if (convError) throw convError

      const result: Conversation[] = []

      for (const conv of conversations ?? []) {
        // 3. Trouver le counterpart
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id)
          .neq('user_id', userId)
          .single()

        let counterpartName = 'Utilisateur'
        if (otherParticipant?.user_id) {
          const { data: otherUser } = await supabase
            .from('users')
            .select('name')
            .eq('auth_id', otherParticipant.user_id)
            .single()
          counterpartName = otherUser?.name ?? 'Utilisateur'
        }

        // 4. Dernier message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // 5. Détails du match (montant, devise, corridor)
        let matchDetails: Conversation['matchDetails'] = undefined
        if (conv.match_id) {
          const { data: match } = await supabase
            .from('matches')
            .select('intent_a')
            .eq('id', conv.match_id)
            .single()

          if (match?.intent_a) {
            const { data: intent } = await supabase
              .from('intents')
              .select('amount, currency, origin_country, dest_country')
              .eq('id', match.intent_a)
              .single()

            if (intent) {
              matchDetails = {
                amount: Number(intent.amount),
                currency: intent.currency,
                corridor: `${intent.origin_country} → ${intent.dest_country}`,
              }
            }
          }
        }

        result.push({
          id: conv.id,
          counterpartName,
          lastMessage: lastMsg?.content ?? '',
          updatedAt: new Date(conv.updated_at).getTime(),
          unreadCount: unreadMap.get(conv.id) ?? 0,
          matchDetails,
        })
      }

      return result
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération conversations:', error)
      return []
    }
  }

  static async fetchConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        content: row.content,
        createdAt: new Date(row.created_at).getTime(),
      }))
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération messages:', error)
      return []
    }
  }

  static async sendMessage(
    conversationId: string,
    message: string,
    senderId: string
  ): Promise<Message> {
    try {
      // 1. Insérer le message
      const { data: msg, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: message,
          sender_id: senderId,
        })
        .select('id, conversation_id, sender_id, content, created_at')
        .single()

      if (messageError || !msg) throw messageError ?? new Error('Erreur insertion message')

      // 2. Mettre à jour le timestamp de la conversation
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      // 3. Incrémenter unread_count de l'autre participant (RPC atomique)
      await supabase.rpc('increment_unread_count', {
        conv_id: conversationId,
        sender: senderId,
      })

      return {
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        createdAt: new Date(msg.created_at).getTime(),
      }
    } catch (error) {
      if (__DEV__) console.error('Erreur envoi message:', error)
      throw error
    }
  }

  static async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ unread_count: 0, last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      if (__DEV__) console.error('Erreur marquage conversation lue:', error)
      throw error
    }
  }

  // ================================
  // GESTION DE LA SYNCHRONISATION
  // ================================

  static async syncUserData(userId: string): Promise<{
    user: User
    requests: RequestItem[]
    matches: MatchItem[]
    suggestions: SuggestedItem[]
    conversations: Conversation[]
  }> {
    try {
      const [user, requests, matches, suggestions, conversations] = await Promise.all([
        this.fetchUserProfile(userId),
        this.fetchUserRequests(userId),
        this.fetchUserMatches(userId),
        this.fetchSuggestionsForUser(userId),
        this.fetchUserConversations(userId),
      ])

      return { user, requests, matches, suggestions, conversations }
    } catch (error) {
      if (__DEV__) console.error('Erreur synchronisation:', error)
      throw error
    }
  }

  // ================================
  // GESTION HORS LIGNE
  // ================================

  static async queueOfflineAction(action: OfflineAction): Promise<void> {
    try {
      const offlineQueue = await AsyncStorage.getItem('offline_queue')
      const queue: OfflineAction[] = offlineQueue ? JSON.parse(offlineQueue) : []

      // Déduplication : vérifier si une action identique existe déjà
      const isDuplicate = queue.some(
        (existing) =>
          existing.type === action.type &&
          existing.userId === action.userId &&
          JSON.stringify(existing.payload) === JSON.stringify(action.payload)
      )

      if (isDuplicate) {
        if (__DEV__) console.warn('Action hors ligne dupliquée ignorée:', action.type)
        return
      }

      queue.push(action)
      await AsyncStorage.setItem('offline_queue', JSON.stringify(queue))
    } catch (error) {
      if (__DEV__) console.error('Erreur ajout queue hors ligne:', error)
    }
  }

  static async processOfflineQueue(): Promise<void> {
    try {
      const offlineQueue = await AsyncStorage.getItem('offline_queue')
      if (!offlineQueue) return

      const queue: OfflineAction[] = JSON.parse(offlineQueue)
      const processedActions: string[] = []

      for (const action of queue) {
        try {
          await this.processOfflineAction(action)
          processedActions.push(action.timestamp.toString())
        } catch (error) {
          if (__DEV__) console.error('Erreur traitement action hors ligne:', error)
        }
      }

      // Supprimer les actions traitées
      const remainingQueue = queue.filter(
        (action) => !processedActions.includes(action.timestamp.toString())
      )

      await AsyncStorage.setItem('offline_queue', JSON.stringify(remainingQueue))
    } catch (error) {
      if (__DEV__) console.error('Erreur traitement queue hors ligne:', error)
    }
  }

  private static async processOfflineAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE_REQUEST':
        await this.createRequest(action.userId, action.payload)
        break
      case 'SEND_MESSAGE':
        await this.sendMessage(action.payload.conversationId, action.payload.message, action.userId)
        break
      case 'ACCEPT_SUGGESTION':
        await this.acceptSuggestion(action.payload.suggestionId, action.userId)
        break
      case 'UPDATE_PROFILE':
        await this.updateUserProfile(action.userId, action.payload)
        break
    }
  }

  // ================================
  // UTILITAIRES
  // ================================

  static async checkApiHealth(): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' })
      return !error
    } catch {
      return false
    }
  }

  static async uploadAvatar(userId: string, imageUri: string): Promise<string> {
    try {
      // Upload vers Supabase Storage
      const fileName = `avatars/${userId}_${Date.now()}.jpg`

      const response = await fetch(imageUri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName)

      // Mettre à jour l'avatar dans le profil
      await this.updateUserProfile(userId, { avatarUrl: publicUrl })

      return publicUrl
    } catch (error) {
      if (__DEV__) console.error('Erreur upload avatar:', error)
      throw error
    }
  }
}

export default ApiService
