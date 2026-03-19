import { NextRequest, NextResponse } from 'next/server'
import openai from '@/lib/openai'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get real market data from database
    const companies = await prisma.companyProfile.findMany({
      select: { name: true, symbol: true, industry: true, marketCap: true },
      take: 5
    })

    const marketData = await prisma.marketData.findMany({
      select: { symbol: true, change: true, changePercent: true },
      orderBy: { timestamp: 'desc' },
      take: 5
    })

    // Create prompt with REAL data
    const prompt = `Based on this real market data, generate 3 AI insights for a market intelligence platform:

Companies in portfolio:
${companies.map(c => `- ${c.symbol}: ${c.name} (${c.industry}), Market Cap: $${(c.marketCap! / 1e9).toFixed(1)}B`).join('\n')}

Recent market movements:
${marketData.map(d => `- ${d.symbol}: ${d.change > 0 ? '+' : ''}${d.changePercent}%`).join('\n')}

Generate insights in this exact JSON format:
[
  {
    "type": "TREND"|"OPPORTUNITY"|"RISK"|"RECOMMENDATION",
    "title": "Brief title (under 60 chars)",
    "description": "Detailed description (100-200 words) based on the actual data",
    "confidence": 85-95,
    "impact": "LOW"|"MEDIUM"|"HIGH",
    "timeframe": "Next 1-3 months"|"Next 3-6 months"|"Next 6-12 months",
    "actionable": true
  }
]`

    // Call REAL OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert market analyst providing AI-powered insights based on real financial data. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    // Parse AI response
    const aiResponse = completion.choices[0].message.content
    const insights = JSON.parse(aiResponse || '[]')

    // Store insights in database for caching
    for (const insight of insights) {
      await prisma.aIInsight.create({
        data: {
          ...insight,
          source: 'OPENAI_GPT4',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      })
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error generating AI insights:', error)
    
    // Fallback to cached insights if available
    const cachedInsights = await prisma.aIInsight.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    if (cachedInsights.length > 0) {
      return NextResponse.json(cachedInsights)
    }

    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}