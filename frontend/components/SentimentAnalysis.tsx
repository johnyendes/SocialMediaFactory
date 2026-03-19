'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  MessageCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ThumbsUp,
  ThumbsDown,
  Brain,
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react'

interface SentimentData {
  source: string
  positive: number
  negative: number
  neutral: number
  overall: 'positive' | 'negative' | 'neutral'
  mentions: number
  trend: 'up' | 'down' | 'stable'
  keyTopics: string[]
  sampleQuotes: string[]
}

interface SentimentAnalysisProps {
  company?: string
  industry?: string
  timeRange?: string
}

export function SentimentAnalysis({ 
  company = 'TechCorp',
  industry = 'Technology',
  timeRange = '7d'
}: SentimentAnalysisProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  // Mock sentiment analysis data
  const data = [
    {
      source: 'Social Media',
      positive: 68,
      negative: 12,
      neutral: 20,
      overall: 'positive',
      mentions: 15432,
      trend: 'up',
      keyTopics: ['Innovation', 'Customer Service', 'Product Quality'],
      sampleQuotes: [
        'Great experience with their new product features',
        'Customer support team was very helpful',
        'Impressed by their commitment to sustainability'
      ]
    },
    {
      source: 'News Articles',
      positive: 72,
      negative: 8,
      neutral: 20,
      overall: 'positive',
      mentions: 3847,
      trend: 'up',
      keyTopics: ['Market Leadership', 'Financial Performance', 'Strategic Moves'],
      sampleQuotes: [
        'Company shows strong growth in quarterly earnings',
        'Innovation strategy positions them well for future',
        'Expansion into new markets showing positive results'
      ]
    },
    {
      source: 'Customer Reviews',
      positive: 85,
      negative: 10,
      neutral: 5,
      overall: 'positive',
      mentions: 8743,
      trend: 'stable',
      keyTopics: ['Product Reliability', 'User Experience', 'Value for Money'],
      sampleQuotes: [
        'Product exceeded expectations in performance',
        'Easy to use and implement',
        'Great ROI for our business'
      ]
    },
    {
      source: 'Industry Forums',
      positive: 62,
      negative: 18,
      neutral: 20,
      overall: 'positive',
      mentions: 2156,
      trend: 'down',
      keyTopics: ['Technical Support', 'Integration', 'Pricing'],
      sampleQuotes: [
        'Technical documentation could be improved',
        'Integration with third-party tools seamless',
        'Pricing is competitive for the features offered'
      ]
    }
  ]

  useEffect(() => {
        const loadData = async () => {
          try {
            const response = await fetch('/api/sentimentanalysis');
            if (response.ok) {
              const data = await response.json();
              // Set appropriate state based on component
            }
          } catch (error) {
            console.error('Error loading data:', error);
          }
        };
        loadData();
    // Simulate sentiment analysis
    Promise.resolve()
  }, [company, industry, timeRange])

  const refreshAnalysis = () => {
    setAnalyzing(true)
    setLoading(true)
    setTimeout(() => {
      setSentimentData(sentimentData.map(data => ({
        ...data,
        positive: Math.floor(0 * 25) + 60,
        negative: Math.floor(0 * 15) + 5,
        neutral: Math.floor(0 * 20) + 10,
        mentions: Math.floor(0 * 5000) + 2000
      })))
      setLoading(false)
      setAnalyzing(false)
    }, 2000)
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-600" />
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
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
        return <TrendingDown className="h-3 w-3 text-red-600" />
      default:
        return <Minus className="h-3 w-3 text-gray-600" />
    }
  }

  const calculateOverallSentiment = () => {
    if (sentimentData.length === 0) return { sentiment: 'neutral', score: 0 }
    
    const totalPositive = sentimentData.reduce((sum, data) => sum + data.positive, 0)
    const totalNegative = sentimentData.reduce((sum, data) => sum + data.negative, 0)
    const totalMentions = sentimentData.reduce((sum, data) => sum + data.mentions, 0)
    
    const overallScore = ((totalPositive - totalNegative) / (totalMentions * 0.01)) * 100
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (overallScore > 10) sentiment = 'positive'
    else if (overallScore < -10) sentiment = 'negative'
    
    return { sentiment, score: Math.abs(overallScore) }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Market Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/5"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const overallSentiment = calculateOverallSentiment()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Market Sentiment Analysis
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            {analyzing ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Sentiment Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${getSentimentColor(overallSentiment.sentiment)}`}>
                {getSentimentIcon(overallSentiment.sentiment)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Overall Market Sentiment: <span className="capitalize">{overallSentiment.sentiment}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Based on analysis of {sentimentData.reduce((sum, data) => sum + data.mentions, 0).toLocaleString()} mentions
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {overallSentiment.score.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Sentiment Score</div>
            </div>
          </div>
        </div>

        {/* Sentiment by Source */}
        <div className="space-y-6">
          {sentimentData.map((data, index) => (
            <div key={index} className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{data.source}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={getSentimentColor(data.overall)}>
                      {getSentimentIcon(data.overall)}
                      <span className="ml-1 capitalize">{data.overall}</span>
                    </Badge>
                    <Badge variant="outline">
                      {data.mentions.toLocaleString()} mentions
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getTrendIcon(data.trend)}
                      <span className="capitalize">{data.trend}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Sentiment Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-24">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Positive</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={data.positive} className="h-3" />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{data.positive}%</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-24">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Negative</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={data.negative} className="h-3" />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{data.negative}%</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-24">
                    <Minus className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Neutral</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={data.neutral} className="h-3" />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{data.neutral}%</span>
                </div>
              </div>

              {/* Key Topics */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Key Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.keyTopics.map((topic, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sample Quotes */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Sample Mentions
                </h4>
                <div className="space-y-2">
                  {data.sampleQuotes.slice(0, 2).map((quote, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic">
                      "{quote}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analysis Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Brain className="h-5 w-5" />
            <span className="font-medium">AI-Powered Insights</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Sentiment has improved by 15% over the analyzed time period</li>
            <li>• Customer reviews show the highest positive sentiment at 85%</li>
            <li>• Main concerns are around technical support in industry forums</li>
            <li>• Social media mentions increased by 23% compared to last period</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}