/**
 * VerifyCertificate component for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Copy,
  ExternalLink,
  Calendar,
  User,
  Hash,
  Database,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyCertificate = ({ 
  initialHash = '', 
  onVerificationComplete 
}) => {
  const [inputValue, setInputValue] = useState(initialHash);
  const [inputType, setInputType] = useState('hash');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    if (initialHash) {
      handleVerification(initialHash);
    }
  }, [initialHash]);

  // Détecter automatiquement le type d'input
  const detectInputType = (value) => {
    if (value.startsWith('0x') && value.length === 66) {
      return 'hash';
    } else if (value.startsWith('0x') && value.length === 42) {
      return 'address';
    } else if (/^\d+$/.test(value)) {
      return 'tokenId';
    }
    return 'hash';
  };

  // Fonction de vérification
  const handleVerification = async (value = inputValue) => {
    if (!value.trim()) {
      toast.error('Veuillez entrer une valeur à vérifier');
      return;
    }

    setIsVerifying(true);
    const detectedType = detectInputType(value);
    setInputType(detectedType);

    try {
      // Simulation d'un appel API de vérification
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulation du résultat basé sur la valeur
      const isValid = !value.includes('invalid') && !value.includes('fake');
      
      const mockResult = {
        isValid,
        certificate: isValid ? {
          id: 'cert_001',
          name: 'Computer Science Degree Certificate',
          description: 'Master\'s Degree in Computer Science - Blockchain Specialization',
          hash: value.startsWith('0x') ? value : '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          walletAddress: '0x1E274F39A44f1561b3Bb21148B9881075575676D',
          createdAt: '2025-08-03T10:30:00.000Z',
          ipfsHash: 'QmTestHash123456789abcdef',
          tokenId: '42',
          contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          network: 'mumbai',
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          issuer: 'École Supérieure d\'Informatique'
        } : null,
        error: !isValid ? 'Certificat non trouvé ou invalide' : undefined
      };

      setResult(mockResult);
      onVerificationComplete?.(mockResult);

      if (isValid) {
        toast.success('Certificat vérifié avec succès !');
      } else {
        toast.error('Certificat non valide ou introuvable');
      }
    } catch (error) {
      const errorResult = {
        isValid: false,
        certificate: null,
        error: 'Erreur lors de la vérification'
      };
      setResult(errorResult);
      onVerificationComplete?.(errorResult);
      toast.error('Erreur lors de la vérification');
    } finally {
      setIsVerifying(false);
    }
  };

  // Copier dans le presse-papier
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copié !`);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  // Formater l'adresse
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInputPlaceholder = () => {
    switch (inputType) {
      case 'hash':
        return 'Entrez le hash SHA256 du document (0x...)';
      case 'tokenId':
        return 'Entrez l\'ID du token NFT';
      case 'address':
        return 'Entrez l\'adresse du propriétaire (0x...)';
      default:
        return 'Entrez le hash, token ID ou adresse à vérifier';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Formulaire de vérification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-8"
      >
        <div className="space-y-6">
          {/* En-tête */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-4 bg-primary-500/20 rounded-full border border-primary-500/30">
                <Shield className="w-8 h-8 text-primary-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white font-poppins">
              Vérifier un certificat
            </h2>
            <p className="text-gray-400">
              Entrez un hash SHA256, un ID de token NFT ou une adresse pour vérifier l'authenticité
            </p>
          </div>

          {/* Sélecteur de type */}
          <div className="flex justify-center">
            <div className="flex bg-dark-800 rounded-xl p-1 border border-gray-600">
              {[
                { key: 'hash', label: 'Hash SHA256', icon: Hash },
                { key: 'tokenId', label: 'Token ID', icon: Sparkles },
                { key: 'address', label: 'Adresse', icon: User }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setInputType(key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${inputType === key 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Zone de saisie */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={getInputPlaceholder()}
                  className="w-full px-4 py-3 bg-dark-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerification()}
                />
              </div>
              <motion.button
                onClick={() => setShowQRScanner(!showQRScanner)}
                className="p-3 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-xl border border-gray-600 transition-all"
                whileTap={{ scale: 0.95 }}
              >
                <QrCode className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Scanner QR (placeholder) */}
            {showQRScanner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-dark-800 border border-gray-600 rounded-xl p-6 text-center"
              >
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  Scanner QR non implémenté dans cette démo
                </p>
              </motion.div>
            )}

            <motion.button
              onClick={() => handleVerification()}
              disabled={isVerifying || !inputValue.trim()}
              className={`
                w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl
                font-medium transition-all duration-200
                ${isVerifying || !inputValue.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-primary-500/25'
                }
              `}
              whileHover={!isVerifying && inputValue.trim() ? { scale: 1.02 } : {}}
              whileTap={!isVerifying && inputValue.trim() ? { scale: 0.98 } : {}}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Vérification en cours...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Vérifier le certificat
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Résultat de la vérification */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              rounded-2xl border p-8 backdrop-blur-sm
              ${result.isValid 
                ? 'bg-success-500/10 border-success-500/30' 
                : 'bg-red-500/10 border-red-500/30'
              }
            `}
          >
            {/* Animation d'icône de statut */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex justify-center mb-6"
            >
              <div className={`
                p-4 rounded-full
                ${result.isValid 
                  ? 'bg-success-500/20 border border-success-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
                }
              `}>
                {result.isValid ? (
                  <CheckCircle className="w-12 h-12 text-success-500" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500" />
                )}
              </div>
            </motion.div>

            <div className="text-center mb-8">
              <h3 className={`
                text-2xl font-bold font-poppins mb-2
                ${result.isValid ? 'text-success-400' : 'text-red-400'}
              `}>
                {result.isValid ? 'Certificat vérifié ✓' : 'Certificat non valide ✗'}
              </h3>
              <p className="text-gray-400">
                {result.isValid 
                  ? 'Ce certificat est authentique et vérifié sur la blockchain' 
                  : result.error || 'Ce certificat n\'a pas pu être vérifié'
                }
              </p>
            </div>

            {/* Détails du certificat (si valide) */}
            {result.isValid && result.certificate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-dark-900/50 rounded-xl p-6 border border-gray-700"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informations principales */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white font-poppins mb-2">
                        {result.certificate.name}
                      </h4>
                      {result.certificate.description && (
                        <p className="text-gray-400 text-sm">
                          {result.certificate.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Propriétaire:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-gray-300 text-sm">
                            {formatAddress(result.certificate.walletAddress)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(result.certificate.walletAddress, 'Adresse')}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Date de création:</span>
                        <span className="text-gray-300 text-sm">
                          {formatDate(result.certificate.createdAt)}
                        </span>
                      </div>

                      {result.certificate.tokenId && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Token NFT:</span>
                          <span className="text-purple-400 text-sm font-medium">
                            #{result.certificate.tokenId}
                          </span>
                        </div>
                      )}

                      {result.certificate.network && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Réseau:</span>
                          <span className="text-blue-400 text-sm font-medium">
                            {result.certificate.network.charAt(0).toUpperCase() + result.certificate.network.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions et liens */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {result.certificate.transactionHash && (
                        <a
                          href={`https://mumbai.polygonscan.com/tx/${result.certificate.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Voir la transaction
                        </a>
                      )}

                      {result.certificate.contractAddress && (
                        <a
                          href={`https://mumbai.polygonscan.com/address/${result.certificate.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Voir le contrat
                        </a>
                      )}

                      {result.certificate.ipfsHash && (
                        <a
                          href={`https://ipfs.io/ipfs/${result.certificate.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-success-400 hover:text-success-300 text-sm transition-colors"
                        >
                          <Database className="w-4 h-4" />
                          Voir sur IPFS
                        </a>
                      )}
                    </div>

                    {/* Badges de validation */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-500/20 text-success-400 text-xs font-medium rounded-full border border-success-500/30">
                        <CheckCircle className="w-3 h-3" />
                        Vérifié
                      </span>
                      {result.certificate.ipfsHash && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                          <Database className="w-3 h-3" />
                          IPFS
                        </span>
                      )}
                      {result.certificate.tokenId && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                          <Sparkles className="w-3 h-3" />
                          NFT
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyCertificate;