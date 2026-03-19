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
    const { topic, level, duration } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'topic is required' },
        { status: 400 }
      );
    }

    const agentWorkforce = getAgentWorkforce();
    await agentWorkforce.initialize();

    const result = await agentWorkforce.createCourseOutline(
      topic,
      level || 'intermediate',
      duration || '8 weeks'
    );

    return NextResponse.json({
      success: result.success,
      courseOutline: result.result,
      error: result.error,
      timestamp: result.timestamp,
      user: auth.user.email
    });

  } catch (error: any) {
    console.error('CourseForge error:', error);
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