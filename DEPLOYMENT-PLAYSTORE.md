# Guide de Déploiement Play Store - BinomePay

## 📋 Prérequis

### 1. Comptes et Services
- ✅ Compte Google Play Developer (25$ one-time)
- ✅ Compte Expo/EAS CLI installé (`npm install -g @expo/cli eas-cli`)
- ✅ Backend API en production accessible
- ✅ Base de données Supabase/PostgreSQL configurée
- ✅ Compte Clerk en mode production

### 2. Outils Requis
```bash
npm install -g @expo/cli eas-cli
eas login
```

## 🔧 Configuration Pre-Déploiement

### 1. Variables d'Environnement Production

Modifiez `.env.production` avec vos vraies URLs :

```bash
# API Backend Production
EXPO_PUBLIC_API_URL=https://api.binomepay.com/v1

# Clerk Production
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your-production-key

# Supabase Production
EXPO_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# Mode Production
EXPO_PUBLIC_MOCK_API=false
NODE_ENV=production
```

### 2. Configuration EAS Project

```bash
# Initialiser le projet EAS (si pas déjà fait)
eas project:init

# Ou lier à un projet existant
eas project:link
```

## 🔐 Vérification de Sécurité

Avant chaque build, exécutez :

```bash
npm run security-check
```

Ce script vérifie :
- ✅ Variables d'environnement configurées
- ✅ Mode mock désactivé
- ✅ Pas de secrets dans le code
- ✅ Configuration Android complète
- ✅ Assets présents

## 🏗️ Process de Build

### 1. Build Preview (Test)

```bash
# Build APK pour tests internes
npm run build:android:preview
```

### 2. Build Production

```bash
# Build AAB pour Play Store
npm run build:android:production
```

### 3. Vérification du Build

Une fois le build terminé :
1. Téléchargez l'AAB/APK depuis EAS
2. Testez sur un appareil physique
3. Vérifiez toutes les fonctionnalités critiques
4. Testez les flux d'authentification
5. Vérifiez les appels API

## 📱 Soumission Play Store

### 1. Configuration Google Play Console

1. **Créer l'application** dans Google Play Console
2. **Package Name** : `com.binomepay.app`
3. **Configurer** :
   - Icône et captures d'écran
   - Description de l'app
   - Classification du contenu
   - Politique de confidentialité

### 2. Service Account (pour auto-submit)

```bash
# Placer le fichier service-account-key.json à la racine
# Puis soumettre automatiquement
npm run submit:android
```

### 3. Soumission Manuelle

Si pas de service account :
1. Télécharger l'AAB depuis EAS
2. Upload manuel dans Google Play Console
3. Remplir les métadonnées requises
4. Soumettre pour review

## 🔄 Workflow Complet

### Pipeline de Développement Recommandé

```bash
# 1. Développement local
npm start

# 2. Test avec build preview
npm run security-check
npm run build:android:preview

# 3. Test de l'APK preview
# Télécharger et installer sur appareil de test

# 4. Build production
npm run security-check
npm run build:android:production

# 5. Soumission
npm run submit:android
```

### Gestion des Versions

```bash
# app.config.ts
android: {
  versionCode: 2,  // Incrémenter à chaque build
}

# package.json
"version": "1.0.1"  // Semantic versioning
```

## 🔍 Checklist Pré-Déploiement

### ✅ Configuration
- [ ] `.env.production` configuré avec vraies URLs
- [ ] `EXPO_PUBLIC_MOCK_API=false`
- [ ] Backend API accessible et fonctionnel
- [ ] Clerk configuré en mode production
- [ ] Supabase/DB configuré pour production

### ✅ Sécurité
- [ ] Script `security-check` passe sans erreur
- [ ] Pas de secrets/tokens hardcodés
- [ ] Permissions Android minimales
- [ ] ProGuard activé pour l'obfuscation

### ✅ Tests
- [ ] App testée sur appareil physique
- [ ] Authentification fonctionnelle
- [ ] API calls fonctionnels
- [ ] Notifications push testées
- [ ] Mode hors ligne testé

### ✅ Play Store
- [ ] Google Play Console configuré
- [ ] Métadonnées et descriptions complètes
- [ ] Icônes et captures d'écran uploadées
- [ ] Politique de confidentialité publiée
- [ ] Classification de contenu complétée

## 🚨 Problèmes Courants

### Build Échoue
```bash
# Nettoyer et rebuilder
rm -rf node_modules
npm install
eas build --platform android --profile production --clear-cache
```

### Erreur de Signature
```bash
# Vérifier la configuration EAS
eas credentials
eas build:configure
```

### API Non Accessible
- Vérifier les URLs dans `.env.production`
- Tester les endpoints avec Postman
- Vérifier les CORS si applicable

### App Crash au Démarrage
- Vérifier les variables d'environnement
- Vérifier les clés Clerk/Supabase
- Consulter les logs : `adb logcat`

## 📞 Support

### Logs et Debug
```bash
# Logs EAS Build
eas build:list
eas build:view [build-id]

# Logs Play Store
# Disponibles dans Google Play Console > Vitals
```

### Ressources Utiles
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/production-checklist)

---

## 🎉 Déploiement Réussi !

Une fois l'app approuvée :
1. 🚀 L'app est disponible sur Play Store
2. 📊 Configurez le monitoring (analytics, crash reports)
3. 🔄 Planifiez les mises à jour futures
4. 📈 Collectez les retours utilisateurs

**Note** : La review Google Play peut prendre 1-3 jours. Soyez patient ! 

Pour des mises à jour futures, répétez simplement le processus avec un `versionCode` incrémenté.