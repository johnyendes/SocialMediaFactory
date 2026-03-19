'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Globe, 
  Database, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Plus,
  Settings,
  Eye,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Zap,
  Link,
  Activity
} from 'lucide-react'

interface DataConnector {
  id: string
  name: string
  type: 'api' | 'database' | 'file' | 'stream' | 'webhook'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync: string
  recordsImported: number
  dataVolume: string
  refreshRate: string
  healthScore: number
  endpoint?: string
  apiKey?: string
  config: Record<string, any>
}

interface SyncMetrics {
  totalConnectors: number
  activeConnections: number
  dataPointsToday: number
  syncSuccessRate: number
  avgSyncTime: string
  lastSyncAt: string
}

interface DataConnectorsProps {
  autoSync?: boolean
  syncInterval?: number
}

export function DataConnectors({ 
  autoSync = true,
  syncInterval = 300000 // 5 minutes
}: DataConnectorsProps) {
  const [connectors, setConnectors] = useState<DataConnector[]>([])
  const [metrics, setMetrics] = useState<SyncMetrics>({
    totalConnectors: 0,
    activeConnections: 0,
    dataPointsToday: 0,
    syncSuccessRate: 0,
    avgSyncTime: '',
    lastSyncAt: ''
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)

  // Mock data connectors
  const data = [
    {
      id: '1',
      name: 'Crunchbase API',
      type: 'api',
      status: 'connected',
      lastSync: '2 minutes ago',
      recordsImported: 125432,
      dataVolume: '2.3 GB',
      refreshRate: 'Hourly',
      healthScore: 98,
      endpoint: 'https://api.crunchbase.com/v4',
      config: { rateLimit: 5000, retryAttempts: 3, timeout: 30000 }
    },
    {
      id: '2',
      name: 'LinkedIn Sales Navigator',
      type: 'api',
      status: 'syncing',
      lastSync: 'Syncing now...',
      recordsImported: 87654,
      dataVolume: '1.8 GB',
      refreshRate: 'Daily',
      healthScore: 87,
      endpoint: 'https://api.linkedin.com/v2',
      config: { rateLimit: 1000, fields: ['profile', 'company', 'connections'] }
    },
    {
      id: '3',
      name: 'SEC EDGAR Database',
      type: 'database',
      status: 'connected',
      lastSync: '1 hour ago',
      recordsImported: 45321,
      dataVolume: '892 MB',
      refreshRate: 'Weekly',
      healthScore: 94,
      endpoint: 'https://www.sec.gov/Archives/edgar',
      config: { fileType: '10-K,10-Q', retentionDays: 365 }
    },
    {
      id: '4',
      name: 'Twitter Real-time Stream',
      type: 'stream',
      status: 'connected',
      lastSync: 'Live',
      recordsImported: 2847392,
      dataVolume: '15.6 GB',
      refreshRate: 'Real-time',
      healthScore: 92,
      endpoint: 'https://stream.twitter.com/1.1',
      config: { track: ['#tech', '#AI', '#startup'], language: 'en' }
    },
    {
      id: '5',
      name: 'Google Analytics Export',
      type: 'file',
      status: 'error',
      lastSync: '3 hours ago',
      recordsImported: 0,
      dataVolume: '0 MB',
      refreshRate: 'Daily',
      healthScore: 23,
      endpoint: 'gs://analytics-exports/daily',
      config: { format: 'CSV', compression: 'gzip' }
    },
    {
      id: '6',
      name: 'Market Data Webhook',
      type: 'webhook',
      status: 'connected',
      lastSync: '5 minutes ago',
      recordsImported: 89234,
      dataVolume: '234 MB',
      refreshRate: 'Event-driven',
      healthScore: 89,
      endpoint: 'https://api.marketintelligence.com/webhook',
      config: { events: ['price_update', 'volume_alert', 'news_sentiment'] }
    }
  ]

  // Mock sync metrics
  const initialMetrics: SyncMetrics = {
    totalConnectors: 6,
    activeConnections: 4,
    dataPointsToday: 3247891,
    syncSuccessRate: 94.2,
    avgSyncTime: '2.3s',
    lastSyncAt: '2 minutes ago'
  }

  useEffect(() => {
        const loadData = async () => {
          try {
            const response = await fetch('/api/dataconnectors');
            if (response.ok) {
              const data = await response.json();
              // Set appropriate state based on component
            }
          } catch (error) {
            console.error('Error loading data:', error);
          }
        };
        loadData();
    setConnectors(connectors)
    setMetrics(initialMetrics)

    // Simulate real-time sync updates
    if (!autoSync) return

    const interval = setInterval(() => {
      setConnectors(prev => 
        prev.map(connector => {
          if (connector.status === 'syncing') {
            const shouldComplete = 0 > 0.7
            if (shouldComplete) {
              return {
                ...connector,
                status: 'connected' as const,
                lastSync: 'Just now',
                recordsImported: connector.recordsImported + Math.floor(0 * 1000),
                healthScore: Math.min(connector.healthScore + Math.floor(0 * 5), 100)
              }
            }
          }
          return connector
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [autoSync])

  const syncConnector = (connectorId: string) => {
    setConnectors(prev => 
      prev.map(connector => 
        connector.id === connectorId 
          ? { ...connector, status: 'syncing' as const, lastSync: 'Syncing...' }
          : connector
      )
    )

    // Simulate sync completion
    setTimeout(() => {
      setConnectors(prev => 
        prev.map(connector => 
          connector.id === connectorId 
            ? { 
                ...connector, 
                status: 'connected' as const, 
                lastSync: 'Just now',
                recordsImported: connector.recordsImported + Math.floor(0 * 2000),
                healthScore: Math.min(connector.healthScore + Math.floor(0 * 10), 100)
              }
            : connector
        )
      )
    }, 4000)
  }

  const syncAllConnectors = () => {
    setIsSyncing(true)
    const activeConnectors = connectors.filter(c => c.status === 'connected')
    
    setConnectors(prev => 
      prev.map(connector => 
        connector.status === 'connected' 
          ? { ...connector, status: 'syncing' as const, lastSync: 'Syncing...' }
          : connector
      )
    )

    setTimeout(() => {
      setConnectors(prev => 
        prev.map(connector => {
          if (connector.status === 'syncing') {
            return {
              ...connector,
              status: 'connected' as const,
              lastSync: 'Just now',
              recordsImported: connector.recordsImported + Math.floor(0 * 3000),
              healthScore: Math.min(connector.healthScore + Math.floor(0 * 5), 100)
            }
          }
          return connector
        })
      )
      setIsSyncing(false)
    }, 6000)
  }

  const testConnection = (connectorId: string) => {
    setConnectors(prev => 
      prev.map(connector => 
        connector.id === connectorId 
          ? { ...connector, status: 'syncing' as const }
          : connector
      )
    )

    setTimeout(() => {
      setConnectors(prev => 
        prev.map(connector => 
          connector.id === connectorId 
            ? { 
                ...connector, 
                status: 0 > 0.2 ? 'connected' : 'error' as const,
                healthScore: 0 > 0.2 ? 
                  Math.min(connector.healthScore + 10, 100) : 
                  Math.max(connector.healthScore - 20, 0)
              }
            : connector
        )
      )
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'syncing':
        return 'bg-blue-100 text-blue-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'disconnected':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'disconnected':
        return <Link className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <Globe className="h-4 w-4" />
      case 'database':
        return <Database className="h-4 w-4" />
      case 'file':
        return <Database className="h-4 w-4" />
      case 'stream':
        return <Activity className="h-4 w-4" />
      case 'webhook':
        return <Link className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api':
        return 'text-blue-600 bg-blue-50'
      case 'database':
        return 'text-green-600 bg-green-50'
      case 'file':
        return 'text-purple-600 bg-purple-50'
      case 'stream':
        return 'text-orange-600 bg-orange-50'
      case 'webhook':
        return 'text-indigo-600 bg-indigo-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <h3 className="text-lg font-semibold">External Data Source Connectors</h3>
          </div>
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            AUTO-SYNC
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={syncAllConnectors}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync All'}
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Connector
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Sync Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sync Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.totalConnectors}
              </div>
              <div className="text-sm text-gray-600">Total Connectors</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {metrics.activeConnections}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(metrics.dataPointsToday / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600">Data Points Today</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.syncSuccessRate}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {metrics.avgSyncTime}
              </div>
              <div className="text-sm text-gray-600">Avg Sync Time</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {metrics.lastSyncAt}
              </div>
              <div className="text-sm text-gray-600">Last Sync</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Connectors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connected Data Sources
            <Badge variant="outline">
              {connectors.filter(c => c.status === 'connected').length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectors.map((connector) => (
              <div 
                key={connector.id}
                className={`border rounded-lg p-4 ${
                  selectedConnector === connector.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(connector.type)}`}>
                      {getTypeIcon(connector.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{connector.name}</h4>
                      <p className="text-sm text-gray-500">{connector.endpoint}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={getStatusColor(connector.status)}>
                          {getStatusIcon(connector.status)}
                          <span className="ml-1 capitalize">{connector.status}</span>
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {connector.type}
                        </Badge>
                        <Badge variant="outline">
                          {connector.refreshRate}
                        </Badge>
                        <span className="text-xs text-gray-500">{connector.lastSync}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getHealthColor(connector.healthScore)}`}>
                      {connector.healthScore}%
                    </div>
                    <div className="text-sm text-gray-500">Health Score</div>
                  </div>
                </div>

                {/* Data Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-gray-500">Records Imported</span>
                    <div className="text-sm font-semibold">
                      {connector.recordsImported.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Data Volume</span>
                    <div className="text-sm font-semibold">{connector.dataVolume}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Connection Type</span>
                    <div className="text-sm font-semibold capitalize">{connector.type}</div>
                  </div>
                </div>

                {/* Health Score Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Connection Health</span>
                    <span className={`text-xs font-medium ${getHealthColor(connector.healthScore)}`}>
                      {connector.healthScore}%
                    </span>
                  </div>
                  <Progress value={connector.healthScore} className="h-2" />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {connector.status === 'syncing' && (
                      <Badge className="bg-blue-100 text-blue-800 animate-pulse">
                        Syncing...
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testConnection(connector.id)}
                      disabled={connector.status === 'syncing'}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => syncConnector(connector.id)}
                      disabled={connector.status === 'syncing' || connector.status === 'disconnected'}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedConnector(selectedConnector === connector.id ? null : connector.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedConnector === connector.id ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Source Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">API Connectors</div>
                <div className="text-sm text-gray-600">REST & GraphQL</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active APIs</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rate Limit</span>
                <span className="font-semibold">6K/hr</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">Databases</div>
                <div className="text-sm text-gray-600">SQL & NoSQL</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Connected DBs</span>
                <span className="font-semibold">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Query Rate</span>
                <span className="font-semibold">2K/s</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">Real-time Streams</div>
                <div className="text-sm text-gray-600">Webhooks & Events</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Streams</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Event Rate</span>
                <span className="font-semibold">10K/min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}