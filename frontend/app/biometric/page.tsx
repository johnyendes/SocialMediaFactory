'use client';

import BiometricAuthManager from '@/components/BiometricAuthManager';

export default function BiometricPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Biometric Authentication
          </h1>
          <p className="mt-2 text-gray-600">
            Register and manage your biometric authentication devices
          </p>
        </div>
        
        <BiometricAuthManager />

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            About Biometric Authentication
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>
              <strong>What it is:</strong> Biometric authentication uses your unique physical 
              characteristics (fingerprint, face, or voice) to verify your identity.
            </p>
            <p>
              <strong>Supported devices:</strong> Touch ID, Face ID, Windows Hello, and other 
              FIDO2/WebAuthn compatible authenticators.
            </p>
            <p>
              <strong>Security benefits:</strong> Biometric authentication provides stronger 
              security than passwords alone and cannot be easily stolen or forgotten.
            </p>
            <p>
              <strong>Privacy:</strong> Your biometric data never leaves your device. 
              Only a cryptographic proof is sent to our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}