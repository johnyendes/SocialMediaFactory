import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateInsight } from '@/lib/openai';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { symbol, timeframe = '1month' } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: 'Company symbol is required' },
        { status: 400 }
      );
    }

    // Get company data and related information
    const company = await prisma.companyProfile.findUnique({
      where: { symbol },
      include: {
        insights: true,
        predictions: true,
        competitors: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get latest market data
    const marketData = await prisma.marketData.findFirst({
      where: { symbol },
      orderBy: { timestamp: 'desc' },
    });

    // Calculate base metrics
    const currentPrice = marketData?.price || 0;
    const marketCap = company.marketCap || 0;
    const revenue = company.revenue || 0;
    const netIncome = company.netIncome || 0;
    const employees = company.employees || 0;

    // Get recent insights and predictions
    const recentInsights = company.insights.slice(-5);
    const recentPredictions = company.predictions.slice(-3);

    // Build AI prompt for scoring
    const scoringPrompt = `
As a senior market analyst, please analyze this company and provide a predictive investment score:

COMPANY: ${company.name} (${company.symbol})
INDUSTRY: ${company.industry}
SECTOR: ${company.sector}

FINANCIAL METRICS:
- Current Price: $${currentPrice}
- Market Cap: $${(marketCap / 1000000000000).toFixed(2)}T
- Revenue: $${(revenue / 1000000000).toFixed(2)}B
- Net Income: $${(netIncome / 1000000000).toFixed(2)}B
- Employees: ${employees.toLocaleString()}

RECENT AI INSIGHTS:
${recentInsights.map(insight => `- ${insight.title} (${insight.confidence}% confidence)`).join('\n')}

RECENT PREDICTIONS:
${recentPredictions.map(pred => `- ${pred.metric}: ${pred.predictedValue} (${pred.confidence}% confidence)`).join('\n')}

COMPETITORS:
${company.competitors.slice(0, 3).map(comp => `- ${comp.competitorName} (${(comp.similarity * 100).toFixed(0)}% similarity)`).join('\n')}

Please provide:
1. An overall investment score (0-100)
2. Breakdown scores for: Growth (0-100), Stability (0-100), Innovation (0-100), Market Position (0-100)
3. Key strengths and weaknesses
4. Risk factors
5. Investment recommendation (BUY/HOLD/SELL)
6. Confidence level in your analysis

Format as JSON with keys: overallScore, breakdown, strengths, weaknesses, risks, recommendation, confidence
`;

    // Generate AI-powered scoring
    const aiResponse = await generateInsight(scoringPrompt);
    
    let scoringData;
    try {
      // Try to parse JSON response
      scoringData = JSON.parse(aiResponse);
    } catch (parseError) {
      // If parsing fails, create structured response from text
      scoringData = {
        overallScore: extractScore(aiResponse, 'overall') || 75,
        breakdown: {
          growth: extractScore(aiResponse, 'growth') || 75,
          stability: extractScore(aiResponse, 'stability') || 70,
          innovation: extractScore(aiResponse, 'innovation') || 80,
          marketPosition: extractScore(aiResponse, 'market') || 75,
        },
        strengths: extractSection(aiResponse, 'strengths') || ['Strong market presence'],
        weaknesses: extractSection(aiResponse, 'weaknesses') || ['Competitive pressure'],
        risks: extractSection(aiResponse, 'risks') || ['Market volatility'],
        recommendation: extractRecommendation(aiResponse) || 'HOLD',
        confidence: extractScore(aiResponse, 'confidence') || 75,
        rawAnalysis: aiResponse,
      };
    }

    // Calculate technical indicators (simplified)
    const technicalIndicators = {
      priceMomentum: marketData ? (marketData.changePercent > 0 ? 75 : 45) : 50,
      volumeAnalysis: marketData?.volume ? 65 : 50,
      relativeStrength: 70, // Would compare to market/sector
    };

    // Combine AI and technical scores
    const finalScore = Math.round(
      (scoringData.overallScore * 0.7 + 
       Object.values(technicalIndicators).reduce((a, b) => a + b, 0) / 3 * 0.3)
    );

    // Store scoring result in database for tracking
    await prisma.aIInsight.create({
      data: {
        companyId: company.id,
        type: 'SCORING',
        title: `Predictive Score for ${company.symbol}: ${finalScore}/100`,
        description: `AI-generated predictive scoring: ${scoringData.recommendation} with ${scoringData.confidence}% confidence`,
        confidence: scoringData.confidence,
        impact: finalScore >= 80 ? 'HIGH' : finalScore >= 60 ? 'MEDIUM' : 'LOW',
        timeframe,
        actionable: true,
        source: 'AI_SCORING_ENGINE',
        metadata: {
          scores: scoringData,
          technicalIndicators,
          finalScore,
        },
      },
    });

    return NextResponse.json({
      symbol,
      company: company.name,
      timestamp: new Date().toISOString(),
      scores: {
        overall: finalScore,
        aiGenerated: scoringData.overallScore,
        technical: Math.round(Object.values(technicalIndicators).reduce((a, b) => a + b, 0) / 3),
      },
      breakdown: scoringData.breakdown,
      analysis: {
        strengths: scoringData.strengths,
        weaknesses: scoringData.weaknesses,
        risks: scoringData.risks,
      },
      recommendation: scoringData.recommendation,
      confidence: scoringData.confidence,
      technicalIndicators,
      metadata: {
        marketData: {
          price: currentPrice,
          changePercent: marketData?.changePercent || 0,
          volume: marketData?.volume || 0,
        },
        analysisTimeframe: timeframe,
        model: 'GPT-4_Predictive_Scoring_v1',
      },
    });

  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictive score' },
      { status: 500 }
    );
  }
}

