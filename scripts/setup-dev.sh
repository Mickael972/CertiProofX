#!/bin/bash
# CertiProof X - Development Environment Setup
# Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js version
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_VERSION="16.0.0"
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js $NODE_VERSION is installed"
        else
            print_error "Node.js $REQUIRED_VERSION or higher is required (found $NODE_VERSION)"
            exit 1
        fi
    else
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION is installed"
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check git
    if command -v git >/dev/null 2>&1; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        print_success "git $GIT_VERSION is installed"
    else
        print_error "git is not installed"
        exit 1
    fi
    
    # Check curl (optional)
    if command -v curl >/dev/null 2>&1; then
        print_success "curl is available"
    else
        print_warning "curl is not installed (optional)"
    fi
    
    # Check docker (optional)
    if command -v docker >/dev/null 2>&1; then
        print_success "Docker is available"
    else
        print_warning "Docker is not installed (optional)"
    fi
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Contracts environment
    if [ ! -f "contracts/.env" ]; then
        print_status "Creating contracts/.env..."
        cat > contracts/.env << 'EOF'
# Alchemy API Key (get from https://alchemy.com)
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Private key for deployment (NEVER commit real keys!)
PRIVATE_KEY=your_private_key_here

# Polygonscan API Key (get from https://polygonscan.com/apis)
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Etherscan API Key (get from https://etherscan.io/apis)
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Gas reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
EOF
        print_warning "Created contracts/.env - Please configure with your API keys"
    fi
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend/.env..."
        cat > backend/.env << 'EOF'
# Server Configuration
PORT=3001
NODE_ENV=development
HOST=0.0.0.0

# IPFS Configuration
IPFS_PROVIDER=web3storage
WEB3_STORAGE_TOKEN=your_web3_storage_token_here
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Alternative: Pinata Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here

# Security
API_KEY=your_secure_api_key_here
JWT_SECRET=your_jwt_secret_here
ENABLE_API_KEY_AUTH=false

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true

# File Upload
MAX_FILE_SIZE=52428800

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
        print_warning "Created backend/.env - Please configure with your API keys"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        print_status "Creating frontend/.env..."
        cat > frontend/.env << 'EOF'
# Contract Addresses (will be filled after deployment)
REACT_APP_CONTRACT_ADDRESS_MUMBAI=
REACT_APP_CONTRACT_ADDRESS_POLYGON=
REACT_APP_CONTRACT_ADDRESS_GOERLI=
REACT_APP_CONTRACT_ADDRESS_MAINNET=

# Alchemy API Key
REACT_APP_ALCHEMY_API_KEY=your_alchemy_api_key_here

# Backend URL
REACT_APP_BACKEND_URL=http://localhost:3001

# IPFS Gateway
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Environment
REACT_APP_ENVIRONMENT=development
EOF
        print_warning "Created frontend/.env - Please configure after contract deployment"
    fi
    
    print_success "Environment files created"
}

# Install all dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Contracts dependencies
    print_status "Installing contracts dependencies..."
    cd contracts
    npm install
    cd ..
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "All dependencies installed"
}

# Setup git hooks
setup_git_hooks() {
    print_status "Setting up git hooks..."
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for CertiProof X

echo "Running pre-commit checks..."

# Run linting
echo "Linting backend..."
cd backend && npm run lint && cd ..

echo "Linting frontend..."
cd frontend && npm run lint && cd ..

echo "Linting contracts..."
cd contracts && npm run lint && cd ..

echo "Pre-commit checks passed!"
EOF
    
    chmod +x .git/hooks/pre-commit
    
    print_success "Git hooks configured"
}

# Setup VS Code configuration
setup_vscode() {
    print_status "Setting up VS Code configuration..."
    
    mkdir -p .vscode
    
    # Settings
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    "backend",
    "frontend",
    "contracts"
  ],
  "files.associations": {
    "*.sol": "solidity"
  },
  "solidity.defaultCompiler": "remote",
  "solidity.compileUsingRemoteVersion": "v0.8.19+commit.7dd6d404"
}
EOF
    
    # Extensions
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "juanblanco.solidity",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
EOF
    
    # Launch configuration
    cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Launch Frontend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/react-scripts/bin/react-scripts.js",
      "args": ["start"],
      "cwd": "${workspaceFolder}/frontend",
      "console": "integratedTerminal"
    }
  ]
}
EOF
    
    print_success "VS Code configuration created"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    mkdir -p scripts
    
    # Development server script
    cat > scripts/dev.sh << 'EOF'
#!/bin/bash
# Start development servers

trap 'kill $(jobs -p)' EXIT

echo "Starting CertiProof X development environment..."

# Start backend
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
cd frontend && npm start &
FRONTEND_PID=$!

echo "✅ Backend running on http://localhost:3001"
echo "✅ Frontend running on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

wait
EOF
    
    chmod +x scripts/dev.sh
    
    print_success "Development scripts created"
}

# Display next steps
show_next_steps() {
    print_success "Development environment setup completed! 🎉"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Configure API Keys:"
    echo "   - Edit contracts/.env with your Alchemy and Polygonscan API keys"
    echo "   - Edit backend/.env with your IPFS provider credentials"
    echo "   - Get testnet MATIC from https://faucet.polygon.technology/"
    echo ""
    echo "2. Deploy Smart Contracts:"
    echo "   ./deploy.sh contracts mumbai"
    echo ""
    echo "3. Update Frontend Configuration:"
    echo "   - Add contract address to frontend/.env"
    echo ""
    echo "4. Start Development:"
    echo "   ./scripts/dev.sh"
    echo ""
    echo "5. Run Tests:"
    echo "   ./scripts/test-all.sh"
    echo ""
    echo "🔗 Useful Links:"
    echo "   - Alchemy: https://alchemy.com"
    echo "   - Polygonscan: https://polygonscan.com"
    echo "   - Web3.Storage: https://web3.storage"
    echo "   - Mumbai Faucet: https://faucet.polygon.technology/"
    echo ""
    echo "📧 Support: certiproofx@protonmail.me"
}

# Main setup function
main() {
    echo "🔐 CertiProof X - Development Environment Setup"
    echo "📧 Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me"
    echo ""
    
    check_requirements
    setup_environment
    install_dependencies
    setup_git_hooks
    setup_vscode
    create_dev_scripts
    show_next_steps
}

main "$@"