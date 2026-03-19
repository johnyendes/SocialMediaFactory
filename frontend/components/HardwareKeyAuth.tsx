'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  startRegistration, 
  startAuthentication 
} from '@simplewebauthn/browser';

interface HardwareKeyDevice {
  id: string;
  name: string;
  type: 'hardware-key' | 'biometric';
  createdAt: string;
  lastUsedAt?: string;
}

export default function HardwareKeyAuth() {
  const { data: session, status } = useSession();
  const [devices, setDevices] = useState<HardwareKeyDevice[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [keyType, setKeyType] = useState<'hardware-key' | 'biometric'>('hardware-key');
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
        // Add device type detection
        const devicesWithType = data.map((device: any) => ({
          ...device,
          type: detectDeviceType(device)
        }));
        setDevices(devicesWithType);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const detectDeviceType = (device: any): 'hardware-key' | 'biometric' => {
    // Simple heuristic to detect device type based on transports
    const transports = JSON.parse(device.transports || '[]');
    if (transports.includes('usb') || transports.includes('nfc') || transports.includes('ble')) {
      return 'hardware-key';
    }
    return 'biometric';
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

      // For hardware keys, we want to ensure cross-platform authenticators
      if (keyType === 'hardware-key') {
        options.authenticatorSelection.authenticatorAttachment = 'cross-platform';
        options.authenticatorSelection.userVerification = 'required';
      } else {
        options.authenticatorSelection.authenticatorAttachment = 'platform';
        options.authenticatorSelection.userVerification = 'preferred';
      }

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
          deviceName: deviceName || `${keyType === 'hardware-key' ? 'Hardware Key' : 'Biometric Device'} ${devices.length + 1}`,
          deviceType: keyType,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Registration verification failed');
      }

      const result = await verifyResponse.json();
      
      if (result.verified) {
        setSuccess(`${keyType === 'hardware-key' ? 'Hardware key' : 'Biometric device'} registered successfully!`);
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

  const handleHardwareKeyLogin = async () => {
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
        setSuccess('Hardware key authentication successful!');
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

  const hardwareKeys = devices.filter(d => d.type === 'hardware-key');
  const biometricDevices = devices.filter(d => d.type === 'biometric');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to manage security devices.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Hardware Key & Biometric Authentication</h2>

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

      {/* Hardware Key Login Button */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Quick Login</h3>
        <button
          onClick={handleHardwareKeyLogin}
          disabled={isAuthenticating || devices.length === 0}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          {isAuthenticating ? 'Authenticating...' : 'Use Hardware Key / Biometric'}
        </button>
        {devices.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Register a security device first to enable passwordless authentication
          </p>
        )}
      </div>

      {/* Hardware Keys Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Hardware Keys (YubiKey, SoloKey, etc.)
        </h3>
        {hardwareKeys.length === 0 ? (
          <p className="text-gray-500 mb-4">No hardware keys registered yet.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {hardwareKeys.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded bg-blue-50">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-gray-500">
                      Added {new Date(device.createdAt).toLocaleDateString()}
                      {device.lastUsedAt && (
                        <span> • Last used {new Date(device.lastUsedAt).toLocaleDateString()}</span>
                      )}
                    </div>
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

      {/* Biometric Devices Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
          Biometric Devices (Touch ID, Face ID, Windows Hello)
        </h3>
        {biometricDevices.length === 0 ? (
          <p className="text-gray-500 mb-4">No biometric devices registered yet.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {biometricDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded bg-purple-50">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-gray-500">
                      Added {new Date(device.createdAt).toLocaleDateString()}
                      {device.lastUsedAt && (
                        <span> • Last used {new Date(device.lastUsedAt).toLocaleDateString()}</span>
                      )}
                    </div>
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
          {showRegisterForm ? 'Cancel' : 'Register New Security Device'}
        </button>

        {showRegisterForm && (
          <form onSubmit={handleRegisterDevice} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="keyType"
                    value="hardware-key"
                    checked={keyType === 'hardware-key'}
                    onChange={(e) => setKeyType(e.target.value as 'hardware-key')}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      keyType === 'hardware-key' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {keyType === 'hardware-key' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">Hardware Key</div>
                      <div className="text-sm text-gray-500">YubiKey, SoloKey, etc.</div>
                    </div>
                  </div>
                </label>

                <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="keyType"
                    value="biometric"
                    checked={keyType === 'biometric'}
                    onChange={(e) => setKeyType(e.target.value as 'biometric')}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      keyType === 'biometric' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {keyType === 'biometric' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">Biometric</div>
                      <div className="text-sm text-gray-500">Touch ID, Face ID, etc.</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-1">
                Device Name (Optional)
              </label>
              <input
                type="text"
                id="deviceName"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={`${keyType === 'hardware-key' ? 'Hardware Key' : 'Biometric Device'} ${devices.length + 1}`}
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

      {/* Security Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Hardware Key Security Benefits</h4>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>Phishing resistant:</strong> Keys only work with authorized domains</li>
          <li>• <strong>Tamper resistant:</strong> Private keys cannot be extracted</li>
          <li>• <strong>Offline capable:</strong> Works without internet connectivity</li>
          <li>• <strong>Multi-protocol:</strong> Supports FIDO2, U2F, and other standards</li>
          <li>• <strong>Cross-platform:</strong> Works on Windows, Mac, Linux, mobile</li>
        </ul>
      </div>
    </div>
  );
}