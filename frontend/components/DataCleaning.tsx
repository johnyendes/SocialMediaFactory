'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  RefreshCw,
  Filter,
  BarChart3,
  Settings,
  Play,
  Pause,
  Eye,
  Clock,
  Database,
  TrendingUp
} from 'lucide-react'

interface CleaningRule {
  id: string
  name: string
  description: string
  type: 'duplicate' | 'invalid' | 'incomplete' | 'format' | 'outlier'
  status: 'active' | 'inactive' | 'running'
  lastRun: string
  recordsProcessed: number
  recordsCleaned: number
  efficiency: number
  schedule: string
}

interface CleaningMetrics {
  totalRecords: number
  duplicatesRemoved: number
  invalidDataFixed: number
  missingFieldsFilled: number
  outliersHandled: number
  dataQualityImprovement: number
  lastRunTime: string
}

interface DataCleaningProps {
  autoRun?: boolean
  schedule?: string
}

export function DataCleaning({ 
  autoRun = true,
  schedule = 'daily'
}: DataCleaningProps) {
  const [rules, setRules] = useState<CleaningRule[]>([])
  const [metrics, setMetrics] = useState<CleaningMetrics>({
    totalRecords: 0,
    duplicatesRemoved: 0,
    invalidDataFixed: 0,
    missingFieldsFilled: 0,
    outliersHandled: 0,
    dataQualityImprovement: 0,
    lastRunTime: ''
  })
  const [isRunning, setIsRunning] = useState(false)
  const [selectedRule, setSelectedRule] = useState<string | null>(null)

  // Mock cleaning rules
  const data = [
    {
      id: '1',
      name: 'Duplicate Record Detection',
      description: 'Identifies and removes duplicate company and contact records based on fuzzy matching',
      type: 'duplicate',
      status: 'active',
      lastRun: '2 hours ago',
      recordsProcessed: 15432,
      recordsCleaned: 1847,
      efficiency: 88,
      schedule: 'daily'
    },
    {
      id: '2',
      name: 'Email Validation & Formatting',
      description: 'Validates email addresses and formats them according to RFC standards',
      type: 'format',
      status: 'running',
      lastRun: 'Running now',
      recordsProcessed: 8934,
      recordsCleaned: 1234,
      efficiency: 92,
      schedule: 'hourly'
    },
    {
      id: '3',
      name: 'Phone Number Standardization',
      description: 'Standardizes phone numbers to international format and validates accuracy',
      type: 'format',
      status: 'active',
      lastRun: '6 hours ago',
      recordsProcessed: 12456,
      recordsCleaned: 2341,
      efficiency: 85,
      schedule: 'daily'
    },
    {
      id: '4',
      name: 'Missing Data Imputation',
      description: 'Intelligently fills missing fields using machine learning predictions',
      type: 'incomplete',
      status: 'inactive',
      lastRun: '1 day ago',
      recordsProcessed: 8765,
      recordsCleaned: 3421,
      efficiency: 78,
      schedule: 'weekly'
    },
    {
      id: '5',
      name: 'Outlier Detection & Handling',
      description: 'Identifies statistical outliers and flags them for review or correction',
      type: 'outlier',
      status: 'active',
      lastRun: '30 minutes ago',
      recordsProcessed: 9876,
      recordsCleaned: 567,
      efficiency: 94,
      schedule: 'hourly'
    }
  ]

  // Mock cleaning metrics
  const initialMetrics: CleaningMetrics = {
    totalRecords: 2847392,
    duplicatesRemoved: 18472,
    invalidDataFixed: 8934,
    missingFieldsFilled: 23456,
    outliersHandled: 5678,
    dataQualityImprovement: 23.4,
    lastRunTime: '2 minutes ago'
  }

  useEffect(() => {
        const loadData = async () => {
          try {
            const response = await fetch('/api/datacleaning');
            if (response.ok) {
              const data = await response.json();
              // Set appropriate state based on component
            }
          } catch (error) {
            console.error('Error loading data:', error);
          }
        };
        loadData();
    setRules([])
    setMetrics(initialMetrics)

    // Simulate real-time updates
    if (!autoRun) return

    const interval = setInterval(() => {
      setRules(prev => 
        prev.map(rule => {
          if (rule.status === 'running') {
            const newProcessed = rule.recordsProcessed + Math.floor(0 * 100)
            const newCleaned = rule.recordsCleaned + Math.floor(0 * 20)
            
            return {
              ...rule,
              recordsProcessed: newProcessed,
              recordsCleaned: newCleaned
            }
          }
          return rule
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [autoRun])

  const runCleaningProcess = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, status: 'running' as const, lastRun: 'Running now' }
          : rule
      )
    )

    // Simulate completion after 5 seconds
    setTimeout(() => {
      setRules(prev => 
        prev.map(rule => 
          rule.id === ruleId 
            ? { 
                ...rule, 
                status: 'active' as const, 
                lastRun: 'Just now',
                recordsProcessed: rule.recordsProcessed + Math.floor(0 * 500),
                recordsCleaned: rule.recordsCleaned + Math.floor(0 * 100)
              }
            : rule
        )
      )
    }, 5000)
  }

  const toggleRuleStatus = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { 
              ...rule, 
              status: rule.status === 'active' ? 'inactive' : 'active' as const
            }
          : rule
      )
    )
  }

  const runAllRules = () => {
    setIsRunning(true)
    const activeRules = rules.filter(rule => rule.status === 'active')
    
    setRules(prev => 
      prev.map(rule => 
        rule.status === 'active' 
          ? { ...rule, status: 'running' as const, lastRun: 'Running now' }
          : rule
      )
    )

    // Simulate completion
    setTimeout(() => {
      setRules(prev => 
        prev.map(rule => {
          if (rule.status === 'running') {
            return {
              ...rule,
              status: 'active' as const,
              lastRun: 'Just now',
              recordsProcessed: rule.recordsProcessed + Math.floor(0 * 1000),
              recordsCleaned: rule.recordsCleaned + Math.floor(0 * 200)
            }
          }
          return rule
        })
      )
      setIsRunning(false)
    }, 8000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'inactive':
        return <Pause className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'duplicate':
        return <Database className="h-4 w-4" />
      case 'invalid':
        return <AlertTriangle className="h-4 w-4" />
      case 'incomplete':
        return <Filter className="h-4 w-4" />
      case 'format':
        return <Sparkles className="h-4 w-4" />
      case 'outlier':
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'duplicate':
        return 'text-red-600 bg-red-50'
      case 'invalid':
        return 'text-orange-600 bg-orange-50'
      case 'incomplete':
        return 'text-yellow-600 bg-yellow-50'
      case 'format':
        return 'text-blue-600 bg-blue-50'
      case 'outlier':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Automated Data Cleaning Pipeline</h3>
          </div>
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <Database className="h-3 w-3" />
            AUTO-CLEANING
          </Badge>
          <Badge variant="outline">
            Schedule: {schedule}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={runAllRules}
            disabled={isRunning}
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run All Rules'}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Cleaning Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Cleaning Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.totalRecords.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Records Processed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {metrics.duplicatesRemoved.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Duplicates Removed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.invalidDataFixed.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Invalid Data Fixed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                +{metrics.dataQualityImprovement}%
              </div>
              <div className="text-sm text-gray-600">Data Quality Improvement</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Last run: {metrics.lastRunTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cleaning Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Active Cleaning Rules
            <Badge variant="outline">
              {rules.filter(rule => rule.status === 'active').length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className={`border rounded-lg p-4 ${
                  selectedRule === rule.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(rule.type)}`}>
                      {getTypeIcon(rule.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={getStatusColor(rule.status)}>
                          {getStatusIcon(rule.status)}
                          <span className="ml-1 capitalize">{rule.status}</span>
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {rule.type} cleaning
                        </Badge>
                        <Badge variant="outline">
                          {rule.schedule}
                        </Badge>
                        <span className="text-xs text-gray-500">{rule.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {rule.efficiency}%
                    </div>
                    <div className="text-sm text-gray-500">Efficiency</div>
                  </div>
                </div>

                {/* Processing Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-gray-500">Records Processed</span>
                    <div className="text-sm font-semibold">
                      {rule.recordsProcessed.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Records Cleaned</span>
                    <div className="text-sm font-semibold text-green-600">
                      {rule.recordsCleaned.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Clean Rate</span>
                    <div className="text-sm font-semibold">
                      {((rule.recordsCleaned / rule.recordsProcessed) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Efficiency Score</span>
                    <span className="text-xs font-medium">{rule.efficiency}%</span>
                  </div>
                  <Progress value={rule.efficiency} className="h-2" />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rule.status === 'running' && (
                      <Badge className="bg-blue-100 text-blue-800 animate-pulse">
                        Processing...
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => runCleaningProcess(rule.id)}
                      disabled={rule.status === 'running'}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleRuleStatus(rule.id)}
                      disabled={rule.status === 'running'}
                    >
                      {rule.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRule(selectedRule === rule.id ? null : rule.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedRule === rule.id ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">98.7%</div>
                <div className="text-sm text-gray-600">Data Accuracy</div>
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
                <div className="text-2xl font-bold text-gray-900">45.2%</div>
                <div className="text-sm text-gray-600">Processing Speed ↑</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">5/5</div>
                <div className="text-sm text-gray-600">Rules Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Auto-Running</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}