import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get all users with their activity
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
        lastActivity: true,
        mfaEnabled: true,
        ssoEnabled: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add isActive field (based on recent activity)
    const usersWithStatus = users.map(user => ({
      ...user,
      isActive: user.lastActivity ? 
        new Date(user.lastActivity).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) : // Active in last 30 days
        false
    }));

    // Log the data access
    await AuditLogger.logFromRequest(request, 'DATA_ACCESS', 'admin/users');

    return NextResponse.json(usersWithStatus);

  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}