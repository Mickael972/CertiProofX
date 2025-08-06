/**
 * I18n Context for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 *
 * Simple and lightweight internationalization system
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Import translations
import frTranslations from '../locales/fr.json';
import enTranslations from '../locales/en.json';

const I18nContext = createContext();

// Available languages
const LANGUAGES = {
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    translations: frTranslations,
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    translations: enTranslations,
  },
};

// Default language
const DEFAULT_LANGUAGE = 'fr';
const STORAGE_KEY = 'certiproof-language';

export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detect browser language as fallback
      const browserLang = navigator.language.split('-')[0];
      if (LANGUAGES[browserLang]) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentLanguage);
    // Set document language attribute
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const getCurrentTranslations = () => {
    return (
      LANGUAGES[currentLanguage]?.translations ||
      LANGUAGES[DEFAULT_LANGUAGE].translations
    );
  };

  // Translation function with nested key support
  const t = (key, defaultValue = key) => {
    const translations = getCurrentTranslations();
    const keys = key.split('.');

    let value = translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return typeof value === 'string' ? value : defaultValue;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    languages: LANGUAGES,
    isRTL: false, // Add RTL support if needed
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// Custom hook to use i18n
export const useTranslation = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }

  return context;
};

// Helper hook for shorter syntax
export const useT = () => {
  const { t } = useTranslation();
  return t;
};

export default I18nContext;
