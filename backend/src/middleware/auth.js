/**
 * Authentication middleware for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 *
 * Handles API key authentication and request validation
 */

const config = require('../config/config');
const logger = require('../utils/logger');
const { verifyHMAC } = require('../utils/crypto');

/**
 * API Key validation middleware
 */
const validateApiKey = (req, res, next) => {
  // Skip API key validation if disabled
  if (!config.security.enableApiKeyAuth) {
    return next();
  }

  const apiKey = req.header('X-API-Key') || req.query.apiKey;

  if (!apiKey) {
    logger.security('Missing API key', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'API key is required',
      code: 'API_KEY_REQUIRED',
      timestamp: new Date().toISOString(),
    });
  }

  if (apiKey !== config.security.apiKey) {
    logger.security('Invalid API key', {
      providedKey: apiKey.substring(0, 10) + '...',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid API key',
      code: 'INVALID_API_KEY',
      timestamp: new Date().toISOString(),
    });
  }

  logger.info('API key validated successfully', {
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
  });

  next();
};

/**
 * Request signature validation middleware
 * Validates HMAC signature for sensitive operations
 */
const validateSignature = (req, res, next) => {
  const signature = req.header('X-Signature');
  const timestamp = req.header('X-Timestamp');

  if (!signature || !timestamp) {
    logger.security('Missing signature or timestamp', {
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      error: 'Signature verification required',
      message: 'Request signature and timestamp are required',
      code: 'SIGNATURE_REQUIRED',
      timestamp: new Date().toISOString(),
    });
  }

  // Check timestamp to prevent replay attacks (5 minutes window)
  const requestTime = parseInt(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(currentTime - requestTime);

  if (timeDiff > 300) {
    // 5 minutes
    logger.security('Request timestamp expired', {
      requestTime,
      currentTime,
      timeDiff,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      error: 'Request expired',
      message: 'Request timestamp is too old or too far in the future',
      code: 'REQUEST_EXPIRED',
      timestamp: new Date().toISOString(),
    });
  }

  // Create payload for signature verification
  const payload = JSON.stringify({
    method: req.method,
    url: req.originalUrl,
    timestamp: timestamp,
    body: req.body || {},
  });

  // Verify signature
  const isValidSignature = verifyHMAC(
    payload,
    signature,
    config.security.jwtSecret,
    'sha256'
  );

  if (!isValidSignature) {
    logger.security('Invalid request signature', {
      signature: signature.substring(0, 16) + '...',
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      error: 'Signature verification failed',
      message: 'Invalid request signature',
      code: 'INVALID_SIGNATURE',
      timestamp: new Date().toISOString(),
    });
  }

  logger.info('Request signature validated successfully', {
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
  });

  next();
};

/**
 * Admin authentication middleware
 * Validates admin privileges for sensitive operations
 */
const requireAdmin = (req, res, next) => {
  // Check if user has admin token or is from authorized IP
  const adminToken = req.header('X-Admin-Token');
  const authorizedIPs = [
    '127.0.0.1',
    '::1',
    // Add more authorized IPs as needed
  ];

  const isAuthorizedIP =
    authorizedIPs.includes(req.ip) ||
    authorizedIPs.includes(req.connection.remoteAddress) ||
    req.ip.startsWith('192.168.') ||
    req.ip.startsWith('10.') ||
    req.ip.startsWith('172.');

  if (!adminToken && !isAuthorizedIP) {
    logger.security('Unauthorized admin access attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      message: 'Insufficient privileges',
      code: 'ADMIN_REQUIRED',
      timestamp: new Date().toISOString(),
    });
  }

  if (adminToken) {
    // Validate admin token (in production, this would be a proper JWT or database lookup)
    const expectedAdminToken = config.security.jwtSecret + '_admin';

    if (adminToken !== expectedAdminToken) {
      logger.security('Invalid admin token', {
        token: adminToken.substring(0, 10) + '...',
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        success: false,
        error: 'Invalid admin token',
        message: 'Invalid administrative credentials',
        code: 'INVALID_ADMIN_TOKEN',
        timestamp: new Date().toISOString(),
      });
    }
  }

  logger.info('Admin access granted', {
    method: isAuthorizedIP ? 'authorized_ip' : 'admin_token',
    ip: req.ip,
    url: req.originalUrl,
  });

  next();
};

/**
 * Request ID middleware
 * Adds unique request ID for tracking
 */
const addRequestId = (req, res, next) => {
  const { generateUUID } = require('../utils/crypto');

  req.id = req.header('X-Request-ID') || generateUUID();
  res.set('X-Request-ID', req.id);

  next();
};

/**
 * IP whitelist middleware
 * Restricts access to whitelisted IPs (for production)
 */
const ipWhitelist = (whitelist = []) => {
  return (req, res, next) => {
    if (whitelist.length === 0) {
      return next(); // No whitelist configured
    }

    const clientIP = req.ip || req.connection.remoteAddress;

    if (!whitelist.includes(clientIP)) {
      logger.security('IP not whitelisted', {
        clientIP,
        whitelist,
        url: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'IP address not authorized',
        code: 'IP_NOT_WHITELISTED',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * User agent validation middleware
 * Blocks requests with suspicious or empty user agents
 */
const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');

  if (!userAgent) {
    logger.security('Missing User-Agent header', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(400).json({
      success: false,
      error: 'Bad request',
      message: 'User-Agent header is required',
      code: 'MISSING_USER_AGENT',
      timestamp: new Date().toISOString(),
    });
  }

  // Block known malicious user agents
  const blockedUserAgents = [
    'curl',
    'wget',
    'python-requests',
    'bot',
    'crawler',
    'spider',
  ];

  const isBlocked = blockedUserAgents.some((blocked) =>
    userAgent.toLowerCase().includes(blocked.toLowerCase())
  );

  if (isBlocked && config.server.env === 'production') {
    logger.security('Blocked user agent', {
      userAgent,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'User agent not allowed',
      code: 'USER_AGENT_BLOCKED',
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

/**
 * CORS preflight handler
 */
const handlePreflight = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,X-API-Key,X-Signature,X-Timestamp,X-Request-ID'
    );
    res.header('Access-Control-Max-Age', '86400'); // 24 hours

    return res.status(200).end();
  }

  next();
};

module.exports = {
  validateApiKey,
  validateSignature,
  requireAdmin,
  addRequestId,
  ipWhitelist,
  validateUserAgent,
  handlePreflight,
};
