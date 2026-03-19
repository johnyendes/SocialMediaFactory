"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Smartphone, 
  Shield, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Fingerprint
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'fingerprint' | 'face' | 'hardware';
  createdAt: string;
  lastUsedAt?: string;
  isDefault: boolean;
}

export default function BiometricAuthManager() {
  const { data: session } = useSession();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user's biometric devices
  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetch('/api/auth/webauthn/devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (err) {
      setError('Failed to load biometric devices');
    } finally {
      setLoading(false);
    }
  };

  const registerNewDevice = async () => {
    setRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      // Get registration options from server
      const optionsResponse = await fetch('/api/auth/webauthn/register-options');
      if (!optionsResponse.ok) throw new Error('Failed to get registration options');
      
      const options = await optionsResponse.json();

      // Start WebAuthn registration
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const registrationResponse = await startAuthentication(options);

      // Verify registration with server
      const verifyResponse = await fetch('/api/auth/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationResponse),
      });

      if (verifyResponse.ok) {
        const result = await verifyResponse.json();
        setSuccess('Biometric device registered successfully!');
        await loadDevices(); // Reload devices list
      } else {
        throw new Error('Device registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register device');
    } finally {
      setRegistering(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/auth/webauthn/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Device removed successfully');
        await loadDevices();
      } else {
        throw new Error('Failed to remove device');
      }
    } catch (err) {
      setError('Failed to remove device');
    }
  };

  const setDefaultDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/auth/webauthn/devices/${deviceId}/default`, {
        method: 'PUT',
      });

      if (response.ok) {
        setSuccess('Default device updated');
        await loadDevices();
      } else {
        throw new Error('Failed to set default device');
      }
    } catch (err) {
      setError('Failed to set default device');
    }
  };

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'fingerprint':
        return <Fingerprint className="w-5 h-5 text-blue-500" />;
      case 'face':
        return <Smartphone className="w-5 h-5 text-green-500" />;
      case 'hardware':
        return <Shield className="w-5 h-5 text-purple-500" />;
      default:
        return <Smartphone className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Biometric Authentication</h1>
            <p className="text-gray-600 mt-2">
              Manage your biometric devices for secure, passwordless authentication
            </p>
          </div>
          <button
            onClick={registerNewDevice}
            disabled={registering}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {registering ? 'Registering...' : 'Add Device'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Devices Grid */}
      <div className="space-y-4">
        {devices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Biometric Devices</h3>
            <p className="text-gray-600 mb-4">
              Add a biometric device to enable secure, passwordless authentication
            </p>
            <button
              onClick={registerNewDevice}
              disabled={registering}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Your First Device
            </button>
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getDeviceIcon(device.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {device.name}
                      </h3>
                      {device.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="capitalize">{device.type}</span>
                      <span>Added {formatDate(device.createdAt)}</span>
                      {device.lastUsedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Used {formatDate(device.lastUsedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!device.isDefault && (
                    <button
                      onClick={() => setDefaultDevice(device.id)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => removeDevice(device.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Security Information</h4>
            <p className="text-sm text-blue-800 mt-1">
              Biometric authentication uses FIDO2/WebAuthn standards to ensure your biometric data never leaves your device. 
              Your privacy and security are protected by industry-leading encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}