/**
 * CertiProof X Backend Server
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 *
 * Main server file for the CertiProof X backend API
 * Handles IPFS uploads, PDF generation, QR codes, and metadata management
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const expressWinston = require('express-winston');
require('dotenv').config();

// Import routes
const uploadRoutes = require('./routes/upload');
const certificateRoutes = require('./routes/certificate');
const verificationRoutes = require('./routes/verification');
const metadataRoutes = require('./routes/metadata');
const healthRoutes = require('./routes/health');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { validateApiKey } = require('./middleware/auth');

// Import config
const config = require('./config/config');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  })
);

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://certiproof-x.vercel.app', 'https://www.certiproof-x.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
};

app.use(cors(corsOptions));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// Winston request logging
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    ignoreRoute: function (req, res) {
      return req.path === '/health' || req.path === '/api/health';
    },
  })
);

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/metadata', metadataRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CertiProof X Backend API',
    version: '1.0.0',
    author: 'Kai Zenjiro (0xGenesis)',
    contact: 'certiproofx@protonmail.me',
    description: 'Backend API for CertiProof X - Decentralized Proof Protocol',
    endpoints: {
      health: '/api/health',
      upload: '/api/upload',
      certificate: '/api/certificate',
      verification: '/api/verification',
      metadata: '/api/metadata',
    },
    documentation:
      'https://github.com/Mickael972/CertiProofX/blob/main/docs/TECHNICAL_DOCUMENTATION.md',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} does not exist`,
    code: 'ENDPOINT_NOT_FOUND',
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/upload',
      'POST /api/certificate/generate',
      'POST /api/certificate/qr',
      'GET /api/verification/:tokenId',
      'GET /api/metadata/:tokenId',
    ],
  });
});

// Error handling middleware (must be last)
app.use(
  expressWinston.errorLogger({
    winstonInstance: logger,
  })
);

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    logger.info(`🚀 CertiProof X Backend API started`);
    logger.info(`📡 Server running on http://${HOST}:${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📁 IPFS Provider: ${config.ipfs.provider}`);
    logger.info(`🔒 Security: Helmet enabled, CORS configured`);

    // Display configuration
    if (process.env.NODE_ENV === 'development') {
      logger.info('📋 Configuration:');
      logger.info(
        `   - Max file size: ${config.upload.maxFileSize / 1024 / 1024}MB`
      );
      logger.info(
        `   - Supported formats: ${config.upload.allowedMimeTypes.join(', ')}`
      );
      logger.info(
        `   - Rate limit: ${process.env.NODE_ENV === 'production' ? 100 : 1000} requests/15min`
      );
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
