/**
 * CertificatePDF component for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import {
  FileText,
  Download,
  Shield,
  Calendar,
  User,
  Hash,
  Signature,
  Award,
  Building,
  Globe,
  Sparkles,
} from 'lucide-react';

interface CertificateData {
  id: string;
  name: string;
  description: string;
  recipientName: string;
  recipientWallet: string;
  issuerName: string;
  issuerWallet: string;
  documentHash: string;
  ipfsHash?: string;
  tokenId?: string;
  issuedDate: string;
  network: string;
  contractAddress?: string;
}

interface CertificatePDFProps {
  certificate?: CertificateData;
  preview?: boolean;
  onDownload?: () => void;
  onSign?: () => void;
}

const CertificatePDF: React.FC<CertificatePDFProps> = ({
  certificate,
  preview = false,
  onDownload,
  onSign,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Données par défaut pré-remplies pour Kai Zenjiro
  const defaultCertificate: CertificateData = {
    id: 'cert_kai_001',
    name: "Computer Science Master's Degree Certificate",
    description:
      "Master's Degree in Computer Science with specialization in Blockchain Technologies and Decentralized Systems",
    recipientName: 'Kai Zenjiro',
    recipientWallet: '0x1E274F39A44f1561b3Bb21148B9881075575676D',
    issuerName: "École Supérieure d'Informatique Paris",
    issuerWallet: '0x742d35Cc6635C0532925a3b8D322035715d3b8B7',
    documentHash:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    ipfsHash: 'QmKaiZenjiroMasterDegree2025',
    tokenId: '42',
    issuedDate: '2025-08-03T10:30:00.000Z',
    network: 'Polygon Mumbai',
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  };

  const certData = certificate || defaultCertificate;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const verificationUrl = `${window.location.origin}/verify/${certData.documentHash}`;

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Ici on implémenterait la génération PDF réelle
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onDownload?.();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Actions */}
      {!preview && (
        <div className="flex flex-wrap gap-4 justify-center">
          <motion.button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-primary-500/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGeneratingPDF ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Télécharger PDF
              </>
            )}
          </motion.button>

          <motion.button
            onClick={onSign}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Signature className="w-5 h-5" />
            Signer avec wallet
          </motion.button>
        </div>
      )}

      {/* Certificat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white text-black rounded-2xl shadow-2xl overflow-hidden"
        style={{ aspectRatio: '210/297' }} // Format A4
      >
        {/* En-tête du certificat */}
        <div className="relative bg-gradient-to-r from-primary-600 to-purple-600 text-white p-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-poppins">
                    CertiProof X
                  </h1>
                  <p className="text-white/80 text-sm">
                    Blockchain Certificate
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-white/80 text-sm">Certificat #</p>
              <p className="font-mono text-lg">{certData.tokenId || '---'}</p>
            </div>
          </div>

          {/* Titre du certificat */}
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold font-poppins mb-2">
              CERTIFICAT D'AUTHENTICITÉ
            </h2>
            <div className="w-24 h-1 bg-white/50 mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Corps du certificat */}
        <div className="p-8 space-y-8">
          {/* Informations principales */}
          <div className="text-center space-y-4">
            <div>
              <p className="text-gray-600 text-lg mb-2">Certifie que</p>
              <h3 className="text-4xl font-bold text-primary-600 font-poppins">
                {certData.recipientName}
              </h3>
            </div>

            <div className="max-w-2xl mx-auto">
              <p className="text-gray-600 text-lg mb-2">a obtenu le</p>
              <h4 className="text-2xl font-semibold text-gray-800 mb-4">
                {certData.name}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {certData.description}
              </p>
            </div>
          </div>

          {/* Détails techniques et signatures */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-gray-200 pt-8">
            {/* Détails blockchain */}
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                Détails Blockchain
              </h5>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Hash du document:</p>
                  <code className="text-xs font-mono text-gray-800 break-all">
                    {formatAddress(certData.documentHash)}
                  </code>
                </div>

                <div>
                  <p className="text-gray-600">Réseau:</p>
                  <span className="font-medium text-purple-600">
                    {certData.network}
                  </span>
                </div>

                {certData.ipfsHash && (
                  <div>
                    <p className="text-gray-600">IPFS:</p>
                    <code className="text-xs font-mono text-gray-800">
                      {formatAddress(certData.ipfsHash)}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Informations d'émission */}
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                <Building className="w-5 h-5 text-primary-500" />
                Émetteur
              </h5>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Institution:</p>
                  <p className="font-medium">{certData.issuerName}</p>
                </div>

                <div>
                  <p className="text-gray-600">Wallet émetteur:</p>
                  <code className="text-xs font-mono text-gray-800">
                    {formatAddress(certData.issuerWallet)}
                  </code>
                </div>

                <div>
                  <p className="text-gray-600">Date d'émission:</p>
                  <p className="font-medium">
                    {formatDate(certData.issuedDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code et signature */}
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-500" />
                Vérification
              </h5>

              <div className="text-center space-y-3">
                <QRCode
                  value={verificationUrl}
                  size={100}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                  includeMargin={true}
                  className="mx-auto border border-gray-200 rounded-lg"
                />
                <p className="text-xs text-gray-600">Scanner pour vérifier</p>
              </div>
            </div>
          </div>

          {/* Signature numérique */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left">
                <p className="text-gray-600 text-sm mb-1">
                  Signature numérique
                </p>
                <div className="flex items-center gap-2">
                  <Signature className="w-5 h-5 text-primary-500" />
                  <span className="font-semibold text-primary-600 font-script text-xl">
                    Kai Zenjiro
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Wallet: {formatAddress(certData.recipientWallet)}
                </p>
              </div>

              {/* Badges de validation */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-100 text-success-700 text-xs font-medium rounded-full">
                  <Shield className="w-3 h-3" />
                  Vérifié
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  <Globe className="w-3 h-3" />
                  Décentralisé
                </span>
                {certData.tokenId && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    <Sparkles className="w-3 h-3" />
                    NFT #{certData.tokenId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pied de page avec licence */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
              <span>© 2025 CertiProof X</span>
              <span>•</span>
              <span>Licence MIT</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Ce certificat est authentifié par la blockchain et vérifiable
              publiquement
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CertificatePDF;
