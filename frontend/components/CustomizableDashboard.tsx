'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Layout, 
  Grid, 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical, 
  X, 
  Plus,
  RefreshCw,
  Save,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Star,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Target
} from 'lucide-react'

interface DashboardWidget {
  id: string
  title: string
  type: 'chart' | 'metrics' | 'table' | 'heatmap' | 'trends' | 'custom'
  size: 'small' | 'medium' | 'large' | 'fullscreen'
  position: { x: number; y: number }
  isVisible: boolean
  isLocked: boolean
  isFavorite: boolean
  config: WidgetConfig
  data?: any
}

interface WidgetConfig {
  refreshInterval?: number
  theme?: 'light' | 'dark' | 'colorful'
  showData?: boolean
  showLabels?: boolean
  animation?: boolean
  customSettings?: Record<string, any>
}

interface DashboardLayout {
  id: string
  name: string
  description: string
  widgets: DashboardWidget[]
  gridCols: number
  isDefault?: boolean
  isLocked?: boolean
}

interface CustomizableDashboardProps {
  layouts?: DashboardLayout[]
  onLayoutChange?: (layout: DashboardLayout) => void
  editable?: boolean
}

const defaultWidgets: Omit<DashboardWidget, 'id' | 'position'>[] = [
  {
    title: 'Market Overview',
    type: 'metrics',
    size: 'large',
    isVisible: true,
    isLocked: false,
    isFavorite: true,
    config: { refreshInterval: 30000, theme: 'colorful' }
  },
  {
    title: 'Trend Analysis',
    type: 'trends',
    size: 'medium',
    isVisible: true,
    isLocked: false,
    isFavorite: false,
    config: { refreshInterval: 60000, animation: true }
  },
  {
    title: 'Competitive Intelligence',
    type: 'heatmap',
    size: 'large',
    isVisible: true,
    isLocked: true,
    isFavorite: true,
    config: { showData: true, theme: 'colorful' }
  },
  {
    title: 'Key Metrics',
    type: 'chart',
    size: 'small',
    isVisible: true,
    isLocked: false,
    isFavorite: false,
    config: { showLabels: true }
  },
  {
    title: 'User Activity',
    type: 'table',
    size: 'medium',
    isVisible: false,
    isLocked: false,
    isFavorite: false,
    config: { refreshInterval: 45000 }
  },
  {
    title: 'Revenue Growth',
    type: 'chart',
    size: 'medium',
    isVisible: true,
    isLocked: false,
    isFavorite: true,
    config: { animation: true, theme: 'light' }
  }
]

const widgetTypes = [
  { value: 'chart', label: 'Charts', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'metrics', label: 'Key Metrics', icon: <Activity className="h-4 w-4" /> },
  { value: 'trends', label: 'Trend Analysis', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'heatmap', label: 'Competitive Map', icon: <Target className="h-4 w-4" /> },
  { value: 'table', label: 'Data Tables', icon: <Grid className="h-4 w-4" /> },
  { value: 'custom', label: 'Custom Widget', icon: <Settings className="h-4 w-4" /> }
]

const sizeOptions = [
  { value: 'small', label: 'Small (1x1)', cols: 1, rows: 1 },
  { value: 'medium', label: 'Medium (2x1)', cols: 2, rows: 1 },
  { value: 'large', label: 'Large (2x2)', cols: 2, rows: 2 },
  { value: 'fullscreen', label: 'Fullscreen', cols: 4, rows: 3 }
]

