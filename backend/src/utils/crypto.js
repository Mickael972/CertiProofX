/**
 * Cryptographic utilities for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate SHA-256 hash of a file or buffer
 * @param {Buffer|string} input - File buffer or file path
 * @returns {Promise<string>} - Hex encoded hash
 */
const generateSHA256 = async (input) => {
  try {
    const hash = crypto.createHash('sha256');
    
    if (Buffer.isBuffer(input)) {
      // Input is a buffer
      hash.update(input);
    } else if (typeof input === 'string') {
      // Input is either a file path or a string
      if (fs.existsSync(input)) {
        // It's a file path
        const fileBuffer = fs.readFileSync(input);
        hash.update(fileBuffer);
      } else {
        // It's a string
        hash.update(input, 'utf8');
      }
    } else {
      throw new Error('Input must be a Buffer, file path, or string');
    }
    
    return hash.digest('hex');
  } catch (error) {
    throw new Error(`Failed to generate SHA-256 hash: ${error.message}`);
  }
};

/**
 * Generate SHA-256 hash from a readable stream
 * @param {ReadableStream} stream - File stream
 * @returns {Promise<string>} - Hex encoded hash
 */
const generateSHA256FromStream = (stream) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    
    stream.on('data', (chunk) => {
      hash.update(chunk);
    });
    
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    
    stream.on('error', (error) => {
      reject(new Error(`Failed to generate hash from stream: ${error.message}`));
    });
  });
};

/**
 * Generate MD5 hash (for file integrity checks)
 * @param {Buffer|string} input - File buffer or file path
 * @returns {Promise<string>} - Hex encoded hash
 */
const generateMD5 = async (input) => {
  try {
    const hash = crypto.createHash('md5');
    
    if (Buffer.isBuffer(input)) {
      hash.update(input);
    } else if (typeof input === 'string') {
      if (fs.existsSync(input)) {
        const fileBuffer = fs.readFileSync(input);
        hash.update(fileBuffer);
      } else {
        hash.update(input, 'utf8');
      }
    } else {
      throw new Error('Input must be a Buffer, file path, or string');
    }
    
    return hash.digest('hex');
  } catch (error) {
    throw new Error(`Failed to generate MD5 hash: ${error.message}`);
  }
};

/**
 * Generate a random UUID v4
 * @returns {string} - UUID string
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Generate a random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} - Hex encoded token
 */
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a secure filename with timestamp and random suffix
 * @param {string} originalName - Original filename
 * @param {string} prefix - Optional prefix
 * @returns {string} - Secure filename
 */
const generateSecureFilename = (originalName, prefix = '') => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const prefixPart = prefix ? `${prefix}_` : '';
  
  return `${prefixPart}${timestamp}_${random}${ext}`;
};

/**
 * Verify SHA-256 hash of a file
 * @param {string} filePath - Path to file
 * @param {string} expectedHash - Expected hash value
 * @returns {Promise<boolean>} - True if hash matches
 */
const verifyFileHash = async (filePath, expectedHash) => {
  try {
    const actualHash = await generateSHA256(filePath);
    return actualHash.toLowerCase() === expectedHash.toLowerCase();
  } catch (error) {
    throw new Error(`Failed to verify file hash: ${error.message}`);
  }
};

/**
 * Calculate file checksum using multiple algorithms
 * @param {Buffer|string} input - File buffer or path
 * @returns {Promise<Object>} - Object with multiple hashes
 */
const calculateFileChecksum = async (input) => {
  try {
    const [sha256, md5] = await Promise.all([
      generateSHA256(input),
      generateMD5(input)
    ]);
    
    return {
      sha256,
      md5,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to calculate file checksum: ${error.message}`);
  }
};

/**
 * Generate HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {string} - Hex encoded signature
 */
const generateHMAC = (data, secret, algorithm = 'sha256') => {
  try {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(data);
    return hmac.digest('hex');
  } catch (error) {
    throw new Error(`Failed to generate HMAC: ${error.message}`);
  }
};

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {boolean} - True if signature is valid
 */
const verifyHMAC = (data, signature, secret, algorithm = 'sha256') => {
  try {
    const expectedSignature = generateHMAC(data, secret, algorithm);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    return false;
  }
};

/**
 * Generate a content identifier (CID) like hash
 * @param {Buffer|string} content - Content to hash
 * @returns {Promise<string>} - Base58 encoded hash
 */
const generateContentID = async (content) => {
  try {
    const hash = await generateSHA256(content);
    // Simple base58 encoding (for demonstration)
    // In production, you might want to use a proper CID library
    return `Qm${hash.substring(0, 44)}`;
  } catch (error) {
    throw new Error(`Failed to generate content ID: ${error.message}`);
  }
};

/**
 * Encrypt data using AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @param {string} password - Password for encryption
 * @returns {Object} - Encrypted data with metadata
 */
const encryptData = (plaintext, password) => {
  try {
    const salt = crypto.randomBytes(32);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm'
    };
  } catch (error) {
    throw new Error(`Failed to encrypt data: ${error.message}`);
  }
};

/**
 * Decrypt data using AES-256-GCM
 * @param {Object} encryptedData - Encrypted data object
 * @param {string} password - Password for decryption
 * @returns {string} - Decrypted plaintext
 */
const decryptData = (encryptedData, password) => {
  try {
    const { encrypted, salt, iv, authTag } = encryptedData;
    
    const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 32, 'sha256');
    const decipher = crypto.createDecipherGCM('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Failed to decrypt data: ${error.message}`);
  }
};

module.exports = {
  generateSHA256,
  generateSHA256FromStream,
  generateMD5,
  generateUUID,
  generateRandomToken,
  generateSecureFilename,
  verifyFileHash,
  calculateFileChecksum,
  generateHMAC,
  verifyHMAC,
  generateContentID,
  encryptData,
  decryptData
};