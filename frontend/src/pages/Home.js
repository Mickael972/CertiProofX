/**
 * Home page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useWeb3 } from '../contexts/Web3Context';
import { useT } from '../contexts/I18nContext';

const Home = () => {
  const { isConnected, connectWallet } = useWeb3();
  const t = useT();

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('home.features.cryptographicSecurity.title'),
      description: t('home.features.cryptographicSecurity.description'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      ),
      title: t('home.features.decentralizedStorage.title'),
      description: t('home.features.decentralizedStorage.description'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
      title: t('home.features.nftCertificates.title'),
      description: t('home.features.nftCertificates.description'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: t('home.features.privacyFirst.title'),
      description: t('home.features.privacyFirst.description'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: t('home.features.openSource.title'),
      description: t('home.features.openSource.description'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t('home.features.instantVerification.title'),
      description: t('home.features.instantVerification.description'),
    }
  ];

  const stats = [
    { label: t('home.stats.certificatesMinted'), value: '0' },
    { label: t('home.stats.documentsVerified'), value: '0' },
    { label: t('home.stats.networksSupported'), value: '4' },
    { label: t('home.stats.fileFormats'), value: '10+' },
  ];

  return (
    <>
      <Helmet>
        <title>{t('home.title')} {t('home.subtitle')} - CertiProof X</title>
        <meta name="description" content={t('home.description')} />
        <meta name="keywords" content="blockchain, NFT, IPFS, certification, proof, verification, Web3, Ethereum, Polygon, decentralized" />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative container-custom py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-poppins">
              {t('home.title')}
              <span className="block text-primary-400">{t('home.subtitle')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              {t('home.description')}
              <span className="block mt-2 text-primary-300">{t('home.inspiration')}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <Link
                  to="/upload"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-poppins"
                >
                  🚀 {t('home.startMinting')}
                </Link>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-poppins"
                >
                  🦊 {t('home.connectToStart')}
                </button>
              )}
              <Link
                to="/verify"
                className="bg-dark-800/50 hover:bg-dark-700/50 text-white border border-gray-600 hover:border-primary-400 px-8 py-4 rounded-xl text-lg font-semibold transition-all backdrop-blur-sm transform hover:scale-105"
              >
                🔍 {t('home.verifyCertificate')}
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-primary-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('home.trustedBy')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-dark-900/50 backdrop-blur-sm">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2 font-poppins">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-400">
                  {stat.label === 'Certificates Créés' ? 'Certificats Créés' :
                   stat.label === 'Documents Vérifiés' ? 'Documents Vérifiés' :
                   stat.label === 'Réseaux Supportés' ? 'Réseaux Supportés' :
                   stat.label === 'Formats de Fichiers' ? 'Formats de Fichiers' :
                   stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-950 relative" style={{ border: 'none', boxShadow: 'none', margin: 0, borderTop: 'none' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/50 to-dark-950"></div>
        <div className="container-custom relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
              {t('home.whyChoose.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('home.whyChoose.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🛡️",
                title: t('home.features.cryptographicSecurity2.title'),
                description: t('home.features.cryptographicSecurity2.description')
              },
              {
                icon: "🌐", 
                title: t('home.features.decentralizedStorage2.title'),
                description: t('home.features.decentralizedStorage2.description')
              },
              {
                icon: "💎",
                title: t('home.features.nftOwnership.title'),
                description: t('home.features.nftOwnership.description')
              },
              {
                icon: "🔒",
                title: t('home.features.dataSovereignty.title'),
                description: t('home.features.dataSovereignty.description')
              },
              {
                icon: "⚡",
                title: t('home.features.instantVerification.title'),
                description: t('home.features.instantVerification.description')
              },
              {
                icon: "🚀",
                title: t('home.features.openSourceRevolution.title'),
                description: t('home.features.openSourceRevolution.description')
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-dark-900/80 to-dark-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 hover:border-primary-500/50 transition-all duration-300 group"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 font-poppins group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-dark-900/30 backdrop-blur-sm" style={{ border: 'none', boxShadow: 'none', margin: 0, borderTop: 'none' }}>
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
              {t('home.steps.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('home.steps.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform font-poppins">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-poppins">{t('home.steps.step1.title')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('home.steps.step1.description')}
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg shadow-success-500/25 group-hover:scale-110 transition-transform font-poppins">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-poppins">{t('home.steps.step2.title')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('home.steps.step2.description')}
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform font-poppins">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 font-poppins">{t('home.steps.step3.title')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('home.steps.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-primary-900 text-white overflow-hidden py-20" style={{ marginTop: 0, borderTop: 'none' }}>
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="container-custom text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white font-poppins">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isConnected ? (
              <Link
                to="/upload"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-poppins"
              >
                🚀 {t('home.cta.uploadFirst')}
              </Link>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-poppins"
              >
                🦊 {t('home.cta.connectWallet')}
              </button>
            )}
            <Link
              to="/about"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all font-poppins"
            >
              {t('home.cta.learnMore')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;