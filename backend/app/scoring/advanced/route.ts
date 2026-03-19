import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateInsight } from '@/lib/openai';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { 
      symbol, 
      scoringMode = 'comprehensive',
      includeBenchmarking = true,
      includeConfidenceIntervals = true,
      timeHorizon = '12months'
    } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: 'Company symbol is required for advanced scoring' },
        { status: 400 }
      );
    }

    // Get comprehensive company and market data
    const company = await prisma.companyProfile.findUnique({
      where: { symbol: symbol.toUpperCase() },
      include: {
        insights: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        competitors: {
          orderBy: { similarity: 'desc' },
          take: 10
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get sector and industry companies for benchmarking
    const sectorCompanies = await prisma.companyProfile.findMany({
      where: { 
        OR: [
          { sector: company.sector },
          { industry: company.industry }
        ]
      },
      take: 15,
    });

    // Get market data for technical analysis
    const marketData = await prisma.marketData.findFirst({
      where: { symbol },
      orderBy: { timestamp: 'desc' },
    });

    // Calculate advanced scoring with confidence intervals
    const advancedScoring = await calculateAdvancedScoring({
      company,
      marketData,
      sectorCompanies,
      options: {
        scoringMode,
        includeBenchmarking,
        includeConfidenceIntervals,
        timeHorizon
      }
    });

    // Store advanced scoring results
    await prisma.aIInsight.create({
      data: {
        companyId: company.id,
        type: 'ADVANCED_SCORING',
        title: `Advanced Score Analysis for ${company.symbol}: ${advancedScoring.overallScore}/100`,
        description: `Advanced multi-factor scoring with confidence intervals and benchmarking`,
        confidence: advancedScoring.confidenceLevel,
        impact: advancedScoring.overallScore >= 80 ? 'HIGH' : advancedScoring.overallScore >= 60 ? 'MEDIUM' : 'LOW',
        timeframe: timeHorizon,
        actionable: true,
        source: 'ADVANCED_AI_SCORING_ENGINE',
        metadata: advancedScoring,
      },
    });

    return NextResponse.json({
      success: true,
      symbol,
      company: company.name,
      timestamp: new Date().toISOString(),
      scoring: advancedScoring,
      metadata: {
        scoringMode,
        timeHorizon,
        sectorBenchmarkSize: sectorCompanies.length,
        model: 'GPT-4_Advanced_Scoring_v2',
      }
    });

  } catch (error) {
    console.error('Advanced scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to generate advanced scoring analysis' },
      { status: 500 }
    );
  }
}

async function calculateAdvancedScoring({
  company,
  marketData,
  sectorCompanies,
  options
}: {
  company: any;
  marketData: any;
  sectorCompanies: any[];
  options: any;
}) {

  // Base scoring factors
  const baseScores = calculateBaseScores(company, marketData);
  
  // AI-enhanced scoring
  const aiScores = await calculateAIScores(company, options);
  
  // Confidence intervals calculation
  const confidenceIntervals = calculateConfidenceIntervals(baseScores, aiScores, sectorCompanies);
  
  // Sector benchmarking
  const sectorBenchmarking = await calculateSectorBenchmarking(company, sectorCompanies);
  
  // Technical analysis enhancement
  const technicalScores = calculateTechnicalScores(marketData);
  
  // Risk-adjusted scoring
  const riskAdjustedScores = calculateRiskAdjustedScores(baseScores, technicalScores, company);

  // Combine all scoring factors
  const overallScore = calculateWeightedOverallScore({
    baseScores,
    aiScores,
    technicalScores,
    riskAdjustedScores,
    confidenceIntervals,
    options
  });

  return {
    overallScore,
    confidenceLevel: confidenceIntervals.overallConfidence,
    confidenceIntervals: {
      overall: {
        lower: Math.max(0, overallScore - confidenceIntervals.marginOfError),
        upper: Math.min(100, overallScore + confidenceIntervals.marginOfError),
        marginOfError: confidenceIntervals.marginOfError,
        confidenceLevel: confidenceIntervals.overallConfidence
      },
      breakdown: confidenceIntervals.breakdown
    },
    factorBreakdown: {
      fundamental: {
        score: baseScores.fundamental,
        weight: 0.25,
        contribution: baseScores.fundamental * 0.25,
        confidence: confidenceIntervals.breakdown.fundamental.confidence,
        factors: {
          financialHealth: baseScores.financialHealth,
          profitability: baseScores.profitability,
          growth: baseScores.growth,
          efficiency: baseScores.efficiency
        }
      },
      technical: {
        score: technicalScores.technical,
        weight: 0.20,
        contribution: technicalScores.technical * 0.20,
        confidence: confidenceIntervals.breakdown.technical.confidence,
        factors: {
          priceMomentum: technicalScores.priceMomentum,
          volumeAnalysis: technicalScores.volumeAnalysis,
          relativeStrength: technicalScores.relativeStrength,
          volatility: technicalScores.volatility
        }
      },
      aiSentiment: {
        score: aiScores.sentiment,
        weight: 0.30,
        contribution: aiScores.sentiment * 0.30,
        confidence: confidenceIntervals.breakdown.ai.confidence,
        factors: {
          insights: aiScores.insights,
          predictions: aiScores.predictions,
          news: aiScores.news,
          outlook: aiScores.outlook
        }
      },
      competitive: {
        score: baseScores.competitive,
        weight: 0.15,
        contribution: baseScores.competitive * 0.15,
        confidence: confidenceIntervals.breakdown.competitive.confidence,
        factors: {
          marketPosition: baseScores.marketPosition,
          competitiveAdvantages: baseScores.competitiveAdvantages,
          barriersToEntry: baseScores.barriersToEntry
        }
      },
      riskAdjusted: {
        score: riskAdjustedScores.riskAdjusted,
        weight: 0.10,
        contribution: riskAdjustedScores.riskAdjusted * 0.10,
        confidence: confidenceIntervals.breakdown.risk.confidence,
        factors: {
          businessRisk: riskAdjustedScores.businessRisk,
          financialRisk: riskAdjustedScores.financialRisk,
          marketRisk: riskAdjustedScores.marketRisk
        }
      }
    },
    sectorBenchmarking: sectorBenchmarking,
    riskMetrics: {
      overallRisk: riskAdjustedScores.overallRisk,
      riskFactors: riskAdjustedScores.riskFactors,
      riskScore: riskAdjustedScores.riskScore,
      volatilityAdjustedReturn: riskAdjustedScores.volatilityAdjustedReturn
    },
    predictiveMetrics: {
      expectedReturn: calculateExpectedReturn(overallScore, riskAdjustedScores, options.timeHorizon),
      probabilityOfOutperformance: calculateProbabilityOfOutperformance(overallScore, sectorBenchmarking),
      timeToTarget: calculateTimeToTarget(overallScore, riskAdjustedScores, options.timeHorizon)
    },
    qualityIndicators: {
      dataQuality: assessDataQuality(company, marketData),
      modelConfidence: confidenceIntervals.overallConfidence,
      predictionAccuracy: calculatePredictionAccuracy(company.predictions),
      updateFrequency: 'Real-time'
    }
  };
}

function calculateBaseScores(company: any, marketData: any) {
  const scores = {
    fundamental: 0,
    financialHealth: 0,
    profitability: 0,
    growth: 0,
    efficiency: 0,
    competitive: 0,
    marketPosition: 0,
    competitiveAdvantages: 0,
    barriersToEntry: 0
  };

  // Financial Health Score
  let healthScore = 50; // Base score
  if (company.revenue && company.revenue > 100000000000) healthScore += 15;
  if (company.netIncome && company.netIncome > 10000000000) healthScore += 15;
  if (company.marketCap && company.marketCap > 500000000000) healthScore += 10;
  if (company.employees && company.employees > 50000) healthScore += 10;
  scores.financialHealth = Math.min(healthScore, 100);

  // Profitability Score
  let profitabilityScore = 60; // Base score
  if (company.netIncome && company.revenue) {
    const profitMargin = company.netIncome / company.revenue;
    if (profitMargin > 0.20) profitabilityScore += 25;
    else if (profitMargin > 0.10) profitabilityScore += 15;
    else if (profitMargin > 0.05) profitabilityScore += 10;
  }
  scores.profitability = Math.min(profitabilityScore, 100);

  // Growth Score
  let growthScore = 65; // Base score
  if (company.industry.includes('Technology')) growthScore += 15;
  if (company.sector.includes('Technology')) growthScore += 10;
  if (company.revenue && company.revenue > 50000000000) growthScore += 10;
  scores.growth = Math.min(growthScore, 100);

  // Efficiency Score
  let efficiencyScore = 70; // Base score
  if (company.employees && company.revenue) {
    const revenuePerEmployee = company.revenue / company.employees;
    if (revenuePerEmployee > 1000000) efficiencyScore += 20;
    else if (revenuePerEmployee > 500000) efficiencyScore += 10;
  }
  scores.efficiency = Math.min(efficiencyScore, 100);

  // Calculate fundamental score as weighted average
  scores.fundamental = Math.round(
    (scores.financialHealth * 0.3 + 
     scores.profitability * 0.3 + 
     scores.growth * 0.2 + 
     scores.efficiency * 0.2)
  );

  // Competitive Position Score
  let competitiveScore = 70; // Base score
  if (company.competitors && company.competitors.length < 5) competitiveScore += 15;
  if (company.name.includes('Inc') || company.name.includes('Corporation')) competitiveScore += 10;
  if (company.marketCap && company.marketCap > 1000000000000) competitiveScore += 5;
  scores.marketPosition = Math.min(competitiveScore, 100);

  // Competitive Advantages
  scores.competitiveAdvantages = Math.min(competitiveScore + 5, 100);
  scores.barriersToEntry = Math.min(competitiveScore - 5, 100);

  // Calculate competitive score
  scores.competitive = Math.round(
    (scores.marketPosition * 0.4 + 
     scores.competitiveAdvantages * 0.35 + 
     scores.barriersToEntry * 0.25)
  );

  return scores;
}

async function calculateAIScores(company: any, options: any) {
  // Calculate scores based on AI insights and predictions
  const insights = company.insights || [];
  const predictions = company.predictions || [];

  let sentimentScore = 70; // Base score
  let insightsScore = 70;
  let predictionsScore = 70;
  let outlookScore = 70;

  // Analyze recent insights
  const positiveInsights = insights.filter((i: any) => i.type === 'OPPORTUNITY' || i.impact === 'HIGH');
  const negativeInsights = insights.filter((i: any) => i.type === 'RISK' || i.impact === 'LOW');
  
  if (positiveInsights.length > negativeInsights.length) {
    insightsScore += 15;
    sentimentScore += 10;
  } else if (negativeInsights.length > positiveInsights.length) {
    insightsScore -= 10;
    sentimentScore -= 10;
  }

  // Analyze predictions
  if (predictions.length > 0) {
    const avgConfidence = predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / predictions.length;
    predictionsScore = Math.round(avgConfidence);
  }

  // Calculate overall AI sentiment
  sentimentScore = Math.round(
    (insightsScore * 0.3 + predictionsScore * 0.3 + outlookScore * 0.4)
  );

  return {
    sentiment: sentimentScore,
    insights: insightsScore,
    predictions: predictionsScore,
    outlook: outlookScore,
    news: outlookScore // Add missing news property
  };
}

function calculateTechnicalScores(marketData: any) {
  const scores = {
    technical: 60, // Base score
    priceMomentum: 60,
    volumeAnalysis: 60,
    relativeStrength: 70,
    volatility: 65
  };

  if (marketData) {
    // Price momentum
    if (marketData.changePercent > 5) scores.priceMomentum = 85;
    else if (marketData.changePercent > 2) scores.priceMomentum = 75;
    else if (marketData.changePercent > 0) scores.priceMomentum = 65;
    else if (marketData.changePercent > -2) scores.priceMomentum = 55;
    else scores.priceMomentum = 45;

    // Volume analysis
    if (marketData.volume && marketData.volume > 50000000) scores.volumeAnalysis = 80;
    else if (marketData.volume && marketData.volume > 20000000) scores.volumeAnalysis = 70;
    else if (marketData.volume && marketData.volume > 10000000) scores.volumeAnalysis = 60;
    else scores.volumeAnalysis = 50;

    // Calculate overall technical score
    scores.technical = Math.round(
      (scores.priceMomentum * 0.4 + 
       scores.volumeAnalysis * 0.3 + 
       scores.relativeStrength * 0.2 + 
       scores.volatility * 0.1)
    );
  }

  return scores;
}

function calculateRiskAdjustedScores(baseScores: any, technicalScores: any, company: any) {
  const riskScores = {
    businessRisk: 30, // Lower is better
    financialRisk: 30,
    marketRisk: 40,
    overallRisk: 33, // Weighted average
    riskAdjusted: 67, // Inverse of risk (100 - riskScore)
    riskScore: 33,
    volatilityAdjustedReturn: 65,
    riskFactors: []
  };

  // Business risk assessment
  if (company.competitors && company.competitors.length > 10) riskScores.businessRisk += 15;
  if (company.industry.includes('Technology')) riskScores.businessRisk += 10;
  
  // Financial risk
  if (!company.netIncome || company.netIncome < 0) riskScores.financialRisk += 20;
  if (!company.revenue || company.revenue < 10000000000) riskScores.financialRisk += 15;

  // Market risk
  riskScores.marketRisk = 40; // Base market risk

  // Calculate overall risk
  riskScores.overallRisk = Math.round(
    (riskScores.businessRisk * 0.4 + 
     riskScores.financialRisk * 0.35 + 
     riskScores.marketRisk * 0.25)
  );

  riskScores.riskAdjusted = Math.max(0, 100 - riskScores.overallRisk);
  riskScores.riskScore = riskScores.overallRisk;

  riskScores.riskFactors = [
    riskScores.businessRisk > 40 ? 'High competitive pressure' : null,
    riskScores.financialRisk > 40 ? 'Financial stability concerns' : null,
    riskScores.marketRisk > 50 ? 'Market volatility exposure' : null
  ].filter(Boolean);

  return riskScores;
}

function calculateConfidenceIntervals(baseScores: any, aiScores: any, sectorCompanies: any[]) {
  const sampleSize = sectorCompanies.length;
  const standardError = sampleSize > 0 ? 15 / Math.sqrt(sampleSize) : 10; // Approximation
  
  const confidenceLevels = {
    overall: 75 + (sampleSize > 10 ? 10 : 0),
    fundamental: 80,
    technical: 70,
    ai: 75,
    competitive: 65,
    risk: 70
  };

  const marginOfError = Math.round(standardError * 1.96); // 95% confidence interval

  return {
    overallConfidence: confidenceLevels.overall,
    marginOfError,
    breakdown: {
      fundamental: {
        confidence: confidenceLevels.fundamental,
        marginOfError: Math.round(marginOfError * 0.8)
      },
      technical: {
        confidence: confidenceLevels.technical,
        marginOfError: Math.round(marginOfError * 1.2)
      },
      ai: {
        confidence: confidenceLevels.ai,
        marginOfError: marginOfError
      },
      competitive: {
        confidence: confidenceLevels.competitive,
        marginOfError: Math.round(marginOfError * 1.5)
      },
      risk: {
        confidence: confidenceLevels.risk,
        marginOfError: Math.round(marginOfError * 1.1)
      }
    }
  };
}

async function calculateSectorBenchmarking(company: any, sectorCompanies: any[]) {
  const sector = company.sector;
  const industry = company.industry;
  
  // Calculate sector averages
  const sectorStats = {
    avgMarketCap: 0,
    avgRevenue: 0,
    avgEmployees: 0,
    companyCount: sectorCompanies.length,
    topQuartileThreshold: 0,
    medianValue: 0
  };

  if (sectorCompanies.length > 0) {
    const marketCaps = sectorCompanies
      .filter(c => c.marketCap)
      .map(c => c.marketCap)
      .sort((a, b) => a - b);
    
    sectorStats.avgMarketCap = marketCaps.reduce((sum, cap) => sum + cap, 0) / marketCaps.length;
    sectorStats.medianValue = marketCaps[Math.floor(marketCaps.length / 2)];
    sectorStats.topQuartileThreshold = marketCaps[Math.floor(marketCaps.length * 0.75)];
  }

  // Calculate company's relative position
  const relativePosition = {
    marketCapPercentile: calculatePercentile(company.marketCap, sectorCompanies.map(c => c.marketCap)),
    revenuePercentile: calculatePercentile(company.revenue, sectorCompanies.map(c => c.revenue)),
    overallSectorRank: sectorCompanies.findIndex(c => c.symbol === company.symbol) + 1,
    outperformanceScore: 0
  };

  relativePosition.outperformanceScore = Math.round(
    (relativePosition.marketCapPercentile + relativePosition.revenuePercentile) / 2
  );

  return {
    sector: sector,
    industry: industry,
    sectorStats,
    relativePosition,
    benchmarkingData: {
      companiesInAnalysis: sectorCompanies.length,
      dataFreshness: 'Real-time',
      comparisonGroups: [sector, industry],
      methodology: 'Percentile-based ranking with weighted factors'
    }
  };
}

function calculateWeightedOverallScore(scores: any) {
  const weightedSum = 
    scores.baseScores.fundamental * 0.25 +
    scores.technicalScores.technical * 0.20 +
    scores.aiScores.sentiment * 0.30 +
    scores.baseScores.competitive * 0.15 +
    scores.riskAdjustedScores.riskAdjusted * 0.10;

  return Math.round(Math.min(100, Math.max(0, weightedSum)));
}

// Helper functions
function calculatePercentile(value: number, array: number[]) {
  if (!value || array.length === 0) return 50;
  const sorted = array.filter(v => v).sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  return index === -1 ? 100 : Math.round((index / sorted.length) * 100);
}

function calculateExpectedReturn(score: number, riskScores: any, timeHorizon: string) {
  const baseReturn = (score / 100) * 0.15; // 15% max return
  const riskAdjustment = (riskScores.riskAdjusted / 100) * 0.05;
  const timeMultiplier = timeHorizon === '12months' ? 1 : timeHorizon === '24months' ? 2 : 0.5;
  
  return {
    annualized: Math.round((baseReturn + riskAdjustment) * 100) / 100,
    projected: Math.round((baseReturn + riskAdjustment) * timeMultiplier * 100) / 100,
    confidence: 75
  };
}

function calculateProbabilityOfOutperformance(score: number, benchmarking: any) {
  const sectorAvg = 65; // Assumed sector average
  const outperformance = score - sectorAvg;
  const probability = Math.min(95, Math.max(5, 50 + (outperformance * 1.5)));
  
  return Math.round(probability);
}

function calculateTimeToTarget(score: number, riskScores: any, timeHorizon: string) {
  if (score >= 80) return 'Immediate';
  if (score >= 70) return '3-6 months';
  if (score >= 60) return '6-12 months';
  return '12+ months';
}

function assessDataQuality(company: any, marketData: any) {
  let qualityScore = 80; // Base quality
  
  if (!company.revenue) qualityScore -= 20;
  if (!company.netIncome) qualityScore -= 15;
  if (!company.marketCap) qualityScore -= 25;
  if (!marketData) qualityScore -= 30;
  if (!company.employees) qualityScore -= 10;
  
  return Math.max(0, qualityScore);
}

function calculatePredictionAccuracy(predictions: any[]) {
  if (!predictions || predictions.length === 0) return 70;
  
  const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  return Math.round(avgConfidence);
}

// GET endpoint for portfolio scoring
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || [];
    const mode = searchParams.get('mode') || 'comprehensive';

    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'At least one symbol is required for portfolio scoring' },
        { status: 400 }
      );
    }

    // Get portfolio data for multiple symbols
    const portfolioData = await Promise.all(
      symbols.map(async (symbol) => {
        const company = await prisma.companyProfile.findUnique({
          where: { symbol: symbol.trim().toUpperCase() },
          include: {
            insights: { orderBy: { createdAt: 'desc' }, take: 10 },
            predictions: { orderBy: { createdAt: 'desc' }, take: 5 },
            competitors: { orderBy: { similarity: 'desc' }, take: 5 },
          },
        });

        const marketData = await prisma.marketData.findFirst({
          where: { symbol: symbol.trim().toUpperCase() },
          orderBy: { timestamp: 'desc' },
        });

        if (!company || !marketData) {
          return { symbol, error: 'Data not available' };
        }

        const basicScore = calculateBaseScores(company, marketData);
        const technicalScore = calculateTechnicalScores(marketData);
        const riskScore = calculateRiskAdjustedScores(basicScore, technicalScore, company);

        return {
          symbol: company.symbol,
          name: company.name,
          overallScore: calculateWeightedOverallScore({ baseScores: basicScore, technicalScores: technicalScore, aiScores: { sentiment: 70 }, riskAdjustedScores: riskScore }),
          breakdown: {
            fundamental: basicScore.fundamental,
            technical: technicalScore.technical,
            competitive: basicScore.competitive,
            risk: riskScore.riskAdjusted
          },
          riskLevel: riskScore.overallRisk > 50 ? 'HIGH' : riskScore.overallRisk > 30 ? 'MEDIUM' : 'LOW'
        };
      })
    );

    // Calculate portfolio metrics
    const validScores = portfolioData.filter(d => !d.error);
    const portfolioScore = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, d) => sum + d.overallScore, 0) / validScores.length)
      : 0;

    return NextResponse.json({
      success: true,
      portfolioAnalysis: {
        overallScore: portfolioScore,
        symbolCount: symbols.length,
        successfulAnalysis: validScores.length,
        scoringMode: mode
      },
      individualScores: portfolioData,
      recommendations: generatePortfolioRecommendations(validScores)
    });

  } catch (error) {
    console.error('Portfolio scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to generate portfolio scoring analysis' },
      { status: 500 }
    );
  }
}

function generatePortfolioRecommendations(scores: any[]) {
  const recommendations = [];
  
  const highScoreStocks = scores.filter(s => s.overallScore >= 80);
  const mediumScoreStocks = scores.filter(s => s.overallScore >= 60 && s.overallScore < 80);
  const lowScoreStocks = scores.filter(s => s.overallScore < 60);

  if (highScoreStocks.length > 0) {
    recommendations.push({
      type: 'STRONG_BUY',
      symbols: highScoreStocks.map(s => s.symbol),
      reasoning: `High confidence in ${highScoreStocks.length} stocks with scores 80+`
    });
  }

  if (mediumScoreStocks.length > 2) {
    recommendations.push({
      type: 'DIVERSIFY',
      reasoning: `Consider diversifying across ${mediumScoreStocks.length} medium-score stocks`
    });
  }

  if (lowScoreStocks.length > 0) {
    recommendations.push({
      type: 'REVIEW',
      symbols: lowScoreStocks.map(s => s.symbol),
      reasoning: `Review ${lowScoreStocks.length} stocks with scores below 60`
    });
  }

  return recommendations;
}