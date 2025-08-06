/**
 * Language Switcher Component for CertiProof X
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../contexts/I18nContext';
import LanguageDropdown from './LanguageDropdown';

const LanguageSwitcher = ({ className = '' }) => {
  const { currentLanguage, languages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  const currentLang = languages[currentLanguage];

  return (
    <div className={`relative ${className}`}>
      {/* Language Button */}
      <button
        ref={buttonRef}
        onClick={() => {
          console.log('Language button clicked, isOpen:', !isOpen);
          setIsOpen(!isOpen);
        }}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-dark-800/50 border border-gray-600 rounded-lg hover:bg-dark-700/50 hover:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${className?.includes('sm:hidden') ? 'w-full justify-between' : ''}`}
        aria-label="Changer de langue / Change language"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{currentLang?.flag}</span>
          <span
            className={`${className?.includes('sm:hidden') ? '' : 'hidden sm:inline'}`}
          >
            {currentLang?.name}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown via Portal */}
      <LanguageDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        buttonRef={buttonRef}
      />
    </div>
  );
};

export default LanguageSwitcher;
