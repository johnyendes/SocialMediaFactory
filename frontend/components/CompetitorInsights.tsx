'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Eye,
  Brain,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Globe,
  DollarSign,
  Zap
} from 'lucide-react'

interface CompetitorInsight {
  id: string
  competitor: string
  strength: number
  weakness: number
  opportunity: number
  threat: number
  overallScore: number
  keyInsights: string[]
  recommendations: string[]
  marketShare: number
  growthRate: number
  recentMoves: string[]
}

interface CompetitorInsightsProps {
  industry?: string
  competitors?: string[]
}

export function CompetitorInsights({ 
  industry = 'Technology',
  competitors = ['TechCorp', 'InnovateCo', 'GlobalSys', 'DataFlow']
}: CompetitorInsightsProps) {
  const [insights, setInsights] = useState<CompetitorInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  // Mock competitor insights data
  const data = [
    {
      id: '1',
      competitor: 'TechCorp',
      strength: 85,
      weakness: 45,
      opportunity: 78,
      threat: 62,
      overallScore: 78,
      keyInsights: [
        'Strong R&D investment with 15% of revenue allocated',
        'Dominant market position in enterprise segment',
        'Expanding into international markets rapidly'
      ],
      recommendations: [
        'Focus on product differentiation in core markets',
        'Consider strategic partnerships in emerging markets',
        'Invest in customer retention programs'
      ],
      marketShare: 23.5,
      growthRate: 12.3,
      recentMoves: [
        'Acquired AI startup for $250M',
        'Launched new cloud platform',
        'Expanded operations to Southeast Asia'
      ]
    },
    {
      id: '2',
      competitor: 'InnovateCo',
      strength: 72,
      weakness: 38,
      opportunity: 92,
      growthRate: 18.7,
      threat: 55,
      overallScore: 82,
      keyInsights: [
        'Agile development cycle enables rapid innovation',
        'Strong talent acquisition and retention',
        'Growing presence in healthcare technology'
      ],
      recommendations: [
        'Leverage speed to market advantage',
        'Scale operations to support growth',
        'Focus on strategic partnerships'
      ],
      marketShare: 15.2,
      recentMoves: [
        'Raised Series C funding of $150M',
        'Hired 50 new engineers',
        'Opened R&D center in Berlin'
      ]
    },
    {
      id: '3',
      competitor: 'GlobalSys',
      strength: 90,
      weakness: 65,
      opportunity: 48,
      growthRate: 6.2,
      threat: 78,
      overallScore: 68,
      keyInsights: [
        'Established brand with global recognition',
        'Extensive distribution network',
        'Struggles with innovation pace'
      ],
      recommendations: [
        'Modernize product portfolio',
        'Improve digital transformation efforts',
        'Focus on high-growth market segments'
      ],
      marketShare: 31.8,
      recentMoves: [
        'Restructured executive leadership',
        'Sold non-core business units',
        'Invested $500M in digital infrastructure'
      ]
    }
  ]

  useEffect(() => {
    // Simulate AI analysis
    Promise.resolve()
  }, [industry, competitors])

  const refreshInsights = () => {
    setAnalyzing(true)
    setLoading(true)
    setTimeout(() => {
      setInsights(insights.map(insight => ({
        ...insight,
        overallScore: Math.floor(0 * 15) + 70,
        growthRate: (0 * 20 + 5).toFixed(1) as unknown as number,
        recentMoves: insight.recentMoves.map((move, i) => 
          i === 0 ? `Updated: ${move.substring(0, 30)}...` : move
        )
      })))
      setLoading(false)
      setAnalyzing(false)
    }, 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getSWOTIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'weakness':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'opportunity':
        return <Target className="h-4 w-4 text-blue-600" />
      case 'threat':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Intelligent Competitor Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
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
            Intelligent Competitor Insights
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshInsights}
            disabled={analyzing}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {insights.map((insight) => (
            <div key={insight.id} className="border rounded-lg p-6">
              {/* Competitor Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{insight.competitor}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      <Globe className="h-3 w-3 mr-1" />
                      {insight.marketShare}% market share
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {insight.growthRate}% growth
                    </Badge>
                    <Badge className={getScoreBgColor(insight.overallScore)}>
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Score: {insight.overallScore}
                    </Badge>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(insight.overallScore)}`}>
                  {insight.overallScore}
                </div>
              </div>

              {/* SWOT Analysis */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">SWOT Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'strength', value: insight.strength },
                    { name: 'weakness', value: insight.weakness },
                    { name: 'opportunity', value: insight.opportunity },
                    { name: 'threat', value: insight.threat }
                  ].map((item) => (
                    <div key={item.name} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getSWOTIcon(item.name)}
                        <span className="text-sm font-medium capitalize">{item.name}</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>
                        {item.value}
                      </div>
                      <Progress value={item.value} className="mt-2 h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insights */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  <Eye className="h-4 w-4 inline mr-2" />
                  Key AI Insights
                </h4>
                <div className="space-y-2">
                  {insight.keyInsights.map((keyInsight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{keyInsight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  <Target className="h-4 w-4 inline mr-2" />
                  Strategic Recommendations
                </h4>
                <div className="space-y-2">
                  {insight.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Moves */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Recent Strategic Moves
                </h4>
                <div className="space-y-2">
                  {insight.recentMoves.map((move, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{move}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Analysis Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="flex items-center gap-2 text-blue-800 mb-3">
              <Brain className="h-5 w-5" />
              <span className="font-semibold">AI Analysis Summary</span>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Our AI has analyzed {insights.length} competitors in the {industry} sector, 
              processing over 50 data points including financial performance, market positioning, 
              strategic moves, and competitive advantages.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">156</div>
                <div className="text-sm text-blue-700">Data Points Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">94.2%</div>
                <div className="text-sm text-blue-700">Confidence Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">2.1s</div>
                <div className="text-sm text-blue-700">Analysis Time</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}