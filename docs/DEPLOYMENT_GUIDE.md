# CertiProof X - Deployment Guide

## Quick Start Deployment

This guide will help you deploy CertiProof X from zero to production in under 30 minutes.

## Prerequisites

Before starting, ensure you have:

- [Node.js 16+](https://nodejs.org/) installed
- [Git](https://git-scm.com/) installed
- [MetaMask](https://metamask.io/) wallet setup
- Some testnet MATIC for Mumbai deployment

## 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/0xGenesis/certiproof-x.git
cd certiproof-x

# Install all dependencies
npm run install:all
```

## 2. Environment Configuration

### Smart Contracts Environment

```bash
cd contracts
cp .env.example .env
```

Edit `contracts/.env`:
```bash
# Get from https://alchemy.com
ALCHEMY_API_KEY=your_alchemy_api_key

# Your wallet private key (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Get from https://polygonscan.com/apis
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### Backend Environment

```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env`:
```bash
# Server config
PORT=3001
NODE_ENV=development

# Get from https://web3.storage
WEB3_STORAGE_TOKEN=your_web3_storage_token

# Alternative: Get from https://pinata.cloud
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Security (generate random strings)
API_KEY=your_secure_api_key
JWT_SECRET=your_jwt_secret

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
```

### Frontend Environment

```bash
cd ../frontend
```

Create `frontend/.env`:
```bash
# Will be filled after contract deployment
REACT_APP_CONTRACT_ADDRESS_MUMBAI=
REACT_APP_CONTRACT_ADDRESS_POLYGON=

# Get from https://alchemy.com
REACT_APP_ALCHEMY_API_KEY=your_alchemy_api_key

# Backend URL
REACT_APP_BACKEND_URL=http://localhost:3001
```

## 3. Deploy Smart Contracts

### Deploy to Mumbai Testnet

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Run tests (optional but recommended)
npx hardhat test

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai
```

**Example output:**
```
🚀 Starting CertiProofNFT deployment...
📡 Network: mumbai (Chain ID: 80001)
👤 Deployer: 0x1234...5678
💰 Balance: 1.234 ETH

✅ Contract deployed to: 0xabcd...ef12
🔗 Transaction hash: 0x9876...5432

🔍 To verify the contract on block explorer, run:
npx hardhat verify --network mumbai 0xabcd...ef12 "CertiProof X" "CERTX"
```

### Verify Contract (Optional)

```bash
# Verify on Polygonscan
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS "CertiProof X" "CERTX"
```

### Update Frontend Config

Copy the deployed contract address and update `frontend/.env`:
```bash
REACT_APP_CONTRACT_ADDRESS_MUMBAI=0xabcd...ef12
```

## 4. Deploy Backend

### Local Development

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### Production Deployment Options

#### Option A: Railway

1. Sign up at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

#### Option B: Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create certiproof-x-backend

# Add environment variables
heroku config:set NODE_ENV=production
heroku config:set WEB3_STORAGE_TOKEN=your_token
# ... add all other env vars

# Deploy
git subtree push --prefix backend heroku main
```

#### Option C: DigitalOcean App Platform

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Create new app from GitHub repository
3. Set build/run commands:
   - **Source Directory:** `backend`
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`
4. Add environment variables
5. Deploy

## 5. Deploy Frontend

### Local Development

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

### Production Deployment Options

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

cd frontend

# Deploy to production
vercel --prod
```

#### Option B: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
4. Add environment variables
5. Deploy

#### Option C: AWS S3 + CloudFront

```bash
cd frontend
npm run build

# Upload build folder to S3 bucket
aws s3 sync build/ s3://your-bucket-name --delete

# Configure CloudFront distribution
# Set up custom domain with Route 53
```

## 6. Production Configuration

### Update Environment Variables

Once deployed, update your environment variables:

**Backend:**
```bash
# Production backend URL
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend:**
```bash
# Production backend URL
REACT_APP_BACKEND_URL=https://your-backend-domain.com

# Production contract addresses
REACT_APP_CONTRACT_ADDRESS_MUMBAI=0x...
REACT_APP_CONTRACT_ADDRESS_POLYGON=0x...
```

### SSL/HTTPS Setup

Both Vercel and Railway provide automatic HTTPS. For custom deployments:

1. Obtain SSL certificate (Let's Encrypt)
2. Configure reverse proxy (Nginx)
3. Redirect HTTP to HTTPS

## 7. Verification Checklist

After deployment, verify everything works:

### ✅ Smart Contract
- [ ] Contract deployed successfully
- [ ] Contract verified on block explorer
- [ ] Test minting function works
- [ ] Events are emitted correctly

### ✅ Backend API
- [ ] Health check returns 200: `GET /api/health`
- [ ] File upload works: `POST /api/upload`
- [ ] Certificate generation works: `POST /api/certificate/generate`
- [ ] CORS configured correctly
- [ ] HTTPS enabled

### ✅ Frontend Application
- [ ] Application loads without errors
- [ ] Wallet connection works
- [ ] File upload interface functional
- [ ] Network switching works
- [ ] Responsive on mobile devices

### ✅ Integration Testing
- [ ] Complete flow: Upload → Mint → Verify
- [ ] QR code scanning works
- [ ] Certificate PDF generation
- [ ] Verification by hash/token ID

## 8. Monitoring Setup

### Health Monitoring

Add uptime monitoring:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

Monitor these endpoints:
- `https://your-backend.com/api/health`
- `https://your-frontend.com`

### Error Tracking

Set up error monitoring:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [New Relic](https://newrelic.com) for performance monitoring

### Analytics

Add analytics tracking:
- [Google Analytics](https://analytics.google.com)
- [Mixpanel](https://mixpanel.com) for event tracking
- [Hotjar](https://hotjar.com) for user behavior

## 9. Security Hardening

### Smart Contract Security
- [ ] Contract audited by security firm
- [ ] Testnet testing completed
- [ ] Gradual mainnet rollout planned

### Backend Security
- [ ] Rate limiting configured
- [ ] API key authentication enabled
- [ ] Input validation implemented
- [ ] HTTPS enforced
- [ ] Security headers configured

### Frontend Security
- [ ] Content Security Policy set
- [ ] Sensitive data not exposed
- [ ] Environment variables secured
- [ ] Dependencies updated

## 10. Performance Optimization

### Frontend Optimization
```bash
# Analyze bundle size
cd frontend
npm run analyze

# Optimize images
# Enable service worker
# Configure CDN
```

### Backend Optimization
```bash
# Enable compression
# Configure caching
# Database connection pooling
# Monitor response times
```

## 11. Backup and Recovery

### Smart Contract Backup
- Save deployment artifacts
- Document all transaction hashes
- Keep ABI and bytecode in version control

### Backend Backup
- Database backups (if applicable)
- Environment variable documentation
- IPFS pinning strategy

### Frontend Backup
- Source code in version control
- Build artifacts stored
- Domain configuration documented

## 12. Maintenance Tasks

### Daily
- [ ] Monitor uptime and performance
- [ ] Check error logs
- [ ] Verify IPFS pinning status

### Weekly  
- [ ] Update dependencies
- [ ] Review security alerts
- [ ] Check blockchain network status

### Monthly
- [ ] Analyze usage metrics
- [ ] Update documentation
- [ ] Plan feature releases

## Troubleshooting

### Common Issues

#### Contract Deployment Fails
```bash
# Check network connection
npx hardhat run scripts/deploy.js --network mumbai --verbose

# Verify account has sufficient funds
# Check gas price settings
```

#### Backend Won't Start
```bash
# Check environment variables
npm run dev

# Verify IPFS credentials
# Check port availability
```

#### Frontend Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
# Verify all dependencies
```

#### Web3 Connection Issues
- Ensure MetaMask is installed
- Check network configuration
- Verify contract address is correct
- Clear browser cache

### Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/0xGenesis/certiproof-x/issues)
2. Join our [Discord Server](https://discord.gg/certiproof-x)
3. Email support: certiproofx@protonmail.me

## Cost Estimation

### Deployment Costs

**Smart Contract:**
- Mumbai deployment: ~$0 (testnet)
- Polygon deployment: ~$50-100
- Contract verification: Free

**Backend Hosting:**
- Railway/Heroku: $7-25/month
- DigitalOcean: $5-20/month
- AWS: Variable, typically $10-50/month

**Frontend Hosting:**
- Vercel: Free for hobby, $20/month pro
- Netlify: Free for personal, $19/month pro
- AWS S3: $1-10/month

**External Services:**
- Alchemy: Free tier, then $49/month
- Web3.Storage: Free
- Pinata: $20/month for 1GB

**Total Monthly Cost:** $50-150 for production setup

---

**Deployment completed! 🎉**

Your CertiProof X instance should now be live and ready to mint tamper-proof certificates on the blockchain.

For support, contact: certiproofx@protonmail.me