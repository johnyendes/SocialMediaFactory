import ReportGenerator from '@/components/ReportGenerator';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ReportGenerator />
    </div>
  );
}

export const metadata = {
  title: 'AI Market Intelligence Reports - Market Intelligence',
  description: 'Generate comprehensive market analysis reports powered by GPT-4 AI',
};