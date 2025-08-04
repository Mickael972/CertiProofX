/**
 * Certificate routes for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 * 
 * Handles certificate PDF generation and QR code creation
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const config = require('../config/config');
const logger = require('../utils/logger');
const certificateService = require('../services/certificateService');
const ipfsService = require('../services/ipfsService');

const router = express.Router();

/**
 * Generate certificate PDF
 * POST /api/certificate/generate
 */
router.post('/generate',
  [
    body('title').notEmpty().isString().isLength({ min: 1, max: 200 }).trim(),
    body('documentHash').notEmpty().isString().matches(/^0x[a-fA-F0-9]{64}$/),
    body('ipfsHash').notEmpty().isString().isLength({ min: 10, max: 100 }),
    body('issuerAddress').notEmpty().isString().matches(/^0x[a-fA-F0-9]{40}$/),
    body('recipientAddress').optional().isString().matches(/^0x[a-fA-F0-9]{40}$/),
    body('tokenId').optional().isNumeric(),
    body('documentType').optional().isString().isLength({ max: 100 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('verificationUrl').optional().isURL(),
    body('metadata').optional().isObject(),
    body('attributes').optional().isArray()
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

      const startTime = Date.now();
      const certificateData = req.body;

      logger.apiRequest(req.method, req.originalUrl, req.ip, req.get('User-Agent'));
      logger.info('Generating certificate PDF', {
        title: certificateData.title,
        tokenId: certificateData.tokenId,
        ip: req.ip
      });

      // Validate certificate data
      certificateService.validateCertificateData(certificateData);

      // Set default values
      certificateData.issuedAt = certificateData.issuedAt || new Date();
      certificateData.documentType = certificateData.documentType || 'Digital Document';

      // Generate certificate PDF
      const pdfResult = await certificateService.generateCertificatePDF(certificateData);

      // Generate metadata for the certificate
      const metadata = certificateService.generateMetadata({
        ...certificateData,
        generatedAt: new Date().toISOString()
      });

      const processingTime = Date.now() - startTime;

      logger.apiResponse(req.method, req.originalUrl, 200, processingTime);
      logger.certificate('generated', certificateData.tokenId, {
        title: certificateData.title,
        size: pdfResult.size,
        processingTime: `${processingTime}ms`
      });

      res.status(200).json({
        success: true,
        message: 'Certificate PDF generated successfully',
        data: {
          certificate: {
            filename: pdfResult.filename,
            size: pdfResult.size,
            hash: pdfResult.hash,
            mimeType: pdfResult.mimeType
          },
          metadata,
          processingTime: `${processingTime}ms`,
          generatedAt: new Date().toISOString()
        },
        // Include PDF as base64 for direct download
        pdf: pdfResult.buffer.toString('base64')
      });

    } catch (error) {
      const processingTime = Date.now() - (req.startTime || Date.now());
      
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('Certificate generation failed:', error);

      res.status(500).json({
        success: false,
        error: 'Certificate generation failed',
        message: error.message,
        code: 'CERTIFICATE_GENERATION_FAILED',
        processingTime: `${processingTime}ms`
      });
    }
  }
);

/**
 * Generate and upload certificate to IPFS
 * POST /api/certificate/upload
 */
router.post('/upload',
  [
    body('title').notEmpty().isString().isLength({ min: 1, max: 200 }).trim(),
    body('documentHash').notEmpty().isString().matches(/^0x[a-fA-F0-9]{64}$/),
    body('ipfsHash').notEmpty().isString().isLength({ min: 10, max: 100 }),
    body('issuerAddress').notEmpty().isString().matches(/^0x[a-fA-F0-9]{40}$/),
    body('recipientAddress').optional().isString().matches(/^0x[a-fA-F0-9]{40}$/),
    body('tokenId').optional().isNumeric(),
    body('documentType').optional().isString().isLength({ max: 100 }).trim(),
    body('uploadToIpfs').optional().isBoolean()
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

      const startTime = Date.now();
      const certificateData = req.body;
      const uploadToIpfs = certificateData.uploadToIpfs !== false; // Default true

      logger.apiRequest(req.method, req.originalUrl, req.ip, req.get('User-Agent'));
      logger.info('Generating and uploading certificate', {
        title: certificateData.title,
        tokenId: certificateData.tokenId,
        uploadToIpfs,
        ip: req.ip
      });

      // Generate certificate PDF
      const pdfResult = await certificateService.generateCertificatePDF(certificateData);

      // Generate metadata
      const metadata = certificateService.generateMetadata(certificateData);

      let ipfsResults = null;

      if (uploadToIpfs) {
        // Upload PDF to IPFS
        const pdfUpload = await ipfsService.uploadFile(
          pdfResult.buffer,
          pdfResult.filename,
          {
            type: 'certificate',
            title: certificateData.title,
            tokenId: certificateData.tokenId,
            documentHash: certificateData.documentHash
          }
        );

        // Upload metadata to IPFS
        const metadataUpload = await ipfsService.uploadMetadata(
          metadata,
          `metadata_${certificateData.tokenId || 'certificate'}.json`
        );

        ipfsResults = {
          pdf: pdfUpload,
          metadata: metadataUpload
        };
      }

      const processingTime = Date.now() - startTime;

      logger.apiResponse(req.method, req.originalUrl, 200, processingTime);
      logger.certificate('uploaded', certificateData.tokenId, {
        title: certificateData.title,
        ipfsEnabled: uploadToIpfs,
        processingTime: `${processingTime}ms`
      });

      res.status(200).json({
        success: true,
        message: `Certificate generated${uploadToIpfs ? ' and uploaded to IPFS' : ''} successfully`,
        data: {
          certificate: {
            filename: pdfResult.filename,
            size: pdfResult.size,
            hash: pdfResult.hash,
            mimeType: pdfResult.mimeType
          },
          metadata,
          ipfs: ipfsResults,
          processingTime: `${processingTime}ms`,
          generatedAt: new Date().toISOString()
        },
        // Include PDF as base64 for direct download
        pdf: pdfResult.buffer.toString('base64')
      });

    } catch (error) {
      const processingTime = Date.now() - (req.startTime || Date.now());
      
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('Certificate upload failed:', error);

      res.status(500).json({
        success: false,
        error: 'Certificate upload failed',
        message: error.message,
        code: 'CERTIFICATE_UPLOAD_FAILED',
        processingTime: `${processingTime}ms`
      });
    }
  }
);

