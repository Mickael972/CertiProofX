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
  const { isConnected, account, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const t = useT();

  const navigation = [
    { name: t('nav.home'), href: '/', current: location.pathname === '/' },
    { name: t('nav.upload'), href: '/upload', current: location.pathname === '/upload' },
    { name: t('nav.mint'), href: '/mint', current: location.pathname === '/mint' },
    { name: t('nav.verify'), href: '/verify', current: location.pathname === '/verify' },
    { name: t('nav.certificates'), href: '/certificates', current: location.pathname === '/certificates' },
  ];

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container-custom">
        <div className="flex items-center h-16 min-h-[4rem]">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                <span className="hidden sm:inline">CertiProof X</span>
                <span className="sm:hidden">CertiProof</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 ml-12 flex-1 justify-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Language Switcher & Wallet Connection */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            {/* Language Switcher - Desktop only */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            {isConnected ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden lg:block">
                  <span className="text-sm text-gray-600">{t('nav.connectWallet')}:</span>
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {formatAddress(account)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  <span className="hidden sm:inline">{t('nav.disconnect')}</span>
                  <span className="sm:hidden">✕</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <span className="hidden sm:inline">
                  {isConnecting ? t('common.loading') : t('nav.connectWallet')}
                </span>
                <span className="sm:hidden">
                  {isConnecting ? '...' : '🔗'}
                </span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {/* Language Switcher for Mobile */}
            <div className="px-3 py-2 border-b border-gray-200 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{t('common.language') || 'Langue / Language'}:</span>
                <LanguageSwitcher className="sm:hidden" />
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.current
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Wallet Info for Mobile */}
            {isConnected && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-3 py-2">
                  <div className="text-sm text-gray-600">{t('nav.connectWallet')}:</div>
                  <div className="text-sm font-medium text-gray-900">{formatAddress(account)}</div>
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