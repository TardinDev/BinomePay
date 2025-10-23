#!/usr/bin/env node

/**
 * 🔍 Script de vérification pre-deploy pour BinomePay
 * Vérifie que tous les éléments sont prêts pour le déploiement
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color, icon, message) {
  console.log(`${colors[color]}${icon} ${message}${colors.reset}`);
}

function logSuccess(message) {
  log('green', '✅', message);
}

function logError(message) {
  log('red', '❌', message);
}

function logWarning(message) {
  log('yellow', '⚠️ ', message);
}

function logInfo(message) {
  log('blue', 'ℹ️ ', message);
}

// Vérifications
let errors = 0;
let warnings = 0;

function checkFile(filePath, description, required = true) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} existe`);
    return true;
  } else {
    if (required) {
      logError(`${description} manquant: ${filePath}`);
      errors++;
    } else {
      logWarning(`${description} optionnel manquant: ${filePath}`);
      warnings++;
    }
    return false;
  }
}

function checkPackageJson() {
  logInfo('🔍 Vérification package.json...');
  
  if (!fs.existsSync('package.json')) {
    logError('package.json non trouvé');
    errors++;
    return;
  }
  
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Vérifier les champs obligatoires
  if (!pkg.name) {
    logError('package.json: nom manquant');
    errors++;
  } else if (pkg.name !== 'binomepay') {
    logWarning(`Nom du package: ${pkg.name} (attendu: binomepay)`);
    warnings++;
  } else {
    logSuccess('Nom du package OK');
  }
  
  if (!pkg.version) {
    logError('package.json: version manquante');
    errors++;
  } else {
    logSuccess(`Version: ${pkg.version}`);
  }
  
  // Vérifier les scripts de déploiement
  const requiredScripts = [
    'build:android:production',
    'submit:android',
    'deploy:production'
  ];
  
  for (const script of requiredScripts) {
    if (pkg.scripts && pkg.scripts[script]) {
      logSuccess(`Script ${script} configuré`);
    } else {
      logError(`Script manquant: ${script}`);
      errors++;
    }
  }
}

function checkAppConfig() {
  logInfo('🔍 Vérification app.config.ts...');
  
  if (!fs.existsSync('app.config.ts')) {
    logError('app.config.ts non trouvé');
    errors++;
    return;
  }
  
  const content = fs.readFileSync('app.config.ts', 'utf8');
  
  // Vérifications basiques
  const checks = [
    { pattern: /name:\s*['"]BinomePay['"]/, message: 'Nom de l\'app' },
    { pattern: /slug:\s*['"]binomepay['"]/, message: 'Slug de l\'app' },
    { pattern: /package:\s*['"]com\.binomepay\.app['"]/, message: 'Package ID Android' },
    { pattern: /version:\s*['"][0-9]+\.[0-9]+\.[0-9]+['"]/, message: 'Version format' },
    { pattern: /versionCode:\s*[0-9]+/, message: 'Version code Android' },
  ];
  
  for (const check of checks) {
    if (check.pattern.test(content)) {
      logSuccess(check.message);
    } else {
      logError(`app.config.ts: ${check.message} problématique`);
      errors++;
    }
  }
}

function checkEasJson() {
  logInfo('🔍 Vérification eas.json...');
  
  if (!fs.existsSync('eas.json')) {
    logError('eas.json non trouvé');
    errors++;
    return;
  }
  
  try {
    const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
    
    // Vérifier les profils
    if (eas.build) {
      if (eas.build.production) {
        logSuccess('Profil production configuré');
        
        // Vérifier la configuration Android production
        if (eas.build.production.android &&
            (eas.build.production.android.buildType === 'aab' ||
             eas.build.production.android.buildType === 'app-bundle')) {
          logSuccess('Build AAB configuré pour production');
        } else {
          logError('Build AAB non configuré pour production');
          errors++;
        }
      } else {
        logError('Profil production manquant');
        errors++;
      }
      
      if (eas.build.preview) {
        logSuccess('Profil preview configuré');
      } else {
        logWarning('Profil preview manquant (optionnel)');
        warnings++;
      }
    } else {
      logError('Section build manquante dans eas.json');
      errors++;
    }
    
    // Vérifier la configuration submit
    if (eas.submit && eas.submit.production && eas.submit.production.android) {
      logSuccess('Configuration submit configurée');
    } else {
      logWarning('Configuration submit manquante (déploiement manuel requis)');
      warnings++;
    }
    
  } catch (e) {
    logError(`Erreur lecture eas.json: ${e.message}`);
    errors++;
  }
}

function checkAssets() {
  logInfo('🔍 Vérification des assets...');
  
  const requiredAssets = [
    { path: 'assets/icon.png', desc: 'Icône principale (1024x1024)' },
    { path: 'assets/adaptive-icon.png', desc: 'Icône adaptative Android' },
    { path: 'assets/splash-icon.png', desc: 'Splash screen' },
  ];
  
  for (const asset of requiredAssets) {
    checkFile(asset.path, asset.desc, true);
  }
  
  // Vérifier optionnels
  checkFile('assets/favicon.png', 'Favicon web', false);
}

function checkStoreAssets() {
  logInfo('🔍 Vérification des assets Play Store...');
  
  checkFile('PRIVACY_POLICY.md', 'Politique de confidentialité', true);
  checkFile('store/play-store-metadata.md', 'Métadonnées Play Store', true);
  checkFile('store/screenshots-guide.md', 'Guide screenshots', false);
  checkFile('DEPLOYMENT_GUIDE.md', 'Guide de déploiement', false);
}

function checkEnvironment() {
  logInfo('🔍 Vérification de l\'environnement...');
  
  // Vérifier les fichiers d'environnement
  checkFile('.env', 'Variables d\'environnement dev', true);
  checkFile('.env.production', 'Variables d\'environnement production', true);
  
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    
    // Vérifier les variables critiques
    const requiredVars = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'
    ];
    
    for (const varName of requiredVars) {
      if (envContent.includes(varName)) {
        logSuccess(`Variable ${varName} présente`);
      } else {
        logError(`Variable manquante: ${varName}`);
        errors++;
      }
    }
    
    // Vérifier le mode mock
    if (envContent.includes('EXPO_PUBLIC_MOCK_API=true')) {
      logWarning('Mode MOCK activé en développement (OK)');
    }
  }
  
  if (fs.existsSync('.env.production')) {
    const prodEnvContent = fs.readFileSync('.env.production', 'utf8');
    
    if (prodEnvContent.includes('EXPO_PUBLIC_MOCK_API=false')) {
      logSuccess('Mode production configuré (pas de mock)');
    } else {
      logError('Mode production mal configuré (mock still enabled)');
      errors++;
    }
  }
}

function checkGitIgnore() {
  logInfo('🔍 Vérification .gitignore...');
  
  if (fs.existsSync('.gitignore')) {
    const content = fs.readFileSync('.gitignore', 'utf8');
    
    const shouldIgnore = [
      'node_modules',
      '.expo',
      'service-account-key.json',
      '.env.local'
    ];
    
    for (const item of shouldIgnore) {
      if (content.includes(item)) {
        logSuccess(`${item} ignoré par git`);
      } else {
        logWarning(`${item} devrait être dans .gitignore`);
        warnings++;
      }
    }
  } else {
    logWarning('.gitignore manquant');
    warnings++;
  }
}

function checkSecurity() {
  logInfo('🔍 Vérification sécurité...');
  
  // Vérifier qu'aucune clé secrète n'est commitée
  const files = ['.env', '.env.production', 'app.config.ts'];
  const sensitivePatterns = [
    /sk_[a-zA-Z0-9_]+/, // Stripe secret keys
    /rk_[a-zA-Z0-9_]+/, // Restricted keys
    /password["\s]*[:=]["\s]*[^"]+/i,
  ];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of sensitivePatterns) {
        if (pattern.test(content)) {
          logError(`Possible clé secrète détectée dans ${file}`);
          errors++;
        }
      }
    }
  }
  
  logSuccess('Aucune clé secrète détectée');
}

// Exécution des vérifications
console.log(`${colors.magenta}🚀 Vérification pre-deploy BinomePay${colors.reset}\n`);

checkPackageJson();
console.log();

checkAppConfig();
console.log();

checkEasJson();
console.log();

checkAssets();
console.log();

checkStoreAssets();
console.log();

checkEnvironment();
console.log();

checkGitIgnore();
console.log();

checkSecurity();
console.log();

// Résumé final
console.log(`${colors.magenta}📊 Résumé des vérifications:${colors.reset}`);
console.log();

if (errors === 0 && warnings === 0) {
  logSuccess('🎉 Toutes les vérifications sont passées !');
  logSuccess('Vous êtes prêt pour le déploiement !');
  console.log();
  logInfo('Commandes de déploiement:');
  logInfo('  Preview:    ./scripts/deploy.sh preview');
  logInfo('  Production: ./scripts/deploy.sh production');
} else {
  if (errors > 0) {
    logError(`${errors} erreur(s) critique(s) détectée(s)`);
  }
  
  if (warnings > 0) {
    logWarning(`${warnings} avertissement(s)`);
  }
  
  console.log();
  
  if (errors > 0) {
    logError('❌ Corrigez les erreurs avant de déployer');
    process.exit(1);
  } else {
    logWarning('⚠️  Vérifiez les avertissements mais vous pouvez déployer');
    process.exit(0);
  }
}