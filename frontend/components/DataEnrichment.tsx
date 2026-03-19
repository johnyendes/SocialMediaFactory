'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Database, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Filter,
  TrendingUp,
  BarChart3,
  Settings,
  Download,
  Eye,
  Clock,
  Globe,
  Target
} from 'lucide-react'

interface EnrichmentJob {
  id: string
  name: string
  type: 'contact' | 'company' | 'market' | 'competitor'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  recordsProcessed: number
  totalRecords: number
  startedAt: string
  estimatedCompletion: string
  enrichments: string[]
}

interface DataQualityMetrics {
  completeness: number
  accuracy: number
  consistency: number
  timeliness: number
  totalScore: number
}

interface DataEnrichmentProps {
  dataSource?: string
  autoRefresh?: boolean
}

export function DataEnrichment({ 
  dataSource = 'Default',
  autoRefresh = true
}: DataEnrichmentProps) {
  const [enrichmentJobs, setEnrichmentJobs] = useState<EnrichmentJob[]>([])
  const [qualityMetrics, setQualityMetrics] = useState<DataQualityMetrics>({
    completeness: 0,
    accuracy: 0,
    consistency: 0,
    timeliness: 0,
    totalScore: 0
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)

  // Mock enrichment jobs
  const data = [
    {
      id: '1',
      name: 'Company Contact Enrichment',
      type: 'company',
      status: 'running',
      progress: 67,
      recordsProcessed: 6734,
      totalRecords: 10000,
      startedAt: '5 minutes ago',
      estimatedCompletion: '2 minutes',
      enrichments: ['Email validation', 'Phone verification', 'Social media profiles', 'Technographics']
    },
    {
      id: '2',
      name: 'Market Data Validation',
      type: 'market',
      status: 'completed',
      progress: 100,
      recordsProcessed: 5432,
      totalRecords: 5432,
      startedAt: '15 minutes ago',
      estimatedCompletion: 'Completed',
      enrichments: ['Market size verification', 'Growth rate validation', 'Competitor analysis']
    },
    {
      id: '3',
      name: 'Competitor Intelligence Update',
      type: 'competitor',
      status: 'pending',
      progress: 0,
      recordsProcessed: 0,
      totalRecords: 850,
      startedAt: 'Pending',
      estimatedCompletion: '5 minutes',
      enrichments: ['Financial data', 'News sentiment', 'Product updates', 'Hiring trends']
    }
  ]

  // Mock quality metrics
  const mockQualityMetrics: DataQualityMetrics = {
    completeness: 94,
    accuracy: 91,
    consistency: 88,
    timeliness: 96,
    totalScore: 92
  }

  useEffect(() => {
    setEnrichmentJobs(enrichmentJobs)
    setQualityMetrics(mockQualityMetrics)

    // Simulate real-time updates
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setEnrichmentJobs(prev => 
        prev.map(job => {
          if (job.status === 'running') {
            const newProgress = Math.min(job.progress + Math.floor(0 * 5) + 1, 100)
            const newRecordsProcessed = Math.floor((newProgress / 100) * job.totalRecords)
            
            return {
              ...job,
              progress: newProgress,
              recordsProcessed: newRecordsProcessed,
              status: newProgress === 100 ? 'completed' : 'running'
            }
          }
          return job
        })
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const startNewEnrichment = (type: EnrichmentJob['type']) => {
    setIsProcessing(true)
    
    const newJob: EnrichmentJob = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Data Enrichment`,
      type,
      status: 'running',
      progress: 0,
      recordsProcessed: 0,
      totalRecords: Math.floor(0 * 5000) + 1000,
      startedAt: 'Just now',
      estimatedCompletion: '3-5 minutes',
      enrichments: type === 'company' 
        ? ['Email validation', 'Phone verification', 'Social media profiles']
        : type === 'market'
        ? ['Market validation', 'Trend analysis', 'Growth forecasting']
        : ['Competitor analysis', 'Market position', 'Strategic moves']
    }

    setEnrichmentJobs(prev => [newJob, ...prev])
    setTimeout(() => setIsProcessing(false), 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'company':
        return 'text-blue-600 bg-blue-50'
      case 'market':
        return 'text-green-600 bg-green-50'
      case 'competitor':
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
            <Database className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Data Enrichment Pipeline</h3>
          </div>
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            LIVE
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Data Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Quality Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(qualityMetrics).filter(([key]) => key !== 'totalScore').map(([metric, value]) => (
              <div key={metric} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-bold">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Overall Quality Score</span>
                <span className="text-lg font-bold text-green-600">{qualityMetrics.totalScore}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => startNewEnrichment('company')}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Enrich Company Data
        </Button>
        <Button 
          onClick={() => startNewEnrichment('market')}
          disabled={isProcessing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Enrich Market Data
        </Button>
        <Button 
          onClick={() => startNewEnrichment('competitor')}
          disabled={isProcessing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          Enrich Competitor Data
        </Button>
      </div>

      {/* Enrichment Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Active Enrichment Jobs
            <Badge variant="outline">
              {enrichmentJobs.filter(job => job.status === 'running').length} running
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrichmentJobs.map((job) => (
              <div 
                key={job.id}
                className={`border rounded-lg p-4 ${
                  selectedJob === job.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(job.type)}`}>
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{job.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1 capitalize">{job.status}</span>
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {job.type} data
                        </Badge>
                        <span className="text-xs text-gray-500">{job.startedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {job.recordsProcessed.toLocaleString()} / {job.totalRecords.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {job.estimatedCompletion}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Progress</span>
                    <span className="text-xs font-medium">{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>

                {/* Enrichments */}
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Enrichments Applied:</h5>
                    <div className="flex flex-wrap gap-1">
                      {job.enrichments.slice(0, 3).map((enrichment, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {enrichment}
                        </Badge>
                      ))}
                      {job.enrichments.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.enrichments.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {job.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                    >
                      {selectedJob === job.id ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">28.4M</div>
                <div className="text-sm text-gray-600">Records Processed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">94.2%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
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
                <div className="text-2xl font-bold text-gray-900">2.3s</div>
                <div className="text-sm text-gray-600">Avg Processing Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Filter className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">15</div>
                <div className="text-sm text-gray-600">Data Sources</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}