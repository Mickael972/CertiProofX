/**
 * Verify page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useT } from '../contexts/I18nContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import VerifyCertificate from '../components/VerifyCertificate';

const Verify = () => {
  const { tokenId } = useParams();
  const [searchParams] = useSearchParams();
  const hashFromQuery = searchParams.get('hash');
  const t = useT();
  
  // Utiliser le hash des query params en priorité, puis tokenId des params
  const initialHashValue = hashFromQuery || tokenId;

  return (
    <>
      <Helmet>
        <title>{t('verify.title')} - CertiProof X</title>
        <meta name="description" content={t('verify.subtitle')} />
      </Helmet>

      <div className="min-h-screen bg-dark-950 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4 font-poppins">
                {t('verify.title')}
              </h1>
              <p className="text-lg text-gray-400">
                {t('verify.subtitle')}
              </p>
            </div>

            {/* Nouveau composant VerifyCertificate */}
            <VerifyCertificate
              initialHash={initialHashValue}
              onVerificationComplete={(result) => {
                console.log('Verification completed:', result);
                if (result.isValid) {
                  toast.success(t('verify.valid'));
                } else {
                  toast.error(t('verify.invalid'));
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Verify;