// Helper functions for parsing AI responses
function extractScore(text: string, type: string): number {
  const patterns = {
    overall: /(\d+)\s*(?:out of\s*)?100|score[:\s]+(\d+)/i,
    growth: /growth[:\s]+(\d+)|(\d+)\s*(?:%|\/\s*100)/i,
    stability: /stability[:\s]+(\d+)/i,
    innovation: /innovation[:\s]+(\d+)/i,
    market: /market[:\s]+(\d+)|position[:\s]+(\d+)/i,
    confidence: /confidence[:\s]+(\d+)|(\d+)%/i,
  };

  const pattern = patterns[type as keyof typeof patterns];
  if (!pattern) return 0;

  const match = text.match(pattern);
  return match ? parseInt(match[1] || match[2] || '0') : 0;
}

function extractSection(text: string, section: string): string[] {
  const patterns = {
    strengths: /strengths?[:\s]*([^]+?)(?:weaknesses?|risks?|$)/i,
    weaknesses: /weaknesses?[:\s]*([^]+?)(?:strength?|risks?|$)/i,
    risks: /risks?[:\s]*([^]+?)(?:strengths?|weaknesses?|$)/i,
  };

  const pattern = patterns[section as keyof typeof patterns];
  if (!pattern) return [];

  const match = text.match(pattern);
  if (!match) return [];

  return match[1]
    .split(/[-*]\s*/)
    .filter(item => item.trim().length > 0)
    .map(item => item.trim())
    .slice(0, 3);
}

function extractRecommendation(text: string): string {
  const match = text.match(/(BUY|HOLD|SELL)/i);
  return match ? match[1].toUpperCase() : 'HOLD';
}

// GET endpoint for retrieving recent scores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (symbol) {
      // Get scores for specific company
      const scores = await prisma.aIInsight.findMany({
        where: {
          companyId: symbol,
          type: 'SCORING',
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({
        symbol,
        scores: scores.map(score => ({
          id: score.id,
          score: score.confidence,
          recommendation: score.impact,
          confidence: score.confidence,
          timestamp: score.createdAt,
        })),
      });
    } else {
      // Get all recent scores
      const scores = await prisma.aIInsight.findMany({
        where: { type: 'SCORING' },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({
        scores: scores.map(score => ({
          id: score.id,
          title: score.title,
          score: score.confidence,
          confidence: score.confidence,
          timestamp: score.createdAt,
        })),
      });
    }

  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scoring data' },
      { status: 500 }
    );
  }
}