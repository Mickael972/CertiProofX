/**
 * Mint page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useT } from '../contexts/I18nContext';

const Mint = () => {
  const t = useT();
  
  return (
    <>
      <Helmet>
        <title>{t('mint.title')} - CertiProof X</title>
        <meta name="description" content={t('mint.subtitle')} />
      </Helmet>

      <div className="min-h-screen bg-dark-950 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4 font-poppins">
              Minter un Certificat NFT
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              Créez un certificat NFT unique pour votre document
            </p>
            <div className="bg-dark-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 font-poppins">Bientôt Disponible</h3>
                <p className="text-gray-400">
                  Cette fonctionnalité est en cours de développement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Mint;