/**
 * Generate QR code
 * POST /api/certificate/qr
 */
router.post('/qr',
  [
    body('data').notEmpty().isString(),
    body('width').optional().isInt({ min: 50, max: 1000 }),
    body('height').optional().isInt({ min: 50, max: 1000 }),
    body('margin').optional().isInt({ min: 0, max: 10 }),
    body('errorCorrectionLevel').optional().isIn(['L', 'M', 'Q', 'H']),
    body('format').optional().isIn(['png', 'svg']),
    body('uploadToIpfs').optional().isBoolean()
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

      const startTime = Date.now();
      const { data, uploadToIpfs = false, ...options } = req.body;

      logger.apiRequest(req.method, req.originalUrl, req.ip, req.get('User-Agent'));
      logger.info('Generating QR code', {
        dataLength: data.length,
        uploadToIpfs,
        ip: req.ip
      });

      // Generate QR code
      const qrResult = await certificateService.generateStandaloneQR(data, options);

      let ipfsResult = null;

      if (uploadToIpfs) {
        // Upload QR code to IPFS
        ipfsResult = await ipfsService.uploadFile(
          qrResult.buffer,
          qrResult.filename,
          {
            type: 'qrcode',
            data: data.substring(0, 100), // Truncate for metadata
            generatedAt: new Date().toISOString()
          }
        );
      }

      const processingTime = Date.now() - startTime;

      logger.apiResponse(req.method, req.originalUrl, 200, processingTime);
      logger.info('QR code generated successfully', {
        size: qrResult.size,
        uploadToIpfs,
        processingTime: `${processingTime}ms`
      });

      res.status(200).json({
        success: true,
        message: `QR code generated${uploadToIpfs ? ' and uploaded to IPFS' : ''} successfully`,
        data: {
          qrcode: {
            filename: qrResult.filename,
            size: qrResult.size,
            hash: qrResult.hash,
            mimeType: qrResult.mimeType,
            data: data
          },
          ipfs: ipfsResult,
          processingTime: `${processingTime}ms`,
          generatedAt: new Date().toISOString()
        },
        // Include QR code as base64 for direct display
        image: qrResult.buffer.toString('base64')
      });

    } catch (error) {
      const processingTime = Date.now() - (req.startTime || Date.now());
      
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('QR code generation failed:', error);

      res.status(500).json({
        success: false,
        error: 'QR code generation failed',
        message: error.message,
        code: 'QR_GENERATION_FAILED',
        processingTime: `${processingTime}ms`
      });
    }
  }
);

