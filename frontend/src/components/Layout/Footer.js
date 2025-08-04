/**
 * Footer component for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../../contexts/I18nContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const t = useT();

  const footerLinks = {
    product: [
      { name: t('footer.uploadDocuments'), href: '/upload' },
      { name: t('footer.mintCertificates'), href: '/mint' },
      { name: t('footer.verifyProofs'), href: '/verify' },
      { name: t('footer.viewCertificates'), href: '/certificates' },
    ],
    resources: [
      { name: t('footer.documentation'), href: 'https://docs.certiproof-x.com' },
      { name: t('footer.apiReference'), href: 'https://docs.certiproof-x.com/api' },
      { name: t('footer.smartContract'), href: 'https://mumbai.polygonscan.com/address/0x...' },
      { name: 'GitHub', href: 'https://github.com/0xGenesis/certiproof-x' },
    ],
    legal: [
      { name: t('footer.privacyPolicy'), href: '/privacy' },
      { name: t('footer.termsOfService'), href: '/terms' },
      { name: t('footer.mitLicense'), href: 'https://github.com/0xGenesis/certiproof-x/blob/main/LICENSE' },
    ],
  };

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/0xGenesis/certiproof-x',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/certiproof_x',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'Discord',
      href: 'https://discord.gg/certiproof-x',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M16.942 3.487c-1.297-.595-2.683-1.027-4.136-1.268a.077.077 0 00-.082.037c-.178.32-.377.738-.515 1.067a15.042 15.042 0 00-4.418 0 9.734 9.734 0 00-.523-1.067.08.08 0 00-.082-.037 16.25 16.25 0 00-4.136 1.268.073.073 0 00-.034.029C.639 6.944-.384 10.317.12 13.644a.085.085 0 00.032.058 16.335 16.335 0 004.92 2.488.08.08 0 00.087-.029c.477-.652.9-1.338 1.262-2.057a.08.08 0 00-.044-.11 10.743 10.743 0 01-1.534-.732.08.08 0 01-.008-.132c.103-.077.206-.158.304-.24a.077.077 0 01.08-.011c3.219 1.47 6.706 1.47 9.887 0a.077.077 0 01.08.01c.098.083.201.164.305.241a.08.08 0 01-.006.132 10.092 10.092 0 01-1.535.732.08.08 0 00-.043.111c.368.718.79 1.404 1.261 2.056a.08.08 0 00.087.03 16.29 16.29 0 004.926-2.489.08.08 0 00.032-.057c.6-3.847-.999-7.188-4.228-10.157a.063.063 0 00-.033-.029zM6.678 11.781c-1.407 0-2.565-1.292-2.565-2.88 0-1.587 1.131-2.88 2.565-2.88 1.447 0 2.591 1.306 2.565 2.88 0 1.588-1.131 2.88-2.565 2.88zm6.644 0c-1.407 0-2.565-1.292-2.565-2.88 0-1.587 1.131-2.88 2.565-2.88 1.447 0 2.591 1.306 2.565 2.88 0 1.588-1.118 2.88-2.565 2.88z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container-custom">
        <div className="py-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand section */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-lg font-bold text-gray-900">CertiProof X</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                {t('footer.product')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                {t('footer.resources')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                {t('footer.legal')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <p className="text-sm text-gray-600">
                  © {currentYear} CertiProof X. {t('footer.allRightsReserved')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('footer.builtBy')}{' '}
                  <a
                    href="mailto:certiproofx@protonmail.me"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Kai Zenjiro (0xGenesis)
                  </a>
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">{t('footer.poweredBy')}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-blockchain-ethereum">Ethereum</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-medium text-blockchain-polygon">Polygon</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-medium text-blockchain-ipfs">IPFS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;