/**
 * IPFS Service for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 *
 * Handles file uploads to IPFS using various providers
 */

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { Web3Storage, File } = require('web3.storage');
const config = require('../config/config');
const logger = require('../utils/logger');
const { generateSHA256, generateUUID } = require('../utils/crypto');

class IPFSService {
  constructor() {
    this.provider = config.ipfs.provider;
    this.initializeClient();
  }

  /**
   * Initialize IPFS client based on provider
   */
  initializeClient() {
    switch (this.provider) {
      case 'web3storage':
        if (!config.ipfs.web3Storage.token) {
          if (config.server.env === 'development') {
            logger.warn(
              '🔧 Development mode: Web3.Storage token not configured, IPFS upload will be mocked'
            );
            this.client = null; // Mock mode
            return;
          }
          throw new Error('Web3.Storage token not configured');
        }
        this.client = new Web3Storage({
          token: config.ipfs.web3Storage.token,
        });
        break;

      case 'pinata':
        if (!config.ipfs.pinata.apiKey || !config.ipfs.pinata.secretKey) {
          throw new Error('Pinata API credentials not configured');
        }
        this.pinataAxios = axios.create({
          baseURL: config.ipfs.pinata.endpoint,
          headers: {
            pinata_api_key: config.ipfs.pinata.apiKey,
            pinata_secret_api_key: config.ipfs.pinata.secretKey,
          },
          timeout: config.ipfs.timeout,
        });
        break;

      case 'infura':
        if (
          !config.ipfs.infura.projectId ||
          !config.ipfs.infura.projectSecret
        ) {
          throw new Error('Infura IPFS credentials not configured');
        }
        // Infura IPFS client setup would go here
        break;

      default:
        throw new Error(`Unsupported IPFS provider: ${this.provider}`);
    }

    logger.info(`IPFS Service initialized with provider: ${this.provider}`);
  }

  /**
   * Upload a single file to IPFS
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filename - Original filename
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - Upload result with IPFS hash
   */
  async uploadFile(fileBuffer, filename, metadata = {}) {
    try {
      const startTime = Date.now();
      logger.info(`Starting IPFS upload for file: ${filename}`);

      // Generate file hash for verification
      const fileHash = await generateSHA256(fileBuffer);

      let result;

      // Mock mode for development when client is not configured
      if (this.client === null && config.server.env === 'development') {
        logger.warn('🔧 Development mode: Mocking IPFS upload');
        result = {
          hash: `mock_${fileHash.substring(0, 16)}`, // Mock IPFS hash
          url: `https://ipfs.io/ipfs/mock_${fileHash.substring(0, 16)}`,
          gateway: `${config.ipfs.gateway}mock_${fileHash.substring(0, 16)}`,
          size: fileBuffer.length,
          type: metadata.type || 'application/octet-stream',
          filename: filename,
          uploadTime: Date.now() - startTime,
          provider: 'mock',
          mock: true,
        };
      } else {
        switch (this.provider) {
          case 'web3storage':
            result = await this.uploadToWeb3Storage(
              fileBuffer,
              filename,
              metadata,
              fileHash
            );
            break;

          case 'pinata':
            result = await this.uploadToPinata(
              fileBuffer,
              filename,
              metadata,
              fileHash
            );
            break;

          case 'infura':
            result = await this.uploadToInfura(
              fileBuffer,
              filename,
              metadata,
              fileHash
            );
            break;

          default:
            throw new Error(
              `Upload method not implemented for provider: ${this.provider}`
            );
        }
      }

      const uploadTime = Date.now() - startTime;
      logger.ipfs('upload', result.hash, {
        filename,
        size: fileBuffer.length,
        uploadTime: `${uploadTime}ms`,
        provider: this.provider,
      });

      return result;
    } catch (error) {
      logger.error(`IPFS upload failed for ${filename}:`, error);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload to Web3.Storage
   */
  async uploadToWeb3Storage(fileBuffer, filename, metadata, fileHash) {
    try {
      const file = new File([fileBuffer], filename, {
        type: this.getMimeType(filename),
      });

      const cid = await this.client.put([file], {
        name: filename,
        maxRetries: 3,
        wrapWithDirectory: false,
      });

      return {
        hash: cid,
        ipfsUrl: `ipfs://${cid}`,
        gatewayUrl: `${config.ipfs.gateway}${cid}`,
        provider: 'web3storage',
        fileHash,
        filename,
        size: fileBuffer.length,
        metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          uploadId: generateUUID(),
        },
      };
    } catch (error) {
      throw new Error(`Web3.Storage upload failed: ${error.message}`);
    }
  }

  /**
   * Upload to Pinata
   */
  async uploadToPinata(fileBuffer, filename, metadata, fileHash) {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename,
        contentType: this.getMimeType(filename),
      });

      // Add metadata
      const pinataMetadata = {
        name: filename,
        keyvalues: {
          ...metadata,
          fileHash,
          uploadedAt: new Date().toISOString(),
          uploadId: generateUUID(),
          originalFilename: filename,
        },
      };

      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

