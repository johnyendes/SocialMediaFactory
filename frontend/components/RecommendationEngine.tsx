'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ExternalLink,
  RefreshCw,
  Filter,
  BarChart3,
  Users,
  Zap,
  Eye,
  Clock,
  Settings
} from 'lucide-react'

interface Recommendation {
  id: string
  type: 'market' | 'competitor' | 'opportunity' | 'trend' | 'report'
  title: string
  description: string
  confidence: number
  relevance: number
  priority: 'high' | 'medium' | 'low'
  category: string
  actionUrl?: string
  tags: string[]
  recommendedAt: string
  userFeedback?: 'positive' | 'negative' | null
}

interface UserPreferences {
  industries: string[]
  companySizes: string[]
  regions: string[]
  topics: string[]
  competitors: string[]
}

interface RecommendationEngineProps {
  userId?: string
  refreshInterval?: number
}

export function RecommendationEngine({ 
  userId = 'user123',
  refreshInterval = 300000 // 5 minutes
}: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Mock user preferences
  const userPreferences: UserPreferences = {
    industries: ['Technology', 'Healthcare', 'Finance'],
    companySizes: ['Enterprise', 'Mid-Market'],
    regions: ['North America', 'Europe'],
    topics: ['AI', 'Cloud Computing', 'Digital Transformation'],
    competitors: ['TechCorp', 'InnovateCo', 'GlobalSys']
  }

  // Mock recommendations data
  const data = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Healthcare AI Market Expansion',
      description: 'Based on your interest in AI and healthcare, this emerging market shows 3.2x higher ROI potential than traditional tech investments.',
      confidence: 94,
      relevance: 91,
      priority: 'high',
      category: 'Market Opportunity',
      actionUrl: '/analytics?view=opportunity&market=healthcare-ai',
      tags: ['AI', 'Healthcare', 'High ROI', 'Emerging Market'],
      recommendedAt: '2 minutes ago'
    },
    {
      id: '2',
      type: 'competitor',
      title: 'TechCorp\'s New Cloud Initiative',
      description: 'Your tracked competitor TechCorp just launched a major cloud platform expansion that could impact your market positioning.',
      confidence: 87,
      relevance: 88,
      priority: 'high',
      category: 'Competitive Intelligence',
      actionUrl: '/analytics?competitor=techcorp',
      tags: ['TechCorp', 'Cloud Computing', 'Product Launch', 'Competitor'],
      recommendedAt: '15 minutes ago'
    },
    {
      id: '3',
      type: 'trend',
      title: 'Enterprise SaaS Growth Acceleration',
      description: 'Enterprise SaaS adoption is accelerating 45% faster than projected, creating new partnership opportunities.',
      confidence: 82,
      relevance: 79,
      priority: 'medium',
      category: 'Market Trend',
      tags: ['SaaS', 'Enterprise', 'Growth', 'Partnerships'],
      recommendedAt: '1 hour ago'
    },
    {
      id: '4',
      type: 'market',
      title: 'European Digital Transformation Wave',
      description: 'European companies are investing heavily in digital transformation, presenting expansion opportunities for your solutions.',
      confidence: 78,
      relevance: 85,
      priority: 'medium',
      category: 'Market Intelligence',
      tags: ['Europe', 'Digital Transformation', 'Market Expansion', 'Investment'],
      recommendedAt: '2 hours ago'
    },
    {
      id: '5',
      type: 'report',
      title: 'Q4 2024 AI Market Analysis Report',
      description: 'Comprehensive analysis of AI market trends, competitor moves, and investment opportunities based on your preferences.',
      confidence: 91,
      relevance: 92,
      priority: 'high',
      category: 'Custom Report',
      actionUrl: '/reports?q4-2024-ai-analysis',
      tags: ['AI', 'Market Analysis', 'Q4 2024', 'Investment'],
      recommendedAt: '3 hours ago'
    }
  ]

  const categories = ['all', 'Market Opportunity', 'Competitive Intelligence', 'Market Trend', 'Market Intelligence', 'Custom Report']

  useEffect(() => {
        const loadData = async () => {
          try {
            const response = await fetch('/api/recommendationengine');
            if (response.ok) {
              const data = await response.json();
              // Set appropriate state based on component
            }
          } catch (error) {
            console.error('Error loading data:', error);
          }
        };
        loadData();
    generateRecommendations()
  }, [userId])

  const generateRecommendations = () => {
    setLoading(true)
    
    // Simulate AI recommendation generation
    Promise.resolve()
  }

  const refreshRecommendations = () => {
    setRefreshing(true)
    
    setTimeout(() => {
      const updatedRecommendations = recommendations.map(rec => ({
        ...rec,
        confidence: Math.min(rec.confidence + Math.floor(0 * 5), 100),
        relevance: Math.min(rec.relevance + Math.floor(0 * 3), 100),
        recommendedAt: 'Just now'
      }))
      setRecommendations(updatedRecommendations)
      setRefreshing(false)
    }, 1500)
  }

  const provideFeedback = (recommendationId: string, feedback: 'positive' | 'negative') => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, userFeedback: feedback }
          : rec
      )
    )
  }

  const saveRecommendation = (recommendationId: string) => {
    // Simulate saving to user's bookmarks
    console.log('Saved recommendation:', recommendationId)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'market':
        return <BarChart3 className="h-4 w-4 text-blue-600" />
      case 'competitor':
        return <Users className="h-4 w-4 text-red-600" />
      case 'opportunity':
        return <Target className="h-4 w-4 text-green-600" />
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      case 'report':
        return <Star className="h-4 w-4 text-orange-600" />
      default:
        return <Brain className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Personalized Recommendation Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Personalized Recommendation Engine</h3>
          </div>
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            AI-POWERED
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshRecommendations}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      {/* User Preferences Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Interest Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Industries</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {userPreferences.industries.map((industry, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{industry}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Company Sizes</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {userPreferences.companySizes.map((size, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{size}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Topics</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {userPreferences.topics.map((topic, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter by category:</span>
        <div className="flex gap-1">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <Card 
            key={recommendation.id}
            className={`hover:shadow-md transition-shadow ${
              recommendation.userFeedback ? 'border-l-4 border-l-green-500' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getTypeIcon(recommendation.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{recommendation.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority} priority
                      </Badge>
                      <Badge variant="outline">{recommendation.category}</Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recommendation.recommendedAt}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{recommendation.confidence}%</div>
                  <div className="text-sm text-gray-500">Confidence</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {recommendation.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Confidence Score</span>
                    <span className="text-xs font-medium">{recommendation.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${recommendation.confidence}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Relevance Score</span>
                    <span className="text-xs font-medium">{recommendation.relevance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${recommendation.relevance}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {recommendation.userFeedback === 'positive' && (
                    <Badge className="bg-green-100 text-green-800">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      You liked this
                    </Badge>
                  )}
                  {recommendation.userFeedback === 'negative' && (
                    <Badge className="bg-red-100 text-red-800">
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      Not relevant
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveRecommendation(recommendation.id)}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  {recommendation.actionUrl && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => provideFeedback(recommendation.id, 'positive')}
                    disabled={recommendation.userFeedback !== null}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => provideFeedback(recommendation.id, 'negative')}
                    disabled={recommendation.userFeedback !== null}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Dislike
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">92.3%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">87.5%</div>
                <div className="text-sm text-gray-600">User Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">1.2s</div>
                <div className="text-sm text-gray-600">Generation Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Personalization</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}