/**
 * Generate complete certificate package (PDF + QR + Metadata)
 * POST /api/certificate/package
 */
router.post('/package',
  [
    body('title').notEmpty().isString().isLength({ min: 1, max: 200 }).trim(),
    body('documentHash').notEmpty().isString().matches(/^0x[a-fA-F0-9]{64}$/),
    body('ipfsHash').notEmpty().isString().isLength({ min: 10, max: 100 }),
    body('issuerAddress').notEmpty().isString().matches(/^0x[a-fA-F0-9]{40}$/),
    body('recipientAddress').optional().isString().matches(/^0x[a-fA-F0-9]{40}$/),
    body('tokenId').optional().isNumeric(),
    body('documentType').optional().isString().isLength({ max: 100 }).trim(),
    body('verificationUrl').optional().isURL(),
    body('uploadToIpfs').optional().isBoolean()
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

      const startTime = Date.now();
      const certificateData = req.body;
      const uploadToIpfs = certificateData.uploadToIpfs !== false;

      logger.apiRequest(req.method, req.originalUrl, req.ip, req.get('User-Agent'));
      logger.info('Generating certificate package', {
        title: certificateData.title,
        tokenId: certificateData.tokenId,
        uploadToIpfs,
        ip: req.ip
      });

      // Set verification URL if not provided
      const verificationUrl = certificateData.verificationUrl || 
        `https://certiproof-x.com/verify/${certificateData.tokenId || certificateData.documentHash}`;

      // Generate certificate PDF
      const pdfResult = await certificateService.generateCertificatePDF({
        ...certificateData,
        verificationUrl
      });

      // Generate QR code for verification
      const qrResult = await certificateService.generateStandaloneQR(verificationUrl);

      // Generate metadata
      const metadata = certificateService.generateMetadata(certificateData);

      let ipfsResults = null;

      if (uploadToIpfs) {
        // Upload all components to IPFS in parallel
        const [pdfUpload, qrUpload, metadataUpload] = await Promise.all([
          ipfsService.uploadFile(pdfResult.buffer, pdfResult.filename, {
            type: 'certificate',
            title: certificateData.title,
            tokenId: certificateData.tokenId
          }),
          ipfsService.uploadFile(qrResult.buffer, qrResult.filename, {
            type: 'qrcode',
            verificationUrl,
            tokenId: certificateData.tokenId
          }),
          ipfsService.uploadMetadata(metadata, `metadata_${certificateData.tokenId || 'certificate'}.json`)
        ]);

        ipfsResults = {
          pdf: pdfUpload,
          qrcode: qrUpload,
          metadata: metadataUpload
        };
      }

      const processingTime = Date.now() - startTime;

      logger.apiResponse(req.method, req.originalUrl, 200, processingTime);
      logger.certificate('package-generated', certificateData.tokenId, {
        title: certificateData.title,
        components: ['pdf', 'qr', 'metadata'],
        uploadToIpfs,
        processingTime: `${processingTime}ms`
      });

      res.status(200).json({
        success: true,
        message: `Certificate package generated${uploadToIpfs ? ' and uploaded to IPFS' : ''} successfully`,
        data: {
          certificate: {
            filename: pdfResult.filename,
            size: pdfResult.size,
            hash: pdfResult.hash,
            mimeType: pdfResult.mimeType
          },
          qrcode: {
            filename: qrResult.filename,
            size: qrResult.size,
            hash: qrResult.hash,
            mimeType: qrResult.mimeType,
            verificationUrl
          },
          metadata,
          ipfs: ipfsResults,
          processingTime: `${processingTime}ms`,
          generatedAt: new Date().toISOString()
        },
        // Include both PDF and QR as base64
        files: {
          pdf: pdfResult.buffer.toString('base64'),
          qrcode: qrResult.buffer.toString('base64')
        }
      });

    } catch (error) {
      const processingTime = Date.now() - (req.startTime || Date.now());
      
      logger.apiError(req.method, req.originalUrl, 500, error, req.ip);
      logger.error('Certificate package generation failed:', error);

      res.status(500).json({
        success: false,
        error: 'Certificate package generation failed',
        message: error.message,
        code: 'PACKAGE_GENERATION_FAILED',
        processingTime: `${processingTime}ms`
      });
    }
  }
);

module.exports = router;