export function CustomizableDashboard({ 
  layouts: initialLayouts = [],
  onLayoutChange,
  editable = true 
}: CustomizableDashboardProps) {
  const [layouts, setLayouts] = useState<DashboardLayout[]>(initialLayouts)
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>(() => ({
    id: 'default',
    name: 'Default Dashboard',
    description: 'Standard market intelligence layout',
    widgets: defaultWidgets.map((widget, index) => ({
      ...widget,
      id: `widget-${index}`,
      position: { 
        x: (index % 4) * 2, 
        y: Math.floor(index / 4) * 2 
      }
    })),
    gridCols: 6,
    isDefault: true
  }))
  const [isEditing, setIsEditing] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  // Save current layout
  const saveLayout = useCallback(() => {
    if (onLayoutChange) {
      onLayoutChange(currentLayout)
    }
    
    // Simulate saving to backend
    const savedLayouts = JSON.parse(localStorage.getItem('dashboard-layouts') || '[]')
    const updatedLayouts = savedLayouts.filter((l: DashboardLayout) => l.id !== currentLayout.id)
    updatedLayouts.push(currentLayout)
    localStorage.setItem('dashboard-layouts', JSON.stringify(updatedLayouts))
    
    setIsEditing(false)
    setSelectedWidget(null)
  }, [currentLayout, onLayoutChange])

  // Add new widget
  const addWidget = useCallback((type: DashboardWidget['type']) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
      type,
      size: 'medium',
      position: { x: 0, y: 0 },
      isVisible: true,
      isLocked: false,
      isFavorite: false,
      config: { theme: 'light' }
    }
    
    setCurrentLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }))
  }, [])

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }))
    setSelectedWidget(null)
  }, [])

  // Update widget
  const updateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      )
    }))
  }, [])

  // Toggle widget visibility
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
      )
    }))
  }, [])

  // Toggle widget lock
  const toggleWidgetLock = useCallback((widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, isLocked: !w.isLocked } : w
      )
    }))
  }, [])

  // Toggle widget favorite
  const toggleWidgetFavorite = useCallback((widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, isFavorite: !w.isFavorite } : w
      )
    }))
  }, [])

  // Handle drag start
  const handleDragStart = useCallback((widgetId: string) => {
    if (!isEditing) return
    setDraggedWidget(widgetId)
    setIsDragging(true)
  }, [isEditing])

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!isDragging || !draggedWidget) return
    
    // Calculate grid position
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = Math.floor((e.clientX - rect.left) / (rect.width / currentLayout.gridCols))
    const y = Math.floor((e.clientY - rect.top) / 150) // Assuming 150px per row
    
    // Update widget position
    updateWidget(draggedWidget, { position: { x, y } })
  }, [isDragging, draggedWidget, currentLayout.gridCols, updateWidget])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null)
    setIsDragging(false)
  }, [])

  // Get widget size in grid units
  const getWidgetSize = (size: DashboardWidget['size']) => {
    const sizeOption = sizeOptions.find(s => s.value === size)
    return sizeOption || { cols: 2, rows: 1 }
  }

  // Render widget content (placeholder)
  const renderWidgetContent = (widget: DashboardWidget) => {
    const icon = widgetTypes.find(t => t.value === widget.type)?.icon || <Grid className="h-8 w-8" />
    
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          {icon}
          <div className="mt-2 text-sm font-medium">{widget.title}</div>
          <div className="text-xs">{widget.type} widget</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              {currentLayout.name}
              <Badge variant="secondary">
                {currentLayout.widgets.filter(w => w.isVisible).length} widgets
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Customize Layout
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveLayout}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Layout
                  </Button>
                </>
              )}
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Widget Management (when editing) */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Widget Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add Widget */}
              <div>
                <h4 className="font-medium mb-2">Add New Widget</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {widgetTypes.map(type => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      onClick={() => addWidget(type.value as DashboardWidget['type'])}
                      className="flex items-center gap-2"
                    >
                      {type.icon}
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Widget List */}
              <div>
                <h4 className="font-medium mb-2">Current Widgets</h4>
                <div className="space-y-2">
                  {currentLayout.widgets.map(widget => (
                    <div
                      key={widget.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        selectedWidget === widget.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWidgetVisibility(widget.id)}
                        >
                          {widget.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWidgetLock(widget.id)}
                        >
                          {widget.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWidgetFavorite(widget.id)}
                        >
                          <Star className={`h-4 w-4 ${widget.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <div>
                          <div className="font-medium text-sm">{widget.title}</div>
                          <div className="text-xs text-gray-500">
                            {widget.type} • {widget.size} • {widget.isLocked ? 'Locked' : 'Movable'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWidget(widget.id)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeWidget(widget.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={gridRef}
            className="relative min-h-[600px] border-2 border-dashed border-gray-300 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Grid Background */}
            {isEditing && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="grid grid-cols-6 h-full opacity-20">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border border-gray-300" />
                  ))}
                </div>
              </div>
            )}

            {/* Widgets */}
            {currentLayout.widgets
              .filter(widget => widget.isVisible)
              .map(widget => {
                const size = getWidgetSize(widget.size)
                const isSelected = selectedWidget === widget.id
                const isBeingDragged = draggedWidget === widget.id
                
                return (
                  <div
                    key={widget.id}
                    className={`absolute border rounded-lg bg-white shadow-sm transition-all ${
                      isSelected ? 'ring-2 ring-blue-500' : ''
                    } ${isBeingDragged ? 'opacity-50' : ''} ${
                      isEditing && !widget.isLocked ? 'cursor-move hover:shadow-md' : ''
                    }`}
                    style={{
                      left: `${(widget.position.x / currentLayout.gridCols) * 100}%`,
                      top: `${widget.position.y * 150}px`,
                      width: `${(size.cols / currentLayout.gridCols) * 100}%`,
                      height: `${size.rows * 150 - 16}px`,
                      zIndex: isSelected ? 10 : 1
                    }}
                    draggable={isEditing && !widget.isLocked}
                    onDragStart={() => handleDragStart(widget.id)}
                    onClick={() => isEditing && setSelectedWidget(widget.id)}
                  >
                    {/* Widget Header */}
                    <div className="flex items-center justify-between p-2 border-b">
                      <div className="flex items-center gap-2">
                        {isEditing && (
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium">{widget.title}</span>
                        {widget.isLocked && <Lock className="h-3 w-3 text-gray-400" />}
                        {widget.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {'value' in size && size.value === 'fullscreen' ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Widget Content */}
                    <div className="p-4 h-full">
                      {renderWidgetContent(widget)}
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Widget Settings Panel */}
      {selectedWidget && isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Widget Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const widget = currentLayout.widgets.find(w => w.id === selectedWidget)
              if (!widget) return null

              return (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Widget Title</label>
                    <input
                      type="text"
                      value={widget.title}
                      onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <select
                      value={widget.size}
                      onChange={(e) => updateWidget(widget.id, { size: e.target.value as DashboardWidget['size'] })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {sizeOptions.map(size => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Theme</label>
                    <select
                      value={widget.config.theme || 'light'}
                      onChange={(e) => updateWidget(widget.id, { 
                        config: { ...widget.config, theme: e.target.value as WidgetConfig['theme'] }
                      })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="colorful">Colorful</option>
                    </select>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}