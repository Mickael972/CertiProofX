/**
 * App Context for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 *
 * Manages global application state and settings
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  // Theme and UI
  theme: 'light',
  sidebarOpen: false,

  // Settings
  settings: {
    autoConnect: true,
    showTestnets: true,
    defaultNetwork: 'mumbai',
    notifications: true,
    analytics: false,
  },

  // Application data
  recentFiles: [],
  certificates: [],
  bookmarks: [],

  // Loading states
  loading: {
    global: false,
    upload: false,
    mint: false,
    verify: false,
  },

  // Error states
  errors: {},

  // User preferences
  preferences: {
    currency: 'USD',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
  },
};

// Action types
const APP_ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  ADD_RECENT_FILE: 'ADD_RECENT_FILE',
  ADD_CERTIFICATE: 'ADD_CERTIFICATE',
  ADD_BOOKMARK: 'ADD_BOOKMARK',
  REMOVE_BOOKMARK: 'REMOVE_BOOKMARK',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  RESET_STATE: 'RESET_STATE',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };

    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.error },
      };

    case APP_ACTIONS.CLEAR_ERROR: {
      const { [action.payload]: _removed, ...remainingErrors } = state.errors;
      return { ...state, errors: remainingErrors };
    }

    case APP_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case APP_ACTIONS.ADD_RECENT_FILE: {
      const recentFiles = [
        action.payload,
        ...state.recentFiles.filter((f) => f.hash !== action.payload.hash),
      ].slice(0, 10); // Keep only last 10 files
      return { ...state, recentFiles };
    }

    case APP_ACTIONS.ADD_CERTIFICATE:
      return {
        ...state,
        certificates: [action.payload, ...state.certificates],
      };

    case APP_ACTIONS.ADD_BOOKMARK:
      return {
        ...state,
        bookmarks: [...state.bookmarks, action.payload],
      };

    case APP_ACTIONS.REMOVE_BOOKMARK:
      return {
        ...state,
        bookmarks: state.bookmarks.filter((b) => b.id !== action.payload),
      };

    case APP_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    case APP_ACTIONS.RESET_STATE:
      return {
        ...initialState,
        theme: state.theme,
        preferences: state.preferences,
      };

    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('certiproof-x-state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Restore specific parts of state
        if (parsedState.theme) {
          dispatch({ type: APP_ACTIONS.SET_THEME, payload: parsedState.theme });
        }

        if (parsedState.settings) {
          dispatch({
            type: APP_ACTIONS.UPDATE_SETTINGS,
            payload: parsedState.settings,
          });
        }

        if (parsedState.preferences) {
          dispatch({
            type: APP_ACTIONS.UPDATE_PREFERENCES,
            payload: parsedState.preferences,
          });
        }

        if (parsedState.recentFiles) {
          parsedState.recentFiles.forEach((file) => {
            dispatch({ type: APP_ACTIONS.ADD_RECENT_FILE, payload: file });
          });
        }

        if (parsedState.bookmarks) {
          parsedState.bookmarks.forEach((bookmark) => {
            dispatch({ type: APP_ACTIONS.ADD_BOOKMARK, payload: bookmark });
          });
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load saved state:', error);
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        theme: state.theme,
        settings: state.settings,
        preferences: state.preferences,
        recentFiles: state.recentFiles,
        bookmarks: state.bookmarks,
      };

      localStorage.setItem('certiproof-x-state', JSON.stringify(stateToSave));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save state:', error);
    }
  }, [
    state.theme,
    state.settings,
    state.preferences,
    state.recentFiles,
    state.bookmarks,
  ]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);

    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Action creators
  const setTheme = (theme) => {
    dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme });
  };

  const toggleSidebar = () => {
    dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setLoading = (key, value) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { key, value } });
  };

  const setError = (key, error) => {
    dispatch({ type: APP_ACTIONS.SET_ERROR, payload: { key, error } });
  };

  const clearError = (key) => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR, payload: key });
  };

  const updateSettings = (settings) => {
    dispatch({ type: APP_ACTIONS.UPDATE_SETTINGS, payload: settings });
  };

  const addRecentFile = (file) => {
    dispatch({ type: APP_ACTIONS.ADD_RECENT_FILE, payload: file });
  };

  const addCertificate = (certificate) => {
    dispatch({ type: APP_ACTIONS.ADD_CERTIFICATE, payload: certificate });
  };

  const addBookmark = (bookmark) => {
    dispatch({ type: APP_ACTIONS.ADD_BOOKMARK, payload: bookmark });
  };

  const removeBookmark = (id) => {
    dispatch({ type: APP_ACTIONS.REMOVE_BOOKMARK, payload: id });
  };

  const updatePreferences = (preferences) => {
    dispatch({ type: APP_ACTIONS.UPDATE_PREFERENCES, payload: preferences });
  };

  const resetState = () => {
    dispatch({ type: APP_ACTIONS.RESET_STATE });
    localStorage.removeItem('certiproof-x-state');
  };

  // Utility functions
  const isLoading = (key) => state.loading[key] || false;
  const getError = (key) => state.errors[key] || null;
  const hasError = (key) => !!state.errors[key];

  const formatDate = (date, format = null) => {
    const dateFormat = format || state.preferences.dateFormat;
    const dateObj = new Date(date);

    if (dateFormat === 'dd/MM/yyyy') {
      return dateObj.toLocaleDateString('en-GB');
    } else if (dateFormat === 'yyyy-MM-dd') {
      return dateObj.toISOString().split('T')[0];
    } else {
      return dateObj.toLocaleDateString('en-US');
    }
  };

  const formatTime = (date, format = null) => {
    const timeFormat = format || state.preferences.timeFormat;
    const dateObj = new Date(date);

    if (timeFormat === '24h') {
      return dateObj.toLocaleTimeString('en-GB', { hour12: false });
    } else {
      return dateObj.toLocaleTimeString('en-US', { hour12: true });
    }
  };

  const value = {
    // State
    ...state,

    // Actions
    setTheme,
    toggleSidebar,
    setLoading,
    setError,
    clearError,
    updateSettings,
    addRecentFile,
    addCertificate,
    addBookmark,
    removeBookmark,
    updatePreferences,
    resetState,

    // Utilities
    isLoading,
    getError,
    hasError,
    formatDate,
    formatTime,

    // Constants
    SUPPORTED_THEMES: ['light', 'dark'],
    SUPPORTED_LANGUAGES: ['en', 'fr', 'es', 'de'],
    SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'ETH', 'MATIC'],
    DATE_FORMATS: ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'],
    TIME_FORMATS: ['12h', '24h'],
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use App context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
