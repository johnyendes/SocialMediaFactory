'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataEnrichment } from '@/components/DataEnrichment'
import { DataCleaning } from '@/components/DataCleaning'
import { DataConnectors } from '@/components/DataConnectors'
import { 
  Database, 
  Activity, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  BarChart3,
  Globe,
  Zap,
  Clock
} from 'lucide-react'

interface IntegrationMetrics {
  totalDataPoints: number
  activeConnectors: number
  processingRate: number
  errorRate: number
  lastSync: string
  uptime: string
}

export default function DataIntegrationPage() {
  const [metrics, setMetrics] = useState<IntegrationMetrics>({
    totalDataPoints: 0,
    activeConnectors: 0,
    processingRate: 0,
    errorRate: 0,
    lastSync: '',
    uptime: ''
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'enrichment' | 'cleaning' | 'connectors'>('overview')

  const fetchIntegrationMetrics = async (): Promise<IntegrationMetrics> => {
    try {
      const response = await fetch('/api/data-integration/metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch integration metrics')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching integration metrics:', error)
      // Return default metrics for graceful degradation
      return {
        totalDataPoints: 0,
        activeConnectors: 0,
        processingRate: 0,
        errorRate: 0,
        lastSync: 'No connection',
        uptime: '0%'
      }
    }
  }

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await fetchIntegrationMetrics()
      setMetrics(data)
    }
    loadMetrics()

    // Set up real-time updates
    const interval = setInterval(loadMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'enrichment', label: 'Data Enrichment', icon: <Zap className="h-4 w-4" /> },
    { id: 'cleaning', label: 'Data Cleaning', icon: <Activity className="h-4 w-4" /> },
    { id: 'connectors', label: 'Data Connectors', icon: <Globe className="h-4 w-4" /> }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Integration Hub</h1>
            <p className="text-gray-600 mt-2">Advanced data processing, enrichment, and integration platform</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {metrics.totalDataPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Data Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Globe className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metrics.activeConnectors}</div>
                      <div className="text-sm text-gray-600">Active Connectors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metrics.processingRate}/s</div>
                      <div className="text-sm text-gray-600">Processing Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metrics.uptime}</div>
                      <div className="text-sm text-gray-600">System Uptime</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Integration Pipeline Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Data Enrichment</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Data Cleaning</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">External Connectors</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                        <span className="text-sm font-medium">Quality Monitoring</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="text-sm font-medium">Company data enrichment completed</div>
                        <div className="text-xs text-gray-500">2 minutes ago</div>
                      </div>
                      <Badge variant="outline">10,234 records</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="text-sm font-medium">Duplicate detection rule executed</div>
                        <div className="text-xs text-gray-500">15 minutes ago</div>
                      </div>
                      <Badge variant="outline">1,847 duplicates found</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="text-sm font-medium">LinkedIn API sync completed</div>
                        <div className="text-xs text-gray-500">1 hour ago</div>
                      </div>
                      <Badge variant="outline">5,432 new records</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="text-sm font-medium">Twitter stream connected</div>
                        <div className="text-xs text-gray-500">2 hours ago</div>
                      </div>
                      <Badge variant="outline">Real-time active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Run Full Data Sync
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Execute Cleaning Rules
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Test All Connections
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Enrichment Tab */}
        {activeTab === 'enrichment' && <DataEnrichment />}

        {/* Data Cleaning Tab */}
        {activeTab === 'cleaning' && <DataCleaning />}

        {/* Data Connectors Tab */}
        {activeTab === 'connectors' && <DataConnectors />}
      </div>
    </div>
  )
}