/**
 * Configuration file for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development'
  },

  // IPFS configuration
  ipfs: {
    provider: process.env.IPFS_PROVIDER || 'web3storage', // 'web3storage' | 'pinata' | 'infura'
    
    // Web3.Storage
    web3Storage: {
      token: process.env.WEB3_STORAGE_TOKEN,
      endpoint: 'https://api.web3.storage'
    },
    
    // Pinata
    pinata: {
      apiKey: process.env.PINATA_API_KEY,
      secretKey: process.env.PINATA_SECRET_KEY,
      endpoint: 'https://api.pinata.cloud'
    },
    
    // Infura IPFS
    infura: {
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      projectSecret: process.env.INFURA_IPFS_PROJECT_SECRET,
      endpoint: 'https://ipfs.infura.io:5001'
    },
    
    // Gateway configuration
    gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
    timeout: 30000 // 30 seconds
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt', '.doc', '.docx', '.xls', '.xlsx'],
    tempDirectory: './tmp'
  },

  // Certificate generation
  certificate: {
    // PDF configuration
    pdf: {
      pageSize: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      font: {
        regular: 'Helvetica',
        bold: 'Helvetica-Bold',
        italic: 'Helvetica-Oblique'
      }
    },
    
    // QR Code configuration
    qr: {
      width: 200,
      height: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M', // L, M, Q, H
      type: 'png'
    }
  },

  // Security configuration
  security: {
    apiKey: process.env.API_KEY,
    enableApiKeyAuth: process.env.ENABLE_API_KEY_AUTH === 'true',
    bcryptRounds: 12,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: '24h'
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: 'Too many requests from this IP, please try again later.'
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: process.env.LOG_TO_FILE === 'true',
      filename: 'logs/certiproof-x.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    },
    console: {
      enabled: true,
      colorize: true
    }
  },

  // Database configuration (if needed in the future)
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
  },

  // Blockchain configuration
  blockchain: {
    networks: {
      mumbai: {
        rpcUrl: process.env.MUMBAI_RPC_URL || `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 80001,
        contractAddress: process.env.CERTIPROOF_NFT_MUMBAI
      },
      polygon: {
        rpcUrl: process.env.POLYGON_RPC_URL || `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 137,
        contractAddress: process.env.CERTIPROOF_NFT_POLYGON
      }
    },
    defaultNetwork: process.env.DEFAULT_NETWORK || 'mumbai'
  },

  // CORS configuration
  cors: {
    origins: process.env.NODE_ENV === 'production' 
      ? ['https://certiproof-x.vercel.app', 'https://www.certiproof-x.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000']
  },

  // Application metadata
  app: {
    name: 'CertiProof X Backend',
    version: '1.0.0',
    author: 'Kai Zenjiro (0xGenesis)',
    contact: 'certiproofx@protonmail.me',
    wallet: '0x1E274F39A44f1561b3Bb21148B9881075575676D',
    license: 'MIT',
    repository: 'https://github.com/Mickael972/CertiProofX',
    documentation: 'https://github.com/Mickael972/CertiProofX/blob/main/README.md'
  }
};

// Validation
const validateConfig = () => {
  const requiredEnvVars = [];
  
  // Skip IPFS validation in development mode
  if (config.server.env === 'production') {
    // Check IPFS configuration only in production
    if (config.ipfs.provider === 'web3storage' && !config.ipfs.web3Storage.token) {
      requiredEnvVars.push('WEB3_STORAGE_TOKEN');
    }
    
    if (config.ipfs.provider === 'pinata' && (!config.ipfs.pinata.apiKey || !config.ipfs.pinata.secretKey)) {
      requiredEnvVars.push('PINATA_API_KEY', 'PINATA_SECRET_KEY');
    }
    
    if (config.ipfs.provider === 'infura' && (!config.ipfs.infura.projectId || !config.ipfs.infura.projectSecret)) {
      requiredEnvVars.push('INFURA_IPFS_PROJECT_ID', 'INFURA_IPFS_PROJECT_SECRET');
    }
    
    if (requiredEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${requiredEnvVars.join(', ')}`);
    }
  } else {
    console.log('🔧 Development mode: IPFS configuration validation skipped');
  }
};

// Validate configuration on import
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

module.exports = config;