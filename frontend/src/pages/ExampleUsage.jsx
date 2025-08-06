/**
 * ExampleUsage page - Démonstration des composants CertiProof X
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UploadDocument from '../components/UploadDocument';
import CertificateCard from '../components/CertificateCard';
import VerifyCertificate from '../components/VerifyCertificate';

const ExampleUsage = () => {
  const [activeTab, setActiveTab] = useState('upload');

  // Données d'exemple pour le certificat
  const exampleCertificate = {
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
  };

  const tabs = [
    { id: 'upload', label: 'Upload Document', icon: '📤' },
    { id: 'card', label: 'Certificate Card', icon: '🏆' },
    { id: 'verify', label: 'Verify Certificate', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white font-poppins mb-4"
          >
            CertiProof X Components
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            Interface utilisateur cybersécurité pour la certification blockchain
          </motion.p>
        </div>

        {/* Navigation des onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all
                ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-dark-800/50 text-gray-300 hover:bg-dark-700 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Contenu des onglets */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white font-poppins mb-2">
                  Upload Document Component
                </h2>
                <p className="text-gray-400">
                  Composant d'upload avec calcul SHA256, génération de
                  certificat et mint NFT
                </p>
              </div>
              <UploadDocument
                onFileProcessed={(file, hash) =>
                  console.log('File processed:', file.name, hash)
                }
                onMintNFT={(file, hash) =>
                  console.log('Minting NFT for:', file.name, hash)
                }
              />
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white font-poppins mb-2">
                  Certificate Card Component
                </h2>
                <p className="text-gray-400">
                  Carte de certificat avec QR code, détails et actions de
                  vérification
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <CertificateCard
                  certificate={exampleCertificate}
                  onVerify={(hash) => console.log('Verifying:', hash)}
                  onView={(cert) => console.log('Viewing:', cert)}
                />
              </div>
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white font-poppins mb-2">
                  Verify Certificate Component
                </h2>
                <p className="text-gray-400">
                  Interface de vérification avec animations et résultats
                  détaillés
                </p>
              </div>
              <VerifyCertificate
                onVerificationComplete={(result) =>
                  console.log('Verification result:', result)
                }
              />
            </div>
          )}
        </motion.div>

        {/* Informations techniques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8"
        >
          <h3 className="text-xl font-bold text-white font-poppins mb-6 text-center">
            Spécifications Techniques
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Design System</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Fond: #0D0D0D</li>
                <li>Primaire: #4B9EFF</li>
                <li>Validation: #28C76F</li>
                <li>Fonts: Poppins/Inter</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Technologies</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>React + JSX</li>
                <li>Framer Motion</li>
                <li>TailwindCSS</li>
                <li>Lucide React</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-success-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔗</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Blockchain</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Polygon Mumbai</li>
                <li>IPFS Storage</li>
                <li>MetaMask Integration</li>
                <li>NFT Certificates</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Sécurité</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>SHA256 Hashing</li>
                <li>QR Code Verification</li>
                <li>Wallet Signing</li>
                <li>Décentralisé</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExampleUsage;
