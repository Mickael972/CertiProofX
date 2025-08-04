/**
 * Certificate Service for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 * 
 * Handles PDF certificate generation and QR code creation
 */

const PDFKit = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');
const { generateUUID, generateSHA256 } = require('../utils/crypto');

class CertificateService {
  constructor() {
    this.ensureTempDirectory();
  }

  /**
   * Ensure temp directory exists
   */
  ensureTempDirectory() {
    const tempDir = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  }

  /**
   * Generate certificate PDF
   * @param {Object} certificateData - Certificate information
   * @returns {Promise<Object>} - PDF buffer and metadata
   */
  async generateCertificatePDF(certificateData) {
    try {
      logger.info(`Generating certificate PDF for: ${certificateData.title}`);
      
      const {
        title,
        documentHash,
        ipfsHash,
        issuerAddress,
        recipientAddress,
        tokenId,
        documentType,
        issuedAt,
        verificationUrl,
        metadata = {}
      } = certificateData;

      // Create PDF document
      const doc = new PDFKit({
        size: config.certificate.pdf.pageSize,
        margins: config.certificate.pdf.margins,
        info: {
          Title: `CertiProof X Certificate - ${title}`,
          Author: config.app.author,
          Subject: 'Digital Proof Certificate',
          Keywords: 'certificate, blockchain, verification, proof',
          Creator: 'CertiProof X',
          Producer: 'CertiProof X Backend'
        }
      });

      // Store PDF in memory
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {});

      // Generate QR code
      const qrCodeBuffer = await this.generateQRCode(verificationUrl || `https://certiproof-x.com/verify/${tokenId}`);

      // Header
      await this.addHeader(doc);

      // Certificate content
      await this.addCertificateContent(doc, {
        title,
        documentHash,
        ipfsHash,
        issuerAddress,
        recipientAddress,
        tokenId,
        documentType,
        issuedAt: issuedAt || new Date(),
        metadata
      });

      // QR Code
      await this.addQRCode(doc, qrCodeBuffer);

      // Footer
      await this.addFooter(doc);

      // Security watermark
      await this.addSecurityWatermark(doc);

      // Finalize PDF
      doc.end();

      // Wait for PDF generation to complete
      const pdfBuffer = await new Promise((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });

      const filename = `certificate_${tokenId || generateUUID()}.pdf`;
      const pdfHash = await generateSHA256(pdfBuffer);

      logger.certificate('generated', tokenId, {
        title,
        size: pdfBuffer.length,
        filename,
        pdfHash
      });

      return {
        buffer: pdfBuffer,
        filename,
        size: pdfBuffer.length,
        hash: pdfHash,
        mimeType: 'application/pdf',
        metadata: {
          title,
          documentHash,
          ipfsHash,
          tokenId,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Failed to generate certificate PDF:', error);
      throw new Error(`Failed to generate certificate PDF: ${error.message}`);
    }
  }

  /**
   * Add header to PDF
   */
  async addHeader(doc) {
    // Logo area (if logo file exists)
    const logoPath = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 60 });
    }

    // Title
    doc.fontSize(28)
       .fillColor('#1e40af')
       .font(config.certificate.pdf.font.bold)
       .text('CertiProof X', logoPath ? 120 : 50, 45);

    doc.fontSize(14)
       .fillColor('#64748b')
       .font(config.certificate.pdf.font.regular)
       .text('Decentralized Proof Protocol', logoPath ? 120 : 50, 75);

    // Line separator
    doc.strokeColor('#e5e7eb')
       .lineWidth(1)
       .moveTo(50, 110)
       .lineTo(545, 110)
       .stroke();
  }

  /**
   * Add certificate content
   */
  async addCertificateContent(doc, data) {
    const startY = 140;
    let currentY = startY;

    // Certificate title
    doc.fontSize(24)
       .fillColor('#111827')
       .font(config.certificate.pdf.font.bold)
       .text('CERTIFICATE OF AUTHENTICITY', 50, currentY, { align: 'center' });

    currentY += 60;

    // Document title
    doc.fontSize(18)
       .fillColor('#374151')
       .font(config.certificate.pdf.font.bold)
       .text(data.title, 50, currentY, { align: 'center', width: 495 });

    currentY += 50;

    // Certificate info box
    const boxY = currentY;
    const boxHeight = 280;

    // Background box
    doc.fillColor('#f8fafc')
       .rect(50, boxY, 495, boxHeight)
       .fill();

    doc.strokeColor('#e5e7eb')
       .lineWidth(1)
       .rect(50, boxY, 495, boxHeight)
       .stroke();

    currentY += 20;

    // Certificate details
    const leftColumn = 70;
    const rightColumn = 320;
    const lineHeight = 25;

    // Left column
    doc.fontSize(12)
       .fillColor('#374151')
       .font(config.certificate.pdf.font.bold);

    doc.text('Document Type:', leftColumn, currentY);
    doc.font(config.certificate.pdf.font.regular)
       .text(data.documentType || 'Digital Document', leftColumn + 100, currentY);

    currentY += lineHeight;

    doc.font(config.certificate.pdf.font.bold)
       .text('Document Hash:', leftColumn, currentY);
    doc.font(config.certificate.pdf.font.regular)
       .fontSize(10)
       .text(data.documentHash, leftColumn + 100, currentY, { width: 180 });

    currentY += lineHeight * 1.5;

    doc.fontSize(12)
       .font(config.certificate.pdf.font.bold)
       .text('IPFS Hash:', leftColumn, currentY);
    doc.font(config.certificate.pdf.font.regular)
       .fontSize(10)
       .text(data.ipfsHash, leftColumn + 100, currentY, { width: 180 });

    currentY += lineHeight * 1.5;

    doc.fontSize(12)
       .font(config.certificate.pdf.font.bold)
       .text('Token ID:', leftColumn, currentY);
    doc.font(config.certificate.pdf.font.regular)
       .text(data.tokenId || 'N/A', leftColumn + 100, currentY);

    currentY += lineHeight;

    doc.font(config.certificate.pdf.font.bold)
       .text('Issued Date:', leftColumn, currentY);
    doc.font(config.certificate.pdf.font.regular)
       .text(new Date(data.issuedAt).toLocaleDateString(), leftColumn + 100, currentY);

    // Right column
    currentY = boxY + 20;

    doc.font(config.certificate.pdf.font.bold)
       .text('Issuer Address:', rightColumn, currentY);
    doc.font(config.certificate.pdf.font.regular)
       .fontSize(10)
       .text(data.issuerAddress, rightColumn, currentY + 15, { width: 200 });

    currentY += lineHeight * 2;

    if (data.recipientAddress) {
      doc.fontSize(12)
         .font(config.certificate.pdf.font.bold)
         .text('Recipient Address:', rightColumn, currentY);
      doc.font(config.certificate.pdf.font.regular)
         .fontSize(10)
         .text(data.recipientAddress, rightColumn, currentY + 15, { width: 200 });
    }

    // Blockchain verification info
    currentY = boxY + boxHeight - 80;

    doc.fontSize(10)
       .fillColor('#6b7280')
       .font(config.certificate.pdf.font.italic)
       .text('This certificate is secured by blockchain technology and', 70, currentY);
    doc.text('cryptographic proof. Verification can be performed at any time.', 70, currentY + 12);

    // Digital signature area
    currentY += 40;
    doc.fontSize(8)
       .text(`Generated by CertiProof X on ${new Date().toISOString()}`, 70, currentY);
    doc.text(`Author: ${config.app.author} | Contact: ${config.app.contact}`, 70, currentY + 10);
  }

  /**
   * Add QR code to PDF
   */
  async addQRCode(doc, qrCodeBuffer) {
    const qrSize = 120;
    const qrX = 450;
    const qrY = 200;

    // QR code background
    doc.fillColor('#ffffff')
       .rect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)
       .fill();

    doc.strokeColor('#e5e7eb')
       .lineWidth(1)
       .rect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)
       .stroke();

    // QR code image
    doc.image(qrCodeBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    // QR code label
    doc.fontSize(10)
       .fillColor('#374151')
       .font(config.certificate.pdf.font.bold)
       .text('Scan to Verify', qrX + 20, qrY + qrSize + 15);
  }

  /**
   * Add footer to PDF
   */
  async addFooter(doc) {
    const footerY = 720;

    // Line separator
    doc.strokeColor('#e5e7eb')
       .lineWidth(1)
       .moveTo(50, footerY)
       .lineTo(545, footerY)
       .stroke();

    // Footer text
    doc.fontSize(8)
       .fillColor('#6b7280')
       .font(config.certificate.pdf.font.regular)
       .text('CertiProof X - Decentralized Proof Protocol', 50, footerY + 15);

    doc.text(`License: ${config.app.license} | Repository: ${config.app.repository}`, 50, footerY + 25);
    
    doc.text(`Page 1 of 1`, 495, footerY + 15, { align: 'right' });
    doc.text(`Generated: ${new Date().toISOString()}`, 300, footerY + 25, { align: 'right' });
  }

  /**
   * Add security watermark
   */
  async addSecurityWatermark(doc) {
    // Semi-transparent watermark
    doc.fillColor('#f3f4f6', 0.1)
       .fontSize(72)
       .font(config.certificate.pdf.font.bold)
       .text('VERIFIED', 50, 350, {
         align: 'center',
         width: 495,
         rotate: -30
       });
  }

  /**
   * Generate QR code
   * @param {string} data - Data to encode in QR code
   * @returns {Promise<Buffer>} - QR code image buffer
   */
  async generateQRCode(data) {
    try {
      logger.info(`Generating QR code for: ${data.substring(0, 50)}...`);
      
      const qrOptions = {
        width: config.certificate.qr.width,
        height: config.certificate.qr.height,
        margin: config.certificate.qr.margin,
        color: {
          dark: config.certificate.qr.color.dark,
          light: config.certificate.qr.color.light
        },
        errorCorrectionLevel: config.certificate.qr.errorCorrectionLevel,
        type: 'png'
      };

      const qrBuffer = await QRCode.toBuffer(data, qrOptions);
      
      logger.info('QR code generated successfully', {
        dataLength: data.length,
        bufferSize: qrBuffer.length
      });

      return qrBuffer;

    } catch (error) {
      logger.error('Failed to generate QR code:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate standalone QR code image
   * @param {string} data - Data to encode
   * @param {Object} options - QR code options
   * @returns {Promise<Object>} - QR code buffer and metadata
   */
  async generateStandaloneQR(data, options = {}) {
    try {
      const qrOptions = {
        ...config.certificate.qr,
        ...options
      };

      const qrBuffer = await QRCode.toBuffer(data, qrOptions);
      const filename = `qrcode_${generateUUID()}.png`;
      const qrHash = await generateSHA256(qrBuffer);

      return {
        buffer: qrBuffer,
        filename,
        size: qrBuffer.length,
        hash: qrHash,
        mimeType: 'image/png',
        data,
        metadata: {
          type: 'qrcode',
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Failed to generate standalone QR code:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate certificate metadata JSON
   * @param {Object} certificateData - Certificate information
   * @returns {Object} - Structured metadata
   */
  generateMetadata(certificateData) {
    const {
      title,
      description,
      documentHash,
      ipfsHash,
      issuerAddress,
      recipientAddress,
      tokenId,
      documentType,
      issuedAt,
      attributes = []
    } = certificateData;

    return {
      name: title,
      description: description || `Certificate of authenticity for ${title}`,
      image: ipfsHash ? `ipfs://${ipfsHash}` : null,
      external_url: `https://certiproof-x.com/certificate/${tokenId}`,
      attributes: [
        {
          trait_type: "Document Type",
          value: documentType || "Digital Document"
        },
        {
          trait_type: "Document Hash",
          value: documentHash
        },
        {
          trait_type: "IPFS Hash",
          value: ipfsHash
        },
        {
          trait_type: "Issuer",
          value: issuerAddress
        },
        {
          trait_type: "Recipient",
          value: recipientAddress || "Not specified"
        },
        {
          trait_type: "Issue Date",
          value: new Date(issuedAt || new Date()).toISOString().split('T')[0]
        },
        {
          trait_type: "Verification Status",
          value: "Verified"
        },
        ...attributes
      ],
      properties: {
        protocol: "CertiProof X",
        version: "1.0.0",
        author: config.app.author,
        contact: config.app.contact,
        license: config.app.license,
        generated_at: new Date().toISOString(),
        verification_url: `https://certiproof-x.com/verify/${tokenId}`
      }
    };
  }

  /**
   * Validate certificate data
   * @param {Object} data - Certificate data to validate
   * @returns {boolean} - True if valid
   */
  validateCertificateData(data) {
    const required = ['title', 'documentHash', 'issuerAddress'];
    
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (data.documentHash && !/^0x[a-fA-F0-9]{64}$/.test(data.documentHash)) {
      throw new Error('Invalid document hash format');
    }

    if (data.issuerAddress && !/^0x[a-fA-F0-9]{40}$/.test(data.issuerAddress)) {
      throw new Error('Invalid issuer address format');
    }

    if (data.recipientAddress && !/^0x[a-fA-F0-9]{40}$/.test(data.recipientAddress)) {
      throw new Error('Invalid recipient address format');
    }

    return true;
  }
}

// Export singleton instance
module.exports = new CertificateService();