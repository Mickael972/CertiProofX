/**
 * Loading Spinner component for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  text = null,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-600',
    success: 'border-success-500',
    error: 'border-error-500',
  };

  const spinnerClasses = `
    ${sizeClasses[size]} 
    border-2 border-gray-600 border-t-2 
    ${colorClasses[color]} 
    rounded-full animate-spin shadow-lg shadow-primary-500/25
    ${className}
  `;

  const content = (
    <div
      className={`flex flex-col items-center justify-center ${text ? 'space-y-3' : ''}`}
    >
      <div className={spinnerClasses}></div>
      {text && <p className="text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-950 bg-opacity-95 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
