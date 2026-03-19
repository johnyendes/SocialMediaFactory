'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonMetric {
  name: string;
  value: number;
  benchmark: number;
  unit: string;
  higherIsBetter: boolean;
}

interface MarketComparisonProps {
  companyName: string;
  metrics: ComparisonMetric[];
  industry: string;
}

export function MarketComparison({ 
  companyName, 
  metrics, 
  industry 
}: MarketComparisonProps) {
  const getPerformanceIcon = (value: number, benchmark: number, higherIsBetter: boolean) => {
    const isBetter = higherIsBetter ? value > benchmark : value < benchmark;
    if (Math.abs(value - benchmark) < 0.1) {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
    return isBetter ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getPerformanceColor = (value: number, benchmark: number, higherIsBetter: boolean) => {
    const isBetter = higherIsBetter ? value > benchmark : value < benchmark;
    if (Math.abs(value - benchmark) < 0.1) {
      return 'text-gray-600';
    }
    return isBetter ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceBadge = (value: number, benchmark: number, higherIsBetter: boolean) => {
    const isBetter = higherIsBetter ? value > benchmark : value < benchmark;
    if (Math.abs(value - benchmark) < 0.1) {
      return { variant: 'secondary', text: 'At Par' };
    }
    return isBetter ? 
      { variant: 'default', text: 'Above Average' } : 
      { variant: 'destructive', text: 'Below Average' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Market Comparison: {companyName}</span>
          <Badge variant="outline">{industry}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const percentage = (metric.value / metric.benchmark) * 100;
            const badge = getPerformanceBadge(metric.value, metric.benchmark, metric.higherIsBetter);
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{metric.name}</span>
                    {getPerformanceIcon(metric.value, metric.benchmark, metric.higherIsBetter)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {metric.value}{metric.unit} vs {metric.benchmark}{metric.unit}
                    </span>
                    <Badge variant={badge.variant as any}>{badge.text}</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span className={getPerformanceColor(metric.value, metric.benchmark, metric.higherIsBetter)}>
                      {metric.value}{metric.unit}
                    </span>
                    <span>Industry Avg: {metric.benchmark}{metric.unit}</span>
                    <span>{Math.max(percentage, 150)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 150)} 
                    className="h-2"
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Performance analyzed against {industry} industry benchmarks</li>
            <li>• Metrics compared with top quartile companies</li>
            <li>• Recommendations based on competitive positioning</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}