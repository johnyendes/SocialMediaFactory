"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Palette,
  Upload,
  Eye,
  Globe,
  Code,
  Download,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image,
  Type,
  Layout,
  Settings
} from 'lucide-react';

interface BrandingSettings {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  customCSS?: string;
  companyName: string;
  tagline?: string;
  favicon?: string;
}

interface CustomDomain {
  id: string;
  domain: string;
  isVerified: boolean;
  sslEnabled: boolean;
  createdAt: string;
}

export default function WhiteLabelSettings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<BrandingSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#10b981',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    companyName: '',
    tagline: '',
  });
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'branding' | 'domains' | 'advanced'>('branding');

  useEffect(() => {
    loadBrandingSettings();
    loadCustomDomains();
  }, []);

  const loadBrandingSettings = async () => {
    try {
      const response = await fetch('/api/admin/white-label/branding');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (err) {
      setError('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomDomains = async () => {
    try {
      const response = await fetch('/api/admin/white-label/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains || []);
      }
    } catch (err) {
      console.error('Failed to load custom domains:', err);
    }
  };

  const saveBrandingSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/white-label/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess('Branding settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/admin/white-label/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...settings,
          [type]: data.url,
        });
        setSuccess(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`);
      }
    } catch (err) {
      setError(`Failed to upload ${type}`);
    }
  };

  const addCustomDomain = async (domain: string) => {
    try {
      const response = await fetch('/api/admin/white-label/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      if (response.ok) {
        setSuccess('Domain added successfully!');
        await loadCustomDomains();
      }
    } catch (err) {
      setError('Failed to add domain');
    }
  };

  const generateCSS = () => {
    return `
:root {
  --primary-color: ${settings.primaryColor};
  --secondary-color: ${settings.secondaryColor};
  --accent-color: ${settings.accentColor};
  --font-family: '${settings.fontFamily}', sans-serif;
  --border-radius: ${settings.borderRadius};
}

body {
  font-family: var(--font-family);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-secondary {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.accent {
  color: var(--accent-color);
}

${settings.customCSS || ''}
    `.trim();
  };

  const fonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Poppins',
    'Playfair Display',
    'Merriweather',
    'Source Sans Pro',
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">White-labeling Settings</h1>
          <p className="text-gray-600 mt-2">
            Customize branding, themes, and domains for your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              previewMode 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Preview Active' : 'Preview Mode'}
          </button>
          <button
            onClick={saveBrandingSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'branding', label: 'Branding', icon: Palette },
            { id: 'domains', label: 'Custom Domains', icon: Globe },
            { id: 'advanced', label: 'Advanced', icon: Code },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo & Brand Assets */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Brand Assets
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  {settings.logo && (
                    <img 
                      src={settings.logo} 
                      alt="Company Logo" 
                      className="h-16 w-auto object-contain border border-gray-200 rounded p-2"
                    />
                  )}
                  <label className="cursor-pointer">
                    <span className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG or SVG. Max size 2MB.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline || ''}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your company tagline (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon
                </label>
                <label className="cursor-pointer">
                  <span className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    Upload Favicon
                  </span>
                  <input
                    type="file"
                    accept="image/x-icon,image/png"
                    onChange={(e) => handleFileUpload(e, 'favicon')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  ICO or PNG format. 32x32px recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Scheme
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" />
              Typography
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fonts.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Radius
                </label>
                <select
                  value={settings.borderRadius}
                  onChange={(e) => setSettings({ ...settings, borderRadius: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">None (0px)</option>
                  <option value="0.25rem">Small (4px)</option>
                  <option value="0.5rem">Medium (8px)</option>
                  <option value="0.75rem">Large (12px)</option>
                  <option value="1rem">Extra Large (16px)</option>
                  <option value="9999px">Full (Pill)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </h3>
            
            <div 
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg"
              style={{
                backgroundColor: settings.primaryColor + '10',
                borderColor: settings.primaryColor,
                fontFamily: settings.fontFamily,
              }}
            >
              <div className="text-center mb-4">
                {settings.logo && (
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="h-12 mx-auto mb-2 object-contain"
                  />
                )}
                <h4 
                  className="text-xl font-bold mb-1"
                  style={{ color: settings.primaryColor }}
                >
                  {settings.companyName || 'Your Company'}
                </h4>
                {settings.tagline && (
                  <p className="text-gray-600">{settings.tagline}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <button
                  className="w-full py-2 px-4 text-white rounded-md text-center"
                  style={{ 
                    backgroundColor: settings.primaryColor,
                    borderRadius: settings.borderRadius,
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="w-full py-2 px-4 text-white rounded-md text-center"
                  style={{ 
                    backgroundColor: settings.secondaryColor,
                    borderRadius: settings.borderRadius,
                  }}
                >
                  Secondary Button
                </button>
                <div
                  className="w-full py-2 px-4 text-center rounded-md"
                  style={{ 
                    backgroundColor: settings.accentColor,
                    color: 'white',
                    borderRadius: settings.borderRadius,
                  }}
                >
                  Accent Element
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Domains Tab */}
      {activeTab === 'domains' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Custom Domains
          </h3>
          
          <div className="space-y-4">
            <DomainList domains={domains} onAdd={addCustomDomain} />
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Custom CSS
            </h3>
            
            <textarea
              value={settings.customCSS || ''}
              onChange={(e) => setSettings({ ...settings, customCSS: e.target.value })}
              placeholder="Add your custom CSS here..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <p className="text-xs text-gray-500 mt-2">
              Add custom CSS to override default styles. Use with caution.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Generated CSS
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {generateCSS()}
              </pre>
            </div>
            
            <button
              onClick={() => {
                const css = generateCSS();
                const blob = new Blob([css], { type: 'text/css' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'branding.css';
                a.click();
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Download CSS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DomainList({ domains, onAdd }: { 
  domains: CustomDomain[]; 
  onAdd: (domain: string) => void; 
}) {
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newDomain.trim()) return;
    
    setAdding(true);
    try {
      await onAdd(newDomain.trim());
      setNewDomain('');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="Enter domain (e.g., app.yourcompany.com)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newDomain.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add Domain'}
        </button>
      </div>

      {domains.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No custom domains configured</p>
          <p className="text-sm">Add a custom domain to use your own branding</p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <div key={domain.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="font-medium">{domain.domain}</div>
                  <div className="text-sm text-gray-500">
                    Added {new Date(domain.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {domain.isVerified ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    Pending
                  </span>
                )}
                {domain.sslEnabled && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    SSL
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}