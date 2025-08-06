/**
 * Header component for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useT } from '../../contexts/I18nContext';
import LanguageSwitcher from '../UI/LanguageSwitcher';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const {
    isConnected,
    account,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useWeb3();
  const t = useT();

  const navigation = [
    { name: t('nav.home'), href: '/', current: location.pathname === '/' },
    {
      name: t('nav.upload'),
      href: '/upload',
      current: location.pathname === '/upload',
    },
    {
      name: t('nav.verify'),
      href: '/verify',
      current: location.pathname === '/verify',
    },
    {
      name: t('nav.certificates'),
      href: '/certificates',
      current: location.pathname === '/certificates',
    },
  ];

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header
      className="bg-dark-900/95 backdrop-blur-sm"
      style={{ borderBottom: 'none', boxShadow: 'none' }}
    >
      <div className="container-custom">
        <div className="flex items-center h-16 min-h-[4rem]">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center shrink-0">
              <img
                src="/images/Logo moderne CertiProof X.png"
                alt="CertiProof X Logo"
                className="w-32 h-32"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 ml-12 flex-1 justify-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  item.current
                    ? 'text-primary-400 bg-primary-500/20 border border-primary-500/30'
                    : 'text-gray-300 hover:text-primary-400 hover:bg-dark-800/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Language Switcher & Wallet Connection */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            {/* Language Switcher - Desktop only */}
            <div
              className="hidden sm:block"
              style={{ position: 'relative', zIndex: 10001 }}
            >
              <LanguageSwitcher />
            </div>

            {isConnected ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden lg:block bg-dark-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-600">
                  <span className="text-sm text-gray-400">
                    {t('nav.connected')}
                  </span>
                  <span className="ml-1 text-sm font-medium text-white font-mono">
                    {formatAddress(account)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-500/50 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
                >
                  <span className="hidden sm:inline">
                    {t('nav.disconnect')}
                  </span>
                  <span className="sm:hidden">✕</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-lg hover:shadow-primary-500/25"
              >
                <span className="hidden sm:inline">
                  {isConnecting
                    ? t('nav.connecting')
                    : t('nav.connectMetaMask')}
                </span>
                <span className="sm:hidden">{isConnecting ? '...' : '🦊'}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800/50 transition-all"
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-dark-900/95 backdrop-blur-sm">
            {/* Language Switcher for Mobile */}
            <div className="px-3 py-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {t('nav.languageLabel')}
                </span>
                <div style={{ position: 'relative', zIndex: 10001 }}>
                  <LanguageSwitcher className="sm:hidden" />
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all ${
                    item.current
                      ? 'text-primary-400 bg-primary-500/20 border border-primary-500/30'
                      : 'text-gray-300 hover:text-primary-400 hover:bg-dark-800/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Wallet Info for Mobile */}
            {isConnected && (
              <div className="mt-4 pt-4">
                <div className="px-3 py-2 bg-dark-800/50 rounded-lg mx-3">
                  <div className="text-sm text-gray-400">
                    {t('nav.connected')}
                  </div>
                  <div className="text-sm font-medium text-white font-mono">
                    {formatAddress(account)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
