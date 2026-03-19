'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Brain, 
  TrendingUp, 
  Target,
  Globe,
  Users,
  DollarSign,
  Clock,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface SummarySection {
  id: string
  title: string
  content: string
  confidence: number
  dataPoints: number
  keyFindings: string[]
}

interface MarketSummary {
  id: string
  title: string
  generatedAt: string
  timeRange: string
  market: string
  overall: {
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    trend: 'up' | 'down' | 'stable'
  }
  sections: SummarySection[]
  recommendations: string[]
}

interface MarketSummaryProps {
  market?: string
  timeRange?: string
  refreshInterval?: number
}

export function MarketSummary({ 
  market = 'Technology',
  timeRange = '30d',
  refreshInterval = 300000 // 5 minutes
}: MarketSummaryProps) {
  const [summary, setSummary] = useState<MarketSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Mock market summary data
  const mockSummary: MarketSummary = {
    id: '1',
    title: `${market} Market Intelligence Summary`,
    generatedAt: new Date().toISOString(),
    timeRange: timeRange,
    market: market,
    overall: {
      sentiment: 'positive',
      confidence: 92,
      trend: 'up'
    },
    sections: [
      {
        id: 'market-overview',
        title: 'Market Overview',
        content: 'The technology market continues to show robust growth with enterprise software leading the expansion. Cloud computing and AI technologies are driving significant investment, with total market capitalization increasing by 15.3% over the analyzed period. Emerging markets in Southeast Asia and Latin America are contributing to global growth momentum.',
        confidence: 94,
        dataPoints: 1247,
        keyFindings: [
          'Enterprise software segment grew 23.4% year-over-year',
          'AI adoption accelerated by 45% in enterprise sector',
          'Cloud infrastructure spending reached $42.3B globally',
          'Emerging markets show 2.8x higher growth rates than developed markets'
        ]
      },
      {
        id: 'competitive-landscape',
        title: 'Competitive Landscape',
        content: 'The competitive landscape is becoming increasingly dynamic with established players investing heavily in AI capabilities and new entrants disrupting traditional segments. M&A activity increased by 28% with total deal value exceeding $15.2B. Strategic partnerships are forming around AI integration and cloud services.',
        confidence: 88,
        dataPoints: 843,
        keyFindings: [
          'Top 5 players control 42% of market share',
          'M&A activity increased by 28% YoY',
          'Average company valuation increased by 34%',
          'New AI-focused startups raised $8.7B in funding'
        ]
      },
      {
        id: 'investment-trends',
        title: 'Investment Trends',
        content: 'Investment patterns show strong preference for AI-enabled solutions and sustainable technologies. Venture capital funding concentrated in late-stage rounds with average deal size increasing to $25.3M. Corporate venture arms are becoming more active, representing 34% of total investment.',
        confidence: 91,
        dataPoints: 623,
        keyFindings: [
          'VC funding increased 18% to $28.4B',
          'Late-stage deals represent 67% of total funding',
          'Corporate venture participation reached 34%',
          'AI-focused companies received 43% of total investment'
        ]
      },
      {
        id: 'future-outlook',
        title: 'Future Outlook',
        content: 'Market projections indicate continued growth trajectory with expected CAGR of 12.7% through 2025. Key growth drivers include digital transformation initiatives, AI integration, and expanding enterprise needs. Regulatory changes may impact certain segments but overall outlook remains positive.',
        confidence: 87,
        dataPoints: 412,
        keyFindings: [
          'Projected market growth: 12.7% CAGR through 2025',
          'AI market expected to reach $190B by 2025',
          'Digital transformation spending to increase 23%',
          'Emerging technologies will create 2.1M new jobs'
        ]
      }
    ],
    recommendations: [
      'Focus on AI integration in core products to capture market momentum',
      'Consider strategic partnerships for cloud service expansion',
      'Monitor regulatory developments in data privacy and AI governance',
      'Invest in talent acquisition for AI and machine learning capabilities',
      'Explore emerging market opportunities in Southeast Asia and Latin America'
    ]
  }

  useEffect(() => {
    generateSummary()
  }, [market, timeRange])

  const generateSummary = () => {
    setGenerating(true)
    setLoading(true)
    
    // Simulate AI analysis and summary generation
    Promise.resolve()
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'negative':
        return <Target className="h-4 w-4 text-red-600" />
      default:
        return <Globe className="h-4 w-4 text-gray-600" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'down':
        return <Target className="h-3 w-3 text-red-600" />
      default:
        return <Globe className="h-3 w-3 text-gray-600" />
    }
  }

  const exportSummary = () => {
    // Simulate export functionality
    const summaryData = JSON.stringify(summary, null, 2)
    const blob = new Blob([summaryData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `market-summary-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Automated Market Research Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Automated Market Research Summary
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateSummary}
              disabled={generating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm" onClick={exportSummary}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Header */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{summary.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Generated {new Date(summary.generatedAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{summary.timeRange} analysis</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getSentimentColor(summary.overall.sentiment).split(' ')[0]}`}>
                {summary.overall.confidence}%
              </div>
              <div className="text-sm text-gray-600">AI Confidence</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={getSentimentColor(summary.overall.sentiment)}>
              {getSentimentIcon(summary.overall.sentiment)}
              <span className="ml-1 capitalize">{summary.overall.sentiment} sentiment</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {getTrendIcon(summary.overall.trend)}
              <span className="capitalize">{summary.overall.trend} trend</span>
            </Badge>
            <Badge variant="outline">
              <FileText className="h-3 w-3 mr-1" />
              {summary.sections.length} sections analyzed
            </Badge>
          </div>
        </div>

        {/* Analysis Sections */}
        <div className="space-y-6 mb-6">
          {summary.sections.map((section) => (
            <div key={section.id} className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <Badge variant="outline">
                      {section.confidence}% confidence
                    </Badge>
                    <Badge variant="secondary">
                      {section.dataPoints} data points
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>
              
              <div>
                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Key Findings
                </h5>
                <ul className="space-y-2">
                  {section.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategic Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {summary.sections.reduce((sum, section) => sum + section.dataPoints, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Data Points Analyzed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">2.3s</div>
            <div className="text-sm text-gray-600">Analysis Time</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">15</div>
            <div className="text-sm text-gray-600">Sources Processed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(summary.sections.reduce((sum, section) => sum + section.confidence, 0) / summary.sections.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg. Confidence</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}