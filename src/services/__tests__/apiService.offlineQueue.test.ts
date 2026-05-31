/**
 * Tests du comportement de la file d'actions hors ligne de ApiService.
 *
 * Couvre le durcissement récent de la file :
 *  (a) garde anti-réentrance `isProcessingQueue` (deux vidages concurrents
 *      ne traitent pas deux fois la même action),
 *  (b) suppression d'une action de la file persistée UNIQUEMENT après un ack
 *      serveur réussi (les échecs restent en file pour réessai).
 *
 * jest.setup.js mocke globalement '@/services/apiService' ; on le démocke ici
 * pour tester la vraie classe. AsyncStorage est remplacé par un mock en mémoire
 * (stateful) afin d'observer le contenu réel de la file après traitement.
 */

// On veut la VRAIE implémentation de ApiService (le setup global la mocke).
jest.unmock('@/services/apiService')

// Mock AsyncStorage stateful en mémoire (le mock global renvoie toujours null).
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {}
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
        return Promise.resolve()
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
        return Promise.resolve()
      }),
    },
  }
})

import AsyncStorage from '@react-native-async-storage/async-storage'
import { ApiService, OfflineAction, CreateRequestAction } from '@/services/apiService'

const QUEUE_KEY = 'offline_queue'

/** Construit une action CREATE_REQUEST avec un timestamp donné (clé de dédup serveur). */
function makeCreateRequestAction(timestamp: number, amount: number): CreateRequestAction {
  return {
    type: 'CREATE_REQUEST',
    userId: 'user-1',
    timestamp,
    payload: {
      type: 'SEND',
      amount,
      currency: 'EUR',
      originCountry: 'France',
      destCountry: 'Maroc',
    },
  }
}

/** Écrit directement une file dans le AsyncStorage mocké. */
async function seedQueue(actions: OfflineAction[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(actions))
}

/** Relit la file persistée depuis le AsyncStorage mocké. */
async function readQueue(): Promise<OfflineAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY)
  return raw ? (JSON.parse(raw) as OfflineAction[]) : []
}

describe('ApiService - file d’actions hors ligne', () => {
  beforeEach(async () => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
    // Repartir d'une file vide et d'une garde réinitialisée entre chaque test.
    await AsyncStorage.removeItem(QUEUE_KEY)
    // isProcessingQueue est privé statique ; on le remet à false par sécurité
    // si un test précédent l'avait laissé bloqué.
    ;(ApiService as unknown as { isProcessingQueue: boolean }).isProcessingQueue = false
  })

  it('retire de la file une action acquittée avec succès par le serveur', async () => {
    const createRequest = jest.spyOn(ApiService, 'createRequest').mockResolvedValue({} as never)

    await seedQueue([makeCreateRequestAction(1000, 100)])

    await ApiService.processOfflineQueue()

    expect(createRequest).toHaveBeenCalledTimes(1)
    expect(createRequest).toHaveBeenCalledWith('user-1', expect.objectContaining({ amount: 100 }))

    // L'action acquittée doit avoir disparu de la file persistée.
    expect(await readQueue()).toEqual([])
  })

  it('conserve dans la file une action en échec (pour réessai), sans la perdre', async () => {
    // Échec serveur : la méthode rejette.
    const createRequest = jest
      .spyOn(ApiService, 'createRequest')
      .mockRejectedValue(new Error('network down'))

    const failing = makeCreateRequestAction(2000, 250)
    await seedQueue([failing])

    await ApiService.processOfflineQueue()

    expect(createRequest).toHaveBeenCalledTimes(1)

    // L'action en échec NE doit PAS être supprimée : elle reste pour un réessai.
    const remaining = await readQueue()
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toMatchObject({ type: 'CREATE_REQUEST', timestamp: 2000 })
  })

  it('ne supprime que les actions acquittées et garde celles en échec (file mixte)', async () => {
    const ok = makeCreateRequestAction(3000, 10)
    const ko = makeCreateRequestAction(4000, 20)
    await seedQueue([ok, ko])

    jest.spyOn(ApiService, 'createRequest').mockImplementation(async (_userId, payload) => {
      // La 2e action (montant 20) échoue, la 1re (montant 10) réussit.
      if (payload.amount === 20) throw new Error('boom')
      return {} as never
    })

    await ApiService.processOfflineQueue()

    const remaining = await readQueue()
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toMatchObject({ timestamp: 4000, payload: { amount: 20 } })
  })

  it('garde anti-réentrance : deux vidages concurrents ne traitent pas deux fois la même action', async () => {
    // createRequest renvoie une promesse contrôlable manuellement : tant qu'elle
    // n'est pas résolue, le premier processOfflineQueue() reste "en cours".
    let resolveCall: (value: unknown) => void = () => {}
    const gate = new Promise((resolve) => {
      resolveCall = resolve
    })

    const createRequest = jest
      .spyOn(ApiService, 'createRequest')
      .mockImplementation(() => gate as Promise<never>)

    await seedQueue([makeCreateRequestAction(5000, 500)])

    // Démarrer un premier vidage (il se bloque sur `gate`, isProcessingQueue=true).
    const first = ApiService.processOfflineQueue()
    // Laisser la microtâche initiale s'exécuter pour que la garde soit posée.
    await Promise.resolve()

    // Un deuxième vidage concurrent doit être ignoré par la garde et finir aussitôt.
    await ApiService.processOfflineQueue()

    // À ce stade, l'action n'a été traitée qu'une seule fois (par le 1er vidage).
    expect(createRequest).toHaveBeenCalledTimes(1)

    // Débloquer le serveur et laisser le 1er vidage se terminer.
    resolveCall({})
    await first

    // Toujours un seul appel : pas de double traitement de la même action.
    expect(createRequest).toHaveBeenCalledTimes(1)
    // Et l'action ayant été acquittée, la file est vide.
    expect(await readQueue()).toEqual([])
  })
})
