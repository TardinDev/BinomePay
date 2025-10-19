# 🌍 BinomePay

**L'application qui révolutionne le change de devises entre particuliers**

BinomePay met en relation des personnes qui souhaitent échanger des devises localement, pour éviter les frais bancaires et obtenir des taux avantageux.

[![React Native](https://img.shields.io/badge/React%20Native-0.79-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

## 📱 Fonctionnalités

- 🔐 **Authentification sécurisée** avec Clerk
- 💱 **Matching intelligent** des intentions d'échange
- 💬 **Messagerie intégrée** en temps réel
- 🏆 **Système de notation** et réputation
- 📊 **Tableaux de bord** avec historique des transactions
- 🔍 **Vérification KYC** obligatoire
- 🌐 **Support multi-devises** et multi-pays
- 🔔 **Notifications push** pour les nouveaux matchs et messages

## 🛠️ Stack technique

### Frontend
- **React Native 0.79** - Framework mobile cross-platform
- **Expo SDK 53** - Toolchain et services
- **Expo Router** - Navigation file-based avec routes protégées
- **NativeWind** - Tailwind CSS pour React Native
- **TypeScript 5.8** - Type safety avec mode strict

### Backend & Services
- **Supabase** - Base de données PostgreSQL avec real-time
- **Clerk** - Authentification et gestion utilisateurs
- **TanStack Query** - Server state management et caching
- **Zustand** - Client state management

### UI & Animations
- **React Native Reanimated** - Animations performantes
- **Expo Linear Gradient** - Gradients natifs
- **Expo Image Picker** - Sélection d'images

### Validation & Types
- **Zod** - Schema validation et type safety
- **TypeScript** - Types stricts end-to-end

### Build & Deployment
- **EAS Build** - Build cloud pour Android/iOS
- **EAS Submit** - Soumission automatique aux stores
- **Google Play Store** - Distribution Android

## 📁 Structure du projet

```
BinomePay/
├── src/
│   ├── app/                      # Expo Router pages
│   │   ├── _layout.tsx          # Root layout avec AnimatedSplash
│   │   ├── (Protected)/         # Routes protégées (auth requise)
│   │   │   ├── (tabs)/          # Navigation par onglets
│   │   │   │   ├── _layout.tsx  # Layout des tabs avec gradient
│   │   │   │   ├── index.tsx    # Home - Liste des intentions
│   │   │   │   └── messages.tsx # Messages & conversations
│   │   │   ├── new-intention.tsx    # Création d'intention
│   │   │   ├── intention-success.tsx
│   │   │   ├── profile.tsx          # Profil utilisateur
│   │   │   └── suggested/[id].tsx   # Détails d'une suggestion
│   │   └── (auth)/              # Routes d'authentification
│   ├── components/              # Composants réutilisables
│   │   ├── AnimatedSplash.tsx   # Splash screen animé
│   │   ├── CustomModal.tsx      # Modal personnalisé
│   │   ├── Toast.tsx            # Notifications toast
│   │   └── home/                # Composants de la home
│   ├── lib/
│   │   ├── supabase.ts          # Client Supabase
│   │   ├── schemas/             # Schémas Zod de validation
│   │   └── queries/             # Hooks TanStack Query
│   │       ├── hooks/           # Custom hooks
│   │       └── queryClient.ts   # Configuration React Query
│   ├── services/
│   │   ├── dataService.ts       # Service de données
│   │   ├── notificationService.ts # Service de notifications
│   │   └── storageService.ts    # Service de stockage local
│   ├── store/
│   │   └── useAppStore.ts       # Store Zustand global
│   ├── hooks/
│   │   └── useDataSync.ts       # Hook de synchronisation
│   └── utils/
│       └── dateUtils.ts         # Utilitaires de dates
├── scripts/
│   ├── deploy.sh                # Script de déploiement
│   └── pre-deploy-check.js      # Vérifications pré-déploiement
├── app.config.ts                # Configuration Expo
├── eas.json                     # Configuration EAS Build
├── tailwind.config.js           # Configuration Tailwind
└── tsconfig.json                # Configuration TypeScript
```

## 🚀 Installation & Développement

### Prérequis

- Node.js 18+ et npm
- Expo CLI
- Compte Expo (pour EAS Build)
- Compte Clerk (authentification)
- Compte Supabase (base de données)

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/BinomePay.git
cd BinomePay

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API
```

### Configuration

1. **Clerk** - Créer un projet sur [clerk.com](https://clerk.com)
   - Récupérer `CLERK_PUBLISHABLE_KEY`
   - Configurer les webhooks si nécessaire

2. **Supabase** - Créer un projet sur [supabase.com](https://supabase.com)
   - Récupérer `SUPABASE_URL` et `SUPABASE_ANON_KEY`
   - Importer le schéma de base de données

3. **Expo** - Configurer EAS
   ```bash
   npx eas login
   npx eas build:configure
   ```

### Lancement

```bash
# Démarrer le serveur de développement
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS
npm run ios

# Lancer sur Web
npm run web
```

## 🚀 Déploiement

### Vérification pré-déploiement

```bash
# Vérifier que tout est prêt pour le déploiement
npm run pre-deploy-check
```

### Build & Déploiement Play Store

```bash
# Version de test (internal testing)
npm run deploy:preview

# Version production
npm run deploy:production
```

### Déploiement manuel

```bash
# Build preview
npm run build:android:preview

# Build production
npm run build:android:production

# Soumettre au Play Store
npm run submit:android
```

## 📚 Architecture

### Gestion de l'état

L'application utilise une approche hybride pour la gestion de l'état :

- **Zustand** - État client (UI, préférences, données temporaires)
- **TanStack Query** - État serveur (API, cache, synchronisation)
- **Clerk** - État d'authentification
- **Supabase** - Subscriptions temps réel

### Flux de données

1. **Authentification** : Clerk gère le cycle de vie utilisateur
2. **Données** : TanStack Query fetche et cache les données Supabase
3. **Real-time** : Supabase subscriptions pour les mises à jour live
4. **Validation** : Zod valide toutes les données entrantes/sortantes

### Navigation

- Routes protégées via groupe `(Protected)` nécessitant authentification
- Navigation par onglets pour les écrans principaux
- Routes dynamiques pour les détails (ex: `suggested/[id]`)
- Splash screen animé au démarrage

### Styling

- NativeWind (Tailwind CSS) pour tous les styles
- Thème sombre avec accents bleu/jaune
- Gradients personnalisés pour tab bar et composants
- Path Tailwind configuré pour `src/app/**` et `src/components/**`

## 🔒 Sécurité

- Authentification sécurisée via Clerk
- Validation de toutes les données avec Zod
- Variables d'environnement pour les secrets
- KYC obligatoire pour les transactions
- Chiffrement des données sensibles

## 📝 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Démarre le serveur Expo |
| `npm run android` | Lance l'app sur Android |
| `npm run ios` | Lance l'app sur iOS |
| `npm run web` | Lance l'app sur Web |
| `npm run type-check` | Vérifie les types TypeScript |
| `npm run pre-deploy-check` | Vérifications pré-déploiement |
| `npm run deploy:preview` | Déploie version preview |
| `npm run deploy:production` | Déploie version production |

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence privée.

## 👤 Auteur

**BinomePay Team**

## 🔗 Liens utiles

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/)
- [Documentation Clerk](https://clerk.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation TanStack Query](https://tanstack.com/query)

---

Fait avec ❤️ pour faciliter les échanges de devises entre particuliers
