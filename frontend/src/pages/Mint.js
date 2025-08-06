/**
 * Mint page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useT } from '../contexts/I18nContext';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const Mint = () => {
  const t = useT();
  const { 
    isConnected, 
    account, 
    contract, 
    connectWallet, 
    network 
  } = useWeb3();



  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    documentType: 'certificate',
    recipient: ''
  });

  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSteps, setProcessSteps] = useState([
    { key: 'upload', status: 'pending' },
    { key: 'hash', status: 'pending' },
    { key: 'ipfs', status: 'pending' },
    { key: 'mint', status: 'pending' },
    { key: 'success', status: 'pending' }
  ]);

  // Result state
  const [mintResult, setMintResult] = useState(null);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error(t('mint.fileTooLarge'));
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(t('mint.fileTypeNotAllowed'));
      return;
    }

    setSelectedFile(file);
    
    // Auto-fill title if empty
    if (!formData.title) {
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setFormData(prev => ({ ...prev, title: fileName }));
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [formData.title, t]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Update process step
  const updateStep = useCallback((stepIndex, status) => {
    setProcessSteps(prev => 
      prev.map((step, index) => 
        index === stepIndex ? { ...step, status } : step
      )
    );
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Upload file to backend
  const uploadFile = async () => {
    const formDataObj = new FormData();
    formDataObj.append('file', selectedFile);
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('documentType', formData.documentType);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formDataObj
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  };

  // Mint NFT
  const mintNFT = async (fileHash, ipfsHash) => {
    if (!contract) {
      throw new Error('Contract not available');
    }

    const recipient = formData.recipient || account;
    
    // Call smart contract mint function
    const tx = await contract.mint(
      recipient,
      fileHash,
      `ipfs://${ipfsHash}`,
      formData.documentType,
      formData.title,
      false // not locked by default
    );

    return tx;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error(t('mint.pleaseSelectFile'));
      return;
    }

    if (!isConnected) {
      toast.error(t('mint.pleaseConnectWallet'));
      return;
    }

    if (!contract) {
      toast.error(t('mint.contractNotAvailable'));
      return;
    }

    setIsProcessing(true);
    setMintResult(null);

    try {
      // Step 1: Upload file
      updateStep(0, 'processing');
      const uploadResult = await uploadFile();
      updateStep(0, 'completed');

      // Step 2: File hash (already done by backend)
      updateStep(1, 'processing');
      const fileHash = uploadResult.data.fileHash;
      updateStep(1, 'completed');

      // Step 3: IPFS upload (already done by backend)
      updateStep(2, 'processing');
      const ipfsHash = uploadResult.data.ipfs.hash;
      updateStep(2, 'completed');

      // Step 4: Mint NFT
      updateStep(3, 'processing');
      const tx = await mintNFT(fileHash, ipfsHash);
      
      toast.loading(t('mint.waitingForConfirmation'), { id: 'mint-tx' });
      
      const receipt = await tx.wait();
      updateStep(3, 'completed');

      // Step 5: Success
      updateStep(4, 'processing');
      
      // Extract token ID from transaction logs
      const mintEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'ProofMinted';
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (mintEvent) {
        const parsed = contract.interface.parseLog(mintEvent);
        tokenId = parsed.args.tokenId.toString();
      }

      setMintResult({
        // NFT/Blockchain Data
        tokenId,
        transactionHash: receipt.hash,
        contractAddress: contract.target || contract.address,
        networkName: network?.name || 'Unknown',
        blockNumber: receipt.blockNumber,
        
        // Document Data
        fileHash,
        ipfsHash,
        ipfsUrl: `ipfs://${ipfsHash}`,
        
        // Certificate Metadata (compatible avec CertificateCard)
        id: `cert_${Date.now()}`,
        name: formData.title,              // title → name pour CertificateCard
        title: formData.title,             // garde title aussi
        description: formData.description,
        documentType: formData.documentType,
        
        // User Data
        recipient: formData.recipient || account,
        walletAddress: formData.recipient || account, // recipient → walletAddress pour CertificateCard
        issuer: account,
        
        // Timestamps
        createdAt: new Date().toISOString(),
        mintedAt: new Date().toISOString(),
        
        // Status
        isVerified: true,
        isActive: true,
        network: network?.name?.toLowerCase() || 'unknown'
      });

      updateStep(4, 'completed');
      toast.success(t('mint.successfullyMinted'), { id: 'mint-tx' });

    } catch (error) {
      console.error('Minting failed:', error);
      toast.error(error.message || t('mint.mintingFailed'), { id: 'mint-tx' });
      
      // Reset steps on error
      setProcessSteps(prev => 
        prev.map(step => ({ ...step, status: 'pending' }))
      );
    }

    setIsProcessing(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      documentType: 'certificate',
      recipient: ''
    });
    setSelectedFile(null);
    setFilePreview(null);
    setMintResult(null);
    setProcessSteps(prev => 
      prev.map(step => ({ ...step, status: 'pending' }))
    );
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('mint.title')} - CertiProof X</title>
        <meta name="description" content={t('mint.subtitle')} />
      </Helmet>

      <div className="min-h-screen bg-dark-950 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4 font-poppins">
                {t('mint.title')}
            </h1>
              <p className="text-lg text-gray-400">
                {t('mint.subtitle')}
              </p>
            </div>

            {/* Connection Check */}
            {!isConnected && (
              <div className="card p-6 mb-8">
              <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 font-poppins">
                    {t('mint.connectWalletFirst')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {t('mint.connectWalletDescription')}
                  </p>
                  <button
                    onClick={connectWallet}
                    className="btn-primary"
                  >
                    {t('mint.connectWallet')}
                  </button>
                </div>
              </div>
            )}

            {/* Main Content */}
            {isConnected && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload */}
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 font-poppins">
                        {t('mint.selectDocument')}
                      </h3>
                      
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                          isDragOver 
                            ? 'border-primary-500 bg-primary-500/10' 
                            : selectedFile
                              ? 'border-success-500 bg-success-500/10'
                              : 'border-gray-700 hover:border-gray-600'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileInputChange}
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.doc,.docx,.xls,.xlsx"
                        />
                        
                        {selectedFile ? (
                          <div className="space-y-4">
                            {filePreview && (
                              <img 
                                src={filePreview} 
                                alt="Preview" 
                                className="w-32 h-32 object-cover mx-auto rounded-lg"
                              />
                            )}
                            <div>
                              <p className="text-success-500 font-medium">
                                ✓ {selectedFile.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                setFilePreview(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                              className="text-error-400 hover:text-error-300 text-sm"
                            >
                              {t('mint.removeFile')}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                              <p className="text-gray-300 font-medium">
                                {t('mint.dragDropFiles')}
                              </p>
                              <p className="text-sm text-gray-400">
                                {t('mint.supportedFormats')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Form */}
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 font-poppins">
                        {t('mint.certificateDetails')}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('mint.title')} *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-dark-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder={t('mint.titlePlaceholder')}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('mint.documentType')}
                          </label>
                          <select
                            name="documentType"
                            value={formData.documentType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-dark-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="certificate">{t('mint.types.certificate')}</option>
                            <option value="diploma">{t('mint.types.diploma')}</option>
                            <option value="license">{t('mint.types.license')}</option>
                            <option value="proof">{t('mint.types.proof')}</option>
                            <option value="document">{t('mint.types.document')}</option>
                            <option value="other">{t('mint.types.other')}</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('mint.description')}
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 bg-dark-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder={t('mint.descriptionPlaceholder')}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('mint.recipient')}
                          <span className="text-gray-500 text-xs ml-1">
                            ({t('mint.optional')})
                          </span>
                        </label>
                        <input
                          type="text"
                          name="recipient"
                          value={formData.recipient}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-dark-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder={account || t('mint.recipientPlaceholder')}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {t('mint.recipientHint')}
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-dark-800 transition-colors"
                        disabled={isProcessing}
                      >
                        {t('mint.reset')}
                      </button>
                      <button
                        type="submit"
                        className="btn-primary px-8 py-2"
                        disabled={!selectedFile || !formData.title || isProcessing}
                      >
                        {isProcessing ? t('mint.minting') : t('mint.mintCertificate')}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Network Info */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 font-poppins">
                      {t('mint.networkInfo')}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('mint.network')}:</span>
                        <span className="font-medium text-white">
                          {network?.displayName || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('mint.account')}:</span>
                        <span className="font-mono text-xs text-white">
                          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('mint.contract')}:</span>
                        <span className={`text-xs ${contract ? 'text-success-500' : 'text-error-400'}`}>
                          {contract ? '✓ Connected' : '✗ Not Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Process Steps */}
                  {isProcessing && (
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 font-poppins">
                        {t('mint.progress')}
                      </h3>
                      <div className="space-y-3">
                        {processSteps.map((step, index) => (
                          <div key={step.key} className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              step.status === 'completed' 
                                ? 'bg-success-500/20 text-success-500'
                                : step.status === 'processing'
                                  ? 'bg-primary-500/20 text-primary-500 animate-pulse'
                                  : 'bg-gray-700 text-gray-400'
                            }`}>
                              {step.status === 'completed' ? '✓' : index + 1}
                            </div>
                            <span className={`text-sm ${
                              step.status === 'completed' 
                                ? 'text-success-500'
                                : step.status === 'processing'
                                  ? 'text-primary-500 font-medium'
                                  : 'text-gray-400'
                            }`}>
                              {t(`mint.steps.${step.key}`)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Result */}
                  {mintResult && (
                    <div className="card p-6 border-success-500/20 bg-success-500/5">
                      <h3 className="text-lg font-semibold text-success-400 mb-4 font-poppins">
                        🎉 {t('mint.mintSuccess')}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-success-400 font-medium">{t('mint.tokenId')}:</span>
                          <span className="ml-2 font-mono text-white">{mintResult.tokenId}</span>
                        </div>
                        <div>
                          <span className="text-success-400 font-medium">{t('mint.transaction')}:</span>
                          <a 
                            href={`${network?.blockExplorer}/tx/${mintResult.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary-400 hover:text-primary-300 font-mono text-xs break-all"
                          >
                            {mintResult.transactionHash.slice(0, 10)}...
                          </a>
                        </div>
                        <div>
                          <span className="text-success-400 font-medium">{t('mint.recipient')}:</span>
                          <span className="ml-2 font-mono text-xs text-white">
                            {mintResult.recipient.slice(0, 6)}...{mintResult.recipient.slice(-4)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => {
                            const verifyUrl = `/verify?hash=${mintResult.fileHash}`;
                            window.open(verifyUrl, '_blank');
                          }}
                          className="w-full px-4 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 transition-colors text-sm"
                        >
                          {t('mint.verifyCertificate')}
                        </button>
                        <button
                          onClick={() => {
                            // Sauvegarder le certificat dans localStorage pour l'afficher dans /certificates
                            const savedCerts = JSON.parse(localStorage.getItem('userCertificates') || '[]');
                            savedCerts.unshift(mintResult); // Ajouter en premier
                            localStorage.setItem('userCertificates', JSON.stringify(savedCerts));
                            
                            // Naviguer vers la page certificats
                            window.location.href = '/certificates';
                          }}
                          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                        >
                          {t('mint.viewCertificate')}
                        </button>
                        <button
                          onClick={resetForm}
                          className="w-full px-4 py-2 border border-success-500 text-success-400 rounded-md hover:bg-success-500/10 transition-colors text-sm"
                        >
                          {t('mint.mintAnother')}
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Mint;