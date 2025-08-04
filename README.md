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

- **Frontend**: React/Next.js, Web3.js, MetaMask integration
- **Backend**: Node.js, Express, IPFS (Web3.Storage)
- **Blockchain**: Ethereum/Polygon, Solidity, Hardhat
- **Storage**: IPFS for files, Blockchain for proofs
- **Deployment**: Vercel/Netlify (Frontend), Railway/Heroku (Backend)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/certiproof-x.git
   cd certiproof-x
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   
   # Install backend dependencies  
   cd backend && npm install && cd ..
   
   # Install contract dependencies
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

1. **Automated Setup**
   ```bash
   ./scripts/setup-dev.sh
   ```

2. **Configure Environment**
   - Edit `contracts/.env` with your API keys
   - Edit `backend/.env` with your IPFS credentials

3. **Deploy & Start**
   ```bash
   ./deploy.sh setup
   ./deploy.sh deploy mumbai
   ./scripts/dev.sh
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

## 🌐 Deployment

### Automated Deployment

```bash
# Full deployment to testnet
./deploy.sh deploy mumbai

# Full deployment to mainnet  
./deploy.sh deploy polygon

# Deploy only contracts
./deploy.sh contracts mumbai

# Verify contracts
./deploy.sh verify mumbai
```

### Manual Deployment

#### Smart Contracts
```bash
cd contracts
npx hardhat run scripts/deploy.js --network mumbai
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

#### Backend (Railway/Heroku)
```bash
cd backend
railway deploy
# or
git push heroku main
```

#### Frontend (Vercel/Netlify)
```bash
cd frontend
vercel --prod
# or
npm run build && netlify deploy --prod
```

### Docker Deployment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
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