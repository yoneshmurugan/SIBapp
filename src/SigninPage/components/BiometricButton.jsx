import React, { useEffect, useState } from 'react';
// Ensure this import path matches where you placed the service file
import { checkBiometricAvailability, getCredentialsFromBiometric } from '../services/biometricService';

export default function BiometricButton({ onBiometricAuthSuccess }) {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const check = async () => {
      const available = await checkBiometricAvailability();
      setIsAvailable(available);
    };
    check();
  }, []);

  const handleBiometricClick = async (e) => {
    e.preventDefault(); 
    try {
      const credentials = await getCredentialsFromBiometric();
      // Pass the retrieved credentials back to the form
      onBiometricAuthSuccess(credentials);
    } catch (error) {
      console.log("Biometric cancelled or failed");
    }
  };

  if (!isAvailable) return null;

  return (
    <button
      type="button"
      onClick={handleBiometricClick}
      className="w-full mt-3 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
    >
      <svg 
        className="mr-2 h-5 w-5 text-yellow-500" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.59-4.18" />
      </svg>
      Log in with Biometrics
    </button>
  );
}