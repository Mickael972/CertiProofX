/**
 * Entry point for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Performance monitoring
import { reportWebVitals } from './utils/reportWebVitals';

// Error tracking (in production)
if (process.env.NODE_ENV === 'production') {
  // Initialize error tracking service here if needed
  console.log('🚀 CertiProof X - Production Mode');
} else {
  console.log('🔧 CertiProof X - Development Mode');
}

// Get the root element
const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

// Create root and render app
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring
reportWebVitals((metric) => {
  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vitals:', metric);
  }

  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    // Example: gtag('event', metric.name, { value: metric.value });
  }
});

// Service worker registration (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);

  // Report to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(event.error);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Report to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(event.reason);
  }
});

// Web3 detection warning
if (typeof window.ethereum === 'undefined') {
  console.warn(
    '⚠️ No Web3 provider detected. Install MetaMask or use a Web3-enabled browser.'
  );
}

// Browser compatibility check
const checkBrowserCompatibility = () => {
  const isCompatible =
    'fetch' in window &&
    'Promise' in window &&
    'Map' in window &&
    'Set' in window &&
    'Symbol' in window &&
    'crypto' in window &&
    'localStorage' in window;

  if (!isCompatible) {
    console.error('❌ Browser not compatible with CertiProof X');
    alert(
      'Your browser is not compatible with CertiProof X. Please upgrade to a modern browser.'
    );
  }
};

checkBrowserCompatibility();
