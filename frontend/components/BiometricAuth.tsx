'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  startRegistration, 
  startAuthentication 
} from '@simplewebauthn/browser';

interface BiometricDevice {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
}

export default function BiometricAuth() {
  const { data: session, status } = useSession();
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      fetchDevices();
    }
  }, [session]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/auth/webauthn/devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setError('');
    setSuccess('');

    try {
      // Get registration options
      const optionsResponse = await fetch('/api/auth/webauthn/register-options', {
        method: 'POST',
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Start registration with WebAuthn API
      const registrationResult = await startRegistration(options);

      // Verify registration
      const verifyResponse = await fetch('/api/auth/webauthn/register-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registrationResult,
          deviceName: deviceName || `Device ${devices.length + 1}`,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Registration verification failed');
      }

      const result = await verifyResponse.json();
      
      if (result.verified) {
        setSuccess('Biometric device registered successfully!');
        setShowRegisterForm(false);
        setDeviceName('');
        await fetchDevices();
      } else {
        throw new Error('Registration failed');
      }

    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!session?.user?.email) return;

    setIsAuthenticating(true);
    setError('');

    try {
      // Get authentication options
      const optionsResponse = await fetch('/api/auth/webauthn/auth-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Start authentication with WebAuthn API
      const authenticationResult = await startAuthentication(options);

      // Verify authentication
      const verifyResponse = await fetch('/api/auth/webauthn/auth-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...authenticationResult,
          email: session.user.email,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Authentication verification failed');
      }

      const result = await verifyResponse.json();
      
      if (result.verified) {
        setSuccess('Biometric authentication successful!');
        // Redirect or update session as needed
        window.location.href = '/dashboard';
      } else {
        throw new Error('Authentication failed');
      }

    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/auth/webauthn/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDevices();
        setSuccess('Device removed successfully');
      } else {
        throw new Error('Failed to remove device');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to remove device');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to manage biometric devices.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Biometric Authentication</h2>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Biometric Login Button */}
      <div className="mb-6">
        <button
          onClick={handleBiometricLogin}
          disabled={isAuthenticating || devices.length === 0}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
          {isAuthenticating ? 'Authenticating...' : 'Sign in with Biometrics'}
        </button>
        {devices.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Register a biometric device first to enable biometric sign-in
          </p>
        )}
      </div>

      {/* Registered Devices */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Registered Devices</h3>
        {devices.length === 0 ? (
          <p className="text-gray-500">No biometric devices registered yet.</p>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{device.name}</div>
                  <div className="text-sm text-gray-500">
                    Added {new Date(device.createdAt).toLocaleDateString()}
                    {device.lastUsedAt && (
                      <span> • Last used {new Date(device.lastUsedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Register New Device */}
      <div>
        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {showRegisterForm ? 'Cancel' : 'Register New Device'}
        </button>

        {showRegisterForm && (
          <form onSubmit={handleRegisterDevice} className="mt-4 space-y-4">
            <div>
              <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-1">
                Device Name (Optional)
              </label>
              <input
                type="text"
                id="deviceName"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={`Device ${devices.length + 1}`}
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isRegistering}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isRegistering ? 'Registering...' : 'Register Device'}
              </button>
              <button
                type="button"
                onClick={() => setShowRegisterForm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}