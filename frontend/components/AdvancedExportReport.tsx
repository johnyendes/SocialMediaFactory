'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Database,
  Calendar,
  Clock,
  Mail,
  Share2,
  Settings,
  Eye,
  EyeOff,
  Palette,
  Layout,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  RefreshCw,
  Save
} from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: ReportSection[]
  format: 'pdf' | 'excel' | 'powerpoint' | 'csv'
  isDefault?: boolean
  isCustom?: boolean
}

interface ReportSection {
  id: string
  title: string
  type: 'chart' | 'table' | 'text' | 'metrics' | 'heatmap' | 'trends'
  data: any
  config: SectionConfig
  enabled: boolean
  order: number
}

interface SectionConfig {
  size: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark' | 'colorful'
  includeData?: boolean
  includeCharts?: boolean
  customBranding?: boolean
}

interface ScheduledReport {
  id: string
  name: string
  templateId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  recipients: string[]
  nextDelivery: string
  isActive: boolean
  template: ReportTemplate
}

interface ExportConfig {
  format: string
  template: ReportTemplate
  settings: any
  timestamp: string
}

interface AdvancedExportReportProps {
  data?: any
  onExport?: (config: ExportConfig) => void
}

const defaultTemplates: ReportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview for executive stakeholders',
    sections: [
      { id: '1', title: 'Key Metrics', type: 'metrics', data: {}, config: { size: 'medium', theme: 'light' }, enabled: true, order: 1 },
      { id: '2', title: 'Market Trends', type: 'chart', data: {}, config: { size: 'large', theme: 'colorful' }, enabled: true, order: 2 },
      { id: '3', title: 'Competitive Analysis', type: 'table', data: {}, config: { size: 'medium', theme: 'light' }, enabled: true, order: 3 }
    ],
    format: 'pdf',
    isDefault: true
  },
  {
    id: 'detailed-analysis',
    name: 'Detailed Analysis',
    description: 'Comprehensive report with full data analysis',
    sections: [
      { id: '1', title: 'Market Overview', type: 'text', data: {}, config: { size: 'medium', theme: 'light' }, enabled: true, order: 1 },
      { id: '2', title: 'Trend Analysis', type: 'trends', data: {}, config: { size: 'large', theme: 'colorful' }, enabled: true, order: 2 },
      { id: '3', title: 'Competitive Intelligence', type: 'heatmap', data: {}, config: { size: 'large', theme: 'colorful' }, enabled: true, order: 3 },
      { id: '4', title: 'Raw Data', type: 'table', data: {}, config: { size: 'large', theme: 'light', includeData: true }, enabled: true, order: 4 }
    ],
    format: 'excel',
    isDefault: true
  },
  {
    id: 'investor-deck',
    name: 'Investor Presentation',
    description: 'Professional presentation for investors and stakeholders',
    sections: [
      { id: '1', title: 'Market Opportunity', type: 'chart', data: {}, config: { size: 'large', theme: 'colorful' }, enabled: true, order: 1 },
      { id: '2', title: 'Growth Metrics', type: 'metrics', data: {}, config: { size: 'medium', theme: 'colorful' }, enabled: true, order: 2 },
      { id: '3', title: 'Competitive Landscape', type: 'heatmap', data: {}, config: { size: 'large', theme: 'colorful' }, enabled: true, order: 3 },
      { id: '4', title: 'Financial Projections', type: 'chart', data: {}, config: { size: 'large', theme: 'colorful' }, enabled: true, order: 4 }
    ],
    format: 'powerpoint',
    isDefault: true
  }
]

const data = [
  {
    id: '1',
    name: 'Weekly Executive Report',
    templateId: 'executive-summary',
    frequency: 'weekly',
    recipients: ['ceo@company.com', 'cto@company.com'],
    nextDelivery: '2024-01-15',
    isActive: true,
    template: defaultTemplates[0]
  },
  {
    id: '2',
    name: 'Monthly Analysis Dashboard',
    templateId: 'detailed-analysis',
    frequency: 'monthly',
    recipients: ['analytics@company.com', 'marketing@company.com'],
    nextDelivery: '2024-02-01',
    isActive: true,
    template: defaultTemplates[1]
  }
]

const sectionTypes = [
  { value: 'chart', label: 'Charts & Graphs', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'table', label: 'Data Tables', icon: <Database className="h-4 w-4" /> },
  { value: 'metrics', label: 'Key Metrics', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'trends', label: 'Trend Analysis', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'heatmap', label: 'Competitive Heatmap', icon: <Globe className="h-4 w-4" /> },
  { value: 'text', label: 'Text Summary', icon: <FileText className="h-4 w-4" /> }
]

