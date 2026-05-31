/**
 * Régression: crash au démarrage de l'APK quand la config Supabase n'est pas injectée.
 *
 * Cause racine (build EAS preview): le profil de build ne liait pas son "environment"
 * dans eas.json, donc SUPABASE_URL/ANON_KEY arrivaient à `undefined` et createClient
 * levait une exception à l'import → l'app se fermait instantanément (avant tout rendu
 * React, hors de portée de l'ErrorBoundary).
 *
 * Ces tests verrouillent le garde-fou de src/lib/supabase.ts: une config manquante
 * doit lever un message explicite et diagnosticable, pas un crash cryptique.
 */

describe('lib/supabase — garde-fou de configuration au démarrage', () => {
  const ORIGINAL_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
  const ORIGINAL_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

  afterEach(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = ORIGINAL_URL
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = ORIGINAL_KEY
    jest.resetModules()
  })

  it("lève une erreur explicite quand l'URL et la clé sont absentes", () => {
    jest.resetModules()
    jest.doMock('expo-constants', () => ({ default: { expoConfig: { extra: {} } } }))
    delete process.env.EXPO_PUBLIC_SUPABASE_URL
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

    expect(() => require('../supabase')).toThrow(/Configuration Supabase manquante/)
  })

  it('signale précisément quelle variable manque (ANON_KEY)', () => {
    jest.resetModules()
    jest.doMock('expo-constants', () => ({ default: { expoConfig: { extra: {} } } }))
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

    expect(() => require('../supabase')).toThrow(/SUPABASE_ANON_KEY=MANQUANT/)
  })

  it('crée le client sans lever quand la config est présente via process.env', () => {
    jest.resetModules()
    jest.doMock('expo-constants', () => ({ default: { expoConfig: { extra: {} } } }))
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    let mod: typeof import('../supabase') | undefined
    expect(() => {
      mod = require('../supabase')
    }).not.toThrow()
    expect(mod?.supabase).toBeDefined()
  })

  it('lit la config depuis expoConfig.extra (chemin build EAS)', () => {
    // Le mock global d'expo-constants (jest.setup.js) expose un objet stable: on
    // injecte la config dans son `extra` pour simuler app.config.ts au build EAS,
    // sans variables process.env (cas exact du build où seul `extra` porte la config).
    delete process.env.EXPO_PUBLIC_SUPABASE_URL
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

    jest.isolateModules(() => {
      // Contrôle total d'expo-constants dans ce registre isolé (forme ES-module
      // explicite pour éviter les surprises d'interop default de babel).
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: {
          expoConfig: {
            extra: {
              SUPABASE_URL: 'https://extra.supabase.co',
              SUPABASE_ANON_KEY: 'extra-anon-key',
            },
          },
        },
      }))
      expect(() => require('../supabase')).not.toThrow()
    })
  })
})
