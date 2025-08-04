# 🔐 CertiProof X – Decentralized Proof Protocol

CertiProof X is an open-source Web3 protocol for certifying any digital proof (diplomas, skills, ownership, identity) in a trustless, verifiable and immutable way using blockchain, IPFS and cryptographic signatures.

Inspired by Bitcoin's revolution of money, CertiProof X aims to revolutionize digital trust.

✅ Proofs are signed  
✅ Hashes are immutable  
✅ Files are stored on IPFS  
✅ NFTs are minted as tokens of truth  

## 🚀 Features

- **Document Certification**: Upload any document (PDF, image, text) and generate cryptographic proof
- **NFT Minting**: Mint ERC-721 tokens on Polygon as certificates of authenticity  
- **IPFS Storage**: Decentralized storage ensuring permanent availability
- **QR Code Verification**: Easy verification via QR codes or wallet addresses
- **Web2 Friendly**: Simple interface accessible to non-crypto users
- **GDPR Compliant**: Privacy-first design with optional data anonymization
- **🌍 Multilingual Support**: French and English interface with language switcher
- **📱 Responsive Design**: Optimized mobile-first design with perfect navbar responsiveness
- **⚡ Native Deployment**: Docker-free deployment with PM2 for production performance

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Smart Contract │
│   (React)       │◄──►│   (Node.js)     │◄──►│    (Solidity)   │
│                 │    │                 │    │                 │
│ • File Upload   │    │ • IPFS Upload   │    │ • ERC-721 NFT   │
│ • SHA-256 Hash  │    │ • PDF Generate  │    │ • Proof Storage │
│ • NFT Mint      │    │ • QR Generate   │    │ • Verification  │
│ • Verification  │    │ • Metadata      │    │ • Governance    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │      IPFS       │
                       │  (Web3.Storage) │
                       │                 │
                       │ • File Storage  │
                       │ • Metadata      │
                       │ • Certificates  │
                       └─────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Ethers.js v6, MetaMask integration, Tailwind CSS
- **Backend**: Node.js 20+, Express, IPFS (Web3.Storage)
- **Blockchain**: Ethereum/Polygon, Solidity 0.8.20, Hardhat, OpenZeppelin v5
- **Storage**: IPFS for files, Blockchain for proofs
- **Deployment**: PM2 Process Manager, Native Node.js deployment
- **i18n**: Custom internationalization system (French/English)
- **Dev Tools**: Makefile automation, ESLint, Prettier, automated setup scripts

## 📦 Installation

### 🚀 Quick Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/certiproof-x.git
cd certiproof-x

# Automated complete setup
chmod +x setup.sh
./setup.sh

# Or using Make
make setup
```

### 🔧 Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/certiproof-x.git
   cd certiproof-x
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install all project dependencies
   make install
   # OR manually:
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   cd contracts && npm install && cd ..
   ```

3. **Environment Setup**
   
   Create `.env` files in each module:
   
   **Frontend `.env`:**
   ```
   REACT_APP_CONTRACT_ADDRESS=0x...
   REACT_APP_ALCHEMY_API_KEY=your_alchemy_key
   REACT_APP_BACKEND_URL=http://localhost:3001
   ```
   
   **Backend `.env`:**
   ```
   WEB3_STORAGE_TOKEN=your_web3_storage_token
   PINATA_API_KEY=your_pinata_key
   PINATA_SECRET_KEY=your_pinata_secret
   PORT=3001
   ```
   
   **Contracts `.env`:**
   ```
   PRIVATE_KEY=your_private_key
   ALCHEMY_API_KEY=your_alchemy_key
   POLYGONSCAN_API_KEY=your_polygonscan_key
   ```

## 🚀 Quick Start

### Development Setup (Recommended)

1. **Complete Automated Setup**
   ```bash
   # Full setup with all dependencies
   ./setup.sh
   
   # OR using Makefile
   make dev-setup
   ```

2. **Start Development Server**
   ```bash
   # Start all services (Frontend + Backend)
   make dev
   
   # Or separately:
   make dev-frontend  # Frontend only (port 3000)
   make dev-backend   # Backend only (port 3001)
   ```

3. **Deploy Smart Contracts**
   ```bash
   # Deploy to testnet
   make deploy-testnet
   
   # Deploy to mainnet  
   make deploy-mainnet
   ```

### 🎯 Available Make Commands

```bash
make help          # Show all available commands
make install       # Install all dependencies
make build         # Build all projects
make test          # Run all tests
make clean         # Clean all build artifacts
make lint          # Run linters
make dev           # Start development environment
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Deploy Smart Contract**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network mumbai
   ```

3. **Start Services**
   ```bash
   # Backend
   cd backend && npm run dev &
   
   # Frontend
   cd frontend && npm start
   ```

4. **Access Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Usage

### Minting a Certificate

1. **Upload Document**: Select any file (PDF, image, text)
2. **Generate Hash**: SHA-256 hash computed client-side
3. **Add Metadata**: Title, description, document type
4. **Mint NFT**: Connect wallet and mint on Polygon Mumbai
5. **Download Certificate**: Get PDF certificate with QR code

### Verifying a Certificate

1. **Scan QR Code**: Or enter NFT token ID/wallet address
2. **View Proof**: See original hash, IPFS link, metadata
3. **Verify Authenticity**: Compare with original document hash

## 📋 Smart Contract Details

