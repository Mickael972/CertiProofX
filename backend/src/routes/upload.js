/**
 * Upload routes for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 *
 * Handles file uploads to IPFS
 */

const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const config = require('../config/config');
const logger = require('../utils/logger');
const ipfsService = require('../services/ipfsService');
const { generateSHA256, generateSecureFilename } = require('../utils/crypto');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error(`File type ${file.mimetype} not allowed`);
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }

    // Check file extension
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    if (!config.upload.allowedExtensions.includes(ext)) {
      const error = new Error(`File extension ${ext} not allowed`);
      error.code = 'INVALID_FILE_EXTENSION';
      return cb(error, false);
    }

    cb(null, true);
  },
});

/**
 * Upload single file to IPFS
 * POST /api/upload
 */
router.post(
  '/',
  upload.single('file'),
  [
    body('title').optional().isString().isLength({ min: 1, max: 200 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('documentType')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .trim(),
    body('metadata').optional().isJSON(),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          code: 'NO_FILE_UPLOADED',
        });
      }

      const startTime = Date.now();
      const { buffer, originalname, mimetype, size } = req.file;
      const { title, description, documentType, metadata } = req.body;

      logger.apiRequest(
        req.method,
        req.originalUrl,
        req.ip,
        req.get('User-Agent')
      );
      logger.info(`Processing file upload: ${originalname}`, {
        size,
        mimetype,
        ip: req.ip,
      });

      // Generate file hash
      const fileHash = await generateSHA256(buffer);
      logger.info(`File hash generated: ${fileHash}`);

      // Parse additional metadata
      let additionalMetadata = {};
      if (metadata) {
        try {
          additionalMetadata = JSON.parse(metadata);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Invalid metadata JSON',
            code: 'INVALID_METADATA',
          });
        }
      }

      // Prepare file metadata
      const fileMetadata = {
        originalName: originalname,
        title: title || originalname,
        description: description || '',
        documentType: documentType || 'document',
        mimetype,
        size,
        uploadedBy: req.ip,
        uploadedAt: new Date().toISOString(),
        ...additionalMetadata,
      };

      // Generate secure filename
      const secureFilename = generateSecureFilename(originalname, 'upload');

      // Upload to IPFS
      const uploadResult = await ipfsService.uploadFile(
        buffer,
        secureFilename,
        fileMetadata
      );

      const processingTime = Date.now() - startTime;

      logger.apiResponse(req.method, req.originalUrl, 200, processingTime);
      logger.info(`File uploaded successfully to IPFS: ${uploadResult.hash}`, {
        originalName: originalname,
        secureFilename,
        ipfsHash: uploadResult.hash,
        processingTime: `${processingTime}ms`,
      });

      // Return success response
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully to IPFS',
        data: {
          fileHash,
          ipfs: {
            hash: uploadResult.hash,
            url: uploadResult.ipfsUrl,
            gatewayUrl: uploadResult.gatewayUrl,
            provider: uploadResult.provider,
          },
          file: {
            originalName: originalname,
            secureFilename,
            size,
            mimetype,
            title: fileMetadata.title,
            description: fileMetadata.description,
            documentType: fileMetadata.documentType,
          },
          metadata: uploadResult.metadata,
          uploadedAt: new Date().toISOString(),
          processingTime: `${processingTime}ms`,
        },
      });
    } catch (error) {
      const processingTime = Date.now() - (req.startTime || Date.now());

      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('File upload failed:', error);

      // Handle specific error types
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: 'File too large',
          message: `Maximum file size is ${config.upload.maxFileSize / 1024 / 1024}MB`,
          code: 'FILE_TOO_LARGE',
        });
      }

      if (
        error.code === 'INVALID_FILE_TYPE' ||
        error.code === 'INVALID_FILE_EXTENSION'
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: error.code,
          allowedTypes: config.upload.allowedMimeTypes,
          allowedExtensions: config.upload.allowedExtensions,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Upload failed',
        message: error.message,
        code: 'UPLOAD_FAILED',
        processingTime: `${processingTime}ms`,
      });
    }
  }
);

/**
 * Upload metadata JSON to IPFS
 * POST /api/upload/metadata
 */
