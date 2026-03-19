'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Filter, 
  Save, 
  RefreshCw, 
  Search, 
  X, 
  Plus, 
  Brain,
  TrendingUp,
  Building,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface FilterPreset {
  id: string
  name: string
  description: string
  filters: FilterState
  isDefault?: boolean
}

interface FilterState {
  industries: string[]
  companySizes: string[]
  locations: string[]
  revenueRanges: string[]
  growthRates: number[]
  technologies: string[]
  businessModels: string[]
  fundingStages: string[]
  marketSegments: string[]
  competitiveLevel: string
  innovationScore: number[]
  customKeywords: string[]
  dateRange: {
    start: string
    end: string
  }
}

interface AdvancedFilterSystemProps {
  onFiltersChange: (filters: FilterState) => void
  onSearch: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

const defaultFilters: FilterState = {
  industries: [],
  companySizes: [],
  locations: [],
  revenueRanges: [],
  growthRates: [0, 100],
  technologies: [],
  businessModels: [],
  fundingStages: [],
  marketSegments: [],
  competitiveLevel: 'all',
  innovationScore: [0, 100],
  customKeywords: [],
  dateRange: {
    start: '',
    end: ''
  }
}

const data = [
  {
    id: '1',
    name: 'High-Growth Tech Startups',
    description: 'Fast-growing technology companies with strong innovation potential',
    filters: {
      ...defaultFilters,
      industries: ['Software', 'AI', 'FinTech'],
      companySizes: ['Startup', 'SMB'],
      growthRates: [50, 100],
      innovationScore: [70, 100],
      fundingStages: ['Series A', 'Series B', 'Series C']
    }
  },
  {
    id: '2',
    name: 'Enterprise Software Leaders',
    description: 'Established enterprise software companies with high revenue',
    filters: {
      ...defaultFilters,
      industries: ['Enterprise Software', 'Cloud Computing'],
      companySizes: ['Enterprise'],
      revenueRanges: ['$100M+', '$500M+', '$1B+'],
      growthRates: [10, 30],
      innovationScore: [60, 90]
    }
  },
  {
    id: '3',
    name: 'Emerging Market Opportunities',
    description: 'Companies in emerging markets with high growth potential',
    filters: {
      ...defaultFilters,
      locations: ['Southeast Asia', 'Latin America', 'Africa'],
      growthRates: [40, 100],
      innovationScore: [50, 100],
      fundingStages: ['Seed', 'Series A', 'Pre-Series']
    }
  }
]

const industryOptions = [
  'Software', 'AI/Machine Learning', 'FinTech', 'HealthTech', 'E-commerce',
  'Enterprise Software', 'Cloud Computing', 'Cybersecurity', 'IoT', 'Blockchain',
  'Biotechnology', 'CleanTech', 'EdTech', 'AgriTech', ' Automotive Tech'
]

const companySizeOptions = [
  'Startup (1-10)', 'SMB (11-50)', 'Small (51-200)', 'Medium (201-1000)', 'Large (1000-5000)', 'Enterprise (5000+)'
]

const locationOptions = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Africa', 'Middle East',
  'United States', 'United Kingdom', 'Germany', 'France', 'China', 'India', 'Japan',
  'Southeast Asia', 'Australia', 'Canada', 'Brazil', 'Mexico'
]

const revenueOptions = [
  'Under $1M', '$1M-$5M', '$5M-$10M', '$10M-$50M', '$50M-$100M', '$100M+', '$500M+', '$1B+'
]

const technologyOptions = [
  'AI/ML', 'Cloud Native', 'Microservices', 'Blockchain', 'IoT', 'AR/VR',
  'Big Data', 'DevOps', 'Mobile First', 'SaaS', 'PaaS', 'IaaS'
]

const businessModelOptions = [
  'SaaS', 'Marketplace', 'Platform', 'B2B', 'B2C', 'B2B2C',
  'Subscription', 'Freemium', 'Enterprise Sales', 'Direct-to-Consumer'
]

const fundingOptions = [
  'Pre-Seed', 'Seed', 'Pre-Series', 'Series A', 'Series B', 'Series C',
  'Series D+', 'Private Equity', 'Public', 'Bootstrapped'
]

const marketSegmentOptions = [
  'Early Adopters', 'Mainstream Market', 'Late Majority', 'Laggards',
  'Niche Market', 'Mass Market', 'Premium Segment', 'Value Segment'
]

