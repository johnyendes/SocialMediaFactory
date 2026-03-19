import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AISecurityMonitor } from '@/lib/ai-security';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get security events
    const events = await AISecurityMonitor.getSecurityEvents(limit);

    return NextResponse.json(events);

  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Analyze user activity for anomalies
    const events = await AISecurityMonitor.analyzeUserActivity(userId);

    // Store detected events
    for (const event of events) {
      await AISecurityMonitor.storeSecurityEvent(event);
    }

    return NextResponse.json({ 
      message: `Security analysis completed for user ${userId}`,
      eventsDetected: events.length,
      events
    });

  } catch (error) {
    console.error('Error analyzing user security:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}