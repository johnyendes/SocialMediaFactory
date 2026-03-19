'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Brain, 
  Clock, 
  TrendingUp, 
  Filter, 
  X, 
  ArrowRight,
  Sparkles,
  Target,
  Globe,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Mic,
  MicOff,
  History,
  Star
} from 'lucide-react'

interface SearchQuery {
  id: string
  text: string
  timestamp: Date
  results: number
  category: string
}

interface SearchSuggestion {
  text: string
  type: 'recent' | 'trending' | 'ai'
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

interface SearchIntent {
  category: string
  entities: string[]
  filters: Record<string, any>
  confidence: number
}

interface AdvancedSearchProps {
  onSearch: (query: string, intent: SearchIntent) => void
  placeholder?: string
  showVoice?: boolean
  showHistory?: boolean
}

const data = [
  {
    text: "AI companies with $10M+ revenue",
    type: 'recent',
    icon: TrendingUp,
    description: "Market research query"
  },
  {
    text: "Competitors in fintech sector",
    type: 'trending',
    icon: Target,
    description: "Popular this week"
  },
  {
    text: "High-growth startups in Southeast Asia",
    type: 'ai',
    icon: Brain,
    description: "AI-suggested based on your interests"
  },
  {
    text: "Enterprise software market leaders",
    type: 'recent',
    icon: BarChart3,
    description: "Analysis from last search"
  },
  {
    text: "Companies with strong ESG ratings",
    type: 'trending',
    icon: Globe,
    description: "Trending topic"
  }
]

const recentQueries: SearchQuery[] = [
  { id: '1', text: 'SaaS companies with 100+ employees', timestamp: new Date(Date.now() - 1000 * 60 * 30), results: 234, category: 'Market Research' },
  { id: '2', text: 'AI startups in Series B funding', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), results: 156, category: 'Investment Analysis' },
  { id: '3', text: 'Healthcare technology leaders', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), results: 89, category: 'Industry Analysis' }
]