### CertiProofNFT (ERC-721)

**Contract Address (Mumbai)**: `0x...` (After deployment)

**Key Functions**:
- `mint(address to, string hash, string ipfsURI, bool locked)`: Mint new certificate
- `verifyProof(string hash)`: Verify proof by document hash  
- `getProofByTokenId(uint256 tokenId)`: Get proof details by NFT ID
- `isProofLocked(uint256 tokenId)`: Check if proof is immutable

**Events**:
- `ProofMinted(uint256 tokenId, string hash, string ipfsURI)`
- `ProofVerified(uint256 tokenId, address verifier)`

## 🔒 Security & Privacy

- **No Personal Data**: Only cryptographic hashes stored on-chain
- **IPFS Privacy**: Documents encrypted before IPFS upload (optional)
- **Wallet Signatures**: MetaMask signatures for authenticity
- **GDPR Compliance**: Right to be forgotten via IPFS unpinning
- **Immutable Proofs**: Optional locked proofs for regulatory compliance

## 🧪 Testing

### Comprehensive Testing
```bash
# Run all tests
./scripts/test-all.sh

# Test specific components
./scripts/test-all.sh contracts
./scripts/test-all.sh backend
./scripts/test-all.sh frontend
./scripts/test-all.sh integration
./scripts/test-all.sh security
```

### Manual Testing
```bash
# Test smart contracts
cd contracts && npx hardhat test

# Test backend
cd backend && npm test

# Test frontend
cd frontend && npm test
```

## 📚 API Documentation

### Backend Endpoints

- `POST /api/upload`: Upload file to IPFS
- `POST /api/generate-certificate`: Generate PDF certificate  
- `POST /api/generate-qr`: Generate QR code
- `GET /api/verify/:tokenId`: Verify certificate by NFT ID
- `GET /api/metadata/:tokenId`: Get NFT metadata

## 🌍 Internationalization (i18n)

CertiProof X supports multiple languages with a custom i18n system:

### Supported Languages
- **🇫🇷 French (Français)** - Complete translation
- **🇬🇧 English** - Default language

### Features
- **Dynamic Language Switching**: Instant language change without page reload
- **Persistent Selection**: Language preference saved in localStorage
- **Responsive UI**: Language switcher adapts to mobile/desktop layouts
- **Complete Coverage**: All UI elements, errors, and messages translated

### Adding New Languages

1. **Create translation file**
   ```bash
   # Copy existing translation
   cp frontend/src/locales/en.json frontend/src/locales/es.json
   ```

2. **Update language configuration**
   ```javascript
   // frontend/src/components/UI/LanguageSwitcher.js
   const languages = {
     fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
     en: { code: 'en', name: 'English', flag: '🇬🇧' },
     es: { code: 'es', name: 'Español', flag: '🇪🇸' }, // Add new language
   };
   ```

3. **Translate all keys**
   ```json
   {
     "nav": {
       "home": "Inicio",
       "upload": "Subir",
       "mint": "Acuñar",
       "verify": "Verificar",
       "certificates": "Certificados"
     }
   }
   ```

## 🌐 Deployment

### 🚀 Native Deployment (Recommended)

#### Quick Production Deploy
```bash
# Automated deployment script
chmod +x deploy-simple.sh
./deploy-simple.sh

# Or using Make
make deploy-prod
```

#### Manual PM2 Deployment
```bash
# 1. Build all projects
make build

# 2. Install PM2 globally
npm install -g pm2

# 3. Start services with PM2
pm2 start ecosystem.config.js --env production

# 4. PM2 management commands
pm2 status        # Check status
pm2 logs          # View logs
pm2 restart all   # Restart all services
pm2 stop all      # Stop all services
pm2 delete all    # Delete all services
```

### 🔧 Smart Contract Deployment

#### Using Makefile
```bash
# Deploy to testnet (Mumbai)
make deploy-testnet

# Deploy to mainnet (Polygon)
make deploy-mainnet

# Verify contracts
make verify-contracts
```

#### Manual Contract Deployment
```bash
cd contracts
npx hardhat run scripts/deploy.js --network mumbai
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

### 🏗️ Production Server Setup

#### Prerequisites
```bash
# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 Process Manager
npm install -g pm2

# Clone and setup project
git clone https://github.com/your-username/certiproof-x.git
cd certiproof-x
./setup.sh
```

#### Environment Configuration
```bash
# Copy example files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
cp contracts/env.example contracts/.env

# Edit with production values
nano backend/.env    # IPFS tokens, API keys
nano frontend/.env   # Contract addresses, API URLs
nano contracts/.env  # Private keys, API keys
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Kai Zenjiro (0xGenesis)**
- Email: certiproofx@protonmail.me
- Wallet: 0x1E274F39A44f1561b3Bb21148B9881075575676D
- GitHub: [@0xGenesis](https://github.com/0xGenesis)

## 🙏 Acknowledgments

- Ethereum Foundation for the underlying technology
- Polygon for scalable infrastructure  
- IPFS for decentralized storage
- OpenZeppelin for secure smart contract standards

## 🔗 Links

- [Live Demo](https://certiproof-x.vercel.app)
- [Smart Contract](https://mumbai.polygonscan.com/address/0x...)
- [Documentation](https://docs.certiproof-x.com)
- [IPFS Proof Explorer](https://ipfs.io/ipfs/...)

---

**Built with ❤️ for a trustless future**