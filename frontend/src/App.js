/**
 * Main App component for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/UI/ErrorBoundary';

// Providers
import { Web3Provider } from './contexts/Web3Context';
import { AppProvider } from './contexts/AppContext';
import { I18nProvider } from './contexts/I18nContext';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Upload = lazy(() => import('./pages/Upload'));
const Mint = lazy(() => import('./pages/Mint'));
const Verify = lazy(() => import('./pages/Verify'));
const Certificates = lazy(() => import('./pages/Certificates'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ExampleUsage = lazy(() => import('./pages/ExampleUsage'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/25">
        <span className="text-white font-bold text-2xl font-poppins">C</span>
      </div>
      <LoadingSpinner size="lg" />
      <p className="text-gray-400 font-medium">Chargement de CertiProof X...</p>
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <I18nProvider>
          <AppProvider>
            <Web3Provider>
            <Router 
              future={{ 
                v7_startTransition: true,
                v7_relativeSplatPath: true 
              }}
            >
              <div className="App min-h-screen bg-dark-950">
                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#fff',
                      color: '#374151',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      maxWidth: '400px',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                    loading: {
                      iconTheme: {
                        primary: '#3b82f6',
                        secondary: '#fff',
                      },
                    },
                  }}
                />

                {/* Main application layout */}
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/mint" element={<Mint />} />
                      <Route path="/verify" element={<Verify />} />
                      <Route path="/verify/:tokenId" element={<Verify />} />
                      <Route path="/certificates" element={<Certificates />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/demo" element={<ExampleUsage />} />
                      
                      {/* Certificate specific routes */}
                      <Route path="/certificate/:tokenId" element={<Verify />} />
                      <Route path="/proof/:hash" element={<Verify />} />
                      
                      {/* 404 fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </div>
            </Router>
            </Web3Provider>
          </AppProvider>
        </I18nProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;