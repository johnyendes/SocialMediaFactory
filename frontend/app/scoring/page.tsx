import PredictiveScoring from '@/components/PredictiveScoring';

export default function ScoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PredictiveScoring />
    </div>
  );
}

export const metadata = {
  title: 'AI Predictive Scoring - Market Intelligence',
  description: 'Get AI-powered investment scores and comprehensive analysis for any stock',
};