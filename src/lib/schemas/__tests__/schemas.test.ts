import { RequestItemSchema, MatchItemSchema, SuggestedItemSchema } from '../exchange'
import { UserSchema, KycStatusSchema } from '../user'
import { ConversationSchema, MessageSchema } from '../conversation'

describe('RequestItemSchema', () => {
  const validRequest = {
    id: 'req_1',
    type: 'SEND',
    amount: 100,
    currency: 'EUR',
    originCountry: 'France',
    destCountry: 'Sénégal',
    status: 'OPEN',
  }

  it('valide des données correctes', () => {
    const result = RequestItemSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('rejette un montant négatif', () => {
    const result = RequestItemSchema.safeParse({ ...validRequest, amount: -10 })
    expect(result.success).toBe(false)
  })

  it('rejette un montant à 0', () => {
    const result = RequestItemSchema.safeParse({ ...validRequest, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejette une devise trop longue', () => {
    const result = RequestItemSchema.safeParse({ ...validRequest, currency: 'EURO' })
    expect(result.success).toBe(false)
  })

  it('rejette un type invalide', () => {
    const result = RequestItemSchema.safeParse({ ...validRequest, type: 'TRANSFER' })
    expect(result.success).toBe(false)
  })

  it('rejette un status invalide', () => {
    const result = RequestItemSchema.safeParse({ ...validRequest, status: 'DELETED' })
    expect(result.success).toBe(false)
  })

  it('accepte tous les types valides', () => {
    expect(RequestItemSchema.safeParse({ ...validRequest, type: 'SEND' }).success).toBe(true)
    expect(RequestItemSchema.safeParse({ ...validRequest, type: 'RECEIVE' }).success).toBe(true)
  })

  it('accepte tous les status valides', () => {
    expect(RequestItemSchema.safeParse({ ...validRequest, status: 'OPEN' }).success).toBe(true)
    expect(RequestItemSchema.safeParse({ ...validRequest, status: 'MATCHED' }).success).toBe(true)
    expect(RequestItemSchema.safeParse({ ...validRequest, status: 'CLOSED' }).success).toBe(true)
  })
})

describe('MatchItemSchema', () => {
  const validMatch = {
    id: 'match_1',
    counterpartName: 'Jean Dupont',
    amount: 200,
    currency: 'EUR',
    corridor: 'FR → SN',
    status: 'PENDING',
  }

  it('valide des données correctes', () => {
    const result = MatchItemSchema.safeParse(validMatch)
    expect(result.success).toBe(true)
  })

  it('rejette un montant négatif', () => {
    const result = MatchItemSchema.safeParse({ ...validMatch, amount: -5 })
    expect(result.success).toBe(false)
  })

  it('accepte tous les status valides', () => {
    expect(MatchItemSchema.safeParse({ ...validMatch, status: 'PENDING' }).success).toBe(true)
    expect(MatchItemSchema.safeParse({ ...validMatch, status: 'ACCEPTED' }).success).toBe(true)
    expect(MatchItemSchema.safeParse({ ...validMatch, status: 'EXPIRED' }).success).toBe(true)
  })
})

describe('SuggestedItemSchema', () => {
  const validSuggestion = {
    id: 'sug_1',
    amount: 150,
    currency: 'EUR',
    originCountryName: 'France',
    destCountryName: 'Sénégal',
    senderName: 'Marie Martin',
    createdAt: Date.now(),
  }

  it('valide des données correctes', () => {
    const result = SuggestedItemSchema.safeParse(validSuggestion)
    expect(result.success).toBe(true)
  })

  it('accepte les champs optionnels', () => {
    const result = SuggestedItemSchema.safeParse({
      ...validSuggestion,
      note: 'Transfert urgent',
      isAccepted: true,
      conversationId: 'conv_1',
    })
    expect(result.success).toBe(true)
  })

  it('fonctionne sans les champs optionnels', () => {
    const result = SuggestedItemSchema.safeParse(validSuggestion)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.note).toBeUndefined()
      expect(result.data.isAccepted).toBeUndefined()
    }
  })
})

describe('UserSchema', () => {
  const validUser = {
    id: 'user_1',
    name: 'Jean Dupont',
    kycStatus: 'unverified',
    ratingAvg: 4.2,
  }

  it('valide des données correctes', () => {
    const result = UserSchema.safeParse(validUser)
    expect(result.success).toBe(true)
  })

  it('rejette un kycStatus invalide', () => {
    const result = UserSchema.safeParse({ ...validUser, kycStatus: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('accepte tous les kycStatus valides', () => {
    expect(KycStatusSchema.safeParse('unverified').success).toBe(true)
    expect(KycStatusSchema.safeParse('pending').success).toBe(true)
    expect(KycStatusSchema.safeParse('verified').success).toBe(true)
  })

  it('rejette un rating négatif', () => {
    const result = UserSchema.safeParse({ ...validUser, ratingAvg: -1 })
    expect(result.success).toBe(false)
  })

  it('rejette un rating au-dessus de 5', () => {
    const result = UserSchema.safeParse({ ...validUser, ratingAvg: 6 })
    expect(result.success).toBe(false)
  })

  it('accepte un avatarUrl optionnel', () => {
    const result = UserSchema.safeParse({
      ...validUser,
      avatarUrl: 'https://example.com/avatar.jpg',
    })
    expect(result.success).toBe(true)
  })
})

describe('ConversationSchema', () => {
  const validConversation = {
    id: 'conv_1',
    counterpartName: 'Jean Dupont',
    lastMessage: 'Bonjour !',
    updatedAt: Date.now(),
    unreadCount: 0,
  }

  it('valide des données correctes', () => {
    const result = ConversationSchema.safeParse(validConversation)
    expect(result.success).toBe(true)
  })

  it('rejette un unreadCount négatif', () => {
    const result = ConversationSchema.safeParse({ ...validConversation, unreadCount: -1 })
    expect(result.success).toBe(false)
  })

  it('accepte matchDetails optionnel', () => {
    const result = ConversationSchema.safeParse({
      ...validConversation,
      matchDetails: {
        amount: 100,
        currency: 'EUR',
        corridor: 'FR → SN',
      },
    })
    expect(result.success).toBe(true)
  })
})

describe('MessageSchema', () => {
  const validMessage = {
    id: 'msg_1',
    conversationId: 'conv_1',
    senderId: 'user_1',
    content: 'Bonjour !',
    createdAt: Date.now(),
    isRead: false,
  }

  it('valide des données correctes', () => {
    const result = MessageSchema.safeParse(validMessage)
    expect(result.success).toBe(true)
  })

  it('rejette sans conversationId', () => {
    const { conversationId: _, ...incomplete } = validMessage
    const result = MessageSchema.safeParse(incomplete)
    expect(result.success).toBe(false)
  })
})
