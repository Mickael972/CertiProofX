/**
 * Verify page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Verify = () => {
  const { tokenId } = useParams();
  const [verificationId, setVerificationId] = useState(tokenId || '');
  const [verificationType, setVerificationType] = useState('tokenId');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (tokenId) {
      handleVerify(tokenId, 'tokenId');
    }
  }, [tokenId]);

  const handleVerify = async (id = verificationId, type = verificationType) => {
    if (!id.trim()) {
      toast.error('Please enter a Token ID, wallet address, or document hash');
      return;
    }

    setVerifying(true);
    
    try {
      // Simulate verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      const mockResult = {
        verified: true,
        tokenId: type === 'tokenId' ? id : '123',
        documentHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        ipfsHash: 'QmTestHash123456789',
        title: 'Computer Science Degree',
        documentType: 'diploma',
        issuer: '0x1234567890123456789012345678901234567890',
        recipient: '0x0987654321098765432109876543210987654321',
        issuedAt: '2025-08-03T00:00:00.000Z',
        network: 'mumbai',
        contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      };
      
      setResult(mockResult);
      toast.success('Certificate verified successfully!');
      
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Verification failed. Please check your input and try again.');
      setResult(null);
    } finally {
      setVerifying(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Verify Certificate - CertiProof X</title>
        <meta name="description" content="Verify the authenticity of blockchain certificates" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Verify Certificate
              </h1>
              <p className="text-lg text-gray-600">
                Enter a Token ID, wallet address, or document hash to verify authenticity
              </p>
            </div>

            {/* Verification Form */}
            <div className="card p-8 mb-8">
              <div className="space-y-6">
                {/* Type Selection */}
                <div>
                  <label className="form-label">Verification Type</label>
                  <select
                    value={verificationType}
                    onChange={(e) => setVerificationType(e.target.value)}
                    className="input"
                  >
                    <option value="tokenId">Token ID</option>
                    <option value="hash">Document Hash</option>
                    <option value="wallet">Wallet Address</option>
                  </select>
                </div>

                {/* Input Field */}
                <div>
                  <label className="form-label">
                    {verificationType === 'tokenId' && 'Token ID'}
                    {verificationType === 'hash' && 'Document Hash'}
                    {verificationType === 'wallet' && 'Wallet Address'}
                  </label>
                  <input
                    type="text"
                    value={verificationId}
                    onChange={(e) => setVerificationId(e.target.value)}
                    placeholder={
                      verificationType === 'tokenId' ? 'e.g., 123' :
                      verificationType === 'hash' ? 'e.g., 0x1234...' :
                      'e.g., 0x1234...'
                    }
                    className="input"
                  />
                </div>

                {/* Verify Button */}
                <button
                  onClick={() => handleVerify()}
                  disabled={verifying || !verificationId.trim()}
                  className="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <LoadingSpinner size="sm" color="white" className="mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Certificate'
                  )}
                </button>
              </div>
            </div>

            {/* Verification Result */}
            {result && (
              <div className="card p-8">
                <div className="flex items-center mb-6">
                  {result.verified ? (
                    <div className="flex items-center text-success-600">
                      <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-2xl font-bold">Verified Certificate</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-error-600">
                      <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-2xl font-bold">Invalid Certificate</span>
                    </div>
                  )}
                </div>

                {result.verified && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Certificate Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Title:</span>
                          <p className="text-gray-900">{result.title}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Type:</span>
                          <p className="text-gray-900 capitalize">{result.documentType}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Issued Date:</span>
                          <p className="text-gray-900">{formatDate(result.issuedAt)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Token ID:</span>
                          <p className="text-gray-900 font-mono">{result.tokenId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Details</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Issuer:</span>
                          <p className="text-gray-900 font-mono">{formatAddress(result.issuer)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Recipient:</span>
                          <p className="text-gray-900 font-mono">{formatAddress(result.recipient)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Network:</span>
                          <p className="text-gray-900 capitalize">{result.network}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Contract:</span>
                          <p className="text-gray-900 font-mono">{formatAddress(result.contractAddress)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Document Hash:</span>
                          <p className="text-gray-900 font-mono text-sm break-all">{result.documentHash}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">IPFS Hash:</span>
                          <p className="text-gray-900 font-mono text-sm break-all">{result.ipfsHash}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-2 flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                      <a
                        href={`https://mumbai.polygonscan.com/tx/${result.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        View on Polygonscan
                      </a>
                      <a
                        href={`https://ipfs.io/ipfs/${result.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        View on IPFS
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Verification link copied!');
                        }}
                        className="btn btn-secondary"
                      >
                        Share Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Verify;