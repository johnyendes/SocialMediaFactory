import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // TEMPORARY: Simple test authentication for API testing
    // REMOVE IN PRODUCTION
    if (email === 'admin@test.com' && password === 'admin123') {
      // Create mock session
      const session = {
        user: {
          id: 'admin-test-id',
          email: 'admin@test.com',
          name: 'Test Admin',
          role: 'ADMIN'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      // Set session cookie
      const response = NextResponse.json({
        success: true,
        message: 'Test authentication successful',
        session
      });

      response.cookies.set('next-auth.session-token', 'test-session-token', {
        httpOnly: true,
        secure: false, // Only for testing
        maxAge: 24 * 60 * 60 // 24 hours
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}