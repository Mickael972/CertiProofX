/**
 * About page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About - CertiProof X</title>
        <meta name="description" content="Learn about CertiProof X, the decentralized proof protocol" />
      </Helmet>

      <div className="min-h-screen bg-dark-950 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4 font-poppins">
                À Propos de CertiProof X
              </h1>
              <p className="text-xl text-gray-300">
                Révolutionner la confiance numérique grâce à la technologie blockchain
              </p>
            </div>

            <div className="space-y-8">
              {/* Mission */}
              <div className="bg-dark-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-4 font-poppins">Notre Mission</h2>
                <p className="text-gray-300 leading-relaxed">
                  CertiProof X vise à révolutionner la confiance numérique en fournissant un système décentralisé 
                  et inviolable pour certifier toute preuve numérique. Inspiré par la révolution Bitcoin de la monnaie, 
                  nous construisons l'avenir de la vérification numérique.
                </p>
              </div>

              {/* Technology */}
              <div className="bg-dark-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 font-poppins">Stack Technologique</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-dark-800/50 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-primary-400 mb-2 font-poppins">🔗 Blockchain</h3>
                    <p className="text-gray-300">Les réseaux Ethereum et Polygon garantissent l'immuabilité et la décentralisation</p>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-primary-400 mb-2 font-poppins">🌐 IPFS</h3>
                    <p className="text-gray-300">Stockage distribué pour une disponibilité permanente des fichiers</p>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-primary-400 mb-2 font-poppins">💎 NFTs</h3>
                    <p className="text-gray-300">Les tokens ERC-721 représentent la propriété et l'authenticité</p>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-primary-400 mb-2 font-poppins">🔐 Cryptographie</h3>
                    <p className="text-gray-300">Hashage SHA-256 pour la vérification de l'intégrité des documents</p>
                  </div>
                </div>
              </div>

              {/* Open Source */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Open Source</h2>
                <p className="text-gray-600 mb-4">
                  CertiProof X is completely open source under the MIT license. 
                  We believe in transparency and community-driven development.
                </p>
                <a 
                  href="https://github.com/0xGenesis/certiproof-x" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  View on GitHub
                </a>
              </div>

              {/* Author */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Created By</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">K</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Kai Zenjiro (0xGenesis)</h3>
                    <p className="text-gray-600">Blockchain Developer & Web3 Enthusiast</p>
                    <a 
                      href="mailto:certiproofx@protonmail.me" 
                      className="text-primary-600 hover:text-primary-500"
                    >
                      certiproofx@protonmail.me
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;