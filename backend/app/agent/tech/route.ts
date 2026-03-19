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
    const { problem, technology } = body;

    if (!problem) {
      return NextResponse.json(
        { error: 'problem description is required' },
        { status: 400 }
      );
    }

    const agentWorkforce = getAgentWorkforce();
    await agentWorkforce.initialize();

    const result = await agentWorkforce.developTechSolution(
      problem,
      technology || 'Python'
    );

    return NextResponse.json({
      success: result.success,
      solution: result.result,
      error: result.error,
      timestamp: result.timestamp,
      user: auth.user.email
    });

  } catch (error: any) {
    console.error('Tech Factory error:', error);
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