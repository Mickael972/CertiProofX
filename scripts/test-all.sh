#!/bin/bash
# CertiProof X - Comprehensive Test Suite
# Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test smart contracts
test_contracts() {
    print_status "Testing smart contracts..."
    cd contracts
    
    # Compile contracts
    npx hardhat compile
    
    # Run tests with coverage
    npx hardhat test
    npx hardhat coverage
    
    # Gas reporting
    REPORT_GAS=true npx hardhat test
    
    cd ..
    print_success "Smart contract tests completed"
}

# Test backend
test_backend() {
    print_status "Testing backend..."
    cd backend
    
    # Lint code
    npm run lint
    
    # Run tests with coverage
    npm run test:coverage
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    npm start &
    SERVER_PID=$!
    sleep 5
    
    # Health check
    curl -f http://localhost:3001/api/health || print_error "Health check failed"
    
    # Stop server
    kill $SERVER_PID 2>/dev/null || true
    
    cd ..
    print_success "Backend tests completed"
}

# Test frontend
test_frontend() {
    print_status "Testing frontend..."
    cd frontend
    
    # Lint code
    npm run lint
    
    # Run tests with coverage
    npm test -- --coverage --watchAll=false
    
    # Build production version
    npm run build
    
    # Test build size
    npx bundlesize
    
    cd ..
    print_success "Frontend tests completed"
}

# Integration tests
test_integration() {
    print_status "Running integration tests..."
    
    # Start all services
    docker-compose up -d
    sleep 30
    
    # Wait for services to be ready
    timeout 60 bash -c 'until curl -f http://localhost:3001/api/health; do sleep 2; done'
    timeout 60 bash -c 'until curl -f http://localhost:3000; do sleep 2; done'
    
    # Run integration tests
    cd frontend
    npm run test:e2e
    cd ..
    
    # Stop services
    docker-compose down
    
    print_success "Integration tests completed"
}

# Security tests
test_security() {
    print_status "Running security tests..."
    
    # Smart contract security
    cd contracts
    npm audit
    npx slither . || print_error "Slither analysis found issues"
    cd ..
    
    # Backend security
    cd backend
    npm audit
    npx snyk test || print_error "Snyk found vulnerabilities"
    cd ..
    
    # Frontend security
    cd frontend
    npm audit
    npx snyk test || print_error "Snyk found vulnerabilities"
    cd ..
    
    print_success "Security tests completed"
}

# Performance tests
test_performance() {
    print_status "Running performance tests..."
    
    # Start services
    docker-compose up -d
    sleep 30
    
    # Lighthouse audit
    cd frontend
    npx lighthouse http://localhost:3000 --output html --output-path lighthouse-report.html
    cd ..
    
    # Load testing
    npx artillery run scripts/load-test.yml
    
    # Stop services
    docker-compose down
    
    print_success "Performance tests completed"
}

# Main test runner
main() {
    echo "🔐 CertiProof X - Comprehensive Test Suite"
    echo "📧 Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me"
    echo ""
    
    START_TIME=$(date +%s)
    
    case ${1:-"all"} in
        "contracts")
            test_contracts
            ;;
        "backend")
            test_backend
            ;;
        "frontend")
            test_frontend
            ;;
        "integration")
            test_integration
            ;;
        "security")
            test_security
            ;;
        "performance")
            test_performance
            ;;
        "all")
            test_contracts
            test_backend
            test_frontend
            test_integration
            test_security
            test_performance
            ;;
        *)
            echo "Usage: $0 [contracts|backend|frontend|integration|security|performance|all]"
            exit 1
            ;;
    esac
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    print_success "All tests completed in ${DURATION}s! 🎉"
}

main "$@"