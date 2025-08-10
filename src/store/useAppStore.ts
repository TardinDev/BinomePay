import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'

export type KycStatus = 'unverified' | 'pending' | 'verified'

export type User = {
  id: string
  name: string
  kycStatus: KycStatus
  ratingAvg: number
}

export type RequestItem = {
  id: string
  type: 'SEND' | 'RECEIVE'
  amount: number
  currency: string
  originCountry: string
  destCountry: string
  status: 'OPEN' | 'MATCHED' | 'CLOSED'
}

export type MatchItem = {
  id: string
  counterpartName: string
  amount: number
  currency: string
  corridor: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED'
}

export type Conversation = {
  id: string
  counterpartName: string
  lastMessage: string
  updatedAt: number
  unreadCount: number
}

export type SuggestedItem = {
  id: string
  amount: number
  currency: string
  destCountryName: string
  senderName: string
  note?: string
  createdAt: number
}

type AppState = {
  user: User | null
  notifications: number
  requests: RequestItem[]
  matches: MatchItem[]
  conversations: Conversation[]
  suggested: SuggestedItem[]
  setUser: (user: User | null) => void
  incrementNotifications: () => void
  clearNotifications: () => void
  addRequest: (r: Omit<RequestItem, 'id' | 'status'> & { type: 'SEND' | 'RECEIVE' }) => void
  setMatches: (items: MatchItem[]) => void
  markConversationRead: (id: string) => void
}

const useAppStore = create<AppState>((set, get) => ({
  user: {
    id: 'u_1',
    name: 'Tardin',
    kycStatus: 'verified',
    ratingAvg: 4.8,
  },
  notifications: 2,
  requests: [
    {
      id: 'r_1',
      type: 'SEND',
      amount: 150,
      currency: 'EUR',
      originCountry: 'France',
      destCountry: 'Sénégal',
      status: 'OPEN',
    },
  ],
  matches: [
    { id: 'm_1', counterpartName: 'Moussa D.', amount: 150, currency: 'EUR', corridor: 'FR → SN', status: 'PENDING' },
    { id: 'm_2', counterpartName: 'Awa S.', amount: 200, currency: 'EUR', corridor: 'FR → CI', status: 'PENDING' },
    { id: 'm_3', counterpartName: 'Koffi A.', amount: 120, currency: 'EUR', corridor: 'FR → CI', status: 'ACCEPTED' },
    { id: 'm_4', counterpartName: 'Fatou N.', amount: 90, currency: 'EUR', corridor: 'FR → SN', status: 'PENDING' },
    { id: 'm_5', counterpartName: 'Yassine M.', amount: 300, currency: 'EUR', corridor: 'FR → MA', status: 'EXPIRED' },
  ],
  suggested: [
    { id: 's_1', amount: 200, currency: 'EUR', destCountryName: 'Côte d’Ivoire', senderName: 'Fatou N.', createdAt: Date.now() - 1000 * 60 * 5 },
    { id: 's_2', amount: 120, currency: 'EUR', destCountryName: 'Sénégal', senderName: 'Jean P.', createdAt: Date.now() - 1000 * 60 * 12 },
    { id: 's_3', amount: 90, currency: 'EUR', destCountryName: 'Maroc', senderName: 'Yassine M.', createdAt: Date.now() - 1000 * 60 * 25 },
    { id: 's_4', amount: 300, currency: 'EUR', destCountryName: 'Cameroun', senderName: 'Brice K.', createdAt: Date.now() - 1000 * 60 * 33 },
    { id: 's_5', amount: 75, currency: 'EUR', destCountryName: 'République Démocratique du Congo', senderName: 'Aline T.', createdAt: Date.now() - 1000 * 60 * 44 },
    { id: 's_6', amount: 250, currency: 'EUR', destCountryName: 'Bénin', senderName: 'Rachid O.', createdAt: Date.now() - 1000 * 60 * 58 },
    { id: 's_7', amount: 180, currency: 'EUR', destCountryName: 'Togo', senderName: 'Komi A.', createdAt: Date.now() - 1000 * 60 * 61 },
    { id: 's_8', amount: 60, currency: 'EUR', destCountryName: 'Guinée', senderName: 'Ibrahima D.', createdAt: Date.now() - 1000 * 60 * 70 },
    { id: 's_9', amount: 220, currency: 'EUR', destCountryName: 'Mali', senderName: 'Aïssata C.', createdAt: Date.now() - 1000 * 60 * 85 },
    { id: 's_10', amount: 140, currency: 'EUR', destCountryName: 'Burkina Faso', senderName: 'Paul K.', createdAt: Date.now() - 1000 * 60 * 100 },
  ],
  conversations: [
    {
      id: 'c_1',
      counterpartName: 'Moussa D.',
      lastMessage: 'On se retrouve à 18h à la station…',
      updatedAt: Date.now() - 1000 * 60 * 20,
      unreadCount: 2,
    },
    {
      id: 'c_2',
      counterpartName: 'Awa S.',
      lastMessage: 'Parfait, je confirme demain matin.',
      updatedAt: Date.now() - 1000 * 60 * 90,
      unreadCount: 0,
    },
  ],
  setUser: (user) => set({ user }),
  incrementNotifications: () => set((s) => ({ notifications: s.notifications + 1 })),
  clearNotifications: () => set({ notifications: 0 }),
  addRequest: ({ type, amount, currency, originCountry, destCountry }) =>
    set((s) => ({
      requests: [
        ...s.requests,
        {
          id: nanoid(8),
          type,
          amount,
          currency,
          originCountry,
          destCountry,
          status: 'OPEN',
        },
      ],
    })),
  setMatches: (items) => set({ matches: items }),
  markConversationRead: (id) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    })),
}))

export default useAppStore


