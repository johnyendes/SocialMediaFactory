'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AIInsights } from '@/components/AIInsights'
import PredictiveScoring from '@/components/PredictiveScoring'
import { RealTimeMonitoring } from '@/components/RealTimeMonitoring'
import { ReportBuilder } from '@/components/ReportBuilder'
import { MarketSummary } from '@/components/MarketSummary'
import { MarketTrendPredictions } from '@/components/MarketTrendPredictions'
import { CompetitiveIntelligenceHeatmap } from '@/components/CompetitiveIntelligenceHeatmap'
import { AdvancedExportReport } from '@/components/AdvancedExportReport'
import { AdvancedSearch } from '@/components/AdvancedSearch'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { 
  Activity, 
  TrendingUp, 
  Users, 
  DollarSign,
  BarChart3,
  Brain,
  Target,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react'

interface AnalyticsMetrics {
  totalAnalyzed: number
  accuracyRate: number
  processingSpeed: number
  predictionsMade: number
  successRate: number
  activeModels: number
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalAnalyzed: 0,
    accuracyRate: 0,
    processingSpeed: 0,
    predictionsMade: 0,
    successRate: 0,
    activeModels: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchAnalyticsMetrics = async (): Promise<AnalyticsMetrics> => {
    try {
      const response = await fetch('/api/analytics/metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics metrics')
      }
      const data = await response.json()
      return {
        totalAnalyzed: data.totalAnalyzed || 0,
        accuracyRate: data.accuracyRate || 0,
        processingSpeed: data.processingSpeed || 0,
        predictionsMade: data.predictionsMade || 0,
        successRate: data.successRate || 0,
        activeModels: data.activeModels || 0
      }
    } catch (error) {
      console.error('Error fetching analytics metrics:', error)
      // Return default metrics for graceful degradation
      return {
        totalAnalyzed: 0,
        accuracyRate: 0,
        processingSpeed: 0,
        predictionsMade: 0,
        successRate: 0,
        activeModels: 0
      }
    }
  }

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchAnalyticsMetrics()
        setMetrics(data)
        setLoading(false)
      } catch (error) {
        console.error('Error loading analytics metrics:', error)
        setLoading(false)
      }
    }
    loadMetrics()
  }, [])

  const refreshData = async () => {
    setLoading(true)
    try {
      const data = await fetchAnalyticsMetrics()
      setMetrics(data)
    } catch (error) {
      console.error('Error refreshing analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const metricCards = [
    {
      title: 'Total Analyzed',
      value: metrics.totalAnalyzed.toLocaleString(),
      change: '+12.5%',
      icon: <Activity className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'AI Accuracy Rate',
      value: `${metrics.accuracyRate}%`,
      change: '+2.1%',
      icon: <Brain className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Processing Speed',
      value: `${metrics.processingSpeed}s`,
      change: '-0.3s',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate}%`,
      change: '+5.2%',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-orange-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-gray-600 mt-2">AI-powered market intelligence and predictive analytics</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" disabled>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-2">AI-powered market intelligence and predictive analytics</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((metric, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${metric.color}20`}>
                      {metric.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                      <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-green-600">
                      {metric.change}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Insights Section */}
        <AIInsights />

        {/* Predictive Scoring Section */}
        <PredictiveScoring />

        {/* Real-Time Monitoring Section */}
        <RealTimeMonitoring />

        {/* Report Builder Section */}
        <ReportBuilder />

        {/* Market Summary Section */}
        <MarketSummary />

        {/* Day 5 Advanced Features */}
        
        {/* Market Trend Predictions */}
        <MarketTrendPredictions />

        {/* Competitive Intelligence Heatmap */}
        <CompetitiveIntelligenceHeatmap />

        {/* Advanced Export & Reporting */}
        <AdvancedExportReport />

        {/* Advanced Search */}
        <AdvancedSearch 
          onSearch={(query, intent) => {
            console.log('Search:', query, intent)
          }}
        />

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Theme Preferences</h4>
                <div className="space-y-2">
                  <DarkModeToggle />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Model Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Models</span>
                  <span className="text-sm font-bold">{metrics.activeModels}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Predictions Made</span>
                  <span className="text-sm font-bold">{metrics.predictionsMade.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm font-bold">2 min ago</span>
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
                <Users className="h-5 w-5" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Users</span>
                  <span className="text-sm font-bold">247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Queries Today</span>
                  <span className="text-sm font-bold">1,843</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg. Session</span>
                  <span className="text-sm font-bold">14m 32s</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-green-600 font-medium">
                    ↑ 18% from yesterday
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">API Credits Used</span>
                  <span className="text-sm font-bold">8,432</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cost This Month</span>
                  <span className="text-sm font-bold">$2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cost per Analysis</span>
                  <span className="text-sm font-bold">$0.23</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-blue-600 font-medium">
                    ↓ 12% cost optimization
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}