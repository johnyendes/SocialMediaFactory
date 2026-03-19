"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FileText,
  Download,
  Upload,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Search,
  Filter,
  Eye,
  RefreshCw,
  BarChart3,
  Lock,
  Database
} from 'lucide-react';

interface GDPRRequest {
  id: string;
  type: 'export' | 'delete';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestDate: string;
  completedDate?: string;
  dataExportUrl?: string;
  deletionProof?: string;
  processedBy?: string;
  userId: string;
  user: {
    email: string;
    name?: string;
  };
}

interface SOC2Report {
  id: string;
  type: 'SOC2' | 'GDPR' | 'AUDIT';
  format: 'JSON' | 'CSV' | 'PDF';
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
  generatedBy: string;
  filePath?: string;
  fileSize?: number;
  metadata?: Record<string, any>;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  user: {
    email: string;
    name?: string;
  };
}

export default function ComplianceExportManager() {
  const { data: session } = useSession();
  const [gdprRequests, setGdprRequests] = useState<GDPRRequest[]>([]);
  const [soc2Reports, setSoc2Reports] = useState<SOC2Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gdpr' | 'soc2' | 'audit'>('gdpr');
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'gdpr':
          await loadGDPRRequests();
          break;
        case 'soc2':
          await loadSOC2Reports();
          break;
        case 'audit':
          await loadAuditLogs();
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const loadGDPRRequests = async () => {
    try {
      const response = await fetch('/api/admin/compliance/gdpr');
      if (response.ok) {
        const data = await response.json();
        setGdprRequests(data.requests || []);
      }
    } catch (err) {
      setError('Failed to load GDPR requests');
    }
  };

  const loadSOC2Reports = async () => {
    try {
      const response = await fetch('/api/admin/compliance/soc2');
      if (response.ok) {
        const data = await response.json();
        setSoc2Reports(data.reports || []);
      }
    } catch (err) {
      setError('Failed to load SOC2 reports');
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit/export?start=' + dateRange.start + '&end=' + dateRange.end);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      setError('Failed to load audit logs');
    }
  };

  const generateSOC2Report = async (type: 'SOC2' | 'GDPR' | 'AUDIT', format: 'JSON' | 'CSV' | 'PDF') => {
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/compliance/soc2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          format,
          period: dateRange,
        }),
      });

      if (response.ok) {
        setSuccess(`${type} report generated successfully!`);
        await loadSOC2Reports();
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const exportAuditLogs = async (format: 'CSV' | 'JSON') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/audit/export?format=${format}&start=${dateRange.start}&end=${dateRange.end}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${dateRange.start}-${dateRange.end}.${format.toLowerCase()}`;
        a.click();
        URL.revokeObjectURL(url);
        setSuccess('Audit logs exported successfully!');
      } else {
        throw new Error('Failed to export logs');
      }
    } catch (err) {
      setError('Failed to export audit logs');
    } finally {
      setExporting(false);
    }
  };

  const processGDPRRequest = async (requestId: string, action: 'approve' | 'deny') => {
    try {
      const response = await fetch(`/api/admin/compliance/gdpr/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setSuccess(`GDPR request ${action}d successfully!`);
        await loadGDPRRequests();
      }
    } catch (err) {
      setError('Failed to process GDPR request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance & Data Export</h1>
          <p className="text-gray-600 mt-2">
            GDPR data requests, SOC2 reporting, and audit log management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
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

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'gdpr', label: 'GDPR Requests', icon: User },
            { id: 'soc2', label: 'SOC2 Reports', icon: Shield },
            { id: 'audit', label: 'Audit Logs', icon: Database },
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

      {/* GDPR Requests Tab */}
      {activeTab === 'gdpr' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">GDPR Data Requests</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage user data export and deletion requests
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {gdprRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No GDPR requests found</p>
              </div>
            ) : (
              gdprRequests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {request.type === 'export' ? (
                          <Download className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {request.type === 'export' ? 'Data Export' : 'Data Deletion'}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Requested by {request.user.name || request.user.email}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(request.requestDate)}
                          </span>
                          {request.completedDate && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Completed {formatDate(request.completedDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => processGDPRRequest(request.id, 'approve')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => processGDPRRequest(request.id, 'deny')}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Deny
                          </button>
                        </>
                      )}
                      
                      {request.status === 'completed' && request.dataExportUrl && (
                        <button
                          onClick={() => window.open(request.dataExportUrl, '_blank')}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      )}
                      
                      {request.deletionProof && (
                        <button
                          onClick={() => window.open(request.deletionProof, '_blank')}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          <Eye className="w-3 h-3" />
                          View Proof
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SOC2 Reports Tab */}
      {activeTab === 'soc2' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">SOC2 & Compliance Reports</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Generate and download compliance reports
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value="SOC2"
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  disabled
                >
                  <option value="SOC2">SOC2 Report</option>
                </select>
                <select
                  value="PDF"
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  disabled
                >
                  <option value="PDF">PDF</option>
                </select>
                <button
                  onClick={() => generateSOC2Report('SOC2', 'PDF')}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {soc2Reports.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No SOC2 reports generated yet</p>
                <p className="text-sm">Generate your first compliance report above</p>
              </div>
            ) : (
              soc2Reports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{report.type} Report</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{report.format}</span>
                          <span>Generated {formatDate(report.generatedAt)}</span>
                          <span>{formatFileSize(report.fileSize)}</span>
                          <span>
                            {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(report.filePath, '_blank')}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-800">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
                <p className="text-sm text-gray-600 mt-1">
                  System activity logs for compliance and security monitoring
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value="CSV"
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  disabled
                >
                  <option value="CSV">CSV</option>
                </select>
                <button
                  onClick={() => exportAuditLogs('CSV')}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? 'Exporting...' : 'Export Logs'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No audit logs found for the selected period</p>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user.name || log.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.resource || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compliance Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Compliance Information</h4>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-1">🔒 Data Protection</h5>
                <p>All user data is encrypted at rest and in transit with industry-standard protocols.</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">📊 Audit Trails</h5>
                <p>Complete audit logging ensures traceability for all system actions and data access.</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">⚖️ Legal Compliance</h5>
                <p>Fully compliant with GDPR, CCPA, and SOC2 requirements for data handling.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}