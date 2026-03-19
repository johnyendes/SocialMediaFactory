'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Zap, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Filter,
  Download,
  RefreshCw,
  Activity,
  Building,
  Users,
  DollarSign,
  Globe,
  Shield,
  Sword,
  Star
} from 'lucide-react'

// Import Recharts components
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'

interface Competitor {
  id: string
  name: string
  marketShare: number
  growthRate: number
  innovationScore: number
  customerSatisfaction: number
  pricingCompetitiveness: number
  brandStrength: number
  technologyAdvancement: number
  marketPosition: {
    x: number
    y: number
  }
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  lastUpdated: string
}

interface HeatmapData {
  x: number
  y: number
  z: number
  competitor: string
  id: string
}

interface CompetitiveIntelligenceHeatmapProps {
  industry?: string
  competitors?: Competitor[]
  metrics?: string[]
}

const generateMockCompetitors = (industry: string): Competitor[] => {
  const competitorNames = [
    'TechCorp Solutions', 'InnovateCo', 'MarketLeader Inc', 'StartupX',
    'EnterprisePlus', 'CloudTech Systems', 'DataDriven Co', 'AI Innovations',
    'GlobalSoft', 'Digital Dynamics', 'FutureTech Labs', 'SmartSolutions'
  ]

  return competitorNames.map((name, index) => {
    const baseMarketShare = 0 * 25 + 5
    const marketShare = index === 0 ? 28.5 : baseMarketShare // Market leader
    
    return {
      id: `comp-${index}`,
      name,
      marketShare,
      growthRate: 0 * 30 - 5,
      innovationScore: 0 * 40 + 60,
      customerSatisfaction: 0 * 30 + 70,
      pricingCompetitiveness: 0 * 35 + 65,
      brandStrength: 0 * 30 + 70,
      technologyAdvancement: 0 * 40 + 60,
      marketPosition: {
        x: marketShare,
        y: 0 * 30 + 70
      },
      strengths: [
        'Strong brand recognition',
        'Advanced technology stack',
        'Large customer base',
        'Global presence'
      ].slice(0, Math.floor(0 * 3) + 1),
      weaknesses: [
        'High pricing',
        'Slow innovation cycle',
        'Limited market reach',
        'Customer service issues'
      ].slice(0, Math.floor(0 * 2) + 1),
      opportunities: [
        'Emerging markets',
        'Technology integration',
        'Strategic partnerships',
        'Product diversification'
      ].slice(0, Math.floor(0 * 2) + 1),
      threats: [
        'New competitors',
        'Market saturation',
        'Regulatory changes',
        'Technology disruption'
      ].slice(0, Math.floor(0 * 2) + 1),
      lastUpdated: new Date(Date.now() - 0 * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }
  }).sort((a, b) => b.marketShare - a.marketShare)
}

const metrics = [
  { value: 'market_share', label: 'Market Share', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'growth_rate', label: 'Growth Rate', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'innovation_score', label: 'Innovation Score', icon: <Zap className="h-4 w-4" /> },
  { value: 'customer_satisfaction', label: 'Customer Satisfaction', icon: <Users className="h-4 w-4" /> },
  { value: 'pricing_competitiveness', label: 'Pricing', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'brand_strength', label: 'Brand Strength', icon: <Star className="h-4 w-4" /> }
]

const quadrantColors = {
  leader: '#10b981',
  challenger: '#3b82f6', 
  visionary: '#8b5cf6',
  niche: '#f59e0b'
}

export function CompetitiveIntelligenceHeatmap({ 
  industry = 'Technology',
  competitors: initialCompetitors,
  metrics: selectedMetrics = ['market_share', 'growth_rate']
}: CompetitiveIntelligenceHeatmapProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null)
  const [selectedXAxis, setSelectedXAxis] = useState('market_share')
  const [selectedYAxis, setSelectedYAxis] = useState('growth_rate')
  const [viewMode, setViewMode] = useState<'heatmap' | 'radar' | 'comparison'>('heatmap')
  const [thresholdLevel, setThresholdLevel] = useState([10])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setCompetitors(initialCompetitors || generateMockCompetitors(industry))
  }, [industry, initialCompetitors])

  const heatmapData: HeatmapData[] = useMemo(() => {
    return competitors.map(comp => ({
      x: comp[selectedXAxis as keyof Competitor] as number,
      y: comp[selectedYAxis as keyof Competitor] as number,
      z: comp.innovationScore,
      competitor: comp.name,
      id: comp.id
    }))
  }, [competitors, selectedXAxis, selectedYAxis])

  const radarData = useMemo(() => {
    if (!selectedCompetitor) return []
    
    return metrics.map(metric => ({
      metric: metric.label,
      value: selectedCompetitor[metric.value as keyof Competitor] as number,
      fullMark: 100
    }))
  }, [selectedCompetitor])

  const comparisonData = useMemo(() => {
    return competitors.slice(0, 8).map(comp => ({
      name: comp.name,
      marketShare: comp.marketShare,
      growthRate: comp.growthRate,
      innovation: comp.innovationScore,
      satisfaction: comp.customerSatisfaction
    }))
  }, [competitors])

  const getCompetitorColor = (competitor: Competitor) => {
    const marketShare = competitor.marketShare
    const growthRate = competitor.growthRate
    
    if (marketShare > 20 && growthRate > 10) return quadrantColors.leader
    if (marketShare > 15 || growthRate > 15) return quadrantColors.challenger
    if (growthRate > 5) return quadrantColors.visionary
    return quadrantColors.niche
  }

  const getCompetitorQuadrant = (competitor: Competitor) => {
    const marketShare = competitor.marketShare
    const growthRate = competitor.growthRate
    
    if (marketShare > 20 && growthRate > 10) return 'Market Leader'
    if (marketShare > 15 || growthRate > 15) return 'Strong Challenger'
    if (growthRate > 5) return 'Emerging Visionary'
    return 'Niche Player'
  }

  const handleCompetitorClick = (competitor: Competitor) => {
    setSelectedCompetitor(competitor)
  }

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCompetitors(generateMockCompetitors(industry))
    setIsRefreshing(false)
  }, [industry])

  const exportAnalysis = () => {
    const csvContent = competitors.map(comp => 
      `${comp.name},${comp.marketShare.toFixed(1)},${comp.growthRate.toFixed(1)},${comp.innovationScore},${comp.customerSatisfaction}`
    ).join('\n')
    
    const blob = new Blob([`Competitor,Market Share,Growth Rate,Innovation,Satisfaction\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `competitive-intelligence-${industry}.csv`
    a.click()
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.competitor}</p>
          <p className="text-sm text-gray-600">
            {metrics.find(m => m.value === selectedXAxis)?.label}: {data.x.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">
            {metrics.find(m => m.value === selectedYAxis)?.label}: {data.y.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">
            Innovation Score: {data.z}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Competitive Intelligence Heatmap
              <Badge variant="secondary" className="ml-2">
                {industry}
              </Badge>
              <Badge variant="outline" className="ml-1">
                {competitors.length} competitors
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportAnalysis}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* View Mode Selection */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'heatmap', label: 'Position Map', icon: <Target className="h-4 w-4" /> },
              { id: 'radar', label: 'Radar Analysis', icon: <Activity className="h-4 w-4" /> },
              { id: 'comparison', label: 'Comparison', icon: <BarChart3 className="h-4 w-4" /> }
            ].map(view => (
              <Button
                key={view.id}
                variant={viewMode === view.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(view.id as any)}
                className="flex items-center gap-2"
              >
                {view.icon}
                {view.label}
              </Button>
            ))}
          </div>

          {/* Axis Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">X-Axis Metric</label>
              <Select value={selectedXAxis} onValueChange={setSelectedXAxis}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map(metric => (
                    <SelectItem key={metric.value} value={metric.value}>
                      <div className="flex items-center gap-2">
                        {metric.icon}
                        {metric.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Y-Axis Metric</label>
              <Select value={selectedYAxis} onValueChange={setSelectedYAxis}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map(metric => (
                    <SelectItem key={metric.value} value={metric.value}>
                      <div className="flex items-center gap-2">
                        {metric.icon}
                        {metric.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Min Market Share: {thresholdLevel[0]}%
              </label>
              <Slider
                value={thresholdLevel}
                onValueChange={setThresholdLevel}
                max={50}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Market Position Map</CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === 'heatmap' && (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={heatmapData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="x" 
                        name={metrics.find(m => m.value === selectedXAxis)?.label}
                        label={{ value: metrics.find(m => m.value === selectedXAxis)?.label, position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        dataKey="y"
                        name={metrics.find(m => m.value === selectedYAxis)?.label}
                        label={{ value: metrics.find(m => m.value === selectedYAxis)?.label, angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter
                        data={heatmapData}
                        fill="#8884d8"
                        onClick={(data) => {
                          const competitor = competitors.find(c => c.id === data.id)
                          if (competitor) handleCompetitorClick(competitor)
                        }}
                      >
                        {heatmapData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getCompetitorColor(competitors.find(c => c.id === entry.id)!)} 
                            stroke="#fff"
                            strokeWidth={2}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}

              {viewMode === 'radar' && selectedCompetitor && (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name={selectedCompetitor.name}
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {viewMode === 'comparison' && (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="marketShare" fill="#8884d8" name="Market Share %" />
                      <Line type="monotone" dataKey="growthRate" stroke="#82ca9d" name="Growth Rate %" />
                      <Line type="monotone" dataKey="innovation" stroke="#ffc658" name="Innovation Score" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Legend */}
              <div className="flex justify-center gap-4 mt-4">
                {Object.entries(quadrantColors).map(([quadrant, color]) => (
                  <div key={quadrant} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm capitalize">
                      {quadrant === 'leader' ? 'Market Leader' : 
                       quadrant === 'challenger' ? 'Strong Challenger' :
                       quadrant === 'visionary' ? 'Emerging Visionary' : 'Niche Player'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitor Details */}
        <div className="space-y-6">
          {selectedCompetitor && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {selectedCompetitor.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCompetitor.marketShare.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Market Share</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCompetitor.growthRate > 0 ? '+' : ''}{selectedCompetitor.growthRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Growth Rate</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Badge 
                      style={{ backgroundColor: getCompetitorColor(selectedCompetitor) }}
                      className="text-white"
                    >
                      {getCompetitorQuadrant(selectedCompetitor)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* SWOT Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SWOT Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Strengths */}
                  <div>
                    <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                      <Sword className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {selectedCompetitor.strengths.map((strength, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Weaknesses
                    </h4>
                    <ul className="space-y-1">
                      {selectedCompetitor.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Opportunities
                    </h4>
                    <ul className="space-y-1">
                      {selectedCompetitor.opportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <TrendingUp className="h-3 w-3 text-blue-600 mt-0.5" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Threats
                    </h4>
                    <ul className="space-y-1">
                      {selectedCompetitor.threats.map((threat, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <TrendingDown className="h-3 w-3 text-orange-600 mt-0.5" />
                          {threat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Market Leaders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Leaders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {competitors.slice(0, 5).map((competitor, index) => (
                  <div 
                    key={competitor.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleCompetitorClick(competitor)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{competitor.name}</div>
                        <div className="text-xs text-gray-500">
                          {competitor.marketShare.toFixed(1)}% market share
                        </div>
                      </div>
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getCompetitorColor(competitor) }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}