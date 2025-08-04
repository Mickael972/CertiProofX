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

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                About CertiProof X
              </h1>
              <p className="text-xl text-gray-600">
                Revolutionizing digital trust through blockchain technology
              </p>
            </div>

            <div className="space-y-8">
              {/* Mission */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  CertiProof X aims to revolutionize digital trust by providing a decentralized, 
                  tamper-proof system for certifying any digital proof. Inspired by Bitcoin's 
                  revolution of money, we're building the future of digital verification.
                </p>
              </div>

              {/* Technology */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technology Stack</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Blockchain</h3>
                    <p className="text-gray-600">Ethereum and Polygon networks ensure immutability and decentralization</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">IPFS</h3>
                    <p className="text-gray-600">Distributed storage for permanent file availability</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">NFTs</h3>
                    <p className="text-gray-600">ERC-721 tokens represent ownership and authenticity</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cryptography</h3>
                    <p className="text-gray-600">SHA-256 hashing for document integrity verification</p>
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