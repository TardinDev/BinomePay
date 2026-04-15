import useAppStore from '../useAppStore'

// Reset le store avant chaque test
beforeEach(() => {
  useAppStore.getState().reset()
})

describe('useAppStore - état initial', () => {
  it('a un user null par défaut', () => {
    expect(useAppStore.getState().user).toBeNull()
  })

  it('a 0 notifications par défaut', () => {
    expect(useAppStore.getState().notifications).toBe(0)
  })

  it('a des listes vides par défaut', () => {
    const state = useAppStore.getState()
    expect(state.requests).toEqual([])
    expect(state.matches).toEqual([])
    expect(state.conversations).toEqual([])
    expect(state.suggested).toEqual([])
  })

  it('a les loading states à false', () => {
    const state = useAppStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.isLoadingRequests).toBe(false)
    expect(state.isLoadingMatches).toBe(false)
    expect(state.isLoadingSuggested).toBe(false)
    expect(state.isAcceptingMatch).toBe(false)
    expect(state.isSendingMessage).toBe(false)
    expect(state.isCreatingIntention).toBe(false)
  })

  it('a error null par défaut', () => {
    expect(useAppStore.getState().error).toBeNull()
  })
})

describe('useAppStore - setUser', () => {
  it('définit un utilisateur', () => {
    const user = {
      id: 'user_1',
      name: 'Jean Dupont',
      kycStatus: 'unverified' as const,
      ratingAvg: 4.0,
    }
    useAppStore.getState().setUser(user)
    expect(useAppStore.getState().user).toEqual(user)
  })

  it('peut remettre user à null', () => {
    useAppStore.getState().setUser({
      id: 'user_1',
      name: 'Jean',
      kycStatus: 'verified',
      ratingAvg: 5,
    })
    useAppStore.getState().setUser(null)
    expect(useAppStore.getState().user).toBeNull()
  })
})

describe('useAppStore - notifications', () => {
  it('incrémente les notifications', () => {
    useAppStore.getState().incrementNotifications()
    expect(useAppStore.getState().notifications).toBe(1)
    useAppStore.getState().incrementNotifications()
    expect(useAppStore.getState().notifications).toBe(2)
  })

  it('remet les notifications à 0', () => {
    useAppStore.getState().incrementNotifications()
    useAppStore.getState().incrementNotifications()
    useAppStore.getState().clearNotifications()
    expect(useAppStore.getState().notifications).toBe(0)
  })
})