export function AdvancedSearch({ 
  onSearch, 
  placeholder = "Ask anything about markets, companies, or trends...",
  showVoice = true,
  showHistory = true 
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchQuery[]>(recentQueries)
  const [searchIntent, setSearchIntent] = useState<SearchIntent | null>(null)
  const [showIntent, setShowIntent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on query
  useEffect(() => {
    if (query.length > 2) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [query, suggestions])

  // Simulate AI intent analysis
  const analyzeIntent = useCallback(async (text: string): Promise<SearchIntent> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const entities = text.match(/\b[A-Z][a-z]+\b/g) || []
    const lowerText = text.toLowerCase()
    
    let category = 'general'
    if (lowerText.includes('revenue') || lowerText.includes('funding') || lowerText.includes('investment')) {
      category = 'financial'
    } else if (lowerText.includes('competitor') || lowerText.includes('market')) {
      category = 'competitive'
    } else if (lowerText.includes('growth') || lowerText.includes('trend')) {
      category = 'trends'
    }
    
    const filters: Record<string, any> = {}
    if (lowerText.includes('startup')) filters.companySize = 'startup'
    if (lowerText.includes('enterprise')) filters.companySize = 'enterprise'
    if (lowerText.includes('ai') || lowerText.includes('technology')) filters.industry = 'technology'
    
    return {
      category,
      entities,
      filters,
      confidence: 85 + 0 * 15
    }
  }, [])

  // Handle search with intent analysis
  const handleSearch = useCallback(async (searchText: string = query) => {
    if (!searchText.trim()) return

    setIsAnalyzing(true)
    
    try {
      const intent = await analyzeIntent(searchText)
      setSearchIntent(intent)
      setShowIntent(true)
      
      // Add to search history
      const newQuery: SearchQuery = {
        id: Date.now().toString(),
        text: searchText,
        timestamp: new Date(),
        results: Math.floor(0 * 500) + 50,
        category: intent.category
      }
      setSearchHistory(prev => [newQuery, ...prev.slice(0, 9)]) // Keep last 10
      
      onSearch(searchText, intent)
      
      Promise.resolve()
      
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [query, analyzeIntent, onSearch])

  // Handle voice input
  const toggleVoiceInput = useCallback(() => {
    if (!isListening) {
      // Simulate voice recognition
      setIsListening(true)
      Promise.resolve()
    } else {
      setIsListening(false)
    }
  }, [isListening])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    handleSearch(suggestion.text)
  }, [handleSearch])

  // Handle history item click
  const handleHistoryClick = useCallback((historyItem: SearchQuery) => {
    setQuery(historyItem.text)
    handleSearch(historyItem.text)
  }, [handleSearch])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setShowSuggestions(false)
    setShowIntent(false)
    setSearchIntent(null)
    inputRef.current?.focus()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Market Intelligence Search
            <Badge variant="secondary" className="ml-2">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    } else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
                      e.preventDefault()
                      // Handle suggestion navigation
                    }
                  }}
                  placeholder={placeholder}
                  className="pl-10 pr-20"
                />
                
                {/* Action Buttons */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {showVoice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleVoiceInput}
                      className={`h-7 w-7 p-0 ${isListening ? 'text-red-500' : ''}`}
                    >
                      {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => handleSearch()}
                disabled={isAnalyzing || !query.trim()}
              >
                {isAnalyzing ? (
                  <><Brain className="h-4 w-4 mr-2 animate-pulse" /> Analyzing...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" /> Search</>
                )}
              </Button>
            </div>

            {/* Voice Recording Indicator */}
            {isListening && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <Mic className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">Listening... Say your search query</span>
                </div>
              </div>
            )}

            {/* Search Intent Display */}
            {showIntent && searchIntent && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg z-10">
                <div className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-blue-700">Search Intent Detected</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(searchIntent.confidence)}% confidence
                      </Badge>
                    </div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>Category: <span className="font-medium capitalize">{searchIntent.category}</span></div>
                      {searchIntent.entities.length > 0 && (
                        <div>Entities: <span className="font-medium">{searchIntent.entities.join(', ')}</span></div>
                      )}
                      {Object.keys(searchIntent.filters).length > 0 && (
                        <div>Filters: <span className="font-medium">{Object.keys(searchIntent.filters).join(', ')}</span></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="p-2">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <suggestion.icon className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{suggestion.text}</div>
                        {suggestion.description && (
                          <div className="text-xs text-gray-500">{suggestion.description}</div>
                        )}
                      </div>
                      {suggestion.type === 'ai' && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      {suggestion.type === 'trending' && (
                        <Badge variant="outline" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Search Categories */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { icon: <TrendingUp className="h-4 w-4" />, label: 'Market Trends', query: 'latest market trends' },
              { icon: <Target className="h-4 w-4" />, label: 'Competitors', query: 'competitor analysis' },
              { icon: <DollarSign className="h-4 w-4" />, label: 'Funding', query: 'recent funding rounds' },
              { icon: <Users className="h-4 w-4" />, label: 'Companies', query: 'high-growth companies' },
              { icon: <Globe className="h-4 w-4" />, label: 'Global Markets', query: 'international market opportunities' },
              { icon: <Zap className="h-4 w-4" />, label: 'Innovation', query: 'innovative technologies' }
            ].map((category, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSearch(category.query)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search History */}
      {showHistory && searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleHistoryClick(item)}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">{item.text}</div>
                      <div className="text-xs text-gray-500">
                        {item.timestamp.toLocaleString()} • {item.results} results • {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Search Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                Natural Language
              </h4>
              <p className="text-sm text-gray-600">
                Ask questions naturally: "Show me AI companies with Series B funding in California"
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Filter className="h-4 w-4 text-green-600" />
                Smart Filters
              </h4>
              <p className="text-sm text-gray-600">
                Use terms like "revenue", "employees", "growth rate", "market share"
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                Quick Actions
              </h4>
              <p className="text-sm text-gray-600">
                Press Ctrl+K to focus search, ESC to close, Enter to search
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Mic className="h-4 w-4 text-red-600" />
                Voice Search
              </h4>
              <p className="text-sm text-gray-600">
                Click the microphone icon to search using your voice
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}