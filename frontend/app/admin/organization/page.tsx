'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface BrandingData {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };
  settings: {
    welcomeMessage?: string;
    loginButtonText?: string;
    showSocialLogin?: boolean;
    showSSO?: boolean;
    showMagicLink?: boolean;
    showBiometric?: boolean;
    footerText?: string;
    supportEmail?: string;
  };
}

export default function OrganizationBranding() {
  const { data: session, status } = useSession();
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchBranding();
    }
  }, [session]);

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/admin/organization/branding');
      if (response.ok) {
        const data = await response.json();
        setBranding(data);
      }
    } catch (error) {
      setError('Failed to fetch branding');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/organization/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      if (response.ok) {
        setSuccess('Branding updated successfully');
      } else {
        setError('Failed to update branding');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Organization Branding</h1>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">{success}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={branding?.name || ''}
                  onChange={(e) => setBranding({ ...branding!, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <input
                  type="text"
                  placeholder="your-domain.com"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={branding?.domain || ''}
                  onChange={(e) => setBranding({ ...branding!, domain: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={branding?.logo || ''}
                onChange={(e) => setBranding({ ...branding!, logo: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Theme Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    value={branding?.theme?.primaryColor || '#3b82f6'}
                    onChange={(e) => setBranding({
                      ...branding!,
                      theme: { ...branding!.theme, primaryColor: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={branding?.theme?.primaryColor || '#3b82f6'}
                    onChange={(e) => setBranding({
                      ...branding!,
                      theme: { ...branding!.theme, primaryColor: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    value={branding?.theme?.secondaryColor || '#1e40af'}
                    onChange={(e) => setBranding({
                      ...branding!,
                      theme: { ...branding!.theme, secondaryColor: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={branding?.theme?.secondaryColor || '#1e40af'}
                    onChange={(e) => setBranding({
                      ...branding!,
                      theme: { ...branding!.theme, secondaryColor: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Login Experience</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={branding?.settings?.welcomeMessage || ''}
                  onChange={(e) => setBranding({
                    ...branding!,
                    settings: { ...branding!.settings, welcomeMessage: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Login Button Text</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={branding?.settings?.loginButtonText || ''}
                  onChange={(e) => setBranding({
                    ...branding!,
                    settings: { ...branding!.settings, loginButtonText: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                <input
                  type="email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={branding?.settings?.supportEmail || ''}
                  onChange={(e) => setBranding({
                    ...branding!,
                    settings: { ...branding!.settings, supportEmail: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Branding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}