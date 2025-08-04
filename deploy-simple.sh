#!/bin/bash

# Script de déploiement simple SANS Docker
# Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
# Plus sécurisé et simple que Docker !

echo "🚀 DÉPLOIEMENT CERTIPROOF X - SANS DOCKER"
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo_error "Node.js n'est pas installé. Installez Node.js 20+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo_error "Node.js version 20+ requis. Version actuelle: $(node -v)"
    exit 1
fi

echo_success "Node.js $(node -v) détecté"

# Installer PM2 si pas présent
if ! command -v pm2 &> /dev/null; then
    echo_info "Installation de PM2..."
    npm install -g pm2
    echo_success "PM2 installé"
fi

# Créer les dossiers de logs
mkdir -p logs
mkdir -p backend/logs
mkdir -p frontend/logs

echo_info "Installation des dépendances backend..."
cd backend
npm ci --only=production
cd ..
echo_success "Backend prêt"

echo_info "Build et installation frontend..."
cd frontend  
npm ci
npm run build
cd ..
echo_success "Frontend buildé"

echo_info "Installation des dépendances contrats..."
cd contracts
npm ci
cd ..
echo_success "Contrats prêts"

# Démarrer avec PM2
echo_info "Démarrage des services avec PM2..."
pm2 start ecosystem.config.js

# Configurer PM2 pour redémarrage automatique
pm2 startup
pm2 save

echo_success "🎉 DÉPLOIEMENT TERMINÉ !"
echo ""
echo "📱 Frontend: http://localhost:3000"  
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "📊 Commandes utiles:"
echo "   pm2 status           # Voir le statut"
echo "   pm2 logs             # Voir les logs"
echo "   pm2 restart all      # Redémarrer"
echo "   pm2 stop all         # Arrêter"
echo "   pm2 delete all       # Supprimer"
echo ""
echo "🔒 Sécurité: ZÉRO vulnérabilité Docker !"