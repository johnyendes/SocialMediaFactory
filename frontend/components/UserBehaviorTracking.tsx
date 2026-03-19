'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Eye, 
  MousePointer, 
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  Calendar,
  FileText,
  Search,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Zap
} from 'lucide-react'

interface UserAction {
  id: string
  type: 'search' | 'filter' | 'view' | 'export' | 'bookmark' | 'share'
  action: string
  details: string
  timestamp: string
  duration?: number
  metadata: Record<string, any>
}

interface BehaviorPattern {
  id: string
  pattern: string
  frequency: number
  description: string
  impact: 'high' | 'medium' | 'low'
  recommendations: string[]
}

interface UserMetrics {
  totalActions: number
  avgSessionDuration: string
  mostActiveHour: string
  preferredFeatures: string[]
  searchQueries: string[]
  filtersUsed: string[]
  exportsGenerated: number
  bookmarksCreated: number
}

interface UserBehaviorTrackingProps {
  userId?: string
  timeframe?: string
  trackRealTime?: boolean
}

export function UserBehaviorTracking({ 
  userId = 'user123',
  timeframe = '7d',
  trackRealTime = true
}: UserBehaviorTrackingProps) {
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([])
  const [metrics, setMetrics] = useState<UserMetrics>({
    totalActions: 0,
    avgSessionDuration: '',
    mostActiveHour: '',
    preferredFeatures: [],
    searchQueries: [],
    filtersUsed: [],
    exportsGenerated: 0,
    bookmarksCreated: 0
  })
  const [isTracking, setIsTracking] = useState(true)

  // Mock user actions
  const behaviorPatternsData: UserAction[] = [
    {
      id: '1',
      type: 'search',
      action: 'Searched for companies',
      details: '"AI startups" with filters: Technology, Seed Stage',
      timestamp: '2 minutes ago',
      duration: 45,
      metadata: { query: 'AI startups', results: 234, filters: 3 }
    },
    {
      id: '2',
      type: 'view',
      action: 'Viewed company profile',
      details: 'TechCorp - Full analysis with competitive insights',
      timestamp: '5 minutes ago',
      duration: 180,
      metadata: { companyId: 'techcorp', viewDuration: 180 }
    },
    {
      id: '3',
      type: 'filter',
      action: 'Applied advanced filters',
      details: 'Industry: Technology, Size: Enterprise, Region: North America',
      timestamp: '8 minutes ago',
      duration: 30,
      metadata: { filters: 3, resultsCount: 89 }
    },
    {
      id: '4',
      type: 'export',
      action: 'Generated PDF report',
      details: 'Market Intelligence Report for Q4 2024',
      timestamp: '1 hour ago',
      duration: 15,
      metadata: { reportType: 'PDF', size: '2.3MB', pages: 24 }
    },
    {
      id: '5',
      type: 'bookmark',
      action: 'Saved competitor analysis',
      details: 'InnovateCo SWOT analysis and market position',
      timestamp: '2 hours ago',
      duration: 10,
      metadata: { bookmarkId: 'innovateco-swot', category: 'competitor' }
    },
    {
      id: '6',
      type: 'view',
      action: 'Viewed analytics dashboard',
      details: 'AI insights and predictive scoring analysis',
      timestamp: '3 hours ago',
      duration: 240,
      metadata: { dashboard: 'analytics', sections: 5 }
    }
  ]

  // Mock behavior patterns
  const behaviorPatterns: BehaviorPattern[] = [
    {
      id: '1',
      pattern: 'Morning Research Sessions',
      frequency: 85,
      description: 'User consistently conducts research between 9-11 AM, focusing on competitive intelligence',
      impact: 'high',
      recommendations: [
        'Schedule automated reports for 9 AM delivery',
        'Prioritize competitor updates for morning briefings',
        'Pre-load competitive intelligence dashboards'
      ]
    },
    {
      id: '2',
      pattern: 'Deep Dive Analysis',
      frequency: 72,
      description: 'Extended viewing sessions on company profiles indicate thorough analysis approach',
      impact: 'medium',
      recommendations: [
        'Provide detailed export options for company analyses',
        'Offer comparative analysis tools for multiple companies',
        'Enable session bookmarks for long-form research'
      ]
    },
    {
      id: '3',
      pattern: 'Filter-First Approach',
      frequency: 68,
      description: 'User consistently applies filters before searching, indicating specific research goals',
      impact: 'medium',
      recommendations: [
        'Save frequently used filter combinations',
        'Create filter templates for quick access',
        'Enable smart filter suggestions based on history'
      ]
    }
  ]

  // Mock user metrics
  const initialMetrics: UserMetrics = {
    totalActions: 234,
    avgSessionDuration: '14m 32s',
    mostActiveHour: '10:00 AM',
    preferredFeatures: ['Competitor Analysis', 'Market Trends', 'AI Insights'],
    searchQueries: ['AI startups', 'healthcare technology', 'cloud computing'],
    filtersUsed: ['Industry', 'Company Size', 'Revenue Range'],
    exportsGenerated: 18,
    bookmarksCreated: 47
  }

  useEffect(() => {
        const loadData = async () => {
          try {
            const response = await fetch('/api/userbehaviortracking');
            if (response.ok) {
              const data = await response.json();
              // Set appropriate state based on component
            }
          } catch (error) {
            console.error('Error loading data:', error);
          }
        };
        loadData();
    setUserActions(behaviorPatternsData)
    setPatterns(behaviorPatterns)
    setMetrics(initialMetrics)

    // Simulate real-time tracking
    if (!trackRealTime) return

    const interval = setInterval(() => {
      const newAction: UserAction = {
        id: Date.now().toString(),
        type: ['search', 'view', 'filter'][Math.floor(0 * 3)] as UserAction['type'],
        action: 'Real-time action',
        details: 'User interaction detected',
        timestamp: 'Just now',
        duration: Math.floor(0 * 60) + 10,
        metadata: { source: 'real-time-tracking' }
      }
      
      setUserActions(prev => [newAction, ...prev.slice(0, 19)])
      setMetrics(prev => ({
        ...prev,
        totalActions: prev.totalActions + 1
      }))
    }, 15000) // Add new action every 15 seconds

    return () => clearInterval(interval)
  }, [trackRealTime])

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'search':
        return <Search className="h-4 w-4 text-blue-600" />
      case 'filter':
        return <Filter className="h-4 w-4 text-purple-600" />
      case 'view':
        return <Eye className="h-4 w-4 text-green-600" />
      case 'export':
        return <Download className="h-4 w-4 text-orange-600" />
      case 'bookmark':
        return <Target className="h-4 w-4 text-indigo-600" />
      case 'share':
        return <Users className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'search':
        return 'text-blue-600 bg-blue-50'
      case 'filter':
        return 'text-purple-600 bg-purple-50'
      case 'view':
        return 'text-green-600 bg-green-50'
      case 'export':
        return 'text-orange-600 bg-orange-50'
      case 'bookmark':
        return 'text-indigo-600 bg-indigo-50'
      case 'share':
        return 'text-red-600 bg-red-50'
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

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h3 className="text-lg font-semibold">User Behavior Tracking System</h3>
          </div>
          <Badge className={isTracking ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {isTracking ? (
              <>
                <Zap className="h-3 w-3" />
                TRACKING
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                PAUSED
              </>
            )}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsTracking(!isTracking)}
          >
            {isTracking ? 'Pause' : 'Resume'} Tracking
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalActions}</div>
                <div className="text-sm text-gray-600">Total Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.avgSessionDuration}</div>
                <div className="text-sm text-gray-600">Avg Session</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.mostActiveHour}</div>
                <div className="text-sm text-gray-600">Peak Activity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.exportsGenerated}</div>
                <div className="text-sm text-gray-600">Reports Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Preferences & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Preferred Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.preferredFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{feature}</span>
                  <Badge variant="outline">
                    {Math.floor(0 * 30) + 70}% usage
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Recent Search Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.searchQueries.map((query, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Search className="h-3 w-3 text-gray-500" />
                  <span className="text-sm">{query}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Frequently Used Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.filtersUsed.map((filter, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{filter}</span>
                  <Badge variant="outline">
                    {Math.floor(0 * 20) + 10} times
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userActions.slice(0, 6).map((action) => (
              <div key={action.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                <div className={`p-2 rounded-lg ${getActionColor(action.type)}`}>
                  {getActionIcon(action.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{action.action}</span>
                    <span className="text-xs text-gray-500">{action.timestamp}</span>
                    {action.duration && (
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(action.duration)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{action.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behavior Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detected Behavior Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {patterns.map((pattern) => (
              <div key={pattern.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{pattern.pattern}</h4>
                    <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{pattern.frequency}%</div>
                    <div className="text-sm text-gray-500">Frequency</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Pattern Strength</span>
                    <span className="text-xs font-medium">{pattern.frequency}%</span>
                  </div>
                  <Progress value={pattern.frequency} className="h-2" />
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">AI Recommendations:</h5>
                  <div className="space-y-1">
                    {pattern.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <TrendingUp className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}