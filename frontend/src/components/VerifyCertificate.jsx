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
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useT } from '../contexts/I18nContext';
import CertificateCard from './CertificateCard';

const VerifyCertificate = ({ initialHash = '', onVerificationComplete }) => {
  const t = useT();
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
      toast.error(t('verify.pleaseEnterValue'));
      return;
    }

    setIsVerifying(true);
    const detectedType = detectInputType(value);
    setInputType(detectedType);

    try {
      // Simulation d'un appel API de vérification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 1. D'abord, chercher dans les certificats de l'utilisateur (localStorage)
      const savedCerts = JSON.parse(
        localStorage.getItem('userCertificates') || '[]'
      );
      const userCert = savedCerts.find(
        (cert) =>
          cert.hash === value ||
          cert.tokenId === value ||
          cert.walletAddress === value ||
          cert.id === value
      );

      if (userCert) {
        // Certificat utilisateur trouvé - retourner les vraies données
        const userResult = {
          isValid: true,
          certificate: {
            ...userCert,
            isVerified: true,
          },
          isUserCertificate: true,
        };
        setResult(userResult);
        onVerificationComplete?.(userResult);
        toast.success(`🎉 ${t('verify.yourCertificateVerified')}`);
        return;
      }

      // 2. Vérifier dans les certificats d'exemple
      const exampleCertificates = [
        {
          id: 'cert_kai_001',
          name: "Master's Degree Certificate",
          description: 'Computer Science with Blockchain Specialization',
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          walletAddress: '0x1E274F39A44f1561b3Bb21148B9881075575676D',
          createdAt: '2025-08-03T10:30:00.000Z',
          ipfsHash: 'QmKaiZenjiroMasterDegree2025',
          tokenId: '42',
          isVerified: true,
          contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          network: 'mumbai',
          transactionHash:
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          issuer: "École Supérieure d'Informatique",
        },
        {
          id: 'cert_kai_002',
          name: 'Blockchain Developer Certificate',
          description: 'Full-Stack Blockchain Development Certification',
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          walletAddress: '0x1E274F39A44f1561b3Bb21148B9881075575676D',
          createdAt: '2025-07-15T14:20:00.000Z',
          ipfsHash: 'QmKaiZenjiroBlockchainDev2025',
          tokenId: '43',
          isVerified: true,
          contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          network: 'mumbai',
          transactionHash:
            '0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          issuer: "École Supérieure d'Informatique",
        },
      ];

      const exampleCert = exampleCertificates.find(
        (cert) =>
          cert.hash === value ||
          cert.tokenId === value ||
          cert.walletAddress === value ||
          cert.id === value
      );

      if (exampleCert) {
        // Certificat d'exemple trouvé
        const exampleResult = {
          isValid: true,
          certificate: exampleCert,
        };
        setResult(exampleResult);
        onVerificationComplete?.(exampleResult);
        toast.success(t('verify.valid'));
        return;
      }

      // 3. Fallback sur la simulation générique
      const isValid = !value.includes('invalid') && !value.includes('fake');

      const mockResult = {
        isValid,
        certificate: isValid
          ? {
              id: 'cert_demo',
              name: 'Demo Certificate',
              description: 'Certificat de démonstration généré automatiquement',
              hash: value.startsWith('0x')
                ? value
                : '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              walletAddress: '0x1E274F39A44f1561b3Bb21148B9881075575676D',
              createdAt: new Date().toISOString(),
              ipfsHash: 'QmDemoHash123456789abcdef',
              tokenId: Math.floor(Math.random() * 1000).toString(),
              contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
              network: 'mumbai',
              transactionHash:
                '0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              issuer: 'CertiProof X Demo',
              isVerified: true,
            }
          : null,
        error: !isValid ? t('verify.notFound') : undefined,
      };

      setResult(mockResult);
      onVerificationComplete?.(mockResult);

      if (isValid) {
        toast.success(t('verify.valid'));
      } else {
        toast.error(t('verify.invalid'));
      }
    } catch (error) {
      const errorResult = {
        isValid: false,
        certificate: null,
        error: t('verify.errorDuringVerification'),
      };
      setResult(errorResult);
      onVerificationComplete?.(errorResult);
      toast.error(t('verify.errorDuringVerification'));
    } finally {
      setIsVerifying(false);
    }
  };

  // Copier dans le presse-papier
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('verify.hashCopied'));
    } catch (error) {
      toast.error(t('verify.copyError'));
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
      minute: '2-digit',
    });
  };

  const getInputPlaceholder = () => {
    switch (inputType) {
      case 'hash':
        return t('verify.hashPlaceholder');
      case 'tokenId':
        return t('verify.enterTokenId');
      case 'address':
        return t('verify.addressPlaceholder');
      default:
        return t('verify.searchPlaceholder');
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
              {t('verify.title')}
            </h2>
            <p className="text-gray-400">{t('verify.enterHashOrId')}</p>
          </div>

          {/* Sélecteur de type */}
          <div className="flex justify-center">
            <div className="flex bg-dark-800 rounded-xl p-1 border border-gray-600">
              {[
                { key: 'hash', label: t('verify.hashLabel'), icon: Hash },
                {
                  key: 'tokenId',
                  label: t('verify.tokenIdLabel'),
                  icon: Sparkles,
                },
                { key: 'address', label: t('verify.addressLabel'), icon: User },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setInputType(key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      inputType === key
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
                  {t('verify.qrScannerNotImplemented')}
                </p>
              </motion.div>
            )}

            <motion.button
              onClick={() => handleVerification()}
              disabled={isVerifying || !inputValue.trim()}
              className={`
                w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl
                font-medium transition-all duration-200
                ${
                  isVerifying || !inputValue.trim()
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-primary-500/25'
                }
              `}
              whileHover={
                !isVerifying && inputValue.trim() ? { scale: 1.02 } : {}
              }
              whileTap={
                !isVerifying && inputValue.trim() ? { scale: 0.98 } : {}
              }
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('verify.verifyingButton')}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {t('verify.verifyButton')}
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
              ${
                result.isValid
                  ? 'bg-success-500/10 border-success-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }
            `}
          >
            {/* Animation d'icône de statut */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex justify-center mb-6"
            >
              <div
                className={`
                p-4 rounded-full
                ${
                  result.isValid
                    ? 'bg-success-500/20 border border-success-500/50'
                    : 'bg-red-500/20 border border-red-500/50'
                }
              `}
              >
                {result.isValid ? (
                  <CheckCircle className="w-12 h-12 text-success-500" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500" />
                )}
              </div>
            </motion.div>

            <div className="text-center mb-8">
              <h3
                className={`
                text-2xl font-bold font-poppins mb-2
                ${result.isValid ? 'text-success-400' : 'text-red-400'}
              `}
              >
                {result.isValid
                  ? t('verify.validCertificate')
                  : t('verify.invalidCertificate')}
              </h3>
              <p className="text-gray-400">
                {result.isValid
                  ? t('verify.certificateAuthentic')
                  : result.error || t('verify.certificateNotVerified')}
              </p>
            </div>

            {/* Certificat vérifié - Affichage avec CertificateCard */}
            {result.isValid && result.certificate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2 font-poppins">
                    {result.isUserCertificate
                      ? t('verify.yourCertificateTitle')
                      : t('verify.certificateDetails')}
                  </h3>
                  <p className="text-gray-400">
                    {result.isUserCertificate
                      ? t('verify.yourCertificateDesc')
                      : t('verify.certificateAuthentic')}
                  </p>
                </div>

                <CertificateCard
                  certificate={result.certificate}
                  onVerify={(hash) => {
                    console.log('Re-verifying certificate:', hash);
                  }}
                  onView={(cert) => {
                    console.log('Viewing certificate details:', cert);
                  }}
                  className="max-w-4xl mx-auto"
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyCertificate;
