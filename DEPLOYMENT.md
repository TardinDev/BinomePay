# Guide de Déploiement BinomePay

## Prérequis

1. **Compte Expo/EAS** : Créer un compte sur https://expo.dev
2. **Installation EAS CLI** : `npm install -g @expo/eas-cli`
3. **Connexion** : `eas login`
4. **Configuration du projet** : `eas build:configure`

## Configuration requise

### Variables d'environnement
Ajouter dans Expo Dashboard (Settings > Environment variables) :
```
SUPABASE_URL=https://olvmbrmgvpgoejjjpnql.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2l2aWwtZWFnbGUtOTIuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### Google Play Console
1. Créer une application sur Google Play Console
2. Générer le service account key JSON
3. Télécharger et placer le fichier dans `./service-account-key.json`

## Builds

### Build de test (APK)
```bash
npm run build:android:preview
```

### Build de production (AAB)
```bash
npm run build:android:production
```

## Soumission au Play Store

```bash
npm run submit:android
```

## Checklist avant déploiement

- [ ] Tests fonctionnels complets
- [ ] Variables d'environnement configurées
- [ ] Icons et splash screens optimisés
- [ ] Permissions Android validées
- [ ] Service account key configuré
- [ ] Métadonnées Play Store remplies
- [ ] Screenshots préparés (obligatoires)

## Structure des fichiers

```
BinomePay/
├── app.config.ts          # Configuration de l'app
├── eas.json               # Configuration EAS Build
├── service-account-key.json  # Clé de service Google (ne pas commiter)
└── assets/                # Ressources visuelles
    ├── icon.png           # Icône principale (1024x1024)
    ├── adaptive-icon.png  # Icône adaptative Android
    ├── splash-icon.png    # Image splash
    └── favicon.png        # Favicon web
```

## Notes importantes

1. **Package name** : `com.binomepay.app` (configuré dans app.config.ts)
2. **Version** : Incrémenter `versionCode` pour chaque nouvelle version
3. **Permissions** : Seules les permissions nécessaires sont incluses
4. **Build type** : AAB (Android App Bundle) requis pour le Play Store