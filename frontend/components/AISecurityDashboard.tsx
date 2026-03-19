"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Globe,
  TrendingUp,
  Clock,
  Eye,
  Download,
  Filter,
  Search,
  BarChart3,
  AlertCircle,
  CheckCircle,
  LogOut
} from 'lucide-react';

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  highRiskEvents: number;
  recentAnomalies: number;
  topThreats: any[];
  authenticated?: boolean;
  user?: string;
}

export default function AISecurityDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSecurityStats();
    } else if (status === 'unauthenticated') {
      setError('Authentication required. Please sign in.');
      setLoading(false);
    }
  }, [status]);

  const fetchSecurityStats = async () => {
    try {
      console.log('🔍 FRONTEND: Fetching security stats...');
      const response = await fetch('/api/admin/security/stats');
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 FRONTEND: Security stats received:', data);
      setStats(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('🔍 FRONTEND: Error fetching security stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch security data');
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">AI Security Monitoring</h1>
          <div className="animate-pulse bg-gray-200 rounded w-24 h-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">AI Security Monitoring</h1>
          {session && (
            <button
              onClick={() => signOut()}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </button>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {!session && (
                <button
                  onClick={() => window.location.href = '/auth/signin'}
                  className="mt-3 text-sm text-red-600 underline hover:text-red-800"
                >
                  Sign in to access this feature
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Security Monitoring</h1>
          {stats?.user && (
            <p className="text-sm text-gray-500">Authenticated as: {stats.user}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Authenticated</span>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Security Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalEvents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Events</p>
              <p className="text-2xl font-semibold text-red-600">{stats?.criticalEvents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk Events</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats?.highRiskEvents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Anomalies</p>
              <p className="text-2xl font-semibold text-green-600">{stats?.recentAnomalies || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              Security Dashboard Operational
            </p>
            <p className="text-sm text-green-700">
              All monitoring systems are active and functioning correctly.
            </p>
          </div>
          <div className="text-xs text-green-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Top Security Threats
          </h3>
          {stats?.topThreats && stats.topThreats.length > 0 ? (
            <div className="space-y-3">
              {stats.topThreats.map((threat, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-900">{threat}</span>
                  </div>
                  <span className="text-xs text-gray-500">Medium Risk</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                No active threats detected. System is secure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
