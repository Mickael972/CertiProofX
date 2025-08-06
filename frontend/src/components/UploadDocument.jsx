/**
 * UploadDocument component for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  Image,
  File,
  Shield,
  Database,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CryptoJS from 'crypto-js';
import { useT } from '../contexts/I18nContext';

const UploadDocument = ({ onFileProcessed, onMintNFT }) => {
  const t = useT();
  const [processedFile, setProcessedFile] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // Fonction pour calculer le SHA256
  const calculateSHA256 = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(`0x${hash}`);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // Configuration du dropzone
  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validation des types de fichiers
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          'Type de fichier non supporté. Utilisez PDF, PNG, JPG ou TXT.'
        );
        return;
      }

      // Validation de la taille (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(t('upload.fileTooLarge'));
        return;
      }

      setProcessedFile({
        file,
        hash: '',
        isProcessing: true,
        isUploaded: false,
      });

      try {
        // Calculer le hash SHA256
        const hash = await calculateSHA256(file);

        setProcessedFile((prev) =>
          prev
            ? {
                ...prev,
                hash,
                isProcessing: false,
              }
            : null
        );

        toast.success(t('upload.fileProcessedSuccess'));
        onFileProcessed?.(file, hash);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erreur lors du traitement du fichier:', error);
        toast.error(t('upload.fileProcessingError'));
        setProcessedFile(null);
      }
    },
    [calculateSHA256, onFileProcessed, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/plain': ['.txt'],
    },
  });

  // Fonction pour générer le certificat
  const handleGenerateCertificate = async () => {
    if (!processedFile) return;

    setIsGeneratingCertificate(true);
    try {
      // Simulation de génération de certificat
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProcessedFile((prev) =>
        prev
          ? {
              ...prev,
              isUploaded: true,
            }
          : null
      );

      toast.success('Certificat généré avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération du certificat.');
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // Fonction pour minter le NFT
  const handleMintNFT = async () => {
    if (!processedFile) return;

    setIsMinting(true);
    try {
      await onMintNFT?.(processedFile.file, processedFile.hash);
      toast.success(t('upload.nftMintedSuccess'));
    } catch (error) {
      toast.error(t('upload.error'));
    } finally {
      setIsMinting(false);
    }
  };

  // Icône basée sur le type de fichier
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8" />;
    if (type.includes('image')) return <Image className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Zone de dépôt de fichier */}
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 bg-dark-900/50 backdrop-blur-sm
          ${
            isDragActive
              ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/25'
              : 'border-gray-600 hover:border-primary-500 hover:bg-primary-500/5'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <motion.div
              className={`
                p-6 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20
                border border-primary-500/30
                ${isDragActive ? 'animate-pulse' : ''}
              `}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Upload className="w-12 h-12 text-primary-500" />
            </motion.div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-poppins mb-2">
              {isDragActive
                ? t('upload.dropFileHere')
                : t('upload.uploadDocument')}
            </h3>
            <p className="text-gray-400 text-sm">
              {t('upload.dragDropOrClick')}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {t('upload.supportedFormatsDetail')}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Informations du fichier traité */}
      <AnimatePresence>
        {processedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-dark-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informations du fichier */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-500/20 rounded-xl border border-primary-500/30">
                    {getFileIcon(processedFile.file.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white font-poppins">
                      {processedFile.file.name}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {formatFileSize(processedFile.file.size)}
                    </p>
                  </div>
                </div>

                {/* Hash SHA256 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-500" />
                    <span className="font-semibold text-white">
                      {t('upload.sha256Hash')}
                    </span>
                  </div>

                  {processedFile.isProcessing ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('upload.calculatingHash')}</span>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-dark-800 rounded-lg p-4 border border-gray-600"
                    >
                      <code className="text-sm text-gray-300 break-all font-mono">
                        {processedFile.hash}
                      </code>
                    </motion.div>
                  )}
                </div>

                {/* Badge IPFS */}
                {processedFile.isUploaded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-success-500/20 text-success-400 px-4 py-2 rounded-lg border border-success-500/30"
                  >
                    <Database className="w-4 h-4" />
                    <span className="font-medium">
                      {t('upload.ipfsStored')}
                    </span>
                    <CheckCircle className="w-4 h-4" />
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h5 className="font-semibold text-white font-poppins">
                  {t('upload.actions')}
                </h5>

                <div className="space-y-3">
                  {/* Générer certificat */}
                  <motion.button
                    onClick={handleGenerateCertificate}
                    disabled={
                      processedFile.isProcessing || isGeneratingCertificate
                    }
                    className={`
                      w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl
                      font-medium transition-all duration-200
                      ${
                        processedFile.isProcessing || isGeneratingCertificate
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-primary-500/25'
                      }
                    `}
                    whileHover={
                      !processedFile.isProcessing && !isGeneratingCertificate
                        ? { scale: 1.02 }
                        : {}
                    }
                    whileTap={
                      !processedFile.isProcessing && !isGeneratingCertificate
                        ? { scale: 0.98 }
                        : {}
                    }
                  >
                    {isGeneratingCertificate ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('upload.generating')}
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        {t('upload.generateCertificate')}
                      </>
                    )}
                  </motion.button>

                  {/* Mint NFT */}
                  <motion.button
                    onClick={handleMintNFT}
                    disabled={!processedFile.isUploaded || isMinting}
                    className={`
                      w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl
                      font-medium transition-all duration-200
                      ${
                        !processedFile.isUploaded || isMinting
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25'
                      }
                    `}
                    whileHover={
                      processedFile.isUploaded && !isMinting
                        ? { scale: 1.02 }
                        : {}
                    }
                    whileTap={
                      processedFile.isUploaded && !isMinting
                        ? { scale: 0.98 }
                        : {}
                    }
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('upload.minting')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        {t('upload.mintNFT')}
                      </>
                    )}
                  </motion.button>
                </div>

                {!processedFile.isUploaded && !processedFile.isProcessing && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{t('upload.generateFirst')}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadDocument;
