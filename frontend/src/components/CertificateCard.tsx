/**
 * CertificateCard component for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { 
  Shield, 
  Calendar, 
  Wallet, 
  Hash, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  Eye,
  Sparkles,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CertificateCardProps {
  certificate: {
    id: string;
    name: string;
    description?: string;
    hash: string;
    walletAddress: string;
    createdAt: string;
    ipfsHash?: string;
    tokenId?: string;
    isVerified?: boolean;
    contractAddress?: string;
    network?: string;
  };
  onVerify?: (hash: string) => void;
  onView?: (certificate: any) => void;
  className?: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ 
  certificate, 
  onVerify, 
  onView,
  className = "" 
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fonction pour copier dans le presse-papier
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copié !`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  // Formater l'adresse wallet
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // URL pour le QR code (lien de vérification)
  const verificationUrl = `${window.location.origin}/verify/${certificate.hash}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`
        relative bg-gradient-to-br from-dark-900/90 to-dark-800/90 
        backdrop-blur-sm rounded-2xl border border-gray-700/50
        p-8 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10
        transition-all duration-300
        ${className}
      `}
    >
      {/* Badge de vérification */}
      {certificate.isVerified && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-success-500 text-white p-2 rounded-full shadow-lg"
        >
          <CheckCircle className="w-5 h-5" />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
                <Shield className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-poppins">
                  {certificate.name}
                </h3>
                {certificate.description && (
                  <p className="text-gray-400 text-sm mt-1">
                    {certificate.description}
                  </p>
                )}
              </div>
            </div>

            {/* Badges de statut */}
            <div className="flex flex-wrap gap-2">
              {certificate.tokenId && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                  <Sparkles className="w-3 h-3" />
                  NFT #{certificate.tokenId}
                </span>
              )}
              {certificate.ipfsHash && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-500/20 text-success-400 text-xs font-medium rounded-full border border-success-500/30">
                  <Database className="w-3 h-3" />
                  IPFS
                </span>
              )}
              {certificate.network && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                  {certificate.network.charAt(0).toUpperCase() + certificate.network.slice(1)}
                </span>
              )}
            </div>
          </div>

          {/* Détails techniques */}
          <div className="space-y-4">
            {/* Hash du document */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Hash SHA256</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-3 border border-gray-600">
                <code className="flex-1 text-xs text-gray-300 font-mono break-all">
                  {certificate.hash}
                </code>
                <motion.button
                  onClick={() => copyToClipboard(certificate.hash, 'Hash')}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {copiedField === 'Hash' ? (
                    <CheckCircle className="w-4 h-4 text-success-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Adresse wallet */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Propriétaire</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-3 border border-gray-600">
                <code className="flex-1 text-sm text-gray-300 font-mono">
                  {formatAddress(certificate.walletAddress)}
                </code>
                <motion.button
                  onClick={() => copyToClipboard(certificate.walletAddress, 'Wallet')}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {copiedField === 'Wallet' ? (
                    <CheckCircle className="w-4 h-4 text-success-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Date de création */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Créé le</span>
              </div>
              <div className="text-sm text-gray-400">
                {formatDate(certificate.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code et actions */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 text-center">
              QR Code de vérification
            </h4>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-4 rounded-xl mx-auto w-fit shadow-lg"
            >
              <QRCode
                value={verificationUrl}
                size={120}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
                includeMargin={true}
              />
            </motion.div>
            <p className="text-xs text-gray-500 text-center">
              Scannez pour vérifier l'authenticité
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              onClick={() => onVerify?.(certificate.hash)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="w-5 h-5" />
              Vérifier
            </motion.button>

            <motion.button
              onClick={() => onView?.(certificate)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium rounded-xl transition-all duration-200 border border-gray-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-4 h-4" />
              Voir détails
            </motion.button>

            {certificate.contractAddress && (
              <motion.a
                href={`https://mumbai.polygonscan.com/address/${certificate.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium rounded-xl transition-all duration-200 border border-gray-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ExternalLink className="w-4 h-4" />
                Voir sur Polygonscan
              </motion.a>
            )}
          </div>
        </div>
      </div>

      {/* Effet de lueur au survol */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default CertificateCard;