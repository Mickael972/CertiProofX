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

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('mint.title')}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {t('mint.subtitle')}
            </p>
            <div className="card p-8">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('mint.comingSoon')}</h3>
                <p className="text-gray-600">
                  {t('mint.inDevelopment')}
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