import PortfolioAnalysis from '@/components/PortfolioAnalysis';

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PortfolioAnalysis />
    </div>
  );
}

export const metadata = {
  title: 'Advanced Portfolio Analysis - Market Intelligence',
  description: 'Multi-factor scoring with confidence intervals, sector benchmarking, and portfolio analytics',
};