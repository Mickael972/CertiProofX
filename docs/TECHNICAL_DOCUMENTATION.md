# CertiProof X - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contracts](#smart-contracts)
3. [Backend API](#backend-api)
4. [Frontend Application](#frontend-application)
5. [Deployment Guide](#deployment-guide)
6. [Security Considerations](#security-considerations)
7. [API Reference](#api-reference)
8. [Testing](#testing)

## Architecture Overview

CertiProof X follows a modular architecture with clear separation of concerns:

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

### Data Flow

1. **Document Upload:** User uploads document via frontend
2. **Hash Generation:** SHA-256 hash calculated client-side
3. **IPFS Storage:** File uploaded to IPFS via backend
4. **Certificate Generation:** PDF certificate with QR code created
5. **NFT Minting:** Smart contract mints ERC-721 token with metadata
6. **Verification:** Anyone can verify proof using hash or token ID

## Smart Contracts

### CertiProofNFT Contract

**File:** `contracts/contracts/CertiProofNFT.sol`  
**Standard:** ERC-721 (Non-Fungible Token)  
**Compiler:** Solidity ^0.8.19  

#### Key Features

- **Proof Storage:** Stores document hashes and IPFS URIs on-chain
- **Verification:** Multiple verification methods (hash, token ID, wallet)
- **Governance:** Owner controls and optional proof locking
- **Privacy:** Only hashes stored, never actual documents
- **GDPR Compliance:** IPFS URI updates for right to be forgotten

#### Core Functions

```solidity
// Mint new certificate
function mint(address to, string hash, string ipfsURI, string documentType, string title, bool locked) 
    public returns (uint256)

// Verify proof by document hash
function verifyProofByHash(string hash) 
    public returns (bool exists, uint256 tokenId, bool isActive)

// Verify proof by token ID
function verifyProofByTokenId(uint256 tokenId) 
    public returns (bool isActive)

// Get complete proof data
function getProofByTokenId(uint256 tokenId) 
    public view returns (Proof memory)

// Lock proof to prevent modifications
function lockProof(uint256 tokenId) public

// Revoke/restore proof status
function revokeProof(uint256 tokenId, string reason) public
function restoreProof(uint256 tokenId) public
```

#### Data Structures

```solidity
struct Proof {
    string documentHash;     // SHA-256 hash of original document
    string ipfsURI;         // IPFS URI for metadata
    address issuer;         // Address that minted the proof
    uint256 timestamp;      // Block timestamp when minted
    string documentType;    // Type of document
    string title;          // Human-readable title
    bool isLocked;         // If true, proof cannot be modified
    bool isActive;         // If false, proof is revoked
}
```

#### Events

```solidity
event ProofMinted(uint256 indexed tokenId, string indexed documentHash, 
                  string ipfsURI, address indexed issuer, string documentType, string title);
event ProofVerified(uint256 indexed tokenId, address indexed verifier, uint256 timestamp);
event ProofLocked(uint256 indexed tokenId, address indexed locker);
event ProofRevoked(uint256 indexed tokenId, address indexed revoker, string reason);
```

### Deployment Addresses

- **Mumbai Testnet:** [To be deployed]
- **Polygon Mainnet:** [To be deployed]
- **Goerli Testnet:** [To be deployed]
- **Ethereum Mainnet:** [To be deployed]

## Backend API

### Technology Stack

- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **IPFS:** Web3.Storage, Pinata
- **PDF Generation:** PDFKit
- **QR Codes:** qrcode library
- **Security:** Helmet, CORS, Rate limiting

### Architecture

```
src/
├── server.js           # Main server entry point
├── config/
│   └── config.js      # Configuration management
├── routes/
│   ├── upload.js      # File upload endpoints
│   ├── certificate.js # PDF and QR generation
│   ├── verification.js# Proof verification
│   ├── metadata.js    # NFT metadata
│   └── health.js      # Health checks
├── services/
│   ├── ipfsService.js # IPFS integration
│   └── certificateService.js # PDF/QR generation
├── middleware/
│   ├── auth.js        # Authentication
│   └── errorHandler.js# Error handling
└── utils/
    ├── crypto.js      # Cryptographic utilities
    └── logger.js      # Logging system
```

### Key Services

#### IPFS Service

Handles file uploads to decentralized storage:

```javascript
class IPFSService {
    async uploadFile(fileBuffer, filename, metadata)
    async uploadMetadata(metadata, name)
    async retrieveFile(hash)
    async fileExists(hash)
    async pinFile(hash)
}
```

#### Certificate Service

Generates PDF certificates and QR codes:

```javascript
class CertificateService {
    async generateCertificatePDF(certificateData)
    async generateQRCode(data)
    async generateStandaloneQR(data, options)
    generateMetadata(certificateData)
}
```

### Environment Variables

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# IPFS Configuration
IPFS_PROVIDER=web3storage
WEB3_STORAGE_TOKEN=your_token
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret

# Security
API_KEY=your_api_key
JWT_SECRET=your_jwt_secret

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
```

## Frontend Application

### Technology Stack

- **Framework:** React 18
- **Styling:** Tailwind CSS
- **Web3:** Ethers.js, MetaMask
- **State Management:** React Context
- **Routing:** React Router DOM
- **Build Tool:** Create React App

### Project Structure

```
src/
├── App.js              # Main application component
├── index.js           # Entry point
├── contexts/
│   ├── Web3Context.js  # Web3 connection management
│   └── AppContext.js   # Global application state
├── pages/
│   ├── Home.js         # Landing page
│   ├── Upload.js       # File upload interface
│   ├── Mint.js         # NFT minting interface
│   ├── Verify.js       # Proof verification
│   ├── Certificates.js # User certificates
│   └── About.js        # About page
├── components/
│   ├── Layout/         # Layout components
│   └── UI/            # Reusable UI components
└── utils/             # Utility functions
```

### Web3 Integration

#### Connection Management

```javascript
const { isConnected, account, connectWallet, contract } = useWeb3();

// Connect wallet
await connectWallet();

// Mint NFT
const tx = await contract.mint(account, documentHash, ipfsURI, 
                               documentType, title, false);
await tx.wait();
```

#### Supported Networks

- **Polygon Mumbai:** ChainID 80001 (Testnet)
- **Polygon Mainnet:** ChainID 137
- **Ethereum Goerli:** ChainID 5 (Testnet)
- **Ethereum Mainnet:** ChainID 1

### Key Features

#### File Upload

- Drag & drop interface
- Client-side SHA-256 hashing
- File type validation
- Size limits (50MB)
- Progress indicators

#### Certificate Verification

- Token ID verification
- Document hash verification
- Wallet address lookup
- QR code scanning
- Batch verification

## Deployment Guide

### Prerequisites

- Node.js 16+
- Git
- Web3 wallet (MetaMask)
- IPFS account (Web3.Storage or Pinata)
- Alchemy account (for RPC)

### Smart Contract Deployment

1. **Setup Environment**
```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your keys
```

2. **Deploy to Mumbai Testnet**
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

3. **Verify Contract**
```bash
npx hardhat verify --network mumbai DEPLOYED_ADDRESS "CertiProof X" "CERTX"
```

### Backend Deployment

1. **Setup Environment**
```bash
cd backend
npm install
cp .env.example .env
# Configure IPFS and other services
```

2. **Deploy to Railway/Heroku**
```bash
# Railway
railway deploy

# Heroku
git push heroku main
```

### Frontend Deployment

1. **Build Application**
```bash
cd frontend
npm install
npm run build
```

2. **Deploy to Vercel**
```bash
vercel --prod
```

## Security Considerations

### Smart Contract Security

- **Access Control:** Owner-only functions protected
- **Reentrancy Protection:** ReentrancyGuard used
- **Input Validation:** All inputs validated
- **Integer Overflow:** Solidity 0.8+ prevents overflow
- **Gas Optimization:** Functions optimized for gas usage

### Backend Security

- **Rate Limiting:** Prevents API abuse
- **Input Validation:** All inputs sanitized
- **CORS Protection:** Configured for frontend domain
- **Helmet.js:** Security headers configured
- **Authentication:** Optional API key authentication

### Frontend Security

- **Content Security Policy:** XSS protection
- **HTTPS Only:** All production traffic encrypted
- **Input Sanitization:** User inputs validated
- **Wallet Security:** Private keys never stored
- **Error Handling:** Sensitive info not exposed

### Privacy Protection

- **Document Hashing:** Only hashes stored on-chain
- **IPFS Privacy:** Optional encryption before upload
- **Metadata Control:** Users control what's public
- **GDPR Compliance:** Right to be forgotten supported

## API Reference

### Upload Endpoints

#### POST /api/upload
Upload file to IPFS

**Request:**
```javascript
FormData: {
    file: File,
    title?: string,
    description?: string,
    documentType?: string
}
```

**Response:**
```javascript
{
    success: true,
    data: {
        fileHash: "0x...",
        ipfs: {
            hash: "Qm...",
            url: "ipfs://Qm...",
            gatewayUrl: "https://ipfs.io/ipfs/Qm..."
        }
    }
}
```

### Certificate Endpoints

#### POST /api/certificate/generate
Generate PDF certificate

**Request:**
```javascript
{
    title: string,
    documentHash: string,
    ipfsHash: string,
    issuerAddress: string,
    recipientAddress?: string,
    tokenId?: number,
    documentType?: string
}
```

**Response:**
```javascript
{
    success: true,
    data: {
        certificate: { filename, size, hash },
        metadata: { /* NFT metadata */ }
    },
    pdf: "base64_encoded_pdf"
}
```

### Verification Endpoints

#### GET /api/verification/:tokenId
Verify certificate by token ID

**Response:**
```javascript
{
    success: true,
    data: {
        verified: true,
        tokenId: 123,
        proof: { /* proof details */ },
        blockchain: { /* blockchain info */ }
    }
}
```

## Testing

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

**Test Coverage:**
- Contract deployment
- Minting functionality
- Verification methods
- Access controls
- Edge cases

### Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

**Test Coverage:**
- API endpoints
- IPFS integration
- PDF generation
- Error handling
- Security middleware

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

**Test Coverage:**
- Component rendering
- User interactions
- Web3 integration
- State management
- Error boundaries

### Integration Tests

End-to-end testing with Cypress:

```bash
npm run test:e2e
```

**Test Scenarios:**
- Complete certificate creation flow
- Verification process
- Error handling
- Cross-browser compatibility

## Performance Optimization

### Smart Contract Gas Optimization

- Struct packing for storage efficiency
- Batch operations where possible
- Event indexing for efficient queries
- Minimal on-chain data storage

### Backend Performance

- Response caching
- Image optimization
- Compression middleware
- Connection pooling
- Async/await patterns

### Frontend Performance

- Code splitting
- Lazy loading
- Image optimization
- Service worker caching
- Bundle size monitoring

## Monitoring and Analytics

### Metrics Tracked

- Certificate minting volume
- Verification requests
- Network usage
- Error rates
- User engagement

### Health Checks

- `/api/health` - Basic health
- `/api/health/detailed` - Comprehensive status
- `/api/health/metrics` - Prometheus metrics

## Support and Maintenance

### Bug Reports

Submit issues on GitHub with:
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Relevant logs

### Feature Requests

Contact: certiproofx@protonmail.me

### Community

- GitHub Discussions
- Discord Server
- Documentation Wiki

---

**Last Updated:** August 3, 2025  
**Version:** 1.0.0  
**Author:** Kai Zenjiro (0xGenesis)