"use client";

import { useState } from "react";

interface ReportData {
  header: {
    title: string;
    subtitle: string;
    company: string;
    symbol: string;
    industry: string;
    sector: string;
    generatedAt: string;
    reportType: string;
  };
  executiveSummary?: {
    recommendation: string;
    confidence: number;
    strengths: string[];
    risks: string[];
    opportunities: string[];
    strategicFocus: string;
  };
  industryTrends?: {
    marketGrowth: string;
    technologyTrends: string[];
    regulatoryChanges: string;
    consumerShifts: string;
    competitiveEvolution: string;
    timeHorizon: string;
  };
  marketScoring: {
    overallScore: number;
    breakdown: {
      financialHealth: number;
      growthPotential: number;
      competitivePosition: number;
      marketOpportunity: number;
      riskAssessment: number;
    };
    technicalIndicators: {
      priceMomentum: number;
      volumeAnalysis: number;
      relativeStrength: number;
    };
    scoringMethodology: string;
  };
  competitiveAnalysis?: {
    marketPosition: string;
    competitiveAdvantages: string[];
    keyThreats: string[];
    competitorAnalysis: Array<{
      company: string;
      symbol: string;
      similarity: string;
      position: string;
    }>;
    marketShare: string;
  };
  strategicRecommendations: {
    investmentAction: string;
    businessDevelopment: string;
    riskMitigation: string;
    innovationFocus: string;
    marketExpansion: string;
    priorityLevel: string;
  };
  riskAnalysis: {
    overallRiskLevel: string;
    riskFactors: {
      marketRisk: string;
      operationalRisk: string;
      regulatoryRisk: string;
      competitiveRisk: string;
      technologyRisk: string;
    };
    mitigationStrategies: string[];
  };
  financialMetrics: {
    currentMetrics: {
      marketCap: string;
      revenue: string;
      netIncome: string;
      employees: string;
      currentPrice: string;
      changePercent: string;
    };
    performance: Record<string, string>;
  };
  footer: {
    disclaimer: string;
    dataSources: string[];
    methodology: string;
    nextUpdate: string;
  };
}

export default function ReportGenerator() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [reportOptions, setReportOptions] = useState({
    reportType: 'comprehensive',
    includeExecutiveSummary: true,
    includeCompetitiveAnalysis: true,
    includeIndustryTrends: true,
  });

  const generateReport = async () => {
    if (!symbol.trim()) {
      setError("Please enter a stock symbol");
      return;
    }

    setLoading(true);
    setError("");
    setReportData(null);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          symbol: symbol.toUpperCase(),
          ...reportOptions 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report");
      }

      setReportData(data.reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'html' | 'markdown' | 'pdf') => {
    if (!reportData) return;

    if (format === 'html') {
      exportAsHTML(reportData);
    } else if (format === 'markdown') {
      exportAsMarkdown(reportData);
    } else if (format === 'pdf') {
      exportAsHTML(reportData, true);
    }
  };

  const exportAsHTML = (data: ReportData, suggestPDF = false) => {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>${data.header.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1e40af; border-left: 4px solid #2563eb; padding-left: 15px; }
        .score-display { display: flex; align-items: center; gap: 15px; margin: 15px 0; }
        .score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 18px; }
        .score-high { background-color: #16a34a; }
        .score-medium { background-color: #ca8a04; }
        .score-low { background-color: #dc2626; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-card { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        @media print { body { margin: 0; padding: 10px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.header.title}</h1>
        <h2>${data.header.subtitle}</h2>
        <p><strong>${data.header.company} (${data.header.symbol})</strong></p>
        <p>${data.header.industry} | ${data.header.sector}</p>
        <p>Generated on ${new Date(data.header.generatedAt).toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p><strong>Recommendation:</strong> <span style="color: ${data.executiveSummary?.recommendation === 'BUY' ? '#16a34a' : data.executiveSummary?.recommendation === 'SELL' ? '#dc2626' : '#d97706'}; font-weight: bold;">${data.executiveSummary?.recommendation || 'N/A'}</span> (${data.executiveSummary?.confidence || 0}% confidence)</p>
        <p><strong>Strategic Focus:</strong> ${data.executiveSummary?.strategicFocus || 'N/A'}</p>
    </div>

    <div class="section">
        <h2>Market Scoring Analysis</h2>
        <div class="score-display">
            <div class="score-circle ${data.marketScoring.overallScore >= 80 ? 'score-high' : data.marketScoring.overallScore >= 60 ? 'score-medium' : 'score-low'}">
                ${data.marketScoring.overallScore}/100
            </div>
            <div>
                <h3>Overall Score: ${data.marketScoring.overallScore}/100</h3>
                <p>${data.marketScoring.scoringMethodology}</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData?.header.company || 'Report'}_${reportData?.header.symbol || 'Symbol'}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (suggestPDF) {
      alert('HTML file downloaded. Use your browser\'s print function to save as PDF.');
    }
  };

  const exportAsMarkdown = (data: ReportData) => {
    const markdown = `# ${data.header.title}

**${data.header.subtitle}**

**${data.header.company} (${data.header.symbol})**  
${data.header.industry} | ${data.header.sector}  
Generated on ${new Date(data.header.generatedAt).toLocaleDateString()}

## Executive Summary

**Recommendation:** ${data.executiveSummary?.recommendation || 'N/A'} (${data.executiveSummary?.confidence || 0}% confidence)

**Strategic Focus:** ${data.executiveSummary?.strategicFocus || 'N/A'}

## Market Scoring Analysis

**Overall Score: ${data.marketScoring.overallScore}/100**

${data.marketScoring.scoringMethodology}

---

*${data.footer.disclaimer}*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.header.company}_${data.header.symbol}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Market Intelligence Report Generator
        </h1>
        <p className="text-gray-600">
          Generate comprehensive market analysis reports powered by GPT-4
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Report Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Symbol
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter stock symbol (e.g., AAPL, GOOGL, MSFT)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>
        </div>

        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          onClick={generateReport}
          disabled={loading || !symbol.trim()}
        >
          {loading ? "Generating Report..." : "Generate Report"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {reportData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {reportData.header.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Generated on {new Date(reportData.header.generatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  onClick={() => exportReport('html')}
                >
                  Export HTML
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  onClick={() => exportReport('markdown')}
                >
                  Export Markdown
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  onClick={() => exportReport('pdf')}
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {reportData.executiveSummary && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Executive Summary
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  reportData.executiveSummary.recommendation === 'BUY' 
                    ? 'text-green-700 bg-green-100' 
                    : reportData.executiveSummary.recommendation === 'SELL'
                    ? 'text-red-700 bg-red-100'
                    : 'text-yellow-700 bg-yellow-100'
                }`}>
                  {reportData.executiveSummary.recommendation}
                </span>
                <span className="text-sm text-gray-600">
                  {reportData.executiveSummary.confidence}% confidence
                </span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Market Scoring Analysis
            </h3>
            <div className="flex items-center gap-6 mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl ${getScoreBackground(reportData.marketScoring.overallScore)}`}>
                {reportData.marketScoring.overallScore}
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  Overall Score: {reportData.marketScoring.overallScore}/100
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {reportData.marketScoring.scoringMethodology}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}