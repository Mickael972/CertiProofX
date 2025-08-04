/**
 * Certificates page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

const Certificates = () => {
  return (
    <>
      <Helmet>
        <title>My Certificates - CertiProof X</title>
        <meta name="description" content="View and manage your blockchain certificates" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                My Certificates
              </h1>
              <p className="text-lg text-gray-600">
                View and manage your blockchain certificates
              </p>
            </div>

            <div className="card p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't minted any certificates yet. Upload your first document to get started.
              </p>
              <a href="/upload" className="btn btn-primary">
                Upload Document
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Certificates;