/**
 * Metadata routes for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 * 
 * Handles NFT metadata retrieval and management
 */

const express = require('express');
const { param, query, validationResult } = require('express-validator');
const config = require('../config/config');
const logger = require('../utils/logger');
const ipfsService = require('../services/ipfsService');
const certificateService = require('../services/certificateService');

const router = express.Router();

/**
 * Get NFT metadata by token ID (ERC-721 standard)
 * GET /api/metadata/:tokenId
 */
router.get('/:tokenId',
  [
    param('tokenId').isNumeric().toInt(),
    query('network').optional().isIn(['mumbai', 'polygon', 'goerli', 'mainnet'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { tokenId } = req.params;
      const network = req.query.network || config.blockchain.defaultNetwork;

      logger.apiRequest(req.method, req.originalUrl, req.ip, req.get('User-Agent'));
      logger.info(`Retrieving metadata for token ID: ${tokenId}`, {
        network,
        ip: req.ip
      });

      // This would typically fetch data from blockchain
      // For now, we'll generate mock metadata
      const mockCertificateData = {
        title: "Computer Science Degree",
        description: "Bachelor of Science in Computer Science from XYZ University",
        documentHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        ipfsHash: "QmTestHash123456789",
        issuerAddress: "0x1234567890123456789012345678901234567890",
        recipientAddress: "0x0987654321098765432109876543210987654321",
        tokenId,
        documentType: "diploma",
        issuedAt: "2025-08-03T00:00:00.000Z",
        attributes: [
          {
            trait_type: "Institution",
            value: "XYZ University"
          },
          {
            trait_type: "Graduation Year",
            value: "2025"
          },
          {
            trait_type: "Major",
            value: "Computer Science"
          }
        ]
      };

      // Generate standard ERC-721 metadata
      const metadata = certificateService.generateMetadata(mockCertificateData);

      // Add blockchain specific information
      metadata.blockchain = {
        network,
        tokenId,
        contractAddress: config.blockchain.networks[network]?.contractAddress || "Not deployed",
        standard: "ERC-721"
      };

      logger.apiResponse(req.method, req.originalUrl, 200, 0);
      logger.info(`Metadata retrieved successfully for token ID: ${tokenId}`);

      // Set appropriate headers for NFT metadata
      res.set({
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
        'X-Token-ID': tokenId.toString(),
        'X-Network': network
      });

      res.status(200).json(metadata);

    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('Metadata retrieval failed:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metadata',
        message: error.message,
        code: 'METADATA_RETRIEVAL_FAILED'
      });
    }
  }
);

/**
 * Get metadata from IPFS
 * GET /api/metadata/ipfs/:hash
 */
router.get('/ipfs/:hash',
  [
    param('hash').isLength({ min: 10, max: 100 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { hash } = req.params;

      logger.apiRequest(req.method, req.originalUrl, req.ip, req.get('User-Agent'));
      logger.info(`Retrieving metadata from IPFS: ${hash}`, { ip: req.ip });

      // Check if file exists
      const fileExists = await ipfsService.fileExists(hash);
      if (!fileExists) {
        return res.status(404).json({
          success: false,
          error: 'Metadata not found on IPFS',
          code: 'METADATA_NOT_FOUND',
          hash
        });
      }

      // Retrieve metadata from IPFS
      const metadataBuffer = await ipfsService.retrieveFile(hash);
      let metadata;

      try {
        metadata = JSON.parse(metadataBuffer.toString('utf8'));
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON metadata',
          code: 'INVALID_METADATA_JSON',
          hash
        });
      }

      // Add retrieval information
      metadata._ipfs = {
        hash,
        retrievedAt: new Date().toISOString(),
        gatewayUrl: `${config.ipfs.gateway}${hash}`,
        size: metadataBuffer.length
      };

      logger.apiResponse(req.method, req.originalUrl, 200, 0);
      logger.ipfs('metadata-retrieved', hash, {
        size: metadataBuffer.length
      });

      // Set appropriate headers
      res.set({
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // 1 hour cache for IPFS content
        'X-IPFS-Hash': hash
      });

      res.status(200).json(metadata);

    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('IPFS metadata retrieval failed:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metadata from IPFS',
        message: error.message,
        code: 'IPFS_METADATA_RETRIEVAL_FAILED'
      });
    }
  }
);

