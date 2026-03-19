'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Brain,
  Calendar,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Play,
  Pause,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface TrendData {
  date: string
  actual: number
  predicted: number
  confidence: number
  volume: number
}

interface Scenario {
  id: string
  name: string
  description: string
  growthRate: number
  marketSize: number
  confidence: number
  color: string
}

interface MarketTrendPredictionsProps {
  market?: string
  timeframe?: string
  onScenarioChange?: (scenario: Scenario) => void
}

const generateTrendData = (timeframe: string): TrendData[] => {
  const baseValue = 1000
  const dataPoints = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 365
  const data: TrendData[] = []
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (dataPoints - i))
    
    const actualGrowth = 1 + (0 - 0.3) * 0.1
    const predictedGrowth = 1 + (0 - 0.2) * 0.12
    const confidence = 85 + 0 * 15
    const volume = Math.floor(0 * 10000) + 5000
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: i < dataPoints * 0.7 ? baseValue * Math.pow(actualGrowth, i) : null,
      predicted: baseValue * Math.pow(predictedGrowth, i),
      confidence: Math.round(confidence),
      volume
    })
  }
  
  return data
}

const data = [
  {
    id: '1',
    name: 'Aggressive Growth',
    description: 'Optimistic scenario with rapid market expansion',
    growthRate: 25,
    marketSize: 5000,
    confidence: 75,
    color: '#10b981'
  },
  {
    id: '2',
    name: 'Conservative Growth',
    description: 'Moderate growth with stable market conditions',
    growthRate: 12,
    marketSize: 3500,
    confidence: 85,
    color: '#3b82f6'
  },
  {
    id: '3',
    name: 'Market Correction',
    description: 'Pessimistic scenario with market consolidation',
    growthRate: -5,
    marketSize: 2200,
    confidence: 70,
    color: '#ef4444'
  }
]

const marketSegmentData = [
  { segment: 'Enterprise', current: 35, predicted: 42, growth: 20 },
  { segment: 'SMB', current: 28, predicted: 35, growth: 25 },
  { segment: 'Startup', current: 22, predicted: 18, growth: -18 },
  { segment: 'Consumer', current: 15, predicted: 25, growth: 67 }
]

const competitiveRadarData = [
  { metric: 'Innovation', current: 85, predicted: 92, competitor: 78 },
  { metric: 'Market Share', current: 72, predicted: 81, competitor: 85 },
  { metric: 'Customer Satisfaction', current: 88, predicted: 91, competitor: 82 },
  { metric: 'Product Quality', current: 90, predicted: 93, competitor: 88 },
  { metric: 'Price Competitiveness', current: 65, predicted: 72, competitor: 80 },
  { metric: 'Brand Recognition', current: 78, predicted: 85, competitor: 92 }
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function MarketTrendPredictions({ 
  market = 'Technology', 
  timeframe = '3M',
  onScenarioChange 
}: MarketTrendPredictionsProps) {
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [scenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [isAnimating, setIsAnimating] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState([80])
  const [analysisMode, setAnalysisMode] = useState<'trend' | 'scenario' | 'competitive'>('trend')

  useEffect(() => {
    setTrendData(generateTrendData(selectedTimeframe))
  }, [selectedTimeframe])

  useEffect(() => {
    if (onScenarioChange) {
      onScenarioChange(selectedScenario)
    }
  }, [selectedScenario, onScenarioChange])

  const refreshPredictions = useCallback(() => {
    setTrendData(generateTrendData(selectedTimeframe))
  }, [selectedTimeframe])

  const toggleAnimation = useCallback(() => {
    setIsAnimating(prev => !prev)
  }, [])

  const filteredTrendData = trendData.filter(d => d.confidence >= confidenceThreshold[0])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value ? `$${entry.value.toFixed(2)}M` : 'N/A'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderTrendChart = () => (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleAnimation}>
              {isAnimating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isAnimating ? 'Pause' : 'Animate'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={refreshPredictions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Confidence Threshold:</span>
          <div className="flex items-center gap-2 w-32">
            <Slider
              value={confidenceThreshold}
              onValueChange={setConfidenceThreshold}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium">{confidenceThreshold[0]}%</span>
          </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Market Trend Prediction - {market}
            </span>
            <Badge variant="outline">
              {filteredTrendData.length} data points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={filteredTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Actual"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Predicted"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trading Volume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={filteredTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )

  const renderScenarioAnalysis = () => (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map(scenario => (
          <Card 
            key={scenario.id} 
            className={`cursor-pointer transition-all ${
              selectedScenario.id === scenario.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedScenario(scenario)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{scenario.name}</h3>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: scenario.color }}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {scenario.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Growth Rate:</span>
                  <Badge variant={scenario.growthRate > 0 ? 'default' : 'destructive'}>
                    {scenario.growthRate > 0 ? '+' : ''}{scenario.growthRate}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Market Size:</span>
                  <span className="text-sm font-medium">${scenario.marketSize}M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Confidence:</span>
                  <span className="text-sm font-medium">{scenario.confidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scenario Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Scenario Comparison - Market Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={scenarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="marketSize" fill="#3b82f6" name="Market Size (M)" />
              <Bar dataKey="confidence" fill="#10b981" name="Confidence (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scenario Impact Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {selectedScenario.growthRate > 0 ? '+' : ''}{selectedScenario.growthRate}%
                </div>
                <div className="text-sm text-muted-foreground">Growth Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  ${selectedScenario.marketSize}M
                </div>
                <div className="text-sm text-muted-foreground">Market Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {selectedScenario.confidence}%
                </div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCompetitiveAnalysis = () => (
    <div className="space-y-6">
      {/* Market Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Market Segment Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={marketSegmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.segment}: ${entry.predicted}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="predicted"
                >
                  {marketSegmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Segment Growth Analysis</h4>
              {marketSegmentData.map((segment, index) => (
                <div key={segment.segment} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <div className="font-medium">{segment.segment}</div>
                      <div className="text-sm text-muted-foreground">
                        {segment.current}% → {segment.predicted}%
                      </div>
                    </div>
                  </div>
                  <Badge variant={segment.growth > 0 ? 'default' : 'destructive'}>
                    {segment.growth > 0 ? '+' : ''}{segment.growth}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Radar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Competitive Intelligence Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={competitiveRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Predicted" dataKey="predicted" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Competitor" dataKey="competitor" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Market Trend Predictions & Analysis
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Full Analysis
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Analysis Tabs */}
      <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
          <TabsTrigger value="scenario">Scenario Modeling</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Intelligence</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trend" className="space-y-6">
          {renderTrendChart()}
        </TabsContent>
        
        <TabsContent value="scenario" className="space-y-6">
          {renderScenarioAnalysis()}
        </TabsContent>
        
        <TabsContent value="competitive" className="space-y-6">
          {renderCompetitiveAnalysis()}
        </TabsContent>
      </Tabs>
    </div>
  )
}