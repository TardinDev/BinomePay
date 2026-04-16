# Binôme Pay — Logo & assets

Pack complet du logo Binôme Pay pour l'intégration dans ton projet Expo/React Native
et la soumission au Play Store.

## 📁 Structure du pack

```
binome-pay-assets/
├── assets/                        → à copier dans src/assets/ (ou /assets/ racine)
│   ├── icon.png                   1024×1024  icône app (Expo: ios.icon + fallback)
│   ├── adaptive-icon.png          1024×1024  foreground Android adaptive icon
│   ├── splash.png                 2048×2048  splash screen natif Expo
│   ├── favicon.png                196×196    favicon web
│   ├── notification-icon.png      96×96      icône notifications push
│   └── logo-preview.png           512×512    aperçu pour documentation / README
│
├── components/                    → à copier dans src/components/
│   ├── Logo.tsx                   composant logo animé (Reanimated 3 + react-native-svg)
│   └── AnimatedSplash.tsx         splash screen animé (entrée + fade out)
│
├── svg/                           → fichiers SVG source (à garder pour modifications)
│   ├── logo-static.svg            logo sans animation (source pour les PNG)
│   ├── logo-adaptive-foreground.svg  version avec safe zone Android (72% scale)
│   └── logo-splash.svg            version splash (plus de padding)
│
├── playstore/                     → assets pour Google Play Console
│   ├── icon-playstore-512.png     icône du listing store (512×512)
│   └── icon-playstore-1024.png    icône haute résolution (1024×1024)
│
├── app.json.example               exemple de config Expo à merger
└── README.md                      ce fichier
```

## 🚀 Installation

### 1. Copier les assets dans ton projet

```bash
# Depuis la racine de ton projet Binôme Pay
cp -r path/to/binome-pay-assets/assets/* ./assets/
cp path/to/binome-pay-assets/components/Logo.tsx ./src/components/
cp path/to/binome-pay-assets/components/AnimatedSplash.tsx ./src/components/
```

### 2. Vérifier les dépendances

Le composant `Logo.tsx` utilise :

```bash
npx expo install react-native-svg react-native-reanimated
```

Si `react-native-reanimated` n'est pas déjà configuré, ajoute le plugin dans
`babel.config.js` :

```js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // toujours en DERNIER
  }
}
```

### 3. Configurer Expo (`app.json`)

Merger le contenu de `app.json.example` avec ton `app.json` existant. Points clés :

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      }
    },
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#EAB308"
    }
  }
}
```

### 4. Rebuild

Les icônes et le splash natif sont bakés dans le bundle natif, donc :

```bash
eas build --profile preview --platform android
# ou pour dev
npx expo prebuild --clean
```

## 💻 Utilisation du composant animé

### Logo simple dans une screen

```tsx
import { Logo } from '@/components/Logo'

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Logo size={200} />
      <Text>Connecte-toi à Binôme Pay</Text>
    </View>
  )
}
```

### Splash screen animé (après le splash natif)

```tsx
// app/_layout.tsx
import { useState, useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { AnimatedSplash } from '@/components/AnimatedSplash'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <>
      <Stack />
      {!splashDone && <AnimatedSplash onAnimationFinish={() => setSplashDone(true)} />}
    </>
  )
}
```

### Désactiver l'animation (économie batterie, a11y)

```tsx
import { AccessibilityInfo } from 'react-native'
// ...
const [reduceMotion, setReduceMotion] = useState(false)
useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
}, [])

;<Logo size={150} animated={!reduceMotion} />
```

## 🎨 Charte de couleurs

| Rôle            | Hex       | Usage                              |
| --------------- | --------- | ---------------------------------- |
| Fond principal  | `#000000` | Background app, icon, splash       |
| Jaune principal | `#EAB308` | Accent, arcs, "pay", notifications |
| Jaune clair     | `#FCD34D` | Points d'ancrage des arcs          |
| Jaune pâle      | `#FDE68A` | Highlights, gradient haut          |
| Blanc           | `#FFFFFF` | Lettre "B" uniquement              |

## 📱 Soumission Google Play

Utilise les fichiers du dossier `playstore/` :

- `icon-playstore-512.png` → Play Console > Store listing > App icon
- Pour la feature graphic (1024×500), tu as déjà un SVG dans ton projet

## 🔧 Modifier le logo

Si tu veux changer quelque chose (taille du "pay", position, couleur) :

1. Édite `svg/logo-static.svg` (ou les autres variantes)
2. Régénère les PNG :

```bash
pip install cairosvg
python3 generate-pngs.py
```

Pour modifier l'animation du composant React Native, édite directement `Logo.tsx`.
Les shared values Reanimated sont toutes en haut du composant, facilement ajustables :

- `rotation1/2.value = withTiming(360, { duration: 8000 })` → vitesse rotation
- `pulse.value` → fréquence de la pulsation des points d'ancrage
- `ringPulse*.value` → ondes concentriques

## ⚠️ Notes importantes

- Les `SvgText` avec `fontFamily="Georgia"` : sur Android, Georgia n'est pas toujours
  installé. Si ton rendu diffère, tu peux :
  - Soit garder Georgia (fallback automatique sur une serif système)
  - Soit bundler une font via `expo-font` (recommandé pour un rendu identique iOS/Android)

- Le composant `Logo` est optimisé : les animations tournent sur le thread UI
  via Reanimated 3, donc aucun impact JS thread même avec plusieurs logos à l'écran.

- Les fichiers `.svg` dans `svg/` sont les sources de vérité. Les PNG sont régénérables.
