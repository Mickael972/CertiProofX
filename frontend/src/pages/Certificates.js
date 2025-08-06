/**
 * Certificates page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useT } from '../contexts/I18nContext';
import CertificateCard from '../components/CertificateCard';

const Certificates = () => {
  const t = useT();
  
  // Charger les certificats du localStorage + données d'exemple
  const [userCertificates, setUserCertificates] = useState([]);
  
  useEffect(() => {
    const savedCerts = JSON.parse(localStorage.getItem('userCertificates') || '[]');
    setUserCertificates(savedCerts);
  }, []);
  
  // Données d'exemple de certificats
  const exampleCertificates = [
    {
      id: 'cert_kai_001',
      name: 'Master\'s Degree Certificate',
      description: 'Computer Science with Blockchain Specialization',
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      walletAddress: '0x1E274F39A44f1561b3Bb21148B9881075575676D',
      createdAt: '2025-08-03T10:30:00.000Z',
      ipfsHash: 'QmKaiZenjiroMasterDegree2025',
      tokenId: '42',
      isVerified: true,
      contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      network: 'mumbai'
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
      network: 'mumbai'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('certificates.title')} - CertiProof X</title>
        <meta name="description" content={t('certificates.subtitle')} />
      </Helmet>

      <div className="min-h-screen bg-dark-950 py-12">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-white mb-4 font-poppins">
                {t('certificates.title')}
              </h1>
              <p className="text-lg text-gray-400">
                {t('certificates.subtitle')}
              </p>
            </motion.div>

            {/* Grille de certificats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Certificats utilisateur en premier */}
              {userCertificates.map((certificate, index) => (
                <motion.div
                  key={certificate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CertificateCard
                    certificate={certificate}
                    onVerify={(hash) => {
                      console.log('Verifying certificate:', hash);
                      // Utiliser query param pour que VerifyCertificate puisse chercher dans localStorage
                      window.location.href = `/verify?hash=${hash}`;
                    }}
                    onView={(cert) => {
                      console.log('Viewing certificate details:', cert);
                    }}
                  />
                </motion.div>
              ))}
              
              {/* Puis les certificats d'exemple */}
              {exampleCertificates.map((certificate, index) => (
                <motion.div
                  key={certificate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CertificateCard
                    certificate={certificate}
                    onVerify={(hash) => {
                      console.log('Verifying certificate:', hash);
                      // Utiliser query param pour que VerifyCertificate puisse chercher dans localStorage
                      window.location.href = `/verify?hash=${hash}`;
                    }}
                    onView={(cert) => {
                      console.log('Viewing certificate details:', cert);
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Message si aucun certificat */}
            {userCertificates.length === 0 && exampleCertificates.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 0a9 9 0 110 18 9 9 0 010-18zm0 0v6a9 9 0 119 9m-9-9h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('certificates.noCertificates')}
                </h3>
                <p className="text-gray-400 mb-6">
                  {t('certificates.createFirstCertificate')}
                </p>
                <a
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-primary-500/25"
                >
                  {t('certificates.createCertificate')}
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Certificates;