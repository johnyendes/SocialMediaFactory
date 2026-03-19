"use client";

import { useState } from "react";

interface ScoreData {
  symbol: string;
  company: string;
  timestamp: string;
  scores: {
    overall: number;
    aiGenerated: number;
    technical: number;
  };
  breakdown: {
    growth: number;
    stability: number;
    innovation: number;
    marketPosition: number;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    risks: string[];
  };
  recommendation: string;
  confidence: number;
  technicalIndicators: {
    priceMomentum: number;
    volumeAnalysis: number;
    relativeStrength: number;
  };
  metadata: {
    marketData: {
      price: number;
      changePercent: number;
      volume: number;
    };
    analysisTimeframe: string;
    model: string;
  };
}

export default function PredictiveScoring() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [error, setError] = useState("");

  const generateScore = async () => {
    if (!symbol.trim()) {
      setError("Please enter a stock symbol");
      return;
    }

    setLoading(true);
    setError("");
    setScoreData(null);

    try {
      const response = await fetch("/api/scoring/predictive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: symbol.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate score");
      }

      setScoreData(data);
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

  const getRecommendationColor = (rec: string) => {
    switch (rec.toUpperCase()) {
      case "BUY": return "text-green-700 bg-green-100";
      case "HOLD": return "text-yellow-700 bg-yellow-100";
      case "SELL": return "text-red-700 bg-red-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  const CircularProgress = ({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) => {
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
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Predictive Scoring Engine
        </h1>
        <p className="text-gray-600">
          Get AI-powered investment scores and analysis for any stock
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter stock symbol (e.g., AAPL, GOOGL, MSFT)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && generateScore()}
          />
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            onClick={generateScore}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Generate Score"}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {scoreData && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {scoreData.company} ({scoreData.symbol})
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Analysis generated on {new Date(scoreData.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Recommendation</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRecommendationColor(scoreData.recommendation)}`}>
                    {scoreData.recommendation}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Confidence</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {scoreData.confidence}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Overall Predictive Score
            </h3>
            <div className="flex justify-center">
              <CircularProgress score={scoreData.scores.overall} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">AI Analysis</p>
                <p className={`text-lg font-semibold ${getScoreColor(scoreData.scores.aiGenerated)}`}>
                  {scoreData.scores.aiGenerated}/100
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Technical</p>
                <p className={`text-lg font-semibold ${getScoreColor(scoreData.scores.technical)}`}>
                  {scoreData.scores.technical}/100
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Final Score</p>
                <p className={`text-lg font-bold ${getScoreColor(scoreData.scores.overall)}`}>
                  {scoreData.scores.overall}/100
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown Scores */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Score Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Growth", value: scoreData.breakdown.growth },
                { label: "Stability", value: scoreData.breakdown.stability },
                { label: "Innovation", value: scoreData.breakdown.innovation },
                { label: "Market Position", value: scoreData.breakdown.marketPosition },
              ].map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className={`p-3 rounded-lg ${getScoreBackground(metric.value)}`}>
                    <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                    <p className={`text-xl font-bold ${getScoreColor(metric.value)}`}>
                      {metric.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-green-700 mb-3">
                Strengths
              </h3>
              <ul className="space-y-2">
                {scoreData.analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-red-700 mb-3">
                Weaknesses
              </h3>
              <ul className="space-y-2">
                {scoreData.analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">!</span>
                    <span className="text-sm text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-orange-700 mb-3">
                Risk Factors
              </h3>
              <ul className="space-y-2">
                {scoreData.analysis.risks.map((risk, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠</span>
                    <span className="text-sm text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Technical Indicators
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Price Momentum", value: scoreData.technicalIndicators.priceMomentum },
                { label: "Volume Analysis", value: scoreData.technicalIndicators.volumeAnalysis },
                { label: "Relative Strength", value: scoreData.technicalIndicators.relativeStrength },
              ].map((indicator) => (
                <div key={indicator.label} className="text-center">
                  <p className="text-sm text-gray-500 mb-1">{indicator.label}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(indicator.value)} bg-current`}
                      style={{ width: `${indicator.value}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${getScoreColor(indicator.value)}`}>
                    {indicator.value}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Data */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Market Data
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${scoreData.metadata.marketData.price.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Change</p>
                <p className={`text-lg font-semibold ${scoreData.metadata.marketData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {scoreData.metadata.marketData.changePercent >= 0 ? '+' : ''}{scoreData.metadata.marketData.changePercent.toFixed(2)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Volume</p>
                <p className="text-lg font-semibold text-gray-900">
                  {scoreData.metadata.marketData.volume.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}