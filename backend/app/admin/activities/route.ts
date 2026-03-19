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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get recent user activities
    const activities = await prisma.userActivity.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc'
      },
      select: {
        id: true,
        userId: true,
        action: true,
        resource: true,
        resourceId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        timestamp: true,
      }
    });

    // Get user info separately
    const userIds = [...new Set(activities.map(a => a.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true }
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, { id: string; email: string; name?: string }>);

    // Transform the data to match the expected interface
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      userId: activity.userId,
      user: userMap[activity.userId] || null,
      action: activity.action,
      resource: activity.resource,
      ipAddress: activity.ipAddress,
      timestamp: activity.timestamp.toISOString()
    }));

    await prisma.$disconnect();
    return NextResponse.json(transformedActivities);

  } catch (error) {
    console.error('Error fetching admin activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}