# Guide Screenshots Play Store - BinomePay

## 📱 Screenshots requis pour Google Play

### Formats requis :
- **Taille** : 1080x1920 pixels (format portrait 9:16)
- **Format** : PNG ou JPG
- **Nombre** : Minimum 2, maximum 8
- **Poids** : Maximum 8MB par image

### 🎯 Screenshots recommandés (dans l'ordre) :

#### Screenshot 1 : Écran d'accueil avec intentions
**Éléments à montrer :**
- Header "Bonjour [Nom]" avec profil
- Liste des suggestions d'échange
- Montants, devises et pays visibles
- Interface claire et moderne

#### Screenshot 2 : Création d'intention
**Éléments à montrer :**
- Formulaire de création d'intention
- Champs montant, devise, pays
- Bouton "Publier l'intention"
- Design soigné du formulaire

#### Screenshot 3 : Profil utilisateur
**Éléments à montrer :**
- Photo de profil
- Statut KYC "Vérifié"
- Note moyenne et statistiques
- Bouton de déconnexion

#### Screenshot 4 : Messagerie
**Éléments à montrer :**
- Liste des conversations
- Indicateurs de messages non lus
- Détails des matches (montant, corridor)
- Interface de chat moderne

#### Screenshot 5 : Écran de connexion/inscription
**Éléments à montrer :**
- Logo BinomePay
- Formulaires élégants
- Boutons d'action clairs
- Design professionnel

### 📝 Textes overlay recommandés :

#### Screenshot 1
**Titre :** "Trouvez votre binôme d'échange"
**Sous-titre :** "Des propositions personnalisées selon vos besoins"

#### Screenshot 2
**Titre :** "Créez votre intention en 30 secondes"
**Sous-titre :** "Montant, devise, destination - c'est tout !"

#### Screenshot 3
**Titre :** "Profils vérifiés et sécurisés"
**Sous-titre :** "KYC obligatoire et système de notation"

#### Screenshot 4
**Titre :** "Communiquez en toute sécurité"
**Sous-titre :** "Chat intégré pour organiser vos échanges"

#### Screenshot 5
**Titre :** "Rejoignez BinomePay"
**Sous-titre :** "Inscription rapide et sécurisée"

## 🎨 Instructions de design

### Couleurs à utiliser :
- **Fond principal :** #000000 (noir)
- **Accents :** #EAB308 (jaune/or)
- **Texte :** #FFFFFF (blanc)
- **Gris :** #9CA3AF, #6B7280

### Éléments à ajouter :
- Logo BinomePay en petit dans le coin
- Textes overlay avec fond semi-transparent
- Flèches ou indicateurs visuels si nécessaire
- Badge "SÉCURISÉ" ou "VÉRIFIÉ" sur certains screenshots

## 📋 Checklist avant soumission

### Screenshots :
- [ ] 5-8 screenshots en format 1080x1920
- [ ] Textes en français lisibles
- [ ] Interface moderne et professionnelle
- [ ] Pas d'informations personnelles réelles
- [ ] Qualité haute définition
- [ ] Ordre logique (onboarding → utilisation)

### Métadonnées :
- [ ] Titre : "BinomePay"
- [ ] Description courte remplie (80 caractères)
- [ ] Description longue complète (4000 caractères)
- [ ] Mots-clés pertinents
- [ ] Catégorie "Finance"
- [ ] Âge minimum 18 ans

### Compliance :
- [ ] Politique de confidentialité accessible
- [ ] Conditions d'utilisation
- [ ] Contact développeur
- [ ] Permissions justifiées

## 🚀 Outils recommandés

### Pour créer les screenshots :
1. **Expo développement** : Capturer les vrais écrans
2. **Figma/Sketch** : Ajouter overlays et textes
3. **Canva** : Templates screenshot Play Store
4. **Screenshot Creator** : Outils en ligne spécialisés

### Commandes pour capturer :
```bash
# Démarrer l'app en mode développement
npm run android

# Utiliser l'émulateur Android Studio pour capturer
# Ou adb screenshot sur un appareil réel
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

## 📐 Template dimensions

```
Portrait Screenshot Template:
┌─────────────────────┐
│     1080 x 1920     │
│                     │
│    [APP CONTENT]    │
│                     │
│   [OVERLAY TEXT]    │
│     (optionnel)     │
│                     │
│    [LOGO SMALL]     │
└─────────────────────┘
```