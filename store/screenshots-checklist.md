# Screenshots Play Store — Checklist de capture

## Exigences Google Play (Phone)

| Paramètre      | Valeur                                                              |
| -------------- | ------------------------------------------------------------------- |
| **Quantité**   | Minimum 2, maximum 8                                                |
| **Format**     | JPEG ou PNG 24-bit                                                  |
| **Ratio**      | 16:9 ou 9:16 (portrait ou paysage)                                  |
| **Dimensions** | Min 320 px, max 3840 px (côté le plus long ≤ 2× côté le plus court) |
| **Recommandé** | **1080 × 1920** (portrait, appareil standard)                       |

## Ordre de capture recommandé (8 écrans — raconte l'histoire)

### 1. 🏠 Accueil avec suggestions

- **Écran** : `(tabs)/index.tsx`
- **État** : connecté, avec 2-3 suggestions visibles
- **Pourquoi** : première impression, montre le cœur du produit

### 2. ➕ Création d'intention (SEND)

- **Écran** : `new-intention.tsx`
- **État** : toggle "ENVOYER" sélectionné, champs montant/devise/pays remplis (ex. 500 EUR · France → Sénégal)
- **Pourquoi** : montre la simplicité de création

### 3. ✅ Succès après création

- **Écran** : `intention-success.tsx`
- **État** : message de confirmation, CTA "Voir mes propositions"
- **Pourquoi** : feedback positif

### 4. 💬 Détail d'une suggestion

- **Écran** : `suggested/[id].tsx`
- **État** : profil binôme visible, note, bouton "Accepter"
- **Pourquoi** : illustre le matching

### 5. 💬 Conversation

- **Écran** : `messages/[id].tsx`
- **État** : chat avec quelques messages échangés
- **Pourquoi** : prouve la messagerie sécurisée

### 6. 📋 Historique des transactions

- **Écran** : `history.tsx`
- **État** : 2-3 entrées visibles, résumé stats
- **Pourquoi** : transparence, crédibilité

### 7. 👤 Profil complet

- **Écran** : `profile.tsx` (nouveau design)
- **État** : photo + KYC vérifié + toutes les sections visibles
- **Pourquoi** : montre le sérieux de l'app

### 8. 🔔 Paramètres de notifications

- **Écran** : `settings/notifications.tsx`
- **État** : toggles visibles
- **Pourquoi** : rassure sur le contrôle utilisateur

## Procédure de capture

### Option A : Appareil Android physique (meilleure qualité)

```bash
# 1. Lancer l'app en mode production-like
npm run build:android:preview
# Installer l'APK sur l'appareil
```

- Sur l'appareil : **Volume bas + Power** pour capturer
- Les screenshots sont dans `DCIM/Screenshots/`
- Les transférer via USB ou email

### Option B : Émulateur Android Studio

```bash
# Lancer l'émulateur puis :
npm run android
```

- Dans l'émulateur : cliquer l'icône appareil photo dans la barre latérale
- Enregistré dans `~/Desktop/Screenshot_*.png`

### Option C : Expo Go (qualité moindre mais rapide)

```bash
npm start
# Scanner le QR code
```

- Même procédure volume bas + power

## Conseils pro

1. **Statut barre propre** : activer le mode démo pour cacher batterie faible/signal faible

   ```bash
   adb shell settings put global sysui_demo_allowed 1
   adb shell am broadcast -a com.android.systemui.demo -e command enter
   adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0900
   adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
   adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4
   ```

   Pour désactiver : `adb shell am broadcast -a com.android.systemui.demo -e command exit`

2. **Données réalistes** : éviter les "Lorem ipsum". Utiliser des vrais prénoms (Amadou, Sophie), montants crédibles.

3. **Pas de textes système** : pas de notifications qui s'affichent pendant la capture.

4. **Après capture, optimiser** :

   ```bash
   # Outils recommandés
   pngquant --quality=85-95 *.png
   # Ou en ligne : tinypng.com
   ```

5. **Overlay marketing (optionnel mais recommandé)** :
   Utiliser Figma/Canva pour ajouter un titre sur chaque screenshot :
   - Screen 1 : « Trouvez votre binôme en quelques secondes »
   - Screen 2 : « Créez votre intention en 3 clics »
   - Screen 3 : « Zéro frais, 100% sécurisé »
   - etc.

## Checklist finale avant upload

- [ ] Au moins 2 screenshots (minimum Play Store)
- [ ] Dimensions ≥ 320 px côté court
- [ ] Ratio respecté (9:16 pour portrait recommandé)
- [ ] Aucune donnée personnelle réelle visible
- [ ] Aucune mention de prix/coûts en dur
- [ ] Cohérence visuelle entre les 8 captures
- [ ] Noms de fichiers explicites : `01-home.png`, `02-new-intention.png`, ...

## Emplacement suggéré

Créer `store/screenshots/` et y déposer les fichiers :

```
store/
├── screenshots/
│   ├── 01-home.png
│   ├── 02-new-intention.png
│   ├── 03-intention-success.png
│   ├── 04-suggested-detail.png
│   ├── 05-conversation.png
│   ├── 06-history.png
│   ├── 07-profile.png
│   └── 08-notifications-settings.png
└── feature-graphic.png  (export du SVG)
```
