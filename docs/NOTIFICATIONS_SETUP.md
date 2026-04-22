# Configuration des notifications push — BinomePay

Ce document décrit les étapes manuelles à réaliser pour activer les notifications push en production.

## Architecture

```
Event DB (messages INSERT / matches ACCEPTED)
    └─> Trigger PostgreSQL (queue_push_notification)
        └─> pg_net.http_post (async, non bloquant)
            └─> Edge Function send-push-notification
                └─> Expo Push API (https://exp.host/--/api/v2/push/send)
                    ├─> APNs (iOS)
                    └─> FCM (Android)
```

- **Table `public.push_tokens`** : stocke les tokens Expo Push par device (RLS self-only via Clerk JWT)
- **Edge Function `send-push-notification`** : batch 100, cleanup auto des tokens `DeviceNotRegistered`
- **Triggers DB** : `messages_push_notification`, `matches_accepted_push_notification`

---

## Étape 1 — Créer le projet Firebase (Android + iOS)

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com/), cliquer **Ajouter un projet**.
2. Nom du projet : `BinomePay`.
3. Désactiver Google Analytics (pas nécessaire pour FCM).

### 1.a — Ajouter l'app Android

4. Dans le projet, cliquer sur l'icône Android.
5. **Package name** : `com.binomepay.app` (doit correspondre exactement à `app.config.ts`).
6. Télécharger `google-services.json` et le placer à la **racine du projet** (à côté de `app.config.ts`). Ce fichier est dans `.gitignore` et ne doit **jamais** être commité.

### 1.b — Ajouter l'app iOS

7. Toujours dans Firebase, cliquer **Ajouter une app > iOS**.
8. **Bundle ID** : `com.binomepay.app`.
9. Télécharger `GoogleService-Info.plist` et le placer à la **racine du projet**. Gitignoré aussi.

---

## Étape 2 — Clé FCM V1 (Android) vers EAS

Google exige FCM pour la livraison des pushs Android. Expo Push Service s'appuie sur FCM en interne.

1. Firebase Console → **Paramètres du projet** (engrenage) → onglet **Comptes de service**.
2. Cliquer **Générer une nouvelle clé privée** → télécharge un JSON.
3. Uploader ce JSON vers EAS :
   ```bash
   eas credentials
   # Choisir: Android > production > Google Service Account Key for Push Notifications (FCM V1)
   # Coller le chemin du JSON téléchargé
   ```

> La même commande fonctionne pour les profils `preview` et `development`.

---

## Étape 3 — Clé APNs (iOS) vers EAS

1. Aller sur [developer.apple.com](https://developer.apple.com/) → **Certificates, Identifiers & Profiles** → **Keys**.
2. Cliquer **+**, cocher **Apple Push Notifications service (APNs)**, Continue → Register.
3. Télécharger le fichier `.p8` (téléchargeable **une seule fois** — conserve-le en lieu sûr).
4. Noter le **Key ID** affiché + ton **Team ID** (visible en haut à droite du compte Apple Developer).
5. Uploader vers EAS :
   ```bash
   eas credentials
   # Choisir: iOS > production > Push Notifications: Manage your Apple Push Notifications Key
   # Upload .p8, coller Key ID + Team ID
   ```

---

## Étape 4 — Stocker le service_role_key dans Supabase Vault

Les triggers DB appellent l'Edge Function via `pg_net`. Ils lisent le `service_role_key` depuis `vault.decrypted_secrets` (nom `app_service_role_key`).

1. Récupère ton `service_role_key` :
   - Dashboard Supabase → **Project Settings** → **API** → copier `service_role` (❗ JAMAIS l'exposer côté client)
2. Dans le SQL Editor Supabase, exécuter **une seule fois** :
   ```sql
   SELECT vault.create_secret(
     '<colle-ici-ton-service-role-key>',
     'app_service_role_key',
     'Service role key utilisée par les triggers push pour appeler l''Edge Function'
   );
   ```
3. Vérifier :
   ```sql
   SELECT name, created_at FROM vault.secrets WHERE name = 'app_service_role_key';
   ```

> Si tu dois rotate le secret plus tard, utilise `vault.update_secret(secret_id, new_value)`.

---

## Étape 5 — Build EAS

La configuration est automatique : `app.config.ts` référence `./google-services.json` et `./GoogleService-Info.plist` à la racine, ou des env vars `GOOGLE_SERVICES_JSON` / `GOOGLE_SERVICES_PLIST` pour les builds EAS si tu préfères les injecter via secrets EAS.

```bash
# Build Android (preview APK)
npm run build:android:preview

# Build Android (production AAB)
npm run build:android:production

# Build iOS (à configurer dans eas.json si besoin)
eas build --platform ios --profile production
```

---

## Étape 6 — Tester

### Test rapide côté Edge Function

Pour valider que l'Edge Function + les tokens fonctionnent, depuis ton app en local (avec un user connecté) :

```ts
import { supabase } from '@/lib/supabase'
import { useAuth } from '@clerk/clerk-expo'

const { getToken } = useAuth()
const jwt = await getToken({ template: 'supabase' })

await fetch('https://olvmbrmgvpgoejjjpnql.supabase.co/functions/v1/send-push-notification', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: '<ton-clerk-id>',
    title: 'Test push',
    body: 'Ça marche ?',
    type: 'new_message',
  }),
})
```

Un utilisateur ne peut envoyer que vers lui-même (la fonction vérifie `jwt.sub === user_id`). Les triggers DB passent en `service_role` et peuvent notifier n'importe qui.

### Test par trigger

- Créer un match entre deux comptes de test → les deux users doivent recevoir une push `match_accepted`
- Envoyer un message dans une conversation → le destinataire doit recevoir une push `new_message`

### Logs

```bash
# Logs de l'Edge Function
# Dashboard Supabase → Edge Functions → send-push-notification → Logs

# Logs pg_net (depuis SQL Editor)
SELECT id, status_code, content, error_msg
FROM net._http_response
ORDER BY created DESC
LIMIT 20;
```

---

## Pré-requis physiques

- **Les push ne fonctionnent PAS sur Expo Go.** Il faut un dev build ou un build production.
- **Les push ne fonctionnent PAS sur simulateur/émulateur.** Il faut un device physique.
- `pushTokenService.getExpoPushToken` retourne `null` dans ces deux cas (détection automatique via `Constants.appOwnership` + `Device.isDevice`).

---

## Check-list de déploiement

- [ ] `google-services.json` à la racine (gitignored)
- [ ] `GoogleService-Info.plist` à la racine (gitignored)
- [ ] Clé FCM V1 uploadée via `eas credentials`
- [ ] Clé APNs `.p8` uploadée via `eas credentials`
- [ ] Secret `app_service_role_key` créé dans Supabase Vault
- [ ] Build EAS testé sur un device physique
- [ ] Notification reçue sur envoi de message entre 2 comptes de test
