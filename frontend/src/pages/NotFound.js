/**
 * 404 Not Found page for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - CertiProof X</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-primary-500 font-poppins">
              404
            </h1>
            <h2 className="mt-6 text-3xl font-bold text-white font-poppins">
              Page non trouvée
            </h2>
            <p className="mt-2 text-lg text-gray-400">
              Désolé, nous n'avons pas pu trouver la page que vous recherchez.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-dark-900/80 backdrop-blur-sm py-8 px-4 shadow-lg border border-gray-700 rounded-2xl sm:px-10">
            <div className="space-y-4">
              <Link
                to="/"
                className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:shadow-primary-500/25"
              >
                Retourner à l'accueil
              </Link>

              <Link
                to="/verify"
                className="w-full flex justify-center py-3 px-6 border border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-dark-800 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
              >
                Vérifier un certificat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
