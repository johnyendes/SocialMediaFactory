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

    console.log('✅ AUTH: Admin user authenticated:', session.user.email);
    
    // Get security statistics
    const stats = await AISecurityMonitor.getSecurityStats();

    return NextResponse.json({
      ...stats,
      authenticated: true,
      user: session.user.email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching security stats:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
