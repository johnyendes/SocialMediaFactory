import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { getAgentWorkforce } from '@/lib/agent-workforce';

export async function POST(request: NextRequest) {
  try {
    const auth = authenticate(request);
    
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { platform, topic } = body;

    if (!platform || !topic) {
      return NextResponse.json(
        { error: 'platform and topic are required' },
        { status: 400 }
      );
    }

    const agentWorkforce = getAgentWorkforce();
    await agentWorkforce.initialize();

    const result = await agentWorkforce.createSocialContent(platform, topic);

    return NextResponse.json({
      success: result.success,
      socialContent: result.result,
      error: result.error,
      timestamp: result.timestamp,
      user: auth.user.email
    });

  } catch (error: any) {
    console.error('Social Media Factory error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}