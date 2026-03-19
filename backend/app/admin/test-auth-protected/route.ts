import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticate(request);
    
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const adminCheck = requireAdmin(auth.user);
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    return NextResponse.json({
      success: true,
      message: '🎉 Authentication working perfectly!',
      user: {
        email: auth.user.email,
        role: auth.user.role,
        userId: auth.user.userId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}