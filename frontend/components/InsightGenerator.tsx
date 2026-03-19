'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Loader2 } from 'lucide-react'

export function InsightGenerator() {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')

  const generateInsight = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      
      if (data.error) {
        setInsight(`Error: ${data.error}`)
      } else {
        setInsight(data.insight)
      }
    } catch (error) {
      setInsight('Failed to generate insight. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Market Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Ask for market insights:
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Analyze Q3 tech sector trends"
            className="w-full p-2 border rounded-md"
            onKeyPress={(e) => e.key === 'Enter' && generateInsight()}
          />
        </div>
        
        <Button 
          onClick={generateInsight} 
          disabled={loading || !prompt.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating insight...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Insight
            </>
          )}
        </Button>

        {insight && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">AI Insight:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {insight}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}