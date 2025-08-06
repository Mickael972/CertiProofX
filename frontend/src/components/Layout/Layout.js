/**
 * Main Layout component for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();

  // Pages that should have a full-screen layout without footer
  const fullScreenPages = ['/upload', '/mint'];
  const isFullScreen = fullScreenPages.includes(location.pathname);

  // Pages that should have minimal layout
  const minimalPages = ['/verify'];
  const isMinimal = minimalPages.some((page) =>
    location.pathname.startsWith(page)
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ border: 'none', boxShadow: 'none', gap: 0, margin: 0 }}
    >
      {/* Header */}
      <Header />

      {/* Main content */}
      <main
        className={`flex-1 ${isFullScreen ? '' : ''}`}
        style={{ border: 'none', boxShadow: 'none', margin: 0, padding: 0 }}
      >
        <div
          className={isMinimal ? 'container-custom' : ''}
          style={{ border: 'none', boxShadow: 'none' }}
        >
          {children}
        </div>
      </main>

      {/* Footer - hidden on full screen pages */}
      {!isFullScreen && <Footer />}
    </div>
  );
};

export default Layout;
