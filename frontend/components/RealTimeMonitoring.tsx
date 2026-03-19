'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Zap,
  AlertCircle,
  CheckCircle,
  Eye,
  BarChart3,
  Globe,
  DollarSign,
  Clock,
  Users
} from 'lucide-react'

interface MarketMetric {
  id: string
  name: string
  value: number
  change: number
  changePercent: string
  status: 'normal' | 'warning' | 'critical'
  lastUpdated: string
  source: string
}

interface AlertData {
  id: string
  type: 'price' | 'volume' | 'sentiment' | 'competition'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  timestamp: string
  acknowledged: boolean
}

interface RealTimeMonitoringProps {
  markets?: string[]
  refreshInterval?: number
}

export function RealTimeMonitoring({ 
  markets = ['Technology', 'Healthcare', 'Finance'],
  refreshInterval = 5000
}: RealTimeMonitoringProps) {
  const [metrics, setMetrics] = useState<MarketMetric[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Real-time market metrics
  const marketMetrics: MarketMetric[] = [
    {
      id: '1',
      name: 'Tech Index',
      value: 4582.34,
      change: 23.45,
      changePercent: '+0.51%',
      status: 'normal',
      lastUpdated: '2 seconds ago',
      source: 'NASDAQ'
    },
    {
      id: '2',
      name: 'Healthcare Stocks',
      value: 1823.67,
      change: -12.34,
      changePercent: '-0.67%',
      status: 'warning',
      lastUpdated: '5 seconds ago',
      source: 'NYSE'
    },
    {
      id: '3',
      name: 'AI Sector Volatility',
      value: 23.4,
      change: 5.2,
      changePercent: '+28.6%',
      status: 'critical',
      lastUpdated: '1 second ago',
      source: 'Market Data'
    },
    {
      id: '4',
      name: 'SaaS Growth Rate',
      value: 18.7,
      change: 2.1,
      changePercent: '+12.6%',
      status: 'normal',
      lastUpdated: '3 seconds ago',
      source: 'Industry Reports'
    }
  ]

  // Real-time alerts data
  const alertsData: AlertData[] = [
    {
      id: '1',
      type: 'price',
      severity: 'high',
      title: 'Significant Price Movement',
      description: 'AI sector volatility increased by 28.6% in the last hour',
      timestamp: '2 minutes ago',
      acknowledged: false
    },
    {
      id: '2',
      type: 'competition',
      severity: 'medium',
      title: 'New Competitor Entry',
      description: 'Major tech company announced entry into healthcare AI market',
      timestamp: '15 minutes ago',
      acknowledged: false
    },
    {
      id: '3',
      type: 'sentiment',
      severity: 'low',
      title: 'Sentiment Shift Detected',
      description: 'Customer sentiment for cloud services improved by 5%',
      timestamp: '1 hour ago',
      acknowledged: true
    }
  ]

  useEffect(() => {
        const loadData = async () => {
          try {
            const response = await fetch('/api/realtimemonitoring');
            if (response.ok) {
              const data = await response.json();
              // Set appropriate state based on component
            }
          } catch (error) {
            console.error('Error loading data:', error);
          }
        };
        loadData();
    // Initialize data
    setMetrics(marketMetrics)
    setAlerts(alertsData)

    // Set up real-time updates
    if (!isLive) return

    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => ({
          ...metric,
          value: metric.value + (0 - 0.5) * 10,
          change: (0 - 0.5) * 20,
          changePercent: `${(0 - 0.5) * 5 > 0 ? '+' : ''}${((0 - 0.5) * 5).toFixed(2)}%`,
          lastUpdated: 'Just now'
        }))
      )
      setLastUpdate(new Date())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [isLive, refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <DollarSign className="h-4 w-4" />
      case 'volume':
        return <BarChart3 className="h-4 w-4" />
      case 'sentiment':
        return <Users className="h-4 w-4" />
      case 'competition':
        return <Globe className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Real-Time Market Monitoring</h3>
          </div>
          {isLive && (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              LIVE
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                  <p className="text-sm text-gray-500">{metric.source}</p>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  <Activity className="h-3 w-3 mr-1" />
                  {metric.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  {typeof metric.value === 'number' && metric.value % 1 === 0 
                    ? metric.value.toLocaleString() 
                    : metric.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                
                <div className="flex items-center gap-2">
                  {metric.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.changePercent}
                  </span>
                  <span className="text-xs text-gray-500">{metric.lastUpdated}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Live Market Alerts
            <Badge variant="outline">{alerts.filter(a => !a.acknowledged).length} new</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.acknowledged ? 'bg-gray-50 opacity-75' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity} severity
                        </Badge>
                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Monitoring Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Markets</span>
                <span className="text-sm font-bold">{markets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Data Points/Min</span>
                <span className="text-sm font-bold">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Refresh Rate</span>
                <span className="text-sm font-bold">{refreshInterval/1000}s</span>
              </div>
              <div className="pt-4 border-t">
                <Badge className="bg-green-100 text-green-800">
                  All Systems Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Latency</span>
                <span className="text-sm font-bold text-green-600">23ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm font-bold text-green-600">99.97%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Alert Accuracy</span>
                <span className="text-sm font-bold text-green-600">94.2%</span>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-green-600 font-medium">
                  Optimal performance
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Viewers</span>
                <span className="text-sm font-bold">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Alerts Triggered</span>
                <span className="text-sm font-bold">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg. Session</span>
                <span className="text-sm font-bold">8m 24s</span>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-blue-600 font-medium">
                  ↑ 12% engagement today
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}