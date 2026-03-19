import { NextRequest, NextResponse } from 'next/server'
import openai from '@/lib/openai'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get real market data and company info
    const companies = await prisma.companyProfile.findMany({
      select: { name: true, symbol: true, revenue: true, netIncome: true },
      take: 3
    })

    // Create prediction prompt with REAL financial data
    const prompt = `Based on this REAL financial data, generate 3 market predictions:

Company Financials:
${companies.map(c => `- ${c.symbol}: Revenue: $${(c.revenue! / 1e9).toFixed(1)}B, Net Income: $${(c.netIncome! / 1e9).toFixed(1)}B`).join('\n')}

Generate predictions in this exact JSON format:
[
  {
    "symbol": "AAPL"|"GOOGL"|"MSFT",
    "metric": "stock_price"|"revenue"|"market_cap",
    "predictedValue": 150.25,
    "confidence": 85,
    "timeframe": "1 month"|"3 months"|"6 months",
    "methodology": "AI prediction based on financial trends"
  }
]`

    // Call REAL OpenAI API for predictions
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a financial prediction AI. Generate realistic predictions based on the provided data. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    })

    const aiResponse = completion.choices[0].message.content
    
    // Try to extract JSON from response
    let predictions = []
    try {
      predictions = JSON.parse(aiResponse || '[]')
    } catch (parseError) {
      // Extract JSON from response if it contains extra text
      const jsonMatch = aiResponse?.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          predictions = JSON.parse(jsonMatch[0])
        } catch (e) {
          console.error('Failed to parse JSON:', e)
          predictions = []
        }
      }
    }

    // Store predictions in database
    for (const prediction of predictions) {
      const company = await prisma.companyProfile.findUnique({
        where: { symbol: prediction.symbol }
      })

      if (company) {
        await prisma.prediction.create({
          data: {
            companyId: company.id,
            ...prediction,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        })
      }
    }

    return NextResponse.json(predictions)
  } catch (error) {
    console.error('Error generating predictions:', error)
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}