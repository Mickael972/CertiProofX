import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../../contexts/I18nContext';

const LanguageDropdown = ({ isOpen, onClose, buttonRef }) => {
  const { currentLanguage, changeLanguage, languages } = useTranslation();
  const dropdownRef = useRef(null);

  const handleLanguageChange = (langCode) => {
    console.log('Changing language to:', langCode);
    changeLanguage(langCode);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  const buttonRect = buttonRef.current?.getBoundingClientRect();
  const top = buttonRect ? buttonRect.bottom + 8 : 60;
  const right = buttonRect ? window.innerWidth - buttonRect.right : 20;

  return createPortal(
    <div 
      ref={dropdownRef}
      className="fixed w-48 bg-dark-900 border border-gray-700 rounded-xl shadow-2xl"
      style={{ 
        zIndex: 999999,
        position: 'fixed',
        top: `${top}px`,
        right: `${right}px`
      }}
    >
      <div className="py-1">
        {Object.values(languages).map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center space-x-3 w-full px-4 py-2 text-sm hover:bg-dark-800/50 transition-colors duration-150 ${
              currentLanguage === language.code
                ? 'bg-primary-500/20 text-primary-400 font-medium border-l-2 border-primary-500'
                : 'text-gray-300'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {currentLanguage === language.code && (
              <svg className="w-4 h-4 ml-auto text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
};

export default LanguageDropdown;