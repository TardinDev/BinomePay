# 🚀 Guide de Déploiement Play Store - BinomePay

## 📋 Pré-requis

### Comptes nécessaires :
- [x] Compte Google Play Console (25$ d'inscription unique)
- [x] Compte EAS Build (Expo) - gratuit avec limitations
- [ ] Service Account Google Cloud (pour automatisation)

### Outils installés :
- [x] Node.js et npm
- [x] Expo CLI : `npm install -g @expo/cli`
- [x] EAS CLI : `npm install -g eas-cli`

## 🔧 Étape 1 : Configuration EAS

### 1.1 Connexion EAS
```bash
# Se connecter à EAS
eas login

# Initialiser le projet (si pas encore fait)
eas build:configure
```

### 1.2 Vérifier la configuration
```bash
# Vérifier que eas.json est correct
cat eas.json

# Vérifier app.config.ts
cat app.config.ts
```

## 🛠️ Étape 2 : Préparation des Assets

### 2.1 Vérifier les icônes
```bash
# Vérifier que les assets existent
ls -la assets/
# icon.png (1024x1024)
# adaptive-icon.png (1024x1024) 
# splash-icon.png (1024x1024)
# favicon.png (48x48)
```

### 2.2 Créer les screenshots
Suivre le guide dans `store/screenshots-guide.md` :
- 5-8 screenshots en format 1080x1920
- Textes overlay en français
- Interface propre sans données personnelles

## 🔐 Étape 3 : Configuration Google Play Console

### 3.1 Créer l'application
1. Aller sur [Google Play Console](https://play.google.com/console)
2. "Créer une application"
3. **Nom :** BinomePay
4. **Langue :** Français
5. **Type :** Application
6. **Gratuit/Payant :** Gratuit

### 3.2 Remplir les métadonnées
Utiliser les informations de `store/play-store-metadata.md` :

**Fiche du Store :**
- Description courte et longue
- Screenshots (5-8 images)
- Icône haute résolution (512x512)
- Bannière de fonctionnalité (optionnel)

**Classification du contenu :**
- Questionnaire sur le contenu
- Âge cible : 18+ (services financiers)
- Classification : Mature 17+

**Politique de confidentialité :**
- Héberger `PRIVACY_POLICY.md` sur un site web
- Ou utiliser : `https://binomepay.com/privacy`

## 🏗️ Étape 4 : Build de Production

### 4.1 Build AAB (Android App Bundle)
```bash
# Build de production (créera le fichier .aab)
eas build --platform android --profile production

# Suivre le lien fourni pour voir le status du build
# Le build prendra 10-20 minutes
```

### 4.2 Test local (optionnel)
```bash
# Build de preview pour tester
eas build --platform android --profile preview

# Installer l'APK sur un appareil de test
# adb install path/to/app.apk
```

## 📤 Étape 5 : Upload sur Play Console

### 5.1 Upload manuel
1. Télécharger le fichier `.aab` depuis EAS
2. Dans Play Console : "Gestion des versions" → "Versions d'app"
3. "Production" → "Créer une version"
4. Glisser-déposer le fichier `.aab`
5. Ajouter les notes de version

### 5.2 Upload automatique (recommandé)
```bash
# Configurer le service account (une seule fois)
# 1. Télécharger service-account-key.json depuis Google Cloud
# 2. Le placer à la racine du projet

# Upload automatique
eas submit --platform android --latest

# Ou commande combinée (build + submit)
npm run deploy:production
```

## ✅ Étape 6 : Configuration finale Play Store

### 6.1 Informations obligatoires
- [x] **Fiche du Store** : Descriptions, screenshots, icônes
- [x] **Classification du contenu** : Questionnaire complété
- [x] **Politique de confidentialité** : URL valide
- [x] **Informations sur l'app** : Catégorie, contacts
- [ ] **Prix et distribution** : Gratuit, pays ciblés

### 6.2 Tests obligatoires
- [ ] **Test interne** : Upload vers piste interne d'abord
- [ ] **Test fermé** : Inviter des testeurs (optionnel)
- [ ] **Review de Google** : Soumission pour review

### 6.3 Conformité
- [x] **Permissions justifiées** : Dans app.config.ts
- [x] **Politique de confidentialité** : Conforme RGPD
- [x] **Conditions d'utilisation** : Créées
- [x] **Support utilisateur** : Email de contact configuré

## 🚀 Étape 7 : Déploiement

### 7.1 Soumission pour review
```bash
# Après upload du AAB
1. Dans Play Console, aller à "Gestion des versions"
2. Cliquer "Examiner la version"
3. Vérifier toutes les informations
4. Cliquer "Lancer le déploiement en production"
```

### 7.2 Timeline attendue
- **Upload :** Immédiat
- **Review Google :** 1-3 jours ouvrables
- **Publication :** Quelques heures après approbation
- **Disponibilité :** 2-3 heures pour être visible partout

## 🔄 Étape 8 : Mises à jour futures

### 8.1 Processus de mise à jour
```bash
# 1. Incrémenter la version dans app.config.ts
# version: '1.0.1'
# android.versionCode: 2

# 2. Build nouvelle version
eas build --platform android --profile production

# 3. Upload nouvelle version
eas submit --platform android --latest
```

### 8.2 Types de mise à jour
- **Patch (1.0.1)** : Corrections de bugs → Review rapide
- **Minor (1.1.0)** : Nouvelles fonctionnalités → Review standard
- **Major (2.0.0)** : Changements majeurs → Review approfondie

## 📊 Étape 9 : Monitoring post-lancement

### 9.1 Métriques à surveiller
- **Installations** : Nombre de téléchargements
- **Notes et avis** : Feedback utilisateurs
- **Crashs** : Rapports d'erreur
- **Performances** : Temps de lancement, ANR

### 9.2 Outils de monitoring
- **Play Console** : Métriques intégrées
- **Crashlytics** : Rapports de crash (à ajouter)
- **Analytics** : Utilisation de l'app (à ajouter)

## 🆘 Résolution de problèmes

### Erreurs courantes :

**"Upload failed - Invalid package"**
```bash
# Vérifier le package ID et la signature
grep "package" app.config.ts
```

**"Missing privacy policy"**
- Héberger PRIVACY_POLICY.md sur un site accessible
- Mettre à jour l'URL dans Play Console

**"Permissions not declared"**
- Vérifier les permissions dans app.config.ts
- S'assurer qu'elles sont justifiées

**"Build failed"**
```bash
# Vérifier les logs EAS
eas build:list
# Cliquer sur le build failed pour voir les détails
```

## 📞 Support

### En cas de problème :
- **EAS Build** : https://docs.expo.dev/build/troubleshooting/
- **Play Console** : https://support.google.com/googleplay/android-developer/
- **Documentation** : Voir README.md du projet

### Contacts d'urgence :
- **Développeur** : developer@binomepay.com
- **Support technique** : tech@binomepay.com

---

## 🎯 Checklist finale avant déploiement

- [ ] Build production réussi
- [ ] Screenshots créés et optimisés
- [ ] Métadonnées complètes sur Play Console  
- [ ] Politique de confidentialité accessible
- [ ] Test interne effectué
- [ ] Version code incrémenté
- [ ] Variables de production configurées
- [ ] Service account configuré (pour auto-deploy)
- [ ] Sauvegarde du keystore/credentials

**Une fois tous ces éléments cochés, vous êtes prêt pour le déploiement ! 🚀**