router.post(
  '/metadata',
  [
    body('metadata').notEmpty().isObject(),
    body('name').optional().isString().isLength({ min: 1, max: 100 }).trim(),
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

      const startTime = Date.now();
      const { metadata, name } = req.body;

      logger.apiRequest(
        req.method,
        req.originalUrl,
        req.ip,
        req.get('User-Agent')
      );
      logger.info('Processing metadata upload', { name, ip: req.ip });

      // Add upload information to metadata
      const enrichedMetadata = {
        ...metadata,
        uploadedBy: req.ip,
        uploadedAt: new Date().toISOString(),
        protocol: 'CertiProof X',
        version: '1.0.0',
      };

      const metadataName = name || `metadata_${Date.now()}.json`;

      // Upload metadata to IPFS
      const uploadResult = await ipfsService.uploadMetadata(
        enrichedMetadata,
        metadataName
      );

      const processingTime = Date.now() - startTime;

      logger.apiResponse(req.method, req.originalUrl, 200, processingTime);
      logger.info(
        `Metadata uploaded successfully to IPFS: ${uploadResult.hash}`,
        {
          name: metadataName,
          ipfsHash: uploadResult.hash,
          processingTime: `${processingTime}ms`,
        }
      );

      res.status(200).json({
        success: true,
        message: 'Metadata uploaded successfully to IPFS',
        data: {
          ipfs: {
            hash: uploadResult.hash,
            url: uploadResult.ipfsUrl,
            gatewayUrl: uploadResult.gatewayUrl,
            provider: uploadResult.provider,
          },
          metadata: enrichedMetadata,
          name: metadataName,
          uploadedAt: new Date().toISOString(),
          processingTime: `${processingTime}ms`,
        },
      });
    } catch (error) {
      const processingTime = Date.now() - (req.startTime || Date.now());

      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('Metadata upload failed:', error);

      res.status(500).json({
        success: false,
        error: 'Metadata upload failed',
        message: error.message,
        code: 'METADATA_UPLOAD_FAILED',
        processingTime: `${processingTime}ms`,
      });
    }
  }
);

/**
 * Get upload status and configuration
 * GET /api/upload/status
 */
router.get('/status', async (req, res) => {
  try {
    logger.apiRequest(
      req.method,
      req.originalUrl,
      req.ip,
      req.get('User-Agent')
    );

    const ipfsStatus = await ipfsService.getStatus();

    res.status(200).json({
      success: true,
      message: 'Upload service status',
      data: {
        upload: {
          maxFileSize: config.upload.maxFileSize,
          maxFileSizeMB: Math.round(config.upload.maxFileSize / 1024 / 1024),
          allowedMimeTypes: config.upload.allowedMimeTypes,
          allowedExtensions: config.upload.allowedExtensions,
        },
        ipfs: ipfsStatus,
        operational: true,
        timestamp: new Date().toISOString(),
      },
    });

    logger.apiResponse(req.method, req.originalUrl, 200, 0);
  } catch (error) {
    logger.apiError(req.method, req.originalUrl, 500, error, req.ip);

    res.status(500).json({
      success: false,
      error: 'Failed to get upload status',
      message: error.message,
    });
  }
});

/**
 * Retrieve file from IPFS
 * GET /api/upload/:hash
 */
router.get('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash || hash.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IPFS hash',
        code: 'INVALID_HASH',
      });
    }

    logger.apiRequest(
      req.method,
      req.originalUrl,
      req.ip,
      req.get('User-Agent')
    );
    logger.info(`Retrieving file from IPFS: ${hash}`);

    // Check if file exists
    const fileMetadata = await ipfsService.getFileMetadata(hash);
    if (!fileMetadata.exists) {
      return res.status(404).json({
        success: false,
        error: 'File not found on IPFS',
        code: 'FILE_NOT_FOUND',
        hash,
      });
    }

    // Retrieve file
    const fileBuffer = await ipfsService.retrieveFile(hash);

    // Set appropriate headers
    res.set({
      'Content-Type': fileMetadata.contentType || 'application/octet-stream',
      'Content-Length': fileBuffer.length,
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
      ETag: `"${hash}"`,
      'X-IPFS-Hash': hash,
    });

    logger.apiResponse(req.method, req.originalUrl, 200, 0);
    logger.info(`File retrieved successfully from IPFS: ${hash}`, {
      size: fileBuffer.length,
      contentType: fileMetadata.contentType,
    });

    res.send(fileBuffer);
  } catch (error) {
    logger.apiError(req.method, req.originalUrl, 500, error, req.ip);

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve file from IPFS',
      message: error.message,
      code: 'RETRIEVAL_FAILED',
    });
  }
});

module.exports = router;
