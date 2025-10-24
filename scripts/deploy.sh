#!/bin/bash

# 🚀 Script de déploiement BinomePay sur Play Store
# Usage: ./scripts/deploy.sh [preview|production]

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour les messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les arguments
PROFILE=${1:-preview}
if [[ "$PROFILE" != "preview" && "$PROFILE" != "production" ]]; then
    log_error "Usage: $0 [preview|production]"
    exit 1
fi

log_info "🚀 Début du déploiement BinomePay - Profile: $PROFILE"

# Vérifier que nous sommes dans le bon répertoire
if [[ ! -f "app.config.ts" || ! -f "package.json" ]]; then
    log_error "Ce script doit être exécuté depuis la racine du projet BinomePay"
    exit 1
fi

# Vérifier les prérequis
log_info "🔍 Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

# Vérifier EAS CLI
if ! command -v eas &> /dev/null; then
    log_error "EAS CLI n'est pas installé. Installez avec: npm install -g eas-cli"
    exit 1
fi

log_success "Prérequis OK"

# Vérifier la connexion EAS
log_info "🔐 Vérification de la connexion EAS..."
if ! eas whoami &> /dev/null; then
    log_error "Vous n'êtes pas connecté à EAS. Connectez-vous avec: eas login"
    exit 1
fi

EAS_USER=$(eas whoami)
log_success "Connecté à EAS en tant que: $EAS_USER"

# Installer les dépendances
log_info "📦 Installation des dépendances..."
npm ci
log_success "Dépendances installées"

# Vérification TypeScript
log_info "🔍 Vérification TypeScript..."
if ! npm run type-check; then
    log_error "Erreurs TypeScript détectées. Corrigez-les avant de déployer."
    exit 1
fi
log_success "TypeScript OK"

# Nettoyer les builds précédents
log_info "🧹 Nettoyage des builds précédents..."
rm -rf .expo
log_success "Nettoyage terminé"

# Vérifier la version
CURRENT_VERSION=$(grep '"version":' package.json | cut -d'"' -f4)
log_info "📦 Version actuelle: $CURRENT_VERSION"

if [[ "$PROFILE" == "production" ]]; then
    # Vérifications supplémentaires pour la production
    log_info "🔍 Vérifications production..."
    
    # Vérifier que nous ne sommes pas en mode mock
    if grep -q "EXPO_PUBLIC_MOCK_API.*true" .env 2>/dev/null; then
        log_warning "Le fichier .env contient MOCK_API=true. Assurez-vous que la production utilisera de vraies données."
    fi
    
    # Vérifier les assets
    if [[ ! -f "assets/icon.png" ]]; then
        log_error "Icône manquante: assets/icon.png"
        exit 1
    fi
    
    if [[ ! -f "assets/adaptive-icon.png" ]]; then
        log_error "Icône adaptative manquante: assets/adaptive-icon.png"
        exit 1
    fi
    
    log_success "Vérifications production OK"
    
    # Demander confirmation pour la production
    echo
    log_warning "⚠️  DÉPLOIEMENT EN PRODUCTION ⚠️"
    log_warning "Ceci va créer une version qui sera soumise au Play Store"
    echo
    read -p "Êtes-vous sûr de vouloir continuer? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Déploiement annulé"
        exit 0
    fi
fi

# Build EAS
log_info "🏗️  Début du build EAS ($PROFILE)..."
echo
eas build --platform android --profile "$PROFILE" --non-interactive

if [[ $? -eq 0 ]]; then
    log_success "Build EAS réussi!"
else
    log_error "Échec du build EAS"
    exit 1
fi

# Pour la production, proposer la soumission automatique
if [[ "$PROFILE" == "production" ]]; then
    echo
    log_info "🚀 Le build de production est terminé!"
    echo
    read -p "Voulez-vous soumettre automatiquement au Play Store? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "📤 Soumission au Play Store..."
        
        if eas submit --platform android --latest --non-interactive; then
            log_success "Application soumise au Play Store avec succès!"
            log_info "📱 L'application sera disponible après validation (1-3 jours)"
        else
            log_error "Échec de la soumission au Play Store"
            log_info "Vous pouvez réessayer avec: eas submit --platform android --latest"
        fi
    else
        log_info "📁 Vous pouvez soumettre manuellement plus tard avec:"
        log_info "   eas submit --platform android --latest"
    fi
else
    # Pour preview, donner les instructions de test
    log_success "Build preview terminé!"
    log_info "📱 Pour télécharger et tester l'APK:"
    log_info "   1. Allez sur https://expo.dev/accounts/$(eas whoami)/projects/binomepay/builds"
    log_info "   2. Téléchargez le dernier build"
    log_info "   3. Installez sur votre appareil Android"
fi

echo
log_success "🎉 Déploiement terminé avec succès!"

# Afficher les prochaines étapes
echo
log_info "📋 Prochaines étapes:"
if [[ "$PROFILE" == "production" ]]; then
    log_info "   1. Vérifier le statut dans Google Play Console"
    log_info "   2. Préparer les assets marketing (screenshots, descriptions)"
    log_info "   3. Attendre la validation Google (1-3 jours)"
    log_info "   4. Surveiller les métriques post-lancement"
else
    log_info "   1. Tester l'APK sur plusieurs appareils"
    log_info "   2. Vérifier les fonctionnalités critiques"
    log_info "   3. Si tout est OK, déployer en production avec:"
    log_info "      ./scripts/deploy.sh production"
fi

echo
log_info "📞 Support: developer@binomepay.com"
log_info "📖 Documentation: ./DEPLOYMENT_GUIDE.md"