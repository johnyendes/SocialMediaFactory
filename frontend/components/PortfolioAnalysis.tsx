"use client";

import { useState } from "react";

interface PortfolioStock {
  symbol: string;
  name: string;
  overallScore: number;
  breakdown: {
    fundamental: number;
    technical: number;
    competitive: number;
    risk: number;
  };
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface AdvancedScoringData {
  overallScore: number;
  confidenceLevel: number;
  confidenceIntervals: {
    overall: {
      lower: number;
      upper: number;
      marginOfError: number;
      confidenceLevel: number;
    };
  };
  factorBreakdown: {
    fundamental: {
      score: number;
      weight: number;
      contribution: number;
      confidence: number;
      factors: {
        financialHealth: number;
        profitability: number;
        growth: number;
        efficiency: number;
      };
    };
    technical: {
      score: number;
      weight: number;
      contribution: number;
      confidence: number;
      factors: {
        priceMomentum: number;
        volumeAnalysis: number;
        relativeStrength: number;
        volatility: number;
      };
    };
    aiSentiment: {
      score: number;
      weight: number;
      contribution: number;
      confidence: number;
      factors: {
        insights: number;
        predictions: number;
        news: number;
        outlook: number;
      };
    };
    competitive: {
      score: number;
      weight: number;
      contribution: number;
      confidence: number;
    };
    riskAdjusted: {
      score: number;
      weight: number;
      contribution: number;
      confidence: number;
    };
  };
  sectorBenchmarking: {
    sector: string;
    industry: string;
    relativePosition: {
      marketCapPercentile: number;
      revenuePercentile: number;
      overallSectorRank: number;
      outperformanceScore: number;
    };
  };
  riskMetrics: {
    overallRisk: number;
    riskScore: number;
    volatilityAdjustedReturn: number;
  };
  predictiveMetrics: {
    expectedReturn: {
      annualized: number;
      projected: number;
      confidence: number;
    };
    probabilityOfOutperformance: number;
    timeToTarget: string;
  };
}

export default function PortfolioAnalysis() {
  const [symbols, setSymbols] = useState("");
  const [mode, setMode] = useState<"individual" | "portfolio">("individual");
  const [loading, setLoading] = useState(false);
  const [individualData, setIndividualData] = useState<AdvancedScoringData | null>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [error, setError] = useState("");

  const generateAnalysis = async () => {
    if (!symbols.trim()) {
      setError("Please enter one or more stock symbols (comma-separated)");
      return;
    }

    setLoading(true);
    setError("");
    setIndividualData(null);
    setPortfolioData(null);

    try {
      const endpoint = mode === "individual" ? "/api/scoring/advanced" : "/api/scoring/advanced";
      const url = mode === "individual" 
        ? endpoint 
        : `${endpoint}?symbols=${encodeURIComponent(symbols)}&mode=portfolio`;

      const response = await fetch(url, {
        method: mode === "individual" ? "POST" : "GET",
        headers: mode === "individual" ? { "Content-Type": "application/json" } : {},
        body: mode === "individual" ? JSON.stringify({ 
          symbol: symbols.split(',')[0].trim().toUpperCase(),
          scoringMode: 'comprehensive',
          includeBenchmarking: true,
          includeConfidenceIntervals: true
        }) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate analysis");
      }

      if (mode === "individual") {
        setIndividualData(data.scoring);
      } else {
        setPortfolioData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "text-green-600 bg-green-100";
      case "MEDIUM": return "text-yellow-600 bg-yellow-100";
      case "HIGH": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const CircularProgress = ({ score, size = 100, strokeWidth = 6, showConfidence = false, confidence = 0 }: { 
    score: number; 
    size?: number; 
    strokeWidth?: number; 
    showConfidence?: boolean; 
    confidence?: number; 
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${getScoreColor(score)} transition-all duration-500`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          {showConfidence && (
            <span className="text-xs text-gray-500">{confidence}%</span>
          )}
        </div>
      </div>
    );
  };

  const ConfidenceInterval = ({ interval }: { interval: any }) => {
    const range = interval.upper - interval.lower;
    const position = ((interval.overall || 75) - interval.lower) / range * 100;

    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{interval.lower}</span>
          <span>95% Confidence</span>
          <span>{interval.upper}</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div 
            className="absolute h-2 bg-blue-500 rounded-full"
            style={{ 
              left: `${((interval.lower) / 100) * 100}%`,
              width: `${range}%`
            }}
          ></div>
          <div 
            className="absolute h-4 w-4 bg-blue-600 rounded-full -top-1 transform -translate-x-1/2"
            style={{ left: `${position}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advanced Portfolio Analysis
        </h1>
        <p className="text-gray-600">
          Multi-factor scoring with confidence intervals and sector benchmarking
        </p>
      </div>

      {/* Configuration Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Analysis Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Mode
            </label>
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mode === "individual"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setMode("individual")}
              >
                Individual Stock
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mode === "portfolio"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setMode("portfolio")}
              >
                Portfolio Analysis
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Symbols {mode === "portfolio" && "(comma-separated)"}
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={mode === "individual" ? "e.g., AAPL" : "e.g., AAPL, GOOGL, MSFT"}
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
            />
          </div>
        </div>

        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          onClick={generateAnalysis}
          disabled={loading || !symbols.trim()}
        >
          {loading ? "Analyzing..." : "Generate Analysis"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Individual Stock Results */}
      {individualData && (
        <div className="space-y-6">
          {/* Overall Score with Confidence */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Advanced Scoring Analysis
            </h3>
            <div className="flex justify-center items-center gap-8">
              <CircularProgress 
                score={individualData.overallScore} 
                showConfidence={true} 
                confidence={individualData.confidenceLevel}
              />
              <div className="text-center">
                <h4 className="text-2xl font-bold text-gray-900">
                  {individualData.overallScore}/100
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {individualData.confidenceLevel}% confidence
                </p>
              </div>
            </div>
            
            {/* Confidence Interval */}
            <div className="mt-6">
              <ConfidenceInterval interval={individualData.confidenceIntervals.overall} />
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Factor Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(individualData.factorBreakdown).map(([key, factor]: [string, any]) => (
                <div key={key} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${getScoreColor(factor.score)}`}>
                        {factor.score}/100
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(factor.weight * 100)}% weight)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(factor.score)} bg-current`}
                      style={{ width: `${factor.score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Contribution: {Math.round(factor.contribution)}</span>
                    <span>Confidence: {factor.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Benchmarking */}
          {individualData.sectorBenchmarking && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sector Benchmarking
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Sector</p>
                  <p className="font-medium">{individualData.sectorBenchmarking.sector}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Industry</p>
                  <p className="font-medium">{individualData.sectorBenchmarking.industry}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Market Cap Percentile</p>
                  <p className={`font-semibold ${getScoreColor(individualData.sectorBenchmarking.relativePosition.marketCapPercentile)}`}>
                    {individualData.sectorBenchmarking.relativePosition.marketCapPercentile}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Outperformance</p>
                  <p className={`font-semibold ${getScoreColor(individualData.sectorBenchmarking.relativePosition.outperformanceScore)}`}>
                    {individualData.sectorBenchmarking.relativePosition.outperformanceScore}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Predictive Metrics */}
          {individualData.predictiveMetrics && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Predictive Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Expected Annual Return</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{(individualData.predictiveMetrics.expectedReturn.annualized * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {individualData.predictiveMetrics.expectedReturn.confidence}% confidence
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Outperformance Probability</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {individualData.predictiveMetrics.probabilityOfOutperformance}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Time to Target</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {individualData.predictiveMetrics.timeToTarget}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Analysis Results */}
      {portfolioData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Portfolio Analysis Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Portfolio Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(portfolioData.portfolioAnalysis.overallScore)}`}>
                  {portfolioData.portfolioAnalysis.overallScore}/100
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Stocks Analyzed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {portfolioData.portfolioAnalysis.successfulAnalysis}/{portfolioData.portfolioAnalysis.symbolCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Risk Distribution</p>
                <div className="flex justify-center gap-2 mt-2">
                  {portfolioData.recommendations.map((rec: any, i: number) => (
                    <span key={i} className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(rec.type === 'STRONG_BUY' ? 'LOW' : rec.type === 'REVIEW' ? 'HIGH' : 'MEDIUM')}`}>
                      {rec.type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Stock Scores */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Individual Stock Scores
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overall Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fundamental
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technical
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {portfolioData.individualScores.map((stock: PortfolioStock, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stock.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${getScoreColor(stock.overallScore)}`}>
                            {stock.overallScore}/100
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${getScoreColor(stock.breakdown.fundamental)}`}>
                            {stock.breakdown.fundamental}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${getScoreColor(stock.breakdown.technical)}`}>
                            {stock.breakdown.technical}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(stock.riskLevel)}`}>
                            {stock.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Portfolio Recommendations
              </h4>
              <div className="space-y-3">
                {portfolioData.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(rec.type === 'STRONG_BUY' ? 'LOW' : rec.type === 'REVIEW' ? 'HIGH' : 'MEDIUM')}`}>
                        {rec.type.replace('_', ' ')}
                      </span>
                      {rec.symbols && (
                        <span className="text-sm text-gray-500">
                          {rec.symbols.join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      {rec.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}