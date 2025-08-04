#!/bin/bash

# CertiProof X - Quick Setup Script
# Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}=================================="
    echo -e "  CertiProof X - Quick Setup"
    echo -e "=================================="
    echo -e "Author: Kai Zenjiro (0xGenesis)"
    echo -e "Email: certiproofx@protonmail.me${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 20+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_error "Node.js version 20+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Setup environment files
setup_environment() {
    print_step "Setting up environment files..."
    
    # Backend
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env"
    else
        print_info "backend/.env already exists"
    fi
    
    # Frontend
    if [ ! -f "frontend/.env" ]; then
        cp frontend/env.example frontend/.env
        print_success "Created frontend/.env"
    else
        print_info "frontend/.env already exists"
    fi
    
    # Contracts
    if [ ! -f "contracts/.env" ]; then
        cp contracts/env.example contracts/.env
        print_success "Created contracts/.env"
    else
        print_info "contracts/.env already exists"
    fi
    
    print_info "Please edit .env files with your actual values before running the application."
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Backend
    print_info "Installing backend dependencies..."
    cd backend && npm install && cd ..
    print_success "Backend dependencies installed"
    
    # Frontend
    print_info "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    print_success "Frontend dependencies installed"
    
    # Contracts
    print_info "Installing contracts dependencies..."
    cd contracts && npm install && cd ..
    print_success "Contracts dependencies installed"
}

# Setup SSL certificates (self-signed for development)
setup_ssl() {
    print_step "Setting up SSL certificates for development..."
    
    if [ ! -d "ssl" ]; then
        mkdir -p ssl
        
        # Generate self-signed certificate
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=CertiProof X/CN=localhost" \
            2>/dev/null || {
                print_info "OpenSSL not available, skipping SSL setup"
                print_info "You can manually create SSL certificates in the ssl/ directory"
                return
            }
        
        print_success "SSL certificates created"
    else
        print_info "SSL directory already exists"
    fi
}

# Build Docker images
build_containers() {
    print_step "Building Docker containers..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose build
    else
        docker compose build
    fi
    
    print_success "Docker containers built"
}

# Display completion message
display_completion() {
    echo ""
    print_success "Setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Edit .env files in backend/, frontend/, and contracts/ directories"
    echo "2. Add your API keys, RPC URLs, and other configuration"
    echo "3. Start the development environment:"
    echo ""
    echo -e "${GREEN}   make start${NC}"
    echo ""
    echo "   Or using Docker Compose directly:"
    echo -e "${GREEN}   docker-compose up -d${NC}"
    echo ""
    print_info "Useful commands:"
    echo "  make help          - Show all available commands"
    echo "  make logs          - View application logs"
    echo "  make test          - Run tests"
    echo "  make lint          - Run code linting"
    echo ""
    print_info "Access URLs (after starting):"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:3001"
    echo "  API Docs:  http://localhost:3001/api/docs"
    echo ""
}

# Main setup function
main() {
    print_header
    
    check_prerequisites
    setup_environment
    install_dependencies
    setup_ssl
    build_containers
    display_completion
}

# Run setup if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi