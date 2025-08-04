/**
 * Language Switcher Component for CertiProof X
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../contexts/I18nContext';

const LanguageSwitcher = ({ className = '' }) => {
  const { currentLanguage, changeLanguage, languages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const currentLang = languages[currentLanguage];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${className?.includes('sm:hidden') ? 'w-full justify-between' : ''}`}
        aria-label="Changer de langue / Change language"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{currentLang?.flag}</span>
          <span className={`${className?.includes('sm:hidden') ? '' : 'hidden sm:inline'}`}>
            {currentLang?.name}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute ${className?.includes('sm:hidden') ? 'left-0 right-0' : 'right-0'} z-50 mt-2 ${className?.includes('sm:hidden') ? 'w-full' : 'w-48'} bg-white border border-gray-200 rounded-lg shadow-lg`}>
          <div className="py-1">
            {Object.values(languages).map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex items-center space-x-3 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                  currentLanguage === language.code
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {currentLanguage === language.code && (
                  <svg className="w-4 h-4 ml-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;