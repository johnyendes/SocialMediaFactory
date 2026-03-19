'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RecommendationEngine } from '@/components/RecommendationEngine'
import { UserBehaviorTracking } from '@/components/UserBehaviorTracking'
import { 
  User, 
  Brain, 
  Settings, 
  Bell,
  Shield,
  Palette,
  Zap,
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react'

interface PersonalizationMetrics {
  recommendationsAccuracy: number
  userSatisfaction: number
  engagementIncrease: number
  timeSaved: string
  personalizationScore: number
  lastUpdate: string
}

export default function PersonalizationPage() {
  const [metrics, setMetrics] = useState<PersonalizationMetrics>({
    recommendationsAccuracy: 0,
    userSatisfaction: 0,
    engagementIncrease: 0,
    timeSaved: '',
    personalizationScore: 0,
    lastUpdate: ''
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'behavior' | 'preferences'>('overview')

  const fetchPersonalizationMetrics = async (): Promise<PersonalizationMetrics> => {
    try {
      const response = await fetch('/api/personalization/metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch personalization metrics')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching personalization metrics:', error)
      // Return default metrics for graceful degradation
      return {
        recommendationsAccuracy: 0,
        userSatisfaction: 0,
        engagementIncrease: 0,
        timeSaved: '0h 0m per week',
        personalizationScore: 0,
        lastUpdate: 'No data'
      }
    }
  }

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await fetchPersonalizationMetrics()
      setMetrics(data)
    }
    loadMetrics()

    // Set up real-time updates
    const interval = setInterval(loadMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'recommendations', label: 'AI Recommendations', icon: <Brain className="h-4 w-4" /> },
    { id: 'behavior', label: 'Behavior Tracking', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Settings className="h-4 w-4" /> }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Personalization Center</h1>
            <p className="text-gray-600 mt-2">AI-powered personalization and user behavior analytics</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Optimize
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
            {/* Personalization Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Personalization Score
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on your interaction patterns and preferences
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">{metrics.personalizationScore}%</div>
                  <div className="text-sm text-gray-600">Highly Personalized</div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metrics.recommendationsAccuracy}%</div>
                      <div className="text-sm text-gray-600">AI Accuracy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metrics.engagementIncrease}%</div>
                      <div className="text-sm text-gray-600">Engagement ↑</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metrics.timeSaved}</div>
                      <div className="text-sm text-gray-600">Time Saved/Week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Target className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metrics.userSatisfaction}%</div>
                      <div className="text-sm text-gray-600">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personalization Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Active Personalizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">AI Recommendations</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Behavior Tracking</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Learning</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Smart Filters</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Optimized</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Personalized Alerts</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Configured</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recent Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="text-sm font-medium">Recommendation Quality</div>
                        <div className="text-xs text-gray-500">Improved by 12% this week</div>
                      </div>
                      <Badge variant="outline">+12%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="text-sm font-medium">Response Time</div>
                        <div className="text-xs text-gray-500">23% faster than last month</div>
                      </div>
                      <Badge variant="outline">-23%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="text-sm font-medium">User Engagement</div>
                        <div className="text-xs text-gray-500">45% increase in interactions</div>
                      </div>
                      <Badge variant="outline">+45%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="text-sm font-medium">Feature Adoption</div>
                        <div className="text-xs text-gray-500">8 new features adopted</div>
                      </div>
                      <Badge variant="outline">+8</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Personalization Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Refresh AI Profile
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Customize Interface
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Recommendations Tab */}
        {activeTab === 'recommendations' && <RecommendationEngine />}

        {/* Behavior Tracking Tab */}
        {activeTab === 'behavior' && <UserBehaviorTracking />}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Personalization Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Content Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Industries of Interest</label>
                        <div className="flex flex-wrap gap-2">
                          {['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'].map((industry) => (
                            <Badge key={industry} variant="outline" className="cursor-pointer hover:bg-gray-100">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Size Focus</label>
                        <div className="flex flex-wrap gap-2">
                          {['Startup', 'SMB', 'Mid-Market', 'Enterprise'].map((size) => (
                            <Badge key={size} variant="outline" className="cursor-pointer hover:bg-gray-100">
                              {size}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Notification Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">AI Recommendations</div>
                          <div className="text-xs text-gray-500">Get personalized insights and opportunities</div>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Market Alerts</div>
                          <div className="text-xs text-gray-500">Important market changes and updates</div>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Competitor Updates</div>
                          <div className="text-xs text-gray-500">Track your competitors' activities</div>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Display Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Layout</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>Compact</option>
                          <option>Standard</option>
                          <option>Detailed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Time Range</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>Last 7 days</option>
                          <option>Last 30 days</option>
                          <option>Last 90 days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}