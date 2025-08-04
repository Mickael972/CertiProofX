/**
 * Upload page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWeb3 } from '../contexts/Web3Context';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Upload = () => {
  const navigate = useNavigate();
  const { isConnected } = useWeb3();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (selectedFile.size > maxSize) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('File type not supported. Please upload PDF, image, or text files.');
      return;
    }

    setFile(selectedFile);
    toast.success('File selected successfully!');
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first.');
      return;
    }

    setUploading(true);
    
    try {
      // Here you would upload to your backend
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('File uploaded successfully!');
      navigate('/mint', { state: { file } });
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Upload Document - CertiProof X</title>
        <meta name="description" content="Upload your document to create a blockchain certificate" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Your Document
              </h1>
              <p className="text-lg text-gray-600">
                Select a file to create a tamper-proof blockchain certificate
              </p>
            </div>

            <div className="card p-8">
              {/* Connection Check */}
              {!isConnected && (
                <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-warning-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-warning-800">
                      Please connect your wallet to upload documents
                    </span>
                  </div>
                </div>
              )}

              {/* Upload Zone */}
              <div
                className={`upload-zone ${dragActive ? 'upload-zone-active' : ''} ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && isConnected && document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.txt"
                  disabled={!isConnected || uploading}
                />
                
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {dragActive ? 'Drop your file here' : 'Drag and drop your file'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG, GIF, TXT up to 50MB
                  </p>
                </div>
              </div>

              {/* Selected File Info */}
              {file && (
                <div className="mt-6 p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-success-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-success-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-success-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={!file || !isConnected || uploading}
                  className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Continue to Mint Certificate'
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="mt-8 text-center text-sm text-gray-600">
                <p>
                  Your file will be hashed locally for security. Only the hash is stored on the blockchain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;