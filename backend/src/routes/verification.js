/**
 * Verification routes for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 *
 * Handles certificate and proof verification
 */

const express = require('express');
const { param, query, validationResult } = require('express-validator');
const config = require('../config/config');
const logger = require('../utils/logger');
const ipfsService = require('../services/ipfsService');
const { generateSHA256 } = require('../utils/crypto');

const router = express.Router();

/**
 * Verify certificate by token ID
 * GET /api/verification/:tokenId
 */
router.get(
  '/:tokenId',
  [
    param('tokenId').isNumeric().toInt(),
    query('network')
      .optional()
      .isIn(['mumbai', 'polygon', 'goerli', 'mainnet']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { tokenId } = req.params;
      const network = req.query.network || config.blockchain.defaultNetwork;

      logger.apiRequest(
        req.method,
        req.originalUrl,
        req.ip,
        req.get('User-Agent')
      );
      logger.info(`Verifying certificate: Token ID ${tokenId}`, {
        network,
        ip: req.ip,
      });

      // This would typically interact with the blockchain to get token data
      // For now, we'll return a mock response structure
      const verificationResult = {
        tokenId,
        network,
        exists: true, // This would come from blockchain query
        isActive: true,
        verified: true,
        proof: {
          documentHash:
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Mock
          ipfsHash: 'QmTestHash123456789', // Mock
          issuer: '0x1234567890123456789012345678901234567890', // Mock
          recipient: '0x0987654321098765432109876543210987654321', // Mock
          issuedAt: '2025-08-03T00:00:00.000Z', // Mock
          title: 'Sample Certificate', // Mock
          documentType: 'diploma', // Mock
        },
        blockchain: {
          network,
          contractAddress:
            config.blockchain.networks[network]?.contractAddress ||
            'Not deployed',
          blockNumber: 12345678, // Mock
          transactionHash:
            '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', // Mock
          gasUsed: '150000', // Mock
        },
        verifiedAt: new Date().toISOString(),
      };

      logger.apiResponse(req.method, req.originalUrl, 200, 0);
      logger.info(`Certificate verification completed: Token ID ${tokenId}`, {
        exists: verificationResult.exists,
        isActive: verificationResult.isActive,
        verified: verificationResult.verified,
      });

      res.status(200).json({
        success: true,
        message: 'Certificate verification completed',
        data: verificationResult,
      });
    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('Certificate verification failed:', error);

      res.status(500).json({
        success: false,
        error: 'Verification failed',
        message: error.message,
        code: 'VERIFICATION_FAILED',
      });
    }
  }
);

/**
 * Verify proof by document hash
 * GET /api/verification/hash/:hash
 */
router.get(
  '/hash/:hash',
  [
    param('hash').matches(/^0x[a-fA-F0-9]{64}$/),
    query('network')
      .optional()
      .isIn(['mumbai', 'polygon', 'goerli', 'mainnet']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { hash } = req.params;
      const network = req.query.network || config.blockchain.defaultNetwork;

      logger.apiRequest(
        req.method,
        req.originalUrl,
        req.ip,
        req.get('User-Agent')
      );
      logger.info(`Verifying proof by hash: ${hash}`, {
        network,
        ip: req.ip,
      });

      // This would typically interact with the blockchain to find token by hash
      // For now, we'll return a mock response
      const verificationResult = {
        documentHash: hash,
        network,
        exists: true, // This would come from blockchain query
        tokenId: 1, // Mock - would be retrieved from blockchain
        isActive: true,
        verified: true,
        proof: {
          ipfsHash: 'QmTestHash123456789', // Mock
          issuer: '0x1234567890123456789012345678901234567890', // Mock
          recipient: '0x0987654321098765432109876543210987654321', // Mock
          issuedAt: '2025-08-03T00:00:00.000Z', // Mock
          title: 'Sample Certificate', // Mock
          documentType: 'diploma', // Mock
        },
        blockchain: {
          network,
          contractAddress:
            config.blockchain.networks[network]?.contractAddress ||
            'Not deployed',
          blockNumber: 12345678, // Mock
          transactionHash:
            '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', // Mock
        },
        verifiedAt: new Date().toISOString(),
      };

      logger.apiResponse(req.method, req.originalUrl, 200, 0);
      logger.info(`Proof verification by hash completed: ${hash}`, {
        exists: verificationResult.exists,
        tokenId: verificationResult.tokenId,
        verified: verificationResult.verified,
      });

      res.status(200).json({
        success: true,
        message: 'Proof verification by hash completed',
        data: verificationResult,
      });
    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('Proof verification by hash failed:', error);

      res.status(500).json({
        success: false,
        error: 'Hash verification failed',
        message: error.message,
        code: 'HASH_VERIFICATION_FAILED',
      });
    }
  }
);

/**
 * Verify IPFS file integrity
 * GET /api/verification/ipfs/:hash
 */
router.get(
  '/ipfs/:hash',
  [param('hash').isLength({ min: 10, max: 100 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { hash } = req.params;

      logger.apiRequest(
        req.method,
        req.originalUrl,
        req.ip,
        req.get('User-Agent')
      );
      logger.info(`Verifying IPFS file integrity: ${hash}`, { ip: req.ip });

      // Check if file exists on IPFS
      const fileExists = await ipfsService.fileExists(hash);

      if (!fileExists) {
        return res.status(404).json({
          success: false,
          error: 'File not found on IPFS',
          code: 'IPFS_FILE_NOT_FOUND',
          hash,
        });
      }

      // Get file metadata
      const metadata = await ipfsService.getFileMetadata(hash);

      // Optionally verify file hash if provided
      let hashVerification = null;
      if (req.query.expectedHash) {
        try {
          const fileBuffer = await ipfsService.retrieveFile(hash);
          const actualHash = await generateSHA256(fileBuffer);
          hashVerification = {
            expected: req.query.expectedHash,
            actual: actualHash,
            matches:
              actualHash.toLowerCase() === req.query.expectedHash.toLowerCase(),
          };
        } catch (error) {
          logger.warn(`Hash verification failed for ${hash}:`, error);
          hashVerification = {
            error: error.message,
          };
        }
      }

      const verificationResult = {
        ipfsHash: hash,
        exists: fileExists,
        metadata,
        hashVerification,
        gatewayUrls: [
          `${config.ipfs.gateway}${hash}`,
          `https://ipfs.io/ipfs/${hash}`,
          `https://gateway.pinata.cloud/ipfs/${hash}`,
          `https://cloudflare-ipfs.com/ipfs/${hash}`,
        ],
        verifiedAt: new Date().toISOString(),
      };

      logger.apiResponse(req.method, req.originalUrl, 200, 0);
      logger.ipfs('verified', hash, {
        exists: fileExists,
        size: metadata.size,
        contentType: metadata.contentType,
      });

      res.status(200).json({
        success: true,
        message: 'IPFS file verification completed',
        data: verificationResult,
      });
    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('IPFS verification failed:', error);

      res.status(500).json({
        success: false,
        error: 'IPFS verification failed',
        message: error.message,
        code: 'IPFS_VERIFICATION_FAILED',
      });
    }
  }
);

/**
 * Verify certificate by wallet address
 * GET /api/verification/wallet/:address
 */
router.get(
  '/wallet/:address',
  [
    param('address').matches(/^0x[a-fA-F0-9]{40}$/),
    query('network')
      .optional()
      .isIn(['mumbai', 'polygon', 'goerli', 'mainnet']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { address } = req.params;
      const network = req.query.network || config.blockchain.defaultNetwork;
      const limit = req.query.limit || 10;
      const offset = req.query.offset || 0;

      logger.apiRequest(
        req.method,
        req.originalUrl,
        req.ip,
        req.get('User-Agent')
      );
      logger.info(`Verifying certificates for wallet: ${address}`, {
        network,
        limit,
        offset,
        ip: req.ip,
      });

      // This would typically query the blockchain for all tokens owned by the address
      // For now, we'll return a mock response
      const certificates = [
        {
          tokenId: 1,
          documentHash:
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          ipfsHash: 'QmTestHash123456789',
          title: 'Computer Science Degree',
          documentType: 'diploma',
          issuedAt: '2025-08-03T00:00:00.000Z',
          issuer: '0x1234567890123456789012345678901234567890',
          isActive: true,
        },
        // More mock certificates would be here
      ];

      const verificationResult = {
        walletAddress: address,
        network,
        totalCertificates: certificates.length,
        certificates,
        pagination: {
          limit,
          offset,
          hasMore: false, // Would be calculated based on actual data
        },
        verifiedAt: new Date().toISOString(),
      };

      logger.apiResponse(req.method, req.originalUrl, 200, 0);
      logger.info(`Wallet verification completed: ${address}`, {
        certificateCount: certificates.length,
      });

      res.status(200).json({
        success: true,
        message: 'Wallet certificates verification completed',
        data: verificationResult,
      });
    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('Wallet verification failed:', error);

      res.status(500).json({
        success: false,
        error: 'Wallet verification failed',
        message: error.message,
        code: 'WALLET_VERIFICATION_FAILED',
      });
    }
  }
);

/**
 * Batch verification of multiple items
 * POST /api/verification/batch
 */
router.post(
  '/batch',
  [
    query('type').isIn(['tokenId', 'hash', 'ipfs']),
    query('network')
      .optional()
      .isIn(['mumbai', 'polygon', 'goerli', 'mainnet']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { type } = req.query;
      const network = req.query.network || config.blockchain.defaultNetwork;
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Items array is required and must not be empty',
          code: 'INVALID_ITEMS',
        });
      }

      if (items.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 50 items allowed per batch',
          code: 'TOO_MANY_ITEMS',
        });
      }

      logger.apiRequest(
        req.method,
        req.originalUrl,
        req.ip,
        req.get('User-Agent')
      );
      logger.info(`Batch verification: ${type}`, {
        itemCount: items.length,
        network,
        ip: req.ip,
      });

      // Process each item based on type
      const results = [];

      for (const item of items) {
        try {
          let result;

          switch (type) {
            case 'tokenId':
              // Mock verification result for token ID
              result = {
                item,
                verified: true,
                exists: true,
                isActive: true,
                error: null,
              };
              break;

            case 'hash':
              // Mock verification result for hash
              result = {
                item,
                verified: true,
                exists: true,
                tokenId: Math.floor(Math.random() * 1000) + 1, // Mock
                error: null,
              };
              break;

            case 'ipfs':
              // Actual IPFS verification
              const exists = await ipfsService.fileExists(item);
              result = {
                item,
                exists,
                verified: exists,
                error: null,
              };
              break;

            default:
              result = {
                item,
                verified: false,
                error: `Unsupported verification type: ${type}`,
              };
          }

          results.push(result);
        } catch (error) {
          results.push({
            item,
            verified: false,
            error: error.message,
          });
        }
      }

      const verificationSummary = {
        total: results.length,
        verified: results.filter((r) => r.verified).length,
        failed: results.filter((r) => !r.verified).length,
        successRate:
          (
            (results.filter((r) => r.verified).length / results.length) *
            100
          ).toFixed(2) + '%',
      };

      logger.apiResponse(req.method, req.originalUrl, 200, 0);
      logger.info(`Batch verification completed`, {
        type,
        ...verificationSummary,
      });

      res.status(200).json({
        success: true,
        message: 'Batch verification completed',
        data: {
          type,
          network,
          summary: verificationSummary,
          results,
          verifiedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('Batch verification failed:', error);

      res.status(500).json({
        success: false,
        error: 'Batch verification failed',
        message: error.message,
        code: 'BATCH_VERIFICATION_FAILED',
      });
    }
  }
);

module.exports = router;
