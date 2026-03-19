import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ComplianceReportingService } from '@/lib/compliance-reports';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { reportType, startDate, endDate } = await request.json();

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Report type, start date, and end date are required' 
      }, { status: 400 });
    }

    // Generate SOC2 report
    const report = await ComplianceReportingService.generateSOC2Report(
      reportType,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error generating SOC2 report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Export compliance data
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') as 'json' | 'csv' | 'pdf' || 'json';

    const data = await ComplianceReportingService.exportComplianceData(format);

    return new NextResponse(data, {
      headers: {
        'Content-Type': format === 'json' ? 'application/json' : 'text/csv',
        'Content-Disposition': `attachment; filename="compliance-report.${format}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting compliance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}