      const pinataOptions = {
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            { id: 'FRA1', desiredReplicationCount: 1 },
            { id: 'NYC1', desiredReplicationCount: 1 },
          ],
        },
      };

      formData.append('pinataOptions', JSON.stringify(pinataOptions));

      const response = await this.pinataAxios.post(
        '/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Content-Length': formData.getLengthSync(),
          },
          maxContentLength: config.upload.maxFileSize,
          maxBodyLength: config.upload.maxFileSize,
        }
      );

      const { IpfsHash, PinSize } = response.data;

      return {
        hash: IpfsHash,
        ipfsUrl: `ipfs://${IpfsHash}`,
        gatewayUrl: `${config.ipfs.gateway}${IpfsHash}`,
        provider: 'pinata',
        fileHash,
        filename,
        size: PinSize,
        metadata: pinataMetadata.keyvalues,
      };
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Pinata upload failed: ${error.response.data.error || error.response.statusText}`
        );
      }
      throw new Error(`Pinata upload failed: ${error.message}`);
    }
  }

  /**
   * Upload to Infura IPFS
   */
  async uploadToInfura(fileBuffer, filename, metadata, fileHash) {
    // Implementation for Infura IPFS would go here
    throw new Error('Infura IPFS upload not yet implemented');
  }

  /**
   * Upload JSON metadata to IPFS
   * @param {Object} metadata - Metadata object
   * @param {string} name - Metadata name
   * @returns {Promise<Object>} - Upload result
   */
  async uploadMetadata(metadata, name = 'metadata.json') {
    try {
      const metadataString = JSON.stringify(metadata, null, 2);
      const metadataBuffer = Buffer.from(metadataString, 'utf8');

      logger.info(`Uploading metadata to IPFS: ${name}`);

      return await this.uploadFile(metadataBuffer, name, {
        type: 'metadata',
        contentType: 'application/json',
      });
    } catch (error) {
      logger.error(`Failed to upload metadata:`, error);
      throw new Error(`Failed to upload metadata to IPFS: ${error.message}`);
    }
  }

  /**
   * Retrieve file from IPFS
   * @param {string} hash - IPFS hash
   * @returns {Promise<Buffer>} - File buffer
   */
  async retrieveFile(hash) {
    try {
      logger.info(`Retrieving file from IPFS: ${hash}`);

      // Try multiple gateways for redundancy
      const gateways = [
        config.ipfs.gateway,
        'https://ipfs.io/ipfs/',
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
      ];

      for (const gateway of gateways) {
        try {
          const response = await axios.get(`${gateway}${hash}`, {
            responseType: 'arraybuffer',
            timeout: config.ipfs.timeout,
          });

          logger.ipfs('retrieve', hash, {
            gateway,
            size: response.data.length,
          });
          return Buffer.from(response.data);
        } catch (error) {
          logger.warn(
            `Failed to retrieve from gateway ${gateway}: ${error.message}`
          );
          continue;
        }
      }

      throw new Error('Failed to retrieve file from all gateways');
    } catch (error) {
      logger.error(`Failed to retrieve file ${hash}:`, error);
      throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
    }
  }

  /**
   * Check if file exists on IPFS
   * @param {string} hash - IPFS hash
   * @returns {Promise<boolean>} - True if file exists
   */
  async fileExists(hash) {
    try {
      const response = await axios.head(`${config.ipfs.gateway}${hash}`, {
        timeout: 10000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata from IPFS
   * @param {string} hash - IPFS hash
   * @returns {Promise<Object>} - File metadata
   */
  async getFileMetadata(hash) {
    try {
      const response = await axios.head(`${config.ipfs.gateway}${hash}`, {
        timeout: 10000,
      });

      return {
        exists: true,
        size: parseInt(response.headers['content-length']) || 0,
        contentType:
          response.headers['content-type'] || 'application/octet-stream',
        lastModified: response.headers['last-modified'],
        etag: response.headers['etag'],
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message,
      };
    }
  }

  /**
   * Pin file to ensure persistence
   * @param {string} hash - IPFS hash
   * @returns {Promise<Object>} - Pin result
   */
  async pinFile(hash) {
    try {
      switch (this.provider) {
        case 'pinata':
          return await this.pinToPinata(hash);
        default:
          logger.warn(`Pinning not implemented for provider: ${this.provider}`);
          return { success: false, message: 'Pinning not supported' };
      }
    } catch (error) {
      logger.error(`Failed to pin file ${hash}:`, error);
      throw new Error(`Failed to pin file: ${error.message}`);
    }
  }

  /**
   * Pin to Pinata by hash
   */
  async pinToPinata(hash) {
    try {
      const response = await this.pinataAxios.post('/pinning/pinByHash', {
        hashToPin: hash,
        pinataMetadata: {
          name: `pinned-${hash}`,
          keyvalues: {
            pinnedAt: new Date().toISOString(),
            method: 'pinByHash',
          },
        },
      });

      return {
        success: true,
        hash: response.data.ipfsHash,
        provider: 'pinata',
      };
    } catch (error) {
      throw new Error(
        `Pinata pin failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  /**
   * Get MIME type from filename
   */
  getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      txt: 'text/plain',
      json: 'application/json',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Get service status
   */
  async getStatus() {
    return {
      provider: this.provider,
      gateway: config.ipfs.gateway,
      maxFileSize: config.upload.maxFileSize,
      supportedTypes: config.upload.allowedMimeTypes,
      operational: true,
    };
  }
}

// Export singleton instance
module.exports = new IPFSService();
