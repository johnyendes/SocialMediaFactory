'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Gauge,
  Monitor,
  RefreshCw,
  Download
} from 'lucide-react'

interface PerformanceMetrics {
  pageLoadTime: number
  timeToFirstByte: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  memoryUsage: number
  renderTime: number
  bundleSize: number
  requestCount: number
  errorRate: number
  uptime: number
}

interface PerformanceAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  value: number
  threshold: number
  timestamp: Date
}

interface PerformanceMonitorProps {
  enabled?: boolean
  alertThresholds?: Partial<PerformanceMetrics>
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void
}

const defaultThresholds = {
  pageLoadTime: 3000,
  timeToFirstByte: 800,
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100,
  memoryUsage: 50 * 1024 * 1024, // 50MB
  renderTime: 100,
  requestCount: 50,
  errorRate: 5
}

export function PerformanceMonitor({ 
  enabled = true, 
  alertThresholds = defaultThresholds,
  onPerformanceUpdate 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    timeToFirstByte: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: 0,
    renderTime: 0,
    bundleSize: 0,
    requestCount: 0,
    errorRate: 0,
    uptime: 0
  })
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const monitoringRef = useRef<NodeJS.Timeout>()

  // Measure page load performance
  const measurePageLoad = useCallback(() => {
    if (typeof window === 'undefined') return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0]

    const pageLoadMetrics: Partial<PerformanceMetrics> = {
      pageLoadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      timeToFirstByte: navigation?.responseStart - navigation?.requestStart || 0,
      firstContentfulPaint: fcp?.startTime || 0,
      largestContentfulPaint: lcp?.startTime || 0,
      cumulativeLayoutShift: (performance as any).getEntriesByType('layout-shift')
        ?.reduce((acc: number, entry: any) => acc + (entry.hadRecentInput ? 0 : entry.value), 0) || 0,
      firstInputDelay: (performance as any).getEntriesByType('first-input')[0]?.processingStart - 
        (performance as any).getEntriesByType('first-input')[0]?.startTime || 0
    }

    return pageLoadMetrics
  }, [])

  // Measure runtime performance
  const measureRuntimePerformance = useCallback(() => {
    if (typeof window === 'undefined') return {}

    const runtimeMetrics: Partial<PerformanceMetrics> = {
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      requestCount: performance.getEntriesByType('resource').length,
      errorRate: parseFloat(localStorage.getItem('error-rate') || '0'),
      uptime: performance.now()
    }

    return runtimeMetrics
  }, [])

  // Get bundle size (mock for demo)
  const getBundleSize = useCallback(() => {
    // In a real app, this would come from build analysis
    const mockBundleSizes = {
      'analytics': 140000, // 140KB
      'research': 237000, // 237KB
      'data-integration': 108000, // 108KB
      'personalization': 109000 // 109KB
    }
    
    const currentPath = window.location.pathname
    const pageName = currentPath.split('/')[1] || 'home'
    
    return mockBundleSizes[pageName as keyof typeof mockBundleSizes] || 150000
  }, [])

  // Check for performance alerts
  const checkAlerts = useCallback((currentMetrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = []

    Object.entries(alertThresholds).forEach(([key, threshold]) => {
      const value = currentMetrics[key as keyof PerformanceMetrics]
      if (typeof value === 'number' && typeof threshold === 'number') {
        let alertType: PerformanceAlert['type'] = 'info'
        let shouldAlert = false

        if (key === 'cumulativeLayoutShift' || key === 'errorRate') {
          shouldAlert = value > threshold
          alertType = value > threshold * 1.5 ? 'error' : 'warning'
        } else {
          shouldAlert = value > threshold
          alertType = value > threshold * 1.5 ? 'error' : 'warning'
        }

        if (shouldAlert) {
          newAlerts.push({
            id: `${key}-${Date.now()}`,
            type: alertType,
            message: `${key.replace(/([A-Z])/g, ' $1').trim()} exceeded threshold`,
            value,
            threshold,
            timestamp: new Date()
          })
        }
      }
    })

    setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)) // Keep last 10 alerts
  }, [alertThresholds])

  // Collect all metrics
  const collectMetrics = useCallback(() => {
    if (!isMonitoring || typeof window === 'undefined') return

    const pageLoadMetrics = measurePageLoad()
    const runtimeMetrics = measureRuntimePerformance()
    const bundleSize = getBundleSize()

    const allMetrics: PerformanceMetrics = {
      ...metrics,
      ...pageLoadMetrics,
      ...runtimeMetrics,
      bundleSize,
      renderTime: 0 * 50 + 10, // Mock render time
    }

    setMetrics(allMetrics)
    setLastUpdate(new Date())
    
    checkAlerts(allMetrics)
    
    if (onPerformanceUpdate) {
      onPerformanceUpdate(allMetrics)
    }
  }, [measurePageLoad, measureRuntimePerformance, getBundleSize, metrics, isMonitoring, checkAlerts, onPerformanceUpdate])

  // Start monitoring
  useEffect(() => {
    if (!enabled) return

    // Initial measurement
    collectMetrics()

    // Set up periodic monitoring
    monitoringRef.current = setInterval(collectMetrics, 5000)

    return () => {
      if (monitoringRef.current) {
        clearInterval(monitoringRef.current)
      }
    }
  }, [enabled, collectMetrics])

  // Get performance score
  const getPerformanceScore = useCallback(() => {
    const weights = {
      pageLoadTime: 0.25,
      firstContentfulPaint: 0.2,
      largestContentfulPaint: 0.2,
      cumulativeLayoutShift: 0.15,
      firstInputDelay: 0.1,
      memoryUsage: 0.1
    }

    let score = 100
    
    Object.entries(weights).forEach(([metric, weight]) => {
      const value = metrics[metric as keyof PerformanceMetrics]
      const threshold = alertThresholds[metric as keyof typeof alertThresholds]
      
      if (typeof value === 'number' && typeof threshold === 'number') {
        const penalty = Math.min((value / threshold - 1) * 100, 100)
        score -= penalty * weight
      }
    })

    return Math.round(Math.max(0, score))
  }, [metrics, alertThresholds])

  // Export performance data
  const exportData = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts,
      score: getPerformanceScore(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${Date.now()}.json`
    a.click()
  }, [metrics, alerts, getPerformanceScore])

  const performanceScore = getPerformanceScore()
  const performanceGrade = performanceScore >= 90 ? 'A' : performanceScore >= 80 ? 'B' : performanceScore >= 70 ? 'C' : performanceScore >= 60 ? 'D' : 'F'

  if (!enabled) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
            <Badge variant={performanceScore >= 80 ? 'default' : performanceScore >= 60 ? 'secondary' : 'destructive'}>
              Grade {performanceGrade} ({performanceScore})
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? <Monitor className="h-4 w-4 mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
              {isMonitoring ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collectMetrics}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(metrics.pageLoadTime / 1000).toFixed(2)}s
              </div>
              <div className="text-sm text-gray-600">Page Load</div>
              {metrics.pageLoadTime > 3000 && (
                <TrendingUp className="h-4 w-4 text-red-500 mx-auto mt-1" />
              )}
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(metrics.firstContentfulPaint / 1000).toFixed(2)}s
              </div>
              <div className="text-sm text-gray-600">FCP</div>
              {metrics.firstContentfulPaint > 1800 && (
                <TrendingUp className="h-4 w-4 text-red-500 mx-auto mt-1" />
              )}
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
              </div>
              <div className="text-sm text-gray-600">Memory</div>
              {metrics.memoryUsage > 50 * 1024 * 1024 && (
                <TrendingUp className="h-4 w-4 text-red-500 mx-auto mt-1" />
              )}
            </div>

            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {(metrics.bundleSize / 1024).toFixed(0)}KB
              </div>
              <div className="text-sm text-gray-600">Bundle Size</div>
              {metrics.bundleSize > 200000 && (
                <TrendingUp className="h-4 w-4 text-red-500 mx-auto mt-1" />
              )}
            </div>
          </div>

          {/* Performance Gauge */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={performanceScore >= 80 ? '#10b981' : performanceScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - performanceScore / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{performanceScore}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Recent Alerts
              </h4>
              <div className="space-y-1">
                {alerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className={`flex items-center gap-2 p-2 rounded text-sm ${
                    alert.type === 'error' ? 'bg-red-50 text-red-700' :
                    alert.type === 'warning' ? 'bg-orange-50 text-orange-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {alert.type === 'error' ? <AlertTriangle className="h-3 w-3" /> :
                     alert.type === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
                     <CheckCircle className="h-3 w-3" />}
                    <span className="flex-1">{alert.message}</span>
                    <span className="text-xs">{alert.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Update */}
          <div className="text-xs text-gray-500 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}