import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 AUDIT: Simple test endpoint working...');
    
    return NextResponse.json({
      status: 'working',
      timestamp: new Date().toISOString(),
      audit: {
        authBypassed: true,
        testing: true,
        endpoint: 'security-test'
      }
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
