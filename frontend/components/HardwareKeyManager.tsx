"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Usb,
  Smartphone,
  Key,
  TestTube,
  RefreshCw,
  Lock,
  Unlock,
  Info,
  AlertTriangle
} from 'lucide-react';

interface HardwareKey {
  id: string;
  name: string;
  type: 'yubikey' | 'solokey' | 'titann' | 'other';
  transport: 'usb' | 'nfc' | 'ble' | 'hybrid';
  firmwareVersion?: string;
  serialNumber?: string;
  createdAt: string;
  lastUsedAt?: string;
  isBackup: boolean;
  supportsBiometrics: boolean;
  supportedAlgorithms: string[];
}

interface KeyTestResult {
  keyId: string;
  challenge: string;
  signature: string;
  responseTime: number;
  success: boolean;
  error?: string;
}

export default function HardwareKeyManager() {
  const { data: session } = useSession();
  const [keys, setKeys] = useState<HardwareKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<KeyTestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    loadHardwareKeys();
  }, []);

  const loadHardwareKeys = async () => {
    try {
      const response = await fetch('/api/auth/webauthn/hardware-keys');
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      setError('Failed to load hardware keys');
    } finally {
      setLoading(false);
    }
  };

  const registerHardwareKey = async () => {
    setRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if WebAuthn is supported
      if (!navigator.credentials) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Get registration options for hardware key
      const optionsResponse = await fetch('/api/auth/webauthn/register-options?hardware=true');
      if (!optionsResponse.ok) throw new Error('Failed to get registration options');
      
      const options = await optionsResponse.json();

      // Modify options to prefer hardware keys
      options.authenticatorSelection = {
        ...options.authenticatorSelection,
        userVerification: 'required',
        authenticatorAttachment: 'cross-platform',
        requireResidentKey: false,
      };

      // Start WebAuthn registration
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const registrationResponse = await startAuthentication(options);

      // Detect hardware key type from response
      const keyInfo = detectKeyType(registrationResponse);

      // Verify registration with server
      const verifyResponse = await fetch('/api/auth/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registrationResponse,
          keyType: keyInfo.type,
          transport: keyInfo.transport,
        }),
      });

      if (verifyResponse.ok) {
        const result = await verifyResponse.json();
        setSuccess(`${keyInfo.displayName} registered successfully!`);
        await loadHardwareKeys();
      } else {
        throw new Error('Hardware key registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register hardware key');
    } finally {
      setRegistering(false);
    }
  };

  const detectKeyType = (response: any): { type: string; transport: string; displayName: string } => {
    // This is a simplified detection - in reality, you'd analyze the response
    const transports = response.response.transports || [];
    
    if (transports.includes('usb')) {
      if (response.id.includes('YubiKey')) {
        return { type: 'yubikey', transport: 'usb', displayName: 'YubiKey' };
      }
      return { type: 'other', transport: 'usb', displayName: 'USB Security Key' };
    }
    
    if (transports.includes('nfc')) {
      return { type: 'other', transport: 'nfc', displayName: 'NFC Security Key' };
    }
    
    if (transports.includes('ble')) {
      return { type: 'other', transport: 'ble', displayName: 'Bluetooth Security Key' };
    }
    
    return { type: 'other', transport: 'hybrid', displayName: 'Hardware Security Key' };
  };

  const testHardwareKey = async (keyId: string) => {
    setTesting(keyId);
    setError(null);

    try {
      const startTime = Date.now();
      
      // Get authentication options
      const optionsResponse = await fetch('/api/auth/webauthn/auth-options');
      if (!optionsResponse.ok) throw new Error('Failed to get auth options');
      
      const options = await optionsResponse.json();

      // Modify options to target specific key
      options.allowCredentials = [{ 
        id: keyId, 
        type: 'public-key',
        transports: ['usb', 'nfc', 'ble']
      }];

      // Start authentication test
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const authResponse = await startAuthentication(options);
      
      const responseTime = Date.now() - startTime;

      // Verify with server
      const verifyResponse = await fetch('/api/auth/webauthn/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResponse),
      });

      if (verifyResponse.ok) {
        const testResult: KeyTestResult = {
          keyId,
          challenge: options.challenge,
          signature: authResponse.response.signature,
          responseTime,
          success: true,
        };
        
        setTestResults(prev => [...prev.filter(r => r.keyId !== keyId), testResult]);
        setSuccess('Hardware key test completed successfully!');
      } else {
        throw new Error('Authentication test failed');
      }
    } catch (err) {
      const testResult: KeyTestResult = {
        keyId,
        challenge: '',
        signature: '',
        responseTime: 0,
        success: false,
        error: err instanceof Error ? err.message : 'Test failed',
      };
      
      setTestResults(prev => [...prev.filter(r => r.keyId !== keyId), testResult]);
      setError('Hardware key test failed');
    } finally {
      setTesting(null);
    }
  };

  const removeHardwareKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/auth/webauthn/hardware-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Hardware key removed successfully');
        await loadHardwareKeys();
      } else {
        throw new Error('Failed to remove hardware key');
      }
    } catch (err) {
      setError('Failed to remove hardware key');
    }
  };

  const getKeyIcon = (key: HardwareKey) => {
    switch (key.type) {
      case 'yubikey':
        return <Key className="w-6 h-6 text-blue-600" />;
      case 'solokey':
        return <Usb className="w-6 h-6 text-purple-600" />;
      default:
        return <Shield className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTransportIcon = (transport: string) => {
    switch (transport) {
      case 'usb':
        return <Usb className="w-4 h-4 text-blue-500" />;
      case 'nfc':
        return <Smartphone className="w-4 h-4 text-green-500" />;
      case 'ble':
        return <Smartphone className="w-4 h-4 text-purple-500" />;
      default:
        return <Usb className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTestResult = (keyId: string) => {
    return testResults.find(r => r.keyId === keyId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hardware Key Authentication</h1>
          <p className="text-gray-600 mt-2">
            Manage YubiKey and other FIDO2 hardware security keys
          </p>
        </div>
        <button
          onClick={registerHardwareKey}
          disabled={registering}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {registering ? 'Registering...' : 'Add Hardware Key'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Hardware Keys List */}
      <div className="space-y-4">
        {keys.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hardware Keys</h3>
            <p className="text-gray-600 mb-4">
              Add a hardware security key for the highest level of authentication security
            </p>
            <button
              onClick={registerHardwareKey}
              disabled={registering}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Your First Hardware Key
            </button>
          </div>
        ) : (
          keys.map((key) => {
            const testResult = getTestResult(key.id);
            return (
              <div
                key={key.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getKeyIcon(key)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {key.name}
                        </h3>
                        {key.isBackup && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            Backup
                          </span>
                        )}
                        {key.supportsBiometrics && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            Biometric
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="capitalize">{key.type}</span>
                        <span className="flex items-center gap-1">
                          {getTransportIcon(key.transport)}
                          {key.transport.toUpperCase()}
                        </span>
                        {key.firmwareVersion && (
                          <span>Firmware: {key.firmwareVersion}</span>
                        )}
                        {key.serialNumber && (
                          <span>S/N: {key.serialNumber}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>Added {formatDate(key.createdAt)}</span>
                        {key.lastUsedAt && (
                          <span>Used {formatDate(key.lastUsedAt)}</span>
                        )}
                      </div>

                      {key.supportedAlgorithms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {key.supportedAlgorithms.map((algo) => (
                            <span
                              key={algo}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                            >
                              {algo}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {testResult && (
                      <div className={`px-3 py-1 rounded-md text-xs font-medium ${
                        testResult.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {testResult.success 
                          ? `✓ ${testResult.responseTime}ms` 
                          : '✗ Failed'
                        }
                      </div>
                    )}
                    
                    <button
                      onClick={() => testHardwareKey(key.id)}
                      disabled={testing === key.id}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      {testing === key.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <TestTube className="w-3 h-3" />
                      )}
                      Test
                    </button>
                    
                    <button
                      onClick={() => removeHardwareKey(key.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {testResult?.error && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <Info className="w-3 h-3 inline mr-1" />
                    {testResult.error}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Supported Keys Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Supported Hardware Keys</h4>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  YubiKey Series
                </h5>
                <p>YubiKey 5, YubiKey 5C, YubiKey 5 NFC, Security Key NFC</p>
              </div>
              <div>
                <h5 className="font-medium mb-1 flex items-center gap-2">
                  <Usb className="w-4 h-4" />
                  SoloKey & Others
                </h5>
                <p>SoloKey, Nitrokey, Google Titan, other FIDO2 compatible keys</p>
              </div>
              <div>
                <h5 className="font-medium mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Security Features
                </h5>
                <p>FIDO2/WebAuthn, PIN protection, touch-to-sign, biometric support</p>
              </div>
              <div>
                <h5 className="font-medium mb-1 flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Connectivity
                </h5>
                <p>USB-A, USB-C, NFC, Bluetooth LE for mobile compatibility</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Instructions</h3>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">1</span>
            <div>
              <strong>Connect your hardware key:</strong> Insert the key into a USB port or hold it near your device for NFC/Bluetooth.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">2</span>
            <div>
              <strong>Click "Add Hardware Key":</strong> The registration process will prompt you to touch or tap your key.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">3</span>
            <div>
              <strong>Complete registration:</strong> Follow the on-screen prompts to set up your key and optionally set a PIN.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">4</span>
            <div>
              <strong>Test your key:</strong> Use the Test button to verify your key is working properly before relying on it for authentication.
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}