const exportFormats = [
  { value: 'pdf', label: 'PDF Document', icon: <FileText className="h-4 w-4" />, description: 'Professional document format' },
  { value: 'excel', label: 'Excel Spreadsheet', icon: <FileSpreadsheet className="h-4 w-4" />, description: 'Data analysis format' },
  { value: 'powerpoint', label: 'PowerPoint Presentation', icon: <Presentation className="h-4 w-4" />, description: 'Presentation slides' },
  { value: 'csv', label: 'CSV Data', icon: <Database className="h-4 w-4" />, description: 'Raw data export' }
]

const frequencies = [
  { value: 'daily', label: 'Daily', description: 'Every business day' },
  { value: 'weekly', label: 'Weekly', description: 'Every Monday' },
  { value: 'monthly', label: 'Monthly', description: 'First of each month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' }
]

export function AdvancedExportReport({ data, onExport }: AdvancedExportReportProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>(defaultTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(defaultTemplates[0])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [activeTab, setActiveTab] = useState<'builder' | 'schedule' | 'templates'>('builder')
  const [isExporting, setIsExporting] = useState(false)
  const [customTemplate, setCustomTemplate] = useState<Partial<ReportTemplate>>({})
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)
  const [exportSettings, setExportSettings] = useState({
    includeBranding: true,
    includeData: false,
    includeCharts: true,
    customTheme: 'light',
    quality: 'high',
    compression: 'medium'
  })

  const handleExport = useCallback(async (format: string, template?: ReportTemplate) => {
    setIsExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const exportConfig = {
      format,
      template: template || selectedTemplate,
      settings: exportSettings,
      timestamp: new Date().toISOString()
    }
    
    if (onExport) {
      onExport(exportConfig)
    }
    
    // Generate mock download
    const mockContent = `Market Intelligence Report - ${format.toUpperCase()}\nGenerated: ${new Date().toLocaleString()}\nTemplate: ${template?.name || selectedTemplate.name}\n\nThis is a sample export file.`
    const blob = new Blob([mockContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `market-intelligence-report-${Date.now()}.${format === 'powerpoint' ? 'pptx' : format}`
    a.click()
    
    setIsExporting(false)
  }, [selectedTemplate, exportSettings, onExport])

  const createCustomTemplate = () => {
    const newTemplate: ReportTemplate = {
      id: Date.now().toString(),
      name: customTemplate.name || 'Custom Template',
      description: customTemplate.description || 'User-defined custom template',
      sections: customTemplate.sections || [],
      format: customTemplate.format || 'pdf',
      isCustom: true
    }
    
    setTemplates(prev => [...prev, newTemplate])
    setSelectedTemplate(newTemplate)
    setShowCustomBuilder(false)
    setCustomTemplate({})
  }

  const addSection = (type: string) => {
    const newSection: ReportSection = {
      id: Date.now().toString(),
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      type: type as ReportSection['type'],
      data: {},
      config: { size: 'medium', theme: 'light' },
      enabled: true,
      order: selectedTemplate.sections.length + 1
    }
    
    if (showCustomBuilder && customTemplate.sections) {
      setCustomTemplate(prev => ({
        ...prev,
        sections: [...(prev.sections || []), newSection]
      }))
    } else {
      setSelectedTemplate(prev => ({
        ...prev,
        sections: [...prev.sections, newSection]
      }))
    }
  }

  const updateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    const updateSections = (sections: ReportSection[]) =>
      sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    
    if (showCustomBuilder && customTemplate.sections) {
      setCustomTemplate(prev => ({
        ...prev,
        sections: updateSections(prev.sections || [])
      }))
    } else {
      setSelectedTemplate(prev => ({
        ...prev,
        sections: updateSections(prev.sections)
      }))
    }
  }

  const deleteSection = (sectionId: string) => {
    if (showCustomBuilder && customTemplate.sections) {
      setCustomTemplate(prev => ({
        ...prev,
        sections: prev.sections?.filter(s => s.id !== sectionId) || []
      }))
    } else {
      setSelectedTemplate(prev => ({
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId)
      }))
    }
  }

  const saveScheduledReport = (report: ScheduledReport) => {
    setScheduledReports(prev => 
      prev.some(r => r.id === report.id) 
        ? prev.map(r => r.id === report.id ? report : r)
        : [...prev, { ...report, id: Date.now().toString() }]
    )
  }

  const toggleScheduledReport = (reportId: string) => {
    setScheduledReports(prev =>
      prev.map(report =>
        report.id === reportId ? { ...report, isActive: !report.isActive } : report
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Advanced Export & Reporting
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCustomBuilder(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="schedule">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Report Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Selection & Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Select Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTemplate.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          {template.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          {template.isCustom && (
                            <Badge variant="outline">Custom</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">
                            {template.format}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {template.sections.length} sections
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sections Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Report Sections
                    </CardTitle>
                    <Select onValueChange={addSection}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Add section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(showCustomBuilder ? customTemplate.sections : selectedTemplate.sections)?.map((section, index) => (
                      <div key={section.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={section.enabled}
                              onCheckedChange={(checked) => 
                                updateSection(section.id, { enabled: checked as boolean })
                              }
                            />
                            <Input
                              value={section.title}
                              onChange={(e) => 
                                updateSection(section.id, { title: e.target.value })
                              }
                              className="font-medium"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSection(section.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <Select
                            value={section.type}
                            onValueChange={(value) => 
                              updateSection(section.id, { type: value as ReportSection['type'] })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sectionTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={section.config.size}
                            onValueChange={(value) => 
                              updateSection(section.id, { 
                                config: { ...section.config, size: value as SectionConfig['size'] }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={section.config.theme}
                            onValueChange={(value) => 
                              updateSection(section.id, { 
                                config: { ...section.config, theme: value as SectionConfig['theme'] }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="colorful">Colorful</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Settings */}
            <div className="space-y-6">
              {/* Export Format */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Format
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exportFormats.map(format => (
                      <Button
                        key={format.value}
                        variant={selectedTemplate.format === format.value ? 'default' : 'outline'}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => handleExport(format.value)}
                        disabled={isExporting}
                      >
                        <div className="flex items-center gap-3">
                          {format.icon}
                          <div className="text-left">
                            <div className="font-medium">{format.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {format.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Export Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Include Branding</Label>
                    <Checkbox
                      checked={exportSettings.includeBranding}
                      onCheckedChange={(checked) => 
                        setExportSettings(prev => ({ ...prev, includeBranding: checked as boolean }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Include Raw Data</Label>
                    <Checkbox
                      checked={exportSettings.includeData}
                      onCheckedChange={(checked) => 
                        setExportSettings(prev => ({ ...prev, includeData: checked as boolean }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Include Charts</Label>
                    <Checkbox
                      checked={exportSettings.includeCharts}
                      onCheckedChange={(checked) => 
                        setExportSettings(prev => ({ ...prev, includeCharts: checked as boolean }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quality</Label>
                    <Select
                      value={exportSettings.quality}
                      onValueChange={(value) => 
                        setExportSettings(prev => ({ ...prev, quality: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="ultra">Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Export */}
              <Card>
                <CardContent className="p-6">
                  <Button 
                    className="w-full" 
                    onClick={() => handleExport(selectedTemplate.format)}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Exporting...</>
                    ) : (
                      <><Download className="h-4 w-4 mr-2" /> Export Now</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Scheduled Reports
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map(report => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-gray-600">
                          Based on: {report.template.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={report.isActive ? 'default' : 'secondary'}>
                          {report.isActive ? 'Active' : 'Paused'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleScheduledReport(report.id)}
                        >
                          {report.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Frequency:</span>
                        <div className="text-gray-600 capitalize">{report.frequency}</div>
                      </div>
                      <div>
                        <span className="font-medium">Next Delivery:</span>
                        <div className="text-gray-600">{report.nextDelivery}</div>
                      </div>
                      <div>
                        <span className="font-medium">Recipients:</span>
                        <div className="text-gray-600">{report.recipients.length} people</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Template Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex gap-1">
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                        {template.isCustom && (
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize text-xs">
                        {template.format}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Template Builder Modal */}
      {showCustomBuilder && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create Custom Template</CardTitle>
              <Button variant="ghost" onClick={() => setShowCustomBuilder(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={customTemplate.name || ''}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label>Format</Label>
                <Select
                  value={customTemplate.format || 'pdf'}
                  onValueChange={(value) => setCustomTemplate(prev => ({ ...prev, format: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="powerpoint">PowerPoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Input
                value={customTemplate.description || ''}
                onChange={(e) => setCustomTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your template"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createCustomTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button variant="outline" onClick={() => setShowCustomBuilder(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}