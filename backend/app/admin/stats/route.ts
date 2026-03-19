import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get today's date
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get user stats
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        lastActivity: {
          gte: startOfDay
        }
      }
    });

    // Get report stats
    const totalReports = await prisma.report.count({
      where: {
        lastGenerated: {
          gte: startOfDay
        }
      }
    });

    // Get API call stats (from user activities)
    const totalApiCalls = await prisma.userActivity.count({
      where: {
        action: 'API_CALL',
        timestamp: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // Get login stats
    const recentLogins = await prisma.userActivity.count({
      where: {
        action: 'LOGIN',
        timestamp: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    const failedLogins = await prisma.userActivity.count({
      where: {
        action: 'FAILED_LOGIN',
        timestamp: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    const stats = {
      totalUsers,
      activeUsers,
      totalReports,
      totalApiCalls,
      recentLogins,
      failedLogins
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}