/**
 * Logger utility for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'grey',
  debug: 'white',
  silly: 'cyan'
};

winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ' ' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configure transports
const transports = [];

// Console transport
if (config.logging.console.enabled) {
  transports.push(
    new winston.transports.Console({
      level: config.logging.level,
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    })
  );
}

// File transports
if (config.logging.file.enabled) {
  // General log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'certiproof-x.log'),
      level: config.logging.level,
      format: fileFormat,
      maxsize: config.logging.file.maxsize,
      maxFiles: config.logging.file.maxFiles,
      handleExceptions: true,
      handleRejections: true
    })
  );

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: config.logging.file.maxsize,
      maxFiles: config.logging.file.maxFiles,
      handleExceptions: true,
      handleRejections: true
    })
  );

  // HTTP log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      level: 'http',
      format: fileFormat,
      maxsize: config.logging.file.maxsize,
      maxFiles: config.logging.file.maxFiles
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  levels: logLevels,
  transports: transports,
  exitOnError: false,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  )
});

// Add custom methods
logger.http = (message, meta = {}) => {
  logger.log('http', message, meta);
};

logger.request = (req, res, responseTime) => {
  const { method, originalUrl, ip } = req;
  const { statusCode } = res;
  
  logger.http(`${method} ${originalUrl}`, {
    method,
    url: originalUrl,
    statusCode,
    ip,
    userAgent: req.get('User-Agent'),
    responseTime: `${responseTime}ms`
  });
};

logger.ipfs = (action, hash, meta = {}) => {
  logger.info(`IPFS ${action}: ${hash}`, meta);
};

logger.certificate = (action, tokenId, meta = {}) => {
  logger.info(`Certificate ${action}: ${tokenId}`, meta);
};

logger.security = (event, meta = {}) => {
  logger.warn(`Security Event: ${event}`, meta);
};

logger.blockchain = (network, action, meta = {}) => {
  logger.info(`Blockchain [${network}] ${action}`, meta);
};

// Error logging helper
logger.logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context
  };
  
  logger.error('Application Error', errorInfo);
};

// Performance logging
logger.performance = (operation, duration, meta = {}) => {
  logger.info(`Performance: ${operation} took ${duration}ms`, meta);
};

// API logging helpers
logger.apiRequest = (method, endpoint, ip, userAgent) => {
  logger.http(`API Request: ${method} ${endpoint}`, {
    method,
    endpoint,
    ip,
    userAgent
  });
};

logger.apiResponse = (method, endpoint, statusCode, responseTime) => {
  logger.http(`API Response: ${method} ${endpoint} - ${statusCode}`, {
    method,
    endpoint,
    statusCode,
    responseTime: `${responseTime}ms`
  });
};

logger.apiError = (method, endpoint, statusCode, error, ip) => {
  logger.error(`API Error: ${method} ${endpoint} - ${statusCode}`, {
    method,
    endpoint,
    statusCode,
    error: error.message,
    stack: error.stack,
    ip
  });
};

// Development helpers
if (config.server.env === 'development') {
  logger.dev = (message, meta = {}) => {
    logger.debug(`[DEV] ${message}`, meta);
  };
} else {
  logger.dev = () => {}; // No-op in production
}

// Stream for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

module.exports = logger;