describe('useAppStore - conversations', () => {
  it('marque une conversation comme lue', () => {
    // Ajouter une conversation avec unreadCount > 0
    const convId = useAppStore.getState().addConversation({
      counterpartName: 'Marie',
      lastMessage: 'Salut',
      updatedAt: Date.now(),
      unreadCount: 3,
    })

    useAppStore.getState().markConversationRead(convId)

    const conv = useAppStore.getState().conversations.find((c) => c.id === convId)
    expect(conv?.unreadCount).toBe(0)
  })

  it('addConversation retourne un id', () => {
    const id = useAppStore.getState().addConversation({
      counterpartName: 'Pierre',
      lastMessage: 'Test',
      updatedAt: Date.now(),
      unreadCount: 0,
    })

    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('ajoute la conversation en début de liste', () => {
    useAppStore.getState().addConversation({
      counterpartName: 'Premier',
      lastMessage: 'A',
      updatedAt: Date.now(),
      unreadCount: 0,
    })
    useAppStore.getState().addConversation({
      counterpartName: 'Deuxième',
      lastMessage: 'B',
      updatedAt: Date.now(),
      unreadCount: 0,
    })

    const conversations = useAppStore.getState().conversations
    expect(conversations[0].counterpartName).toBe('Deuxième')
    expect(conversations[1].counterpartName).toBe('Premier')
  })
})

describe('useAppStore - suggestions', () => {
  it('supprime une suggestion par ID', () => {
    useAppStore.getState().addSuggested({
      amount: 100,
      currency: 'EUR',
      originCountryName: 'France',
      destCountryName: 'Sénégal',
      senderName: 'Marie',
      createdAt: Date.now(),
    })

    const sugId = useAppStore.getState().suggested[0].id
    useAppStore.getState().removeSuggestion(sugId)
    expect(useAppStore.getState().suggested).toHaveLength(0)
  })

  it('ajoute une suggestion en début de liste', () => {
    useAppStore.getState().addSuggested({
      amount: 100,
      currency: 'EUR',
      originCountryName: 'France',
      destCountryName: 'Sénégal',
      senderName: 'Marie',
      createdAt: Date.now(),
    })
    useAppStore.getState().addSuggested({
      amount: 200,
      currency: 'USD',
      originCountryName: 'Canada',
      destCountryName: 'Mali',
      senderName: 'Pierre',
      createdAt: Date.now(),
    })

    expect(useAppStore.getState().suggested[0].senderName).toBe('Pierre')
    expect(useAppStore.getState().suggested[1].senderName).toBe('Marie')
  })
})

describe('useAppStore - matches', () => {
  it('setMatches remplace la liste', () => {
    const matches = [
      {
        id: 'match_1',
        counterpartName: 'Jean',
        amount: 100,
        currency: 'EUR',
        corridor: 'FR → SN',
        status: 'PENDING' as const,
      },
    ]
    useAppStore.getState().setMatches(matches)
    expect(useAppStore.getState().matches).toEqual(matches)
  })

  it('setMatches peut vider la liste', () => {
    useAppStore.getState().setMatches([
      {
        id: 'match_1',
        counterpartName: 'Jean',
        amount: 100,
        currency: 'EUR',
        corridor: 'FR → SN',
        status: 'ACCEPTED',
      },
    ])
    useAppStore.getState().setMatches([])
    expect(useAppStore.getState().matches).toEqual([])
  })
})

describe('useAppStore - loading/error states', () => {
  it('setLoading met à jour isLoading', () => {
    useAppStore.getState().setLoading(true)
    expect(useAppStore.getState().isLoading).toBe(true)
    useAppStore.getState().setLoading(false)
    expect(useAppStore.getState().isLoading).toBe(false)
  })

  it('setError met à jour error', () => {
    useAppStore.getState().setError('Test error')
    expect(useAppStore.getState().error).toBe('Test error')
    useAppStore.getState().setError(null)
    expect(useAppStore.getState().error).toBeNull()
  })

  it('setLoggingOut met à jour isLoggingOut', () => {
    useAppStore.getState().setLoggingOut(true)
    expect(useAppStore.getState().isLoggingOut).toBe(true)
  })

  it('setAcceptingMatch met à jour isAcceptingMatch', () => {
    useAppStore.getState().setAcceptingMatch(true)
    expect(useAppStore.getState().isAcceptingMatch).toBe(true)
  })

  it('setSendingMessage met à jour isSendingMessage', () => {
    useAppStore.getState().setSendingMessage(true)
    expect(useAppStore.getState().isSendingMessage).toBe(true)
  })

  it('setCreatingIntention met à jour isCreatingIntention', () => {
    useAppStore.getState().setCreatingIntention(true)
    expect(useAppStore.getState().isCreatingIntention).toBe(true)
  })
})

describe('useAppStore - reset', () => {
  it('remet tout à zéro', () => {
    // Modifier l'état
    useAppStore.getState().setUser({
      id: '1',
      name: 'Jean',
      kycStatus: 'verified',
      ratingAvg: 5,
    })
    useAppStore.getState().incrementNotifications()
    useAppStore.getState().setLoading(true)
    useAppStore.getState().setError('test error')
    useAppStore.getState().setMatches([
      {
        id: 'm1',
        counterpartName: 'X',
        amount: 1,
        currency: 'EUR',
        corridor: 'A',
        status: 'PENDING',
      },
    ])

    // Reset
    useAppStore.getState().reset()

    const state = useAppStore.getState()
    expect(state.user).toBeNull()
    expect(state.notifications).toBe(0)
    expect(state.requests).toEqual([])
    expect(state.matches).toEqual([])
    expect(state.conversations).toEqual([])
    expect(state.suggested).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.isLoggingOut).toBe(false)
  })
})