/**
 * Update metadata for a token (admin only)
 * PUT /api/metadata/:tokenId
 */
router.put('/:tokenId',
  [
    param('tokenId').isNumeric().toInt(),
    // This would typically require authentication middleware
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { tokenId } = req.params;
      const updateData = req.body;

      logger.apiRequest(req.method, req.originalUrl, req.ip, req.get('User-Agent'));
      logger.info(`Updating metadata for token ID: ${tokenId}`, { ip: req.ip });

      // This would typically:
      // 1. Verify ownership/permissions
      // 2. Update metadata on-chain or IPFS
      // 3. Return updated metadata

      // For now, return a mock response
      logger.apiResponse(req.method, req.originalUrl, 501, 0);

      res.status(501).json({
        success: false,
        error: 'Metadata updates not yet implemented',
        message: 'This feature will be available in a future version',
        code: 'FEATURE_NOT_IMPLEMENTED'
      });

    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      
      res.status(500).json({
        success: false,
        error: 'Metadata update failed',
        message: error.message,
        code: 'METADATA_UPDATE_FAILED'
      });
    }
  }
);

/**
 * Get collection metadata
 * GET /api/metadata/collection
 */
router.get('/collection',
  [
    query('network').optional().isIn(['mumbai', 'polygon', 'goerli', 'mainnet'])
  ],
  async (req, res) => {
    try {
      const network = req.query.network || config.blockchain.defaultNetwork;

      logger.apiRequest(req.method, req.originalUrl, req.ip, req.get('User-Agent'));
      logger.info('Retrieving collection metadata', { network, ip: req.ip });

      const collectionMetadata = {
        name: "CertiProof X Certificates",
        description: "Decentralized proof certificates secured by blockchain technology and IPFS storage. Each NFT represents a verified digital proof with cryptographic authenticity.",
        image: "ipfs://QmCollectionImageHash", // Would be actual collection image
        external_link: "https://certiproof-x.com",
        seller_fee_basis_points: 0, // No royalties for certificates
        fee_recipient: config.app.wallet,
        blockchain: {
          network,
          contractAddress: config.blockchain.networks[network]?.contractAddress || "Not deployed",
          standard: "ERC-721"
        },
        properties: {
          protocol: "CertiProof X",
          version: "1.0.0",
          author: config.app.author,
          contact: config.app.contact,
          license: config.app.license,
          repository: config.app.repository,
          documentation: config.app.documentation,
          totalSupply: "Dynamic", // Would be fetched from contract
          maxSupply: "Unlimited"
        },
        categories: [
          "Education",
          "Certification",
          "Identity",
          "Verification",
          "Blockchain",
          "Web3"
        ],
        stats: {
          // These would be real statistics in production
          totalCertificates: 0,
          totalHolders: 0,
          totalVerifications: 0,
          lastUpdated: new Date().toISOString()
        }
      };

      logger.apiResponse(req.method, req.originalUrl, 200, 0);

      res.set({
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // 1 hour cache
      });

      res.status(200).json(collectionMetadata);

    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve collection metadata',
        message: error.message,
        code: 'COLLECTION_METADATA_FAILED'
      });
    }
  }
);

/**
 * Generate metadata template
 * GET /api/metadata/template
 */
