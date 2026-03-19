'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Plus, 
  Trash2, 
  Settings,
  Eye,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Globe
} from 'lucide-react'

interface ReportSection {
  id: string
  type: 'market-overview' | 'competitor-analysis' | 'trend-analysis' | 'sentiment-analysis' | 'opportunity-scoring'
  title: string
  description: string
  icon: React.ReactNode
  included: boolean
  config: Record<string, any>
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: string[]
  isDefault: boolean
}

interface ReportBuilderProps {
  onSave?: (report: any) => void
  onPreview?: (report: any) => void
}

export function ReportBuilder({ onSave, onPreview }: ReportBuilderProps) {
  const [reportTitle, setReportTitle] = useState('Market Intelligence Report')
  const [selectedSections, setSelectedSections] = useState<ReportSection[]>([])
  const [isBuilding, setIsBuilding] = useState(false)

  // Available report sections
  const availableSections: ReportSection[] = [
    {
      id: 'market-overview',
      type: 'market-overview',
      title: 'Market Overview',
      description: 'Comprehensive market size, growth, and key trends analysis',
      icon: <BarChart3 className="h-4 w-4" />,
      included: false,
      config: { timeRange: '30d', includeCharts: true }
    },
    {
      id: 'competitor-analysis',
      type: 'competitor-analysis',
      title: 'Competitor Intelligence',
      description: 'Detailed analysis of key competitors and market positioning',
      icon: <Target className="h-4 w-4" />,
      included: false,
      config: { includeSWOT: true, benchmarkMetrics: true }
    },
    {
      id: 'trend-analysis',
      type: 'trend-analysis',
      title: 'Trend Analysis',
      description: 'Market trends, predictive insights, and future projections',
      icon: <TrendingUp className="h-4 w-4" />,
      included: false,
      config: { predictiveModel: true, confidenceInterval: 95 }
    },
    {
      id: 'sentiment-analysis',
      type: 'sentiment-analysis',
      title: 'Sentiment Analysis',
      description: 'Customer and market sentiment across various channels',
      icon: <Users className="h-4 w-4" />,
      included: false,
      config: { sources: ['social', 'news', 'reviews'], timeRange: '7d' }
    },
    {
      id: 'opportunity-scoring',
      type: 'opportunity-scoring',
      title: 'Opportunity Scoring',
      description: 'AI-powered scoring of market opportunities and recommendations',
      icon: <DollarSign className="h-4 w-4" />,
      included: false,
      config: { scoringModel: 'advanced', includeRecommendations: true }
    }
  ]

  // Predefined templates
  const templates: ReportTemplate[] = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for executive stakeholders',
      sections: ['market-overview', 'competitor-analysis', 'opportunity-scoring'],
      isDefault: true
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Analysis',
      description: 'Detailed analysis for research and strategy teams',
      sections: ['market-overview', 'competitor-analysis', 'trend-analysis', 'sentiment-analysis', 'opportunity-scoring'],
      isDefault: false
    },
    {
      id: 'competitive',
      name: 'Competitive Intelligence',
      description: 'Focus on competitive landscape and positioning',
      sections: ['competitor-analysis', 'sentiment-analysis'],
      isDefault: false
    }
  ]

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => {
      const section = availableSections.find(s => s.id === sectionId)
      if (!section) return prev
      
      const existing = prev.find(s => s.id === sectionId)
      if (existing) {
        return prev.filter(s => s.id !== sectionId)
      } else {
        return [...prev, { ...section, included: true }]
      }
    })
  }

  const applyTemplate = (template: ReportTemplate) => {
    const sections = template.sections.map(sectionId => {
      const section = availableSections.find(s => s.id === sectionId)
      return section ? { ...section, included: true } : null
    }).filter(Boolean) as ReportSection[]
    
    setSelectedSections(sections)
    setReportTitle(template.name)
  }

  const removeSection = (sectionId: string) => {
    setSelectedSections(prev => prev.filter(s => s.id !== sectionId))
  }

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSelectedSections(prev => {
      const index = prev.findIndex(s => s.id === sectionId)
      if (index === -1) return prev
      
      const newSections = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      
      if (newIndex >= 0 && newIndex < newSections.length) {
        [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
      }
      
      return newSections
    })
  }

  const generateReport = async () => {
    setIsBuilding(true)
    
    // Simulate report generation
    setTimeout(() => {
      setIsBuilding(false)
      const reportData = {
        title: reportTitle,
        sections: selectedSections,
        generatedAt: new Date().toISOString(),
        type: 'custom'
      }
      
      if (onPreview) {
        onPreview(reportData)
      }
    }, 3000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'market-overview':
        return <BarChart3 className="h-4 w-4 text-blue-600" />
      case 'competitor-analysis':
        return <Target className="h-4 w-4 text-red-600" />
      case 'trend-analysis':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'sentiment-analysis':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'opportunity-scoring':
        return <DollarSign className="h-4 w-4 text-orange-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Analytics Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Report Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Title
          </label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter report title..."
          />
        </div>

        {/* Templates */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Start with a Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  template.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => applyTemplate(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  {template.isDefault && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">Default</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Globe className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {template.sections.length} sections
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Sections */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableSections.map((section) => (
              <div
                key={section.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSections.find(s => s.id === section.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                  </div>
                  {selectedSections.find(s => s.id === section.id) && (
                    <Badge className="bg-green-100 text-green-800">
                      Included
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">{section.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Sections */}
        {selectedSections.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Report Sections ({selectedSections.length})
            </h3>
            <div className="space-y-2">
              {selectedSections.map((section, index) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(section.type)}
                      <span className="font-medium text-gray-900">{section.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Position {index + 1}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === selectedSections.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Configuration */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Report Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Custom range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Export Format
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>PDF</option>
                <option>PowerPoint</option>
                <option>Excel</option>
                <option>Interactive HTML</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedSections.length === 0 ? (
              <span className="text-yellow-600">
                Please select at least one section to generate a report
              </span>
            ) : (
              <span>
                Ready to generate {selectedSections.length}-section report
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (onPreview) {
                  onPreview({ title: reportTitle, sections: selectedSections })
                }
              }}
              disabled={selectedSections.length === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={generateReport}
              disabled={selectedSections.length === 0 || isBuilding}
              className="flex items-center gap-2"
            >
              {isBuilding ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Building...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}