'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'trend' | 'opportunity' | 'risk' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  timeframe: string
  actionable: boolean
}

interface AIInsightsProps {
  industry?: string
  market?: string
  timeRange?: string
}

export function AIInsights({ industry = 'Technology', market = 'Global', timeRange = '30d' }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  // Mock AI insights data
  const data = [
    {
      id: '1',
      type: 'trend',
      title: 'AI Market Growth Acceleration',
      description: 'The AI technology sector is experiencing unprecedented growth with a 45% increase in investment over the last quarter. Enterprise adoption is driving this surge.',
      confidence: 92,
      impact: 'high',
      timeframe: 'Next 6 months',
      actionable: true
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Emerging Market in Southeast Asia',
      description: 'Southeast Asian markets show 78% higher growth potential for SaaS products compared to established markets.',
      confidence: 85,
      impact: 'high',
      timeframe: 'Next 3 months',
      actionable: true
    },
    {
      id: '3',
      type: 'risk',
      title: 'Regulatory Changes in EU',
      description: 'New GDPR-style regulations for AI systems may impact deployment timelines for European markets.',
      confidence: 78,
      impact: 'medium',
      timeframe: 'Next 12 months',
      actionable: true
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Diversify into Healthcare AI',
      description: 'Healthcare AI sector shows 3.2x higher ROI potential than general AI applications.',
      confidence: 88,
      impact: 'high',
      timeframe: 'Next 9 months',
      actionable: true
    }
  ]

  useEffect(() => {
    // Simulate AI analysis
    Promise.resolve()
  }, [industry, market, timeRange])

  const refreshInsights = async () => {
    setAnalyzing(true)
    setLoading(true)
    setTimeout(async () => {
      // Load real data from API
      try {
        const response = await fetch('/api/aiinsights')
        if (response.ok) {
          const data = await response.json()
          setInsights(data.data || [])
        }
      } catch (error) {
        console.error('Error loading AI insights:', error)
      } finally {
        setLoading(false)
      }
      setLoading(false)
      setAnalyzing(false)
    }, 1500)
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5" />
      case 'opportunity':
        return <Target className="h-5 w-5" />
      case 'risk':
        return <AlertCircle className="h-5 w-5" />
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend':
        return 'text-blue-600 bg-blue-50'
      case 'opportunity':
        return 'text-green-600 bg-green-50'
      case 'risk':
        return 'text-red-600 bg-red-50'
      case 'recommendation':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Market Insights
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshInsights}
            disabled={analyzing}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {analyzing ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={getImpactColor(insight.impact)}>
                    {insight.impact} impact
                  </Badge>
                  <Badge variant="outline">
                    {insight.confidence}% confidence
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {insight.timeframe}
                  </span>
                </div>
                
                {insight.actionable && (
                  <Button variant="outline" size="sm">
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">AI Analysis Complete</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Based on analysis of {industry} market data, competitive landscape, and emerging trends.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}