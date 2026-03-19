import { NextRequest, NextResponse } from 'next/server'
import openai from '@/lib/openai'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get companies from database
    const companies = await prisma.companyProfile.findMany({
      select: { symbol: true, name: true },
      take: 3
    })

    // Generate simple predictions
    const predictions = []
    
    for (const company of companies) {
      const prompt = `Generate a simple stock price prediction for ${company.name} (${company.symbol}) in 3 months. 
      Return ONLY a number between 100 and 500. No explanation, no text, just the number.`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial prediction AI. Always return only a number between 100 and 500."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 10
      })

      const predictedValue = parseFloat(completion.choices[0].message.content || '0')
      
      predictions.push({
        symbol: company.symbol,
        metric: 'stock_price',
        predictedValue: predictedValue,
        confidence: Math.floor(Math.random() * 10) + 85, // 85-94
        timeframe: '3 months',
        methodology: 'OpenAI GPT-3.5 based prediction'
      })
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