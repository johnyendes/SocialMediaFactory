import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireAdmin } from '@/lib/auth-middleware';
import { getAgentWorkforce } from '@/lib/agent-workforce';

export async function POST(request: NextRequest) {
  try {
    const auth = authenticate(request);
    
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { factoryType, task, context, parameters } = body;

    if (!factoryType || !task) {
      return NextResponse.json(
        { error: 'factoryType and task are required' },
        { status: 400 }
      );
    }

    // Initialize agent workforce
    const agentWorkforce = getAgentWorkforce();
    await agentWorkforce.initialize();

    // Execute the task
    const result = await agentWorkforce.executeTask({
      factoryType,
      task,
      context,
      parameters
    });

    return NextResponse.json({
      success: result.success,
      result: result.result,
      error: result.error,
      artifacts: result.artifacts,
      timestamp: result.timestamp,
      user: auth.user.email
    });

  } catch (error: any) {
    console.error('Agent execution error:', error);
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