export function AdvancedFilterSystem({ onFiltersChange, onSearch, initialFilters }: AdvancedFilterSystemProps) {
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters, ...initialFilters })
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [isExpanded, setIsExpanded] = useState<{ [key: string]: boolean }>({
    basic: true,
    advanced: false,
    ai: false
  })
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)

  // Notify parent component of filter changes
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleMultiSelectChange = useCallback((key: keyof FilterState, option: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...(prev[key] as string[]), option]
        : (prev[key] as string[]).filter(item => item !== option)
    }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const applyPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters)
  }, [])

  const saveAsPreset = useCallback(() => {
    if (!newPresetName.trim()) return

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: newPresetName,
      description: `Custom filter saved ${new Date().toLocaleDateString()}`,
      filters: { ...filters }
    }

    setPresets(prev => [...prev, newPreset])
    setNewPresetName('')
    setShowSavePreset(false)
  }, [filters, newPresetName])

  const generateAISuggestions = useCallback(async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const suggestions = [
      'Consider adding "AI/ML" technology filter for higher growth potential',
      'Companies with 70%+ innovation score show 3x higher ROI',
      'Enterprise companies in Cloud Computing have 45% lower churn',
      'SaaS companies with $10M+ revenue have 2.8x better valuation'
    ]
    
    setAiSuggestions(suggestions)
    setIsAnalyzing(false)
  }, [])

  const toggleSection = useCallback((section: string) => {
    setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const getActiveFiltersCount = useCallback(() => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'dateRange') {
        if (value.start || value.end) count++
      } else if (Array.isArray(value)) {
        if (key === 'growthRates' || key === 'innovationScore') {
          if (value[0] !== 0 || value[1] !== 100) count++
        } else if (value.length > 0) count++
      } else if (value && value !== 'all') {
        count++
      }
    })
    return count
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Filter Summary and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filter System
              <Badge variant="secondary">
                {getActiveFiltersCount()} active filters
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSavePreset(true)}>
                <Save className="h-4 w-4 mr-2" />
                Save Preset
              </Button>
              <Button onClick={() => onSearch(filters)}>
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Presets */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Quick Presets</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {presets.map(preset => (
                <Button
                  key={preset.id}
                  variant="outline"
                  className="h-auto p-3 justify-start"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {preset.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Save Preset Dialog */}
          {showSavePreset && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter preset name..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={saveAsPreset} disabled={!newPresetName.trim()}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowSavePreset(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Expandable Filter Sections */}
          
          {/* Basic Filters */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-between p-2"
              onClick={() => toggleSection('basic')}
            >
              <span className="font-medium">Basic Filters</span>
              {isExpanded.basic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {isExpanded.basic && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Industries */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Industries
                  </Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                    {industryOptions.map(industry => (
                      <div key={industry} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`industry-${industry}`}
                          checked={filters.industries.includes(industry)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange('industries', industry, checked as boolean)
                          }
                        />
                        <Label htmlFor={`industry-${industry}`} className="text-sm">
                          {industry}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Sizes */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Company Size
                  </Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                    {companySizeOptions.map(size => (
                      <div key={size} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`size-${size}`}
                          checked={filters.companySizes.includes(size)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange('companySizes', size, checked as boolean)
                          }
                        />
                        <Label htmlFor={`size-${size}`} className="text-sm">
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Locations
                  </Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                    {locationOptions.map(location => (
                      <div key={location} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`location-${location}`}
                          checked={filters.locations.includes(location)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange('locations', location, checked as boolean)
                          }
                        />
                        <Label htmlFor={`location-${location}`} className="text-sm">
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-between p-2"
              onClick={() => toggleSection('advanced')}
            >
              <span className="font-medium">Advanced Filters</span>
              {isExpanded.advanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {isExpanded.advanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Revenue Ranges */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Revenue Range
                  </Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                    {revenueOptions.map(revenue => (
                      <div key={revenue} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`revenue-${revenue}`}
                          checked={filters.revenueRanges.includes(revenue)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange('revenueRanges', revenue, checked as boolean)
                          }
                        />
                        <Label htmlFor={`revenue-${revenue}`} className="text-sm">
                          {revenue}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Technologies
                  </Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                    {technologyOptions.map(tech => (
                      <div key={tech} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`tech-${tech}`}
                          checked={filters.technologies.includes(tech)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange('technologies', tech, checked as boolean)
                          }
                        />
                        <Label htmlFor={`tech-${tech}`} className="text-sm">
                          {tech}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Models */}
                <div className="space-y-2">
                  <Label>Business Model</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                    {businessModelOptions.map(model => (
                      <div key={model} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`model-${model}`}
                          checked={filters.businessModels.includes(model)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange('businessModels', model, checked as boolean)
                          }
                        />
                        <Label htmlFor={`model-${model}`} className="text-sm">
                          {model}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth Rate Slider */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Growth Rate
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {filters.growthRates[0]}% - {filters.growthRates[1]}%
                    </span>
                  </Label>
                  <Slider
                    value={filters.growthRates}
                    onValueChange={(value) => handleFilterChange('growthRates', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Innovation Score Slider */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Innovation Score
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {filters.innovationScore[0]} - {filters.innovationScore[1]}
                    </span>
                  </Label>
                  <Slider
                    value={filters.innovationScore}
                    onValueChange={(value) => handleFilterChange('innovationScore', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      placeholder="Start date"
                      value={filters.dateRange.start}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        start: e.target.value
                      })}
                    />
                    <Input
                      type="date"
                      placeholder="End date"
                      value={filters.dateRange.end}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        end: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI-Powered Suggestions */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-between p-2"
              onClick={() => toggleSection('ai')}
            >
              <span className="font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI-Powered Suggestions
              </span>
              {isExpanded.ai ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {isExpanded.ai && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Get AI recommendations based on your current filters
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAISuggestions}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Brain className="h-4 w-4 mr-2" /> Generate Suggestions</>
                    )}
                  </Button>
                </div>

                {aiSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}