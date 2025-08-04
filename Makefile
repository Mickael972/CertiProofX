# CertiProof X - Makefile
# Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me

.PHONY: help install build start stop clean test lint format deploy logs shell

# Default target
help:
	@echo "CertiProof X - Development Commands"
	@echo "=================================="
	@echo ""
	@echo "🚀 Quick Start:"
	@echo "  make install     - Install all dependencies"
	@echo "  make start       - Start development environment"
	@echo ""
	@echo "🔧 Development:"
	@echo "  make build       - Build all containers"
	@echo "  make stop        - Stop all services"
	@echo "  make clean       - Clean up containers and volumes"
	@echo "  make logs        - Show application logs"
	@echo ""
	@echo "🧪 Testing & Quality:"
	@echo "  make test        - Run all tests"
	@echo "  make lint        - Run linters"
	@echo "  make format      - Format code"
	@echo ""
	@echo "🚢 Deployment:"
	@echo "  make deploy-dev  - Deploy to development"
	@echo "  make deploy-prod - Deploy to production"
	@echo ""
	@echo "🔍 Utilities:"
	@echo "  make shell-backend   - Backend shell"
	@echo "  make shell-frontend  - Frontend shell"
	@echo "  make shell-contracts - Contracts shell"

# Installation
install:
	@echo "📦 Installing dependencies..."
	@cd backend && npm install
	@cd frontend && npm install
	@cd contracts && npm install
	@echo "✅ Dependencies installed!"

# Development
start:
	@echo "🚀 Starting development environment..."
	@docker-compose up -d
	@echo "✅ Development environment started!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "⚡ Backend: http://localhost:3001"
	@echo "📊 Logs: make logs"

build:
	@echo "🔨 Building containers..."
	@docker-compose build --no-cache
	@echo "✅ Containers built!"

stop:
	@echo "⏹️  Stopping services..."
	@docker-compose down
	@echo "✅ Services stopped!"

clean:
	@echo "🧹 Cleaning up..."
	@docker-compose down -v --remove-orphans
	@docker system prune -f
	@echo "✅ Cleanup complete!"

restart: stop start

# Logs
logs:
	@docker-compose logs -f

logs-backend:
	@docker-compose logs -f backend

logs-frontend:
	@docker-compose logs -f frontend

# Testing
test:
	@echo "🧪 Running tests..."
	@cd backend && npm test
	@cd frontend && npm test
	@cd contracts && npm test
	@echo "✅ Tests completed!"

test-backend:
	@cd backend && npm test

test-frontend:
	@cd frontend && npm test

test-contracts:
	@cd contracts && npm test

# Code Quality
lint:
	@echo "🔍 Running linters..."
	@cd backend && npm run lint
	@cd frontend && npm run lint
	@cd contracts && npm run lint
	@echo "✅ Linting completed!"

lint-fix:
	@echo "🔧 Fixing lint issues..."
	@cd backend && npm run lint:fix
	@cd frontend && npm run lint:fix
	@cd contracts && npm run lint:fix
	@echo "✅ Lint fixes applied!"

format:
	@echo "💄 Formatting code..."
	@cd backend && npm run format
	@cd frontend && npm run format
	@echo "✅ Code formatted!"

# Shell access
shell-backend:
	@docker-compose exec backend sh

shell-frontend:
	@docker-compose exec frontend sh

shell-contracts:
	@echo "🔧 Contracts shell..."
	@cd contracts && npm run console

# Database
db-migrate:
	@echo "🗃️  Running database migrations..."
	@docker-compose exec backend npm run db:migrate

db-seed:
	@echo "🌱 Seeding database..."
	@docker-compose exec backend npm run db:seed

db-reset:
	@echo "♻️  Resetting database..."
	@docker-compose exec backend npm run db:reset

# Blockchain
compile-contracts:
	@echo "⚡ Compiling contracts..."
	@cd contracts && npm run compile

deploy-mumbai:
	@echo "🚀 Deploying to Mumbai..."
	@cd contracts && npm run deploy:mumbai

deploy-polygon:
	@echo "🚀 Deploying to Polygon..."
	@cd contracts && npm run deploy:polygon

# Security
security-audit:
	@echo "🔒 Running security audit..."
	@cd backend && npm audit
	@cd frontend && npm audit
	@cd contracts && npm audit

# Docker utilities
docker-prune:
	@echo "🧹 Pruning Docker..."
	@docker system prune -af --volumes

docker-logs:
	@docker-compose logs -f --tail=100

docker-ps:
	@docker-compose ps

# Environment setup
setup-env:
	@echo "🔧 Setting up environment files..."
	@cp backend/env.example backend/.env
	@cp frontend/env.example frontend/.env
	@cp contracts/env.example contracts/.env
	@echo "✅ Environment files created!"
	@echo "⚠️  Please edit .env files with your actual values"

# Production deployment
deploy-prod:
	@echo "🚀 Deploying to production..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "✅ Production deployment complete!"

# Backup
backup:
	@echo "💾 Creating backup..."
	@mkdir -p backups
	@docker-compose exec postgres pg_dump -U postgres certiproof_x > backups/db_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created!"

# Monitoring
health-check:
	@echo "🩺 Checking service health..."
	@curl -f http://localhost:3001/api/health || echo "❌ Backend unhealthy"
	@curl -f http://localhost:3000 || echo "❌ Frontend unhealthy"

# Update dependencies
update-deps:
	@echo "📦 Updating dependencies..."
	@cd backend && npm update
	@cd frontend && npm update
	@cd contracts && npm update
	@echo "✅ Dependencies updated!"