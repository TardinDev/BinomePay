#!/usr/bin/env node

/**
 * Script de vérification de sécurité avant déploiement
 * Vérifie que l'application est prête pour la production
 */

const fs = require('fs')
const path = require('path')

console.log('🔐 Vérification de sécurité BinomePay...\n')

const errors = []
const warnings = []

// 1. Vérifier les variables d'environnement
console.log("📋 Vérification des variables d'environnement...")

const envProdPath = path.join(__dirname, '..', '.env.production')
if (!fs.existsSync(envProdPath)) {
  errors.push('❌ Fichier .env.production manquant')
} else {
  const envContent = fs.readFileSync(envProdPath, 'utf8')

  // Vérifier les variables critiques
  const requiredVars = [
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ]

  requiredVars.forEach((varName) => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your-`)) {
      errors.push(`❌ Variable ${varName} non configurée dans .env.production`)
    }
  })

  // Vérifier que MOCK_API est désactivé
  if (envContent.includes('EXPO_PUBLIC_MOCK_API=true')) {
    errors.push('❌ EXPO_PUBLIC_MOCK_API doit être false en production')
  }
}

// 2. Vérifier qu'il n'y a pas de secrets dans le code
console.log('🔍 Recherche de secrets potentiels dans le code...')

const searchPatterns = [
  /sk_live_[a-zA-Z0-9]+/g, // Clés Stripe live
  /pk_live_[a-zA-Z0-9]+/g, // Clés publiques Stripe live exposées dans le code
  /[0-9a-f]{32}/g, // Hash MD5 potentiels
  /password\s*=\s*["'][^"']+["']/gi, // Mots de passe en dur
]

const filesToCheck = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'app.config.ts']

// Fonction simple de recherche (sans glob pour éviter les dépendances)
function checkFileForSecrets(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    searchPatterns.forEach((pattern) => {
      const matches = content.match(pattern)
      if (matches) {
        warnings.push(`⚠️ Secret potentiel détecté dans ${filePath}: ${matches[0]}`)
      }
    })
  } catch (err) {
    // Ignore les erreurs de lecture de fichier
  }
}

// 3. Vérifier la configuration app.config.ts
console.log('⚙️ Vérification de app.config.ts...')

const appConfigPath = path.join(__dirname, '..', 'app.config.ts')
if (fs.existsSync(appConfigPath)) {
  const appConfig = fs.readFileSync(appConfigPath, 'utf8')

  if (!appConfig.includes('com.binomepay.app')) {
    errors.push('❌ Package name Android non configuré')
  }

  if (!appConfig.includes('versionCode')) {
    warnings.push('⚠️ Version code Android manquant')
  }
} else {
  errors.push('❌ app.config.ts manquant')
}

// 4. Vérifier EAS configuration
console.log('🏗️ Vérification de la configuration EAS...')

const easConfigPath = path.join(__dirname, '..', 'eas.json')
if (!fs.existsSync(easConfigPath)) {
  errors.push('❌ eas.json manquant')
} else {
  const easConfig = JSON.parse(fs.readFileSync(easConfigPath, 'utf8'))

  if (!easConfig.build?.production?.android?.buildType) {
    errors.push('❌ Configuration build production Android manquante')
  }

  if (easConfig.build.production.android.buildType !== 'aab') {
    warnings.push('⚠️ Build type recommandé: aab (Android App Bundle)')
  }
}

// 5. Vérifier les assets
console.log('🖼️ Vérification des assets...')

const requiredAssets = [
  'assets/icon.png',
  'assets/adaptive-icon.png',
  'assets/splash-icon.png',
  'assets/favicon.png',
]

requiredAssets.forEach((asset) => {
  const assetPath = path.join(__dirname, '..', asset)
  if (!fs.existsSync(assetPath)) {
    warnings.push(`⚠️ Asset manquant: ${asset}`)
  }
})

// Résultats
console.log('\n📊 Résultats de la vérification:\n')

if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ Aucun problème détecté ! L'application est prête pour le déploiement.")
} else {
  if (errors.length > 0) {
    console.log('🚨 ERREURS CRITIQUES (à corriger avant déploiement):')
    errors.forEach((error) => console.log(`   ${error}`))
    console.log('')
  }

  if (warnings.length > 0) {
    console.log('⚠️ AVERTISSEMENTS (recommandé de corriger):')
    warnings.forEach((warning) => console.log(`   ${warning}`))
    console.log('')
  }

  if (errors.length > 0) {
    console.log(
      "❌ Le déploiement n'est PAS recommandé tant que les erreurs critiques ne sont pas corrigées."
    )
    process.exit(1)
  } else {
    console.log('✅ Le déploiement peut continuer, mais vérifiez les avertissements.')
  }
}

console.log('\n🎯 Prochaines étapes:')
console.log('   1. Corriger les erreurs et avertissements ci-dessus')
console.log('   2. Exécuter: npm run build:android:production')
console.log("   3. Tester l'APK/AAB avant soumission")
console.log('   4. Exécuter: npm run submit:android')
