# Guide d'Intégration des Données Dynamiques - BinomePay

## Vue d'ensemble

L'application BinomePay a été préparée pour fonctionner avec des données dynamiques via une API REST. Le système utilise une approche hybride avec fallback vers des données mock en cas d'indisponibilité de l'API.

## Architecture

### Services créés

1. **`src/services/apiService.ts`** - Service principal pour les appels API
2. **`src/services/syncService.ts`** - Service de synchronisation automatique
3. **`src/hooks/useDataSync.ts`** - Hook React pour la gestion de la synchronisation
4. **`src/components/ConnectionStatus.tsx`** - Indicateur de statut de connexion

### Composants UI

1. **`src/components/LoadingSpinner.tsx`** - Composants de chargement
2. **`src/components/ErrorState.tsx`** - Composants de gestion d'erreur

## Configuration

### Variables d'environnement

Configurez votre fichier `.env` avec les variables suivantes :

```bash
# API Backend
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Supabase (optionnel)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Mode développement avec fallback mock
EXPO_PUBLIC_MOCK_API=true
NODE_ENV=development
```

### Points d'API requis

Votre backend doit implémenter les endpoints suivants :

#### Utilisateurs
- `GET /users/{userId}` - Profil utilisateur
- `PUT /users/{userId}` - Mise à jour profil
- `POST /users/{userId}/avatar` - Upload avatar

#### Intentions (Requests)
- `GET /users/{userId}/requests` - Liste des intentions
- `POST /users/{userId}/requests` - Créer une intention
- `PATCH /requests/{requestId}/status` - Mettre à jour statut

#### Suggestions
- `GET /users/{userId}/suggestions` - Suggestions pour l'utilisateur
- `POST /suggestions/{suggestionId}/accept` - Accepter une suggestion

#### Matches
- `GET /users/{userId}/matches` - Matches de l'utilisateur
- `PATCH /matches/{matchId}/status` - Mettre à jour statut match

#### Conversations
- `GET /users/{userId}/conversations` - Liste des conversations
- `GET /conversations/{conversationId}/messages` - Messages
- `POST /conversations/{conversationId}/messages` - Envoyer message
- `POST /conversations/{conversationId}/read` - Marquer comme lu

#### Synchronisation
- `GET /users/{userId}/sync` - Synchronisation complète
- `GET /health` - Vérification santé API

## Fonctionnalités implémentées

### 1. Synchronisation automatique
- Synchronisation périodique toutes les 30 secondes
- Synchronisation au retour de connexion
- Queue d'actions hors ligne

### 2. États de chargement
- Indicateurs de chargement pour chaque section
- États d'erreur avec boutons de retry
- Pull-to-refresh sur la page principale

### 3. Gestion hors ligne
- Actions mises en queue automatiquement
- Synchronisation à la reconnexion
- Indicateur de statut de connexion

### 4. Optimistic UI
- Mise à jour immédiate de l'interface
- Rollback en cas d'erreur API
- Feedback visuel pour les actions

## Migration graduelle

Le système est conçu pour une migration graduelle :

1. **Phase 1** (Actuelle) : Mock data avec structure API
2. **Phase 2** : Intégration API avec fallback mock
3. **Phase 3** : API complète avec cache local
4. **Phase 4** : API + WebSocket temps réel

## Tests et Débogage

### Mode développement

Activez `EXPO_PUBLIC_MOCK_API=true` pour utiliser les données mock en développement.

### Logs disponibles

- `console.log` pour les actions de synchronisation
- Erreurs API loggées automatiquement
- État de connexion visible dans l'UI

### Composants de test

```tsx
// Test des états de chargement
<LoadingSpinner message="Test..." />
<LoadingCard />
<LoadingScreen />

// Test des états d'erreur
<ErrorState message="Test erreur" onRetry={() => {}} />
<NetworkError onRetry={() => {}} />
<ApiError onRetry={() => {}} />
```

## Prochaines étapes

1. **Configurer votre backend API** selon les endpoints décrits
2. **Tester l'intégration** en définissant `EXPO_PUBLIC_MOCK_API=false`
3. **Implementer WebSocket** pour les mises à jour temps réel
4. **Optimiser** les performances avec mise en cache avancée

## Support et Migration

L'application continuera de fonctionner avec les données mock même sans backend configuré. La transition vers l'API se fait de manière transparente en modifiant simplement les variables d'environnement.