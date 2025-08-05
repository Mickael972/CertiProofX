/**
 * Verify page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import VerifyCertificate from '../components/VerifyCertificate';

const Verify = () => {
  const { tokenId } = useParams();

  return (
    <>
      <Helmet>
        <title>Verify Certificate - CertiProof X</title>
        <meta name="description" content="Verify the authenticity of blockchain certificates" />
      </Helmet>

      <div className="min-h-screen bg-dark-950 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4 font-poppins">
                Vérifier un Certificat
              </h1>
              <p className="text-lg text-gray-400">
                Entrez un hash, token ID ou adresse pour vérifier l'authenticité
              </p>
            </div>

            {/* Nouveau composant VerifyCertificate */}
            <VerifyCertificate
              initialHash={tokenId}
              onVerificationComplete={(result) => {
                console.log('Verification completed:', result);
                if (result.isValid) {
                  toast.success('Certificat vérifié avec succès !');
                } else {
                  toast.error('Certificat invalide ou introuvable');
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