router.get('/template',
  [
    query('type').optional().isIn(['basic', 'educational', 'professional', 'identity'])
  ],
  async (req, res) => {
    try {
      const type = req.query.type || 'basic';

      logger.apiRequest(req.method, req.originalUrl, req.ip, req.get('User-Agent'));

      const templates = {
        basic: {
          name: "[Certificate Title]",
          description: "[Certificate Description]",
          image: "ipfs://[IPFS_HASH]",
          external_url: "https://certiproof-x.com/certificate/[TOKEN_ID]",
          attributes: [
            {
              trait_type: "Document Type",
              value: "[TYPE]"
            },
            {
              trait_type: "Issue Date",
              value: "[YYYY-MM-DD]"
            },
            {
              trait_type: "Issuer",
              value: "[ISSUER_NAME]"
            }
          ]
        },
        
        educational: {
          name: "[Degree/Certificate Name]",
          description: "[Academic achievement description]",
          image: "ipfs://[IPFS_HASH]",
          external_url: "https://certiproof-x.com/certificate/[TOKEN_ID]",
          attributes: [
            {
              trait_type: "Document Type",
              value: "Educational Certificate"
            },
            {
              trait_type: "Institution",
              value: "[INSTITUTION_NAME]"
            },
            {
              trait_type: "Degree Level",
              value: "[Bachelor/Master/PhD/etc.]"
            },
            {
              trait_type: "Field of Study",
              value: "[FIELD]"
            },
            {
              trait_type: "Graduation Year",
              value: "[YEAR]"
            },
            {
              trait_type: "Grade/GPA",
              value: "[GRADE]"
            }
          ]
        },
        
        professional: {
          name: "[Certification Name]",
          description: "[Professional certification description]",
          image: "ipfs://[IPFS_HASH]",
          external_url: "https://certiproof-x.com/certificate/[TOKEN_ID]",
          attributes: [
            {
              trait_type: "Document Type",
              value: "Professional Certificate"
            },
            {
              trait_type: "Certification Body",
              value: "[ORGANIZATION]"
            },
            {
              trait_type: "Skill Area",
              value: "[SKILL_CATEGORY]"
            },
            {
              trait_type: "Certification Level",
              value: "[BEGINNER/INTERMEDIATE/ADVANCED/EXPERT]"
            },
            {
              trait_type: "Valid Until",
              value: "[EXPIRY_DATE]"
            },
            {
              trait_type: "License Number",
              value: "[LICENSE_ID]"
            }
          ]
        },
        
        identity: {
          name: "[Identity Document Name]",
          description: "[Identity verification description]",
          image: "ipfs://[IPFS_HASH]",
          external_url: "https://certiproof-x.com/certificate/[TOKEN_ID]",
          attributes: [
            {
              trait_type: "Document Type",
              value: "Identity Verification"
            },
            {
              trait_type: "Identity Type",
              value: "[PASSPORT/ID_CARD/DRIVER_LICENSE/etc.]"
            },
            {
              trait_type: "Issuing Authority",
              value: "[AUTHORITY_NAME]"
            },
            {
              trait_type: "Country",
              value: "[COUNTRY_CODE]"
            },
            {
              trait_type: "Valid Until",
              value: "[EXPIRY_DATE]"
            }
          ]
        }
      };

      const template = templates[type];
      
      if (!template) {
        return res.status(400).json({
          success: false,
          error: 'Invalid template type',
          availableTypes: Object.keys(templates)
        });
      }

      // Add common properties
      template.properties = {
        protocol: "CertiProof X",
        version: "1.0.0",
        author: config.app.author,
        verification_url: "https://certiproof-x.com/verify/[TOKEN_ID]"
      };

      logger.apiResponse(req.method, req.originalUrl, 200, 0);

      res.status(200).json({
        success: true,
        message: `Metadata template for ${type} certificates`,
        data: {
          type,
          template,
          instructions: {
            "Replace placeholders": "Replace all [PLACEHOLDER] values with actual data",
            "IPFS Hash": "Upload certificate image/document to IPFS and use the hash",
            "Token ID": "Use the actual NFT token ID after minting",
            "Custom Attributes": "Add more attributes as needed for your use case"
          },
          availableTypes: Object.keys(templates)
        }
      });

    } catch (error) {
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate metadata template',
        message: error.message,
        code: 'TEMPLATE_GENERATION_FAILED'
      });
    }
  }
);

module.exports = router;