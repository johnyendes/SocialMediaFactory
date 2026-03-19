import openai from './openai'
import prisma from './prisma'

interface GenerateInsightParams {
  companyId?: string
  marketData?: any[]
  userPreferences?: any
}

export async function generateAIInsight(params: GenerateInsightParams) {
  try {
    // Get current market data from database
    const recentData = await prisma.marketData.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' }
    })

    const companies = await prisma.companyProfile.findMany({
      take: 5,
      select: { symbol: true, name: true, industry: true }
    })

    // Build context for OpenAI
    const context = {
      marketData: recentData.map(d => ({
        symbol: d.symbol,
        price: d.price,
        change: d.change,
        changePercent: d.changePercent
      })),
      companies: companies,
      timeframe: 'current market conditions',
    }

    const prompt = `
Based on this market data, generate a specific, actionable insight:
${JSON.stringify(context, null, 2)}

Respond with a JSON object containing:
{
  "type": "TREND|OPPORTUNITY|RISK|RECOMMENDATION",
  "title": "Brief, impactful title",
  "description": "Detailed analysis (2-3 sentences)",
  "confidence": 85-95,
  "impact": "LOW|MEDIUM|HIGH|CRITICAL",
  "timeframe": "Next 1-6 months",
  "actionable": true
}

Make it specific to technology companies and current market conditions.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert market analyst providing AI-driven insights for technology companies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const insight = JSON.parse(content)
    
    // Save to database
    const savedInsight = await prisma.aIInsight.create({
      data: {
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        impact: insight.impact,
        timeframe: insight.timeframe,
        actionable: insight.actionable,
        source: 'OPENAI_GPT4',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    })

    console.log('✅ Generated REAL AI insight from OpenAI:', savedInsight.title)
    
    return savedInsight
  } catch (error) {
    console.error('❌ Error generating AI insight:', error)
    throw error
  }
}

export async function generateMultipleInsights(count: number = 3) {
  const insights = []
  for (let i = 0; i < count; i++) {
    try {
      const insight = await generateAIInsight({})
      insights.push(insight)
    } catch (error) {
      console.error(`Failed to generate insight ${i + 1}:`, error)
    }
  }
  return insights
}