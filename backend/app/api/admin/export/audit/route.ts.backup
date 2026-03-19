import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Build where clause for date filtering
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp.gte = new Date(startDate);
      if (endDate) whereClause.timestamp.lte = new Date(endDate);
    }

    // Fetch audit logs with user information
    const logs = await prisma.userActivity.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10000, // Limit for performance
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Timestamp', 'User Email', 'User Name', 'Action', 'Resource', 'IP Address', 'User Agent'];
      const csvRows = [headers.join(',')];
      
      logs.forEach(log => {
        const row = [
          log.timestamp.toISOString(),
          log.user.email,
          log.user.name || '',
          log.action,
          log.resource || '',
          log.ipAddress || '',
          log.userAgent || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Escape quotes
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // Generate JSON
      const exportData = {
        exportInfo: {
          generatedAt: new Date().toISOString(),
          recordCount: logs.length,
          dateRange: {
            startDate: startDate || new Date('1970-01-01'),
            endDate: endDate || new Date()
          }
        },
        auditLogs: logs.map(log => ({
          id: log.id,
          timestamp: log.timestamp,
          user: {
            email: log.user.email,
            name: log.user.name
          },
          action: log.action,
          resource: log.resource,
          metadata: log.metadata,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent
        }))
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}