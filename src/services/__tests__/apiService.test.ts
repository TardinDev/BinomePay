/* eslint-disable @typescript-eslint/no-explicit-any */
jest.unmock('@/services/apiService')

// Le mock doit être défini inline dans la factory (pas de variables externes, car jest.mock est hoisté)
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    storage: { from: jest.fn() },
  },
}))

import { ApiService } from '../apiService'
import { supabase } from '@/lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Référence vers le mock (même objet que celui utilisé par apiService)
const mockSupabase = supabase as any

/**
 * Helper: crée un builder de requête Supabase chainable
 * qui résout à `result` quand on fait `await`.
 */
function chain(result: { data?: any; error?: any } = { data: null, error: null }) {
  const builder: any = {}
  const methods = [
    'select',
    'insert',
    'upsert',
    'update',
    'delete',
    'eq',
    'neq',
    'in',
    'or',
    'order',
    'limit',
    'single',
  ]
  methods.forEach((m) => {
    builder[m] = jest.fn().mockReturnValue(builder)
  })
  // Rendre le builder "thenable" pour que `await` fonctionne
  builder.then = (onFulfilled: any) => Promise.resolve(result).then(onFulfilled)
  return builder
}

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─────────────────────────────────────────────────
  // fetchUserProfile
  // ─────────────────────────────────────────────────
  describe('fetchUserProfile', () => {
    it('retourne un profil utilisateur correctement mappé', async () => {
      const dbRow = {
        clerk_id: 'user_123',
        name: 'Jean',
        kyc_status: 'verified',
        rating_avg: 4.5,
        avatar_url: 'https://example.com/avatar.jpg',
      }
      mockSupabase.from.mockReturnValue(chain({ data: dbRow, error: null }))

      const user = await ApiService.fetchUserProfile('user_123')

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(user).toEqual({
        id: 'user_123',
        name: 'Jean',
        kycStatus: 'verified',
        ratingAvg: 4.5,
        avatarUrl: 'https://example.com/avatar.jpg',
      })
    })

    it('utilise des valeurs par défaut pour les champs null', async () => {
      const dbRow = {
        clerk_id: 'user_123',
        name: null,
        kyc_status: null,
        rating_avg: null,
        avatar_url: null,
      }
      mockSupabase.from.mockReturnValue(chain({ data: dbRow, error: null }))

      const user = await ApiService.fetchUserProfile('user_123')

      expect(user.name).toBe('Utilisateur')
      expect(user.kycStatus).toBe('unverified')
      expect(user.ratingAvg).toBe(0)
      expect(user.avatarUrl).toBeUndefined()
    })

    it('lance une erreur si supabase échoue avec un code non-PGRST116', async () => {
      // PGRST116 = ligne inexistante → déclenche createUserProfile (pas un vrai échec)
      // Les autres codes doivent remonter l'erreur.
      const error = { message: 'Server error', code: '500' }
      mockSupabase.from.mockReturnValue(chain({ data: null, error }))

      await expect(ApiService.fetchUserProfile('user_bad')).rejects.toEqual(error)
    })
  })

  // ─────────────────────────────────────────────────
  // updateUserProfile
  // ─────────────────────────────────────────────────
  describe('updateUserProfile', () => {
    it('met à jour et retourne le profil', async () => {
      const dbRow = {
        clerk_id: 'user_123',
        name: 'Jean Updated',
        kyc_status: 'verified',
        rating_avg: 4.8,
        avatar_url: null,
      }
      const c = chain({ data: dbRow, error: null })
      mockSupabase.from.mockReturnValue(c)

      const user = await ApiService.updateUserProfile('user_123', { name: 'Jean Updated' })

      expect(user.name).toBe('Jean Updated')
      expect(c.update).toHaveBeenCalled()
      expect(c.eq).toHaveBeenCalledWith('clerk_id', 'user_123')
    })

    it('mappe correctement les champs camelCase vers snake_case', async () => {
      const c = chain({
        data: {
          clerk_id: 'u1',
          name: 'N',
          kyc_status: 'pending',
          rating_avg: 3,
          avatar_url: 'url',
        },
        error: null,
      })
      mockSupabase.from.mockReturnValue(c)

      await ApiService.updateUserProfile('u1', {
        kycStatus: 'pending',
        avatarUrl: 'url',
      })

      expect(c.update).toHaveBeenCalledWith(
        expect.objectContaining({
          kyc_status: 'pending',
          avatar_url: 'url',
        })
      )
    })
  })

  // ─────────────────────────────────────────────────
  // updateKycStatus
  // ─────────────────────────────────────────────────
  describe('updateKycStatus', () => {
    it('appelle updateUserProfile avec le bon statut', async () => {
      const spy = jest.spyOn(ApiService, 'updateUserProfile').mockResolvedValue({
        id: 'u1',
        name: 'Test',
        kycStatus: 'pending',
        ratingAvg: 0,
      })

      await ApiService.updateKycStatus('u1', 'pending')

      expect(spy).toHaveBeenCalledWith('u1', { kycStatus: 'pending' })
      spy.mockRestore()
    })
  })

  // ─────────────────────────────────────────────────
  // fetchUserRequests
  // ─────────────────────────────────────────────────
  describe('fetchUserRequests', () => {
    it('retourne les intentions mappées', async () => {
      const dbRows = [
        {
          id: 'intent_1',
          direction: 'SEND',
          amount: 500,
          currency: 'EUR',
          origin_country: 'France',
          dest_country: 'Sénégal',
          status: 'OPEN',
        },
        {
          id: 'intent_2',
          direction: 'RECEIVE',
          amount: 200,
          currency: 'XOF',
          origin_country: 'Mali',
          dest_country: 'France',
          status: 'MATCHED',
        },
      ]
      mockSupabase.from.mockReturnValue(chain({ data: dbRows, error: null }))

      const requests = await ApiService.fetchUserRequests('user_123')

      expect(requests).toHaveLength(2)
      expect(requests[0]).toEqual({
        id: 'intent_1',
        type: 'SEND',
        amount: 500,
        currency: 'EUR',
        originCountry: 'France',
        destCountry: 'Sénégal',
        status: 'OPEN',
      })
      expect(requests[1].type).toBe('RECEIVE')
    })

    it('retourne un tableau vide en cas d erreur', async () => {
      mockSupabase.from.mockReturnValue(chain({ data: null, error: { message: 'DB error' } }))

      const requests = await ApiService.fetchUserRequests('user_123')
      expect(requests).toEqual([])
    })

    it('retourne un tableau vide quand data est null', async () => {
      mockSupabase.from.mockReturnValue(chain({ data: null, error: null }))

      const requests = await ApiService.fetchUserRequests('user_123')
      expect(requests).toEqual([])
    })
  })

  // ─────────────────────────────────────────────────
  // createRequest
  // ─────────────────────────────────────────────────
  describe('createRequest', () => {
    it('insère une intention et retourne le résultat mappé', async () => {
      const dbRow = {
        id: 'new_intent_1',
        direction: 'RECEIVE',
        amount: 200,
        currency: 'XOF',
        origin_country: 'Sénégal',
        dest_country: 'France',
        status: 'OPEN',
      }
      mockSupabase.from.mockReturnValue(chain({ data: dbRow, error: null }))

      const result = await ApiService.createRequest('user_123', {
        type: 'RECEIVE',
        amount: 200,
        currency: 'XOF',
        originCountry: 'Sénégal',
        destCountry: 'France',
      })

      expect(result.id).toBe('new_intent_1')
      expect(result.type).toBe('RECEIVE')
      expect(result.amount).toBe(200)
    })

    it('lance une erreur si l insertion échoue', async () => {
      mockSupabase.from.mockReturnValue(chain({ data: null, error: { message: 'Insert failed' } }))

      await expect(
        ApiService.createRequest('user_123', {
          type: 'SEND',
          amount: 100,
          currency: 'EUR',
          originCountry: 'France',
          destCountry: 'Mali',
        })
      ).rejects.toEqual({ message: 'Insert failed' })
    })
  })

  // ─────────────────────────────────────────────────
  // updateRequestStatus
  // ─────────────────────────────────────────────────
  describe('updateRequestStatus', () => {
    it('met à jour le statut de l intention', async () => {
      const c = chain({ data: null, error: null })
      mockSupabase.from.mockReturnValue(c)

      await ApiService.updateRequestStatus('intent_1', 'CLOSED')

      expect(mockSupabase.from).toHaveBeenCalledWith('intents')
      expect(c.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'CLOSED' }))
    })

    it('lance une erreur si la mise à jour échoue', async () => {
      mockSupabase.from.mockReturnValue(chain({ data: null, error: { message: 'Failed' } }))

      await expect(ApiService.updateRequestStatus('intent_1', 'CLOSED')).rejects.toEqual({
        message: 'Failed',
      })
    })
  })

  // ─────────────────────────────────────────────────
  // fetchSuggestionsForUser
  // ─────────────────────────────────────────────────
  describe('fetchSuggestionsForUser', () => {
    it('retourne les suggestions mappées', async () => {
      const dbRows = [
        {
          id: 'intent_other',
          amount: 300,
          currency: 'EUR',
          origin_country: 'France',
          dest_country: "Côte d'Ivoire",
          user_name: 'Marie',
          note: 'Urgent',
          created_at: '2024-01-15T10:00:00Z',
        },
      ]
      mockSupabase.from.mockReturnValue(chain({ data: dbRows, error: null }))

      const suggestions = await ApiService.fetchSuggestionsForUser('my_user_id')

      expect(suggestions).toHaveLength(1)
      expect(suggestions[0].senderName).toBe('Marie')
      expect(suggestions[0].note).toBe('Urgent')
      expect(suggestions[0].createdAt).toBe(new Date('2024-01-15T10:00:00Z').getTime())
    })

    it('utilise Utilisateur par défaut quand user_name est null', async () => {
      const dbRows = [
        {
          id: 'intent_1',
          amount: 100,
          currency: 'EUR',
          origin_country: 'France',
          dest_country: 'Mali',
          user_name: null,
          note: null,
          created_at: '2024-01-01T00:00:00Z',
        },
      ]
      mockSupabase.from.mockReturnValue(chain({ data: dbRows, error: null }))

      const suggestions = await ApiService.fetchSuggestionsForUser('user_123')

      expect(suggestions[0].senderName).toBe('Utilisateur')
      expect(suggestions[0].note).toBeUndefined()
    })

    it('retourne un tableau vide en cas d erreur', async () => {
      mockSupabase.from.mockReturnValue(chain({ data: null, error: { message: 'Error' } }))

      const suggestions = await ApiService.fetchSuggestionsForUser('user_123')
      expect(suggestions).toEqual([])
    })
  })

  // ─────────────────────────────────────────────────
  // fetchConversationMessages
  // ─────────────────────────────────────────────────
  describe('fetchConversationMessages', () => {
    it('retourne les messages mappés et triés', async () => {
      const dbRows = [
        {
          id: 'msg_1',
          conversation_id: 'conv_1',
          sender_id: 'user_1',
          content: 'Bonjour',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 'msg_2',
          conversation_id: 'conv_1',
          sender_id: 'user_2',
          content: 'Salut !',
          created_at: '2024-01-15T10:01:00Z',
        },
      ]
      mockSupabase.from.mockReturnValue(chain({ data: dbRows, error: null }))

      const messages = await ApiService.fetchConversationMessages('conv_1')

      expect(messages).toHaveLength(2)
      expect(messages[0].content).toBe('Bonjour')
      expect(messages[0].conversationId).toBe('conv_1')
      expect(messages[1].senderId).toBe('user_2')
      expect(messages[1].createdAt).toBe(new Date('2024-01-15T10:01:00Z').getTime())
    })

    it('retourne un tableau vide en cas d erreur', async () => {
      mockSupabase.from.mockReturnValue(chain({ data: null, error: { message: 'Error' } }))

      const messages = await ApiService.fetchConversationMessages('conv_bad')
      expect(messages).toEqual([])
    })
  })

  // ─────────────────────────────────────────────────
  // sendMessage
  // ─────────────────────────────────────────────────
  describe('sendMessage', () => {
    it('insère un message, met à jour le timestamp et incrémente unread_count', async () => {
      const msgRow = {
        id: 'msg_new',
        conversation_id: 'conv_1',
        sender_id: 'user_1',
        content: 'Hello!',
        created_at: '2024-01-15T12:00:00Z',
      }

      mockSupabase.from
        .mockReturnValueOnce(chain({ data: msgRow, error: null })) // messages insert
        .mockReturnValueOnce(chain({ data: null, error: null })) // conversations update

      mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: null })

      const result = await ApiService.sendMessage('conv_1', 'Hello!', 'user_1')

      expect(result.content).toBe('Hello!')
      expect(result.conversationId).toBe('conv_1')
      expect(result.senderId).toBe('user_1')
      expect(mockSupabase.from).toHaveBeenCalledWith('messages')
      expect(mockSupabase.from).toHaveBeenCalledWith('conversations')
      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_unread_count', {
        conv_id: 'conv_1',
        sender: 'user_1',
      })
    })

    it('lance une erreur si l insertion du message échoue', async () => {
      mockSupabase.from.mockReturnValueOnce(
        chain({ data: null, error: { message: 'Insert failed' } })
      )

      await expect(ApiService.sendMessage('conv_1', 'Hello!', 'user_1')).rejects.toBeTruthy()
    })
  })

  // ─────────────────────────────────────────────────
  // markConversationAsRead
  // ─────────────────────────────────────────────────
  describe('markConversationAsRead', () => {
    it('met à jour conversation_participants', async () => {
      const c = chain({ data: null, error: null })
      mockSupabase.from.mockReturnValue(c)

      await ApiService.markConversationAsRead('conv_1', 'user_1')

      expect(mockSupabase.from).toHaveBeenCalledWith('conversation_participants')
      expect(c.update).toHaveBeenCalled()
      expect(c.eq).toHaveBeenCalledWith('conversation_id', 'conv_1')
      expect(c.eq).toHaveBeenCalledWith('user_id', 'user_1')
    })

    it('lance une erreur en cas d échec', async () => {
      mockSupabase.from.mockReturnValue(chain({ data: null, error: { message: 'Update failed' } }))

      await expect(ApiService.markConversationAsRead('conv_1', 'user_1')).rejects.toEqual({
        message: 'Update failed',
      })
    })
  })

  // ─────────────────────────────────────────────────
  // updateMatchStatus
  // ─────────────────────────────────────────────────
  describe('updateMatchStatus', () => {
    it('met à jour le statut du match', async () => {
      const c = chain({ data: null, error: null })
      mockSupabase.from.mockReturnValue(c)

      await ApiService.updateMatchStatus('match_1', 'EXPIRED')

      expect(mockSupabase.from).toHaveBeenCalledWith('matches')
      expect(c.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'EXPIRED' }))
    })
  })

  // ─────────────────────────────────────────────────
  // checkApiHealth
  // ─────────────────────────────────────────────────
  describe('checkApiHealth', () => {
    it('retourne true quand supabase répond sans erreur', async () => {
      mockSupabase.from.mockReturnValue(chain({ data: null, error: null }))

      const result = await ApiService.checkApiHealth()
      expect(result).toBe(true)
    })

    it('retourne false quand supabase retourne une erreur', async () => {
      mockSupabase.from.mockReturnValue(chain({ data: null, error: { message: 'Unavailable' } }))

      const result = await ApiService.checkApiHealth()
      expect(result).toBe(false)
    })

    it('retourne false si une exception est levée', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const result = await ApiService.checkApiHealth()
      expect(result).toBe(false)
    })
  })

  // ─────────────────────────────────────────────────
  // acceptSuggestion
  // ─────────────────────────────────────────────────
  describe('acceptSuggestion', () => {
    const suggestion = {
      id: 'intent_other',
      user_id: 'other_user',
      direction: 'SEND',
      amount: 500,
      currency: 'EUR',
      origin_country: 'France',
      dest_country: 'Sénégal',
      user_name: 'Marie',
    }

    function setupAcceptMocks() {
      mockSupabase.from
        .mockReturnValueOnce(chain({ data: suggestion, error: null })) // 1. fetch suggestion
        .mockReturnValueOnce(chain({ data: { name: 'Jean' }, error: null })) // 2. fetch user name
        .mockReturnValueOnce(chain({ data: { id: 'my_intent' }, error: null })) // 3. create intent
        .mockReturnValueOnce(chain({ data: { id: 'match_1' }, error: null })) // 4. create match
        .mockReturnValueOnce(chain({ data: { id: 'conv_1' }, error: null })) // 5. create conversation
        .mockReturnValueOnce(chain({ data: null, error: null })) // 6. add participants
        .mockReturnValueOnce(chain({ data: null, error: null })) // 7. update suggestion status
        .mockReturnValueOnce(chain({ data: null, error: null })) // 8. system message
    }

    it('crée match, conversation, participants et message système', async () => {
      setupAcceptMocks()

      const result = await ApiService.acceptSuggestion('intent_other', 'my_user_id')

      expect(result).toEqual({
        conversationId: 'conv_1',
        matchId: 'match_1',
      })
      expect(mockSupabase.from).toHaveBeenCalledTimes(8)
    })

    it('crée un intent complémentaire avec la direction opposée (SEND → RECEIVE)', async () => {
      const insertChain = chain({ data: { id: 'my_intent' }, error: null })

      mockSupabase.from
        .mockReturnValueOnce(chain({ data: suggestion, error: null }))
        .mockReturnValueOnce(chain({ data: { name: 'Jean' }, error: null }))
        .mockReturnValueOnce(insertChain) // intent complémentaire
        .mockReturnValueOnce(chain({ data: { id: 'match_1' }, error: null }))
        .mockReturnValueOnce(chain({ data: { id: 'conv_1' }, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: null }))

      await ApiService.acceptSuggestion('intent_other', 'my_user_id')

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'RECEIVE', // Opposé de SEND
          user_id: 'my_user_id',
          status: 'MATCHED',
          amount: 500,
          currency: 'EUR',
        })
      )
    })

    it('crée un intent SEND quand la suggestion est RECEIVE', async () => {
      const receiveSuggestion = { ...suggestion, direction: 'RECEIVE' }
      const insertChain = chain({ data: { id: 'my_intent' }, error: null })

      mockSupabase.from
        .mockReturnValueOnce(chain({ data: receiveSuggestion, error: null }))
        .mockReturnValueOnce(chain({ data: { name: 'Jean' }, error: null }))
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(chain({ data: { id: 'match_1' }, error: null }))
        .mockReturnValueOnce(chain({ data: { id: 'conv_1' }, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: null }))

      await ApiService.acceptSuggestion('intent_other', 'my_user_id')

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ direction: 'SEND' })
      )
    })

    it('lance une erreur si la suggestion est introuvable', async () => {
      mockSupabase.from.mockReturnValueOnce(chain({ data: null, error: { message: 'Not found' } }))

      await expect(ApiService.acceptSuggestion('bad_id', 'user_1')).rejects.toBeTruthy()
    })

    it('lance une erreur si la création du match échoue', async () => {
      mockSupabase.from
        .mockReturnValueOnce(chain({ data: suggestion, error: null }))
        .mockReturnValueOnce(chain({ data: { name: 'Jean' }, error: null }))
        .mockReturnValueOnce(chain({ data: { id: 'my_intent' }, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: { message: 'Match failed' } }))

      await expect(ApiService.acceptSuggestion('intent_other', 'my_user_id')).rejects.toBeTruthy()
    })
  })

  // ─────────────────────────────────────────────────
  // fetchUserMatches
  // ─────────────────────────────────────────────────
  describe('fetchUserMatches', () => {
    it('retourne un tableau vide si aucun intent', async () => {
      mockSupabase.from.mockReturnValueOnce(chain({ data: [], error: null }))

      const matches = await ApiService.fetchUserMatches('user_123')
      expect(matches).toEqual([])
    })

    it('retourne les matches avec le nom du counterpart', async () => {
      mockSupabase.from
        // 1. intents de l'utilisateur
        .mockReturnValueOnce(chain({ data: [{ id: 'my_intent_1' }], error: null }))
        // 2. matches
        .mockReturnValueOnce(
          chain({
            data: [
              {
                id: 'match_1',
                intent_a: 'my_intent_1',
                intent_b: 'other_intent_1',
                status: 'ACCEPTED',
                created_at: '2024-01-15T10:00:00Z',
              },
            ],
            error: null,
          })
        )
        // 3. other intent details
        .mockReturnValueOnce(
          chain({
            data: {
              user_id: 'other_user',
              amount: 500,
              currency: 'EUR',
              origin_country: 'France',
              dest_country: 'Sénégal',
            },
            error: null,
          })
        )
        // 4. other user name
        .mockReturnValueOnce(chain({ data: { name: 'Marie' }, error: null }))

      const matches = await ApiService.fetchUserMatches('user_123')

      expect(matches).toHaveLength(1)
      expect(matches[0].id).toBe('match_1')
      expect(matches[0].counterpartName).toBe('Marie')
      expect(matches[0].amount).toBe(500)
      expect(matches[0].currency).toBe('EUR')
      expect(matches[0].status).toBe('ACCEPTED')
    })

    it('retourne un tableau vide en cas d erreur', async () => {
      mockSupabase.from.mockReturnValueOnce(chain({ data: null, error: { message: 'Error' } }))

      const matches = await ApiService.fetchUserMatches('user_123')
      expect(matches).toEqual([])
    })
  })

  // ─────────────────────────────────────────────────
  // fetchUserConversations
  // ─────────────────────────────────────────────────
  describe('fetchUserConversations', () => {
    it('retourne un tableau vide sans participations', async () => {
      mockSupabase.from.mockReturnValueOnce(chain({ data: [], error: null }))

      const conversations = await ApiService.fetchUserConversations('user_123')
      expect(conversations).toEqual([])
    })

    it('retourne les conversations avec détails complets', async () => {
      mockSupabase.from
        // 1. participations
        .mockReturnValueOnce(
          chain({ data: [{ conversation_id: 'conv_1', unread_count: 2 }], error: null })
        )
        // 2. conversations
        .mockReturnValueOnce(
          chain({
            data: [{ id: 'conv_1', match_id: 'match_1', updated_at: '2024-01-15T10:00:00Z' }],
            error: null,
          })
        )
        // 3. other participant
        .mockReturnValueOnce(chain({ data: { user_id: 'other_user' }, error: null }))
        // 4. other user name
        .mockReturnValueOnce(chain({ data: { name: 'Marie' }, error: null }))
        // 5. last message
        .mockReturnValueOnce(chain({ data: { content: 'Dernier message' }, error: null }))
        // 6. match
        .mockReturnValueOnce(chain({ data: { intent_a: 'intent_1' }, error: null }))
        // 7. intent details
        .mockReturnValueOnce(
          chain({
            data: {
              amount: 500,
              currency: 'EUR',
              origin_country: 'France',
              dest_country: 'Sénégal',
            },
            error: null,
          })
        )

      const conversations = await ApiService.fetchUserConversations('user_123')

      expect(conversations).toHaveLength(1)
      expect(conversations[0]).toEqual({
        id: 'conv_1',
        counterpartName: 'Marie',
        lastMessage: 'Dernier message',
        updatedAt: new Date('2024-01-15T10:00:00Z').getTime(),
        unreadCount: 2,
        matchDetails: {
          amount: 500,
          currency: 'EUR',
          corridor: 'France → Sénégal',
        },
      })
    })

    it('retourne un tableau vide en cas d erreur', async () => {
      mockSupabase.from.mockReturnValueOnce(chain({ data: null, error: { message: 'Error' } }))

      const conversations = await ApiService.fetchUserConversations('user_123')
      expect(conversations).toEqual([])
    })
  })

  // ─────────────────────────────────────────────────
  // syncUserData
  // ─────────────────────────────────────────────────
  describe('syncUserData', () => {
    it('récupère toutes les données en parallèle', async () => {
      const spies = {
        profile: jest
          .spyOn(ApiService, 'fetchUserProfile')
          .mockResolvedValue({ id: 'u1', name: 'T', kycStatus: 'unverified', ratingAvg: 0 }),
        requests: jest.spyOn(ApiService, 'fetchUserRequests').mockResolvedValue([]),
        matches: jest.spyOn(ApiService, 'fetchUserMatches').mockResolvedValue([]),
        suggestions: jest.spyOn(ApiService, 'fetchSuggestionsForUser').mockResolvedValue([]),
        conversations: jest.spyOn(ApiService, 'fetchUserConversations').mockResolvedValue([]),
      }

      const result = await ApiService.syncUserData('u1')

      expect(spies.profile).toHaveBeenCalledWith('u1')
      expect(spies.requests).toHaveBeenCalledWith('u1')
      expect(spies.matches).toHaveBeenCalledWith('u1')
      expect(spies.suggestions).toHaveBeenCalledWith('u1')
      expect(spies.conversations).toHaveBeenCalledWith('u1')
      expect(result.user.id).toBe('u1')
      expect(result.requests).toEqual([])
      expect(result.matches).toEqual([])

      Object.values(spies).forEach((s) => s.mockRestore())
    })

    it('lance une erreur si une requête échoue', async () => {
      jest.spyOn(ApiService, 'fetchUserProfile').mockRejectedValue(new Error('fail'))
      jest.spyOn(ApiService, 'fetchUserRequests').mockResolvedValue([])
      jest.spyOn(ApiService, 'fetchUserMatches').mockResolvedValue([])
      jest.spyOn(ApiService, 'fetchSuggestionsForUser').mockResolvedValue([])
      jest.spyOn(ApiService, 'fetchUserConversations').mockResolvedValue([])

      await expect(ApiService.syncUserData('u1')).rejects.toThrow('fail')

      jest.restoreAllMocks()
    })
  })

  // ─────────────────────────────────────────────────
  // Offline Queue
  // ─────────────────────────────────────────────────
  describe('queueOfflineAction', () => {
    it('ajoute une action à une queue vide', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)

      await ApiService.queueOfflineAction({
        type: 'CREATE_REQUEST',
        payload: {
          type: 'SEND',
          amount: 100,
          currency: 'EUR',
          originCountry: 'France',
          destCountry: 'Mali',
        },
        userId: 'user_1',
        timestamp: 12345,
      })

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'offline_queue',
        expect.stringContaining('CREATE_REQUEST')
      )
    })

    it('ajoute une action à une queue existante', async () => {
      const existingQueue = [
        {
          type: 'SEND_MESSAGE',
          payload: { conversationId: 'c1', message: 'Hi' },
          userId: 'user_1',
          timestamp: 11111,
        },
      ]
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingQueue))

      await ApiService.queueOfflineAction({
        type: 'CREATE_REQUEST',
        payload: {
          type: 'SEND',
          amount: 100,
          currency: 'EUR',
          originCountry: 'France',
          destCountry: 'Mali',
        },
        userId: 'user_1',
        timestamp: 22222,
      })

      const savedQueue = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1])
      expect(savedQueue).toHaveLength(2)
    })

    it('ignore les actions dupliquées', async () => {
      const action = {
        type: 'CREATE_REQUEST',
        payload: {
          type: 'SEND',
          amount: 100,
          currency: 'EUR',
          originCountry: 'France',
          destCountry: 'Mali',
        },
        userId: 'user_1',
        timestamp: 12345,
      }
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([action]))

      await ApiService.queueOfflineAction({
        type: 'CREATE_REQUEST',
        payload: {
          type: 'SEND',
          amount: 100,
          currency: 'EUR',
          originCountry: 'France',
          destCountry: 'Mali',
        },
        userId: 'user_1',
        timestamp: 99999,
      })

      expect(AsyncStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('processOfflineQueue', () => {
    it('traite les actions en attente et les retire de la queue', async () => {
      const actions = [
        {
          type: 'CREATE_REQUEST',
          payload: {
            type: 'SEND',
            amount: 100,
            currency: 'EUR',
            originCountry: 'France',
            destCountry: 'Mali',
          },
          userId: 'user_1',
          timestamp: 12345,
        },
      ]
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(actions))

      mockSupabase.from.mockReturnValue(
        chain({
          data: {
            id: 'intent_1',
            direction: 'SEND',
            amount: 100,
            currency: 'EUR',
            origin_country: 'France',
            dest_country: 'Mali',
            status: 'OPEN',
          },
          error: null,
        })
      )

      await ApiService.processOfflineQueue()

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('offline_queue', '[]')
    })

    it('ne fait rien si la queue est vide', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)

      await ApiService.processOfflineQueue()

      expect(AsyncStorage.setItem).not.toHaveBeenCalled()
    })

    it('conserve les actions en échec dans la queue', async () => {
      const actions = [
        {
          type: 'CREATE_REQUEST',
          payload: {
            type: 'SEND',
            amount: 100,
            currency: 'EUR',
            originCountry: 'France',
            destCountry: 'Mali',
          },
          userId: 'user_1',
          timestamp: 12345,
        },
        {
          type: 'SEND_MESSAGE',
          payload: { conversationId: 'c1', message: 'Hi' },
          userId: 'user_1',
          timestamp: 12346,
        },
      ]
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(actions))

      // Premier appel réussit, deuxième échoue
      mockSupabase.from
        .mockReturnValueOnce(
          chain({
            data: {
              id: 'i1',
              direction: 'SEND',
              amount: 100,
              currency: 'EUR',
              origin_country: 'France',
              dest_country: 'Mali',
              status: 'OPEN',
            },
            error: null,
          })
        )
        .mockReturnValueOnce(chain({ data: null, error: { message: 'Failed' } }))

      await ApiService.processOfflineQueue()

      // La queue restante devrait contenir l'action en échec
      const savedQueue = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1])
      expect(savedQueue).toHaveLength(1)
      expect(savedQueue[0].type).toBe('SEND_MESSAGE